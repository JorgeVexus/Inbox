import { NextResponse } from "next/server";
import { z } from "zod";
import { siboxPost, SiboxApiError, SiboxBlockedError } from "@/lib/api/sibox-client";

// TODO(seguridad): rate limit propio (sugerido en CLAUDE.md seccion 5: p.ej.
// rastreo 30/min) antes de exponer esto en produccion. Un limitador en
// memoria no sirve en serverless (cada instancia/cold-start tiene la suya) --
// hace falta un store compartido (p.ej. Upstash Redis) antes de lanzar.

/**
 * Patron comun de los Route Handlers que proxean un endpoint de SIBOX:
 * valida el body con Zod (regla de seguridad 4), llama a SIBOX con la cuenta
 * de servicio, valida la respuesta, y traduce errores sin exponer detalles
 * internos. Una respuesta `{result:1, data:""}` (mensaje vacio) es como SIBOX
 * dice "no encontrado" (probado con wsRastreo) -> 404.
 */
export async function proxySibox<Req, Res>(
  request: Request,
  opts: {
    endpoint: string;
    requestSchema: z.ZodType<Req>;
    responseSchema: z.ZodType<Res>;
    notFoundMessage: string;
    genericErrorMessage: string;
  },
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body invalido, se esperaba JSON." }, { status: 400 });
  }

  const parsedRequest = opts.requestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Request invalido.", detalle: z.treeifyError(parsedRequest.error) },
      { status: 400 },
    );
  }

  try {
    const data = await siboxPost(opts.endpoint, parsedRequest.data);
    const parsedResponse = opts.responseSchema.safeParse(data);
    if (!parsedResponse.success) {
      // La forma de datos que regreso SIBOX no coincidio con lo esperado --
      // no se pasa tal cual al cliente, se reporta como error de servidor
      // para que quede visible en logs en vez de silenciarse.
      console.error(`${opts.endpoint}: respuesta con forma inesperada`, parsedResponse.error);
      return NextResponse.json(
        { error: "SIBOX regreso datos con una forma inesperada." },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: parsedResponse.data });
  } catch (err) {
    if (err instanceof SiboxBlockedError) {
      // Detalle tecnico solo en logs; el visitante ve un mensaje generico.
      console.error(err.message);
      return NextResponse.json(
        { error: "El servicio no está disponible por el momento. Intenta más tarde." },
        { status: 503 },
      );
    }
    if (err instanceof SiboxApiError) {
      if (err.message.trim() === "") {
        return NextResponse.json({ error: opts.notFoundMessage }, { status: 404 });
      }
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error(`${opts.endpoint}: error inesperado`, err);
    return NextResponse.json({ error: opts.genericErrorMessage }, { status: 500 });
  }
}
