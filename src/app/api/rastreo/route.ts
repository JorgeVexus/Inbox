import { NextResponse } from "next/server";
import { z } from "zod";
import { siboxPost, SiboxApiError } from "@/lib/api/sibox-client";
import {
  rastreoRequestSchema,
  rastreoResponseSchema,
} from "@/lib/api/schemas/rastreo";

// TODO(seguridad): rate limit propio (sugerido en CLAUDE.md seccion 5:
// 30/min por sesion) antes de exponer esto en produccion. Un limitador en
// memoria no sirve en serverless (cada instancia/cold-start tiene la suya) --
// hace falta un store compartido (p.ej. Upstash Redis) antes de lanzar.

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body invalido, se esperaba JSON." }, { status: 400 });
  }

  const parsedRequest = rastreoRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Request invalido.", detalle: z.treeifyError(parsedRequest.error) },
      { status: 400 },
    );
  }

  try {
    const data = await siboxPost("/wsRastreo", parsedRequest.data);
    const parsedResponse = rastreoResponseSchema.safeParse(data);
    if (!parsedResponse.success) {
      // La forma de datos que regresa SIBOX no coincidio con lo documentado
      // en el PDF -- no la pasamos tal cual al cliente, se reporta como
      // error de servidor para que quede visible en logs, no silenciado.
      console.error("wsRastreo: respuesta con forma inesperada", parsedResponse.error);
      return NextResponse.json(
        { error: "SIBOX regreso datos con una forma inesperada." },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: parsedResponse.data });
  } catch (err) {
    if (err instanceof SiboxApiError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("wsRastreo: error inesperado", err);
    return NextResponse.json({ error: "Error al consultar el rastreo." }, { status: 500 });
  }
}
