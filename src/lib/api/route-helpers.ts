import { NextResponse } from "next/server";
import { z } from "zod";
import { logError } from "@/lib/api/log";
import { ipDelCliente, limiteDesactivado, revisarLimite, type ConfigLimite } from "@/lib/api/rate-limit";
import { siboxPost, SiboxApiError, SiboxBlockedError } from "@/lib/api/sibox-client";

/**
 * Patron comun de los Route Handlers que proxean un endpoint de SIBOX:
 * valida el body con Zod (regla de seguridad 4), llama a SIBOX con la cuenta
 * de servicio, valida la respuesta, y traduce errores sin exponer detalles
 * internos. Una respuesta `{result:1, data:""}` (mensaje vacio) es como SIBOX
 * dice "no encontrado" (probado con wsRastreo) -> 404.
 */
const MAX_BODY_CHARS = 10_000;

/** `Origin` ausente = no es un navegador haciendo una petición entre sitios; presente = debe ser el mismo host. */
function origenPermitido(request: Request): boolean {
  const origen = request.headers.get("origin");
  if (!origen) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return host !== null && new URL(origen).host === host;
  } catch {
    return false;
  }
}

const respuesta = (error: string, status: number, headers?: HeadersInit) =>
  NextResponse.json({ error }, headers ? { status, headers } : { status });

/**
 * Defensas que se aplican ANTES de leer el cuerpo. Devuelve la respuesta de rechazo, o null si pasa.
 * Orden a propósito: origen y tipo de contenido antes del límite, para que una página ajena no
 * pueda gastar el cupo de quien la visita; el límite antes de leer el cuerpo, para que el abuso
 * no cueste nada.
 */
async function rechazarEntrada(request: Request, limite?: ConfigLimite): Promise<NextResponse | null> {
  // CSRF: el navegador siempre manda `Origin` en un POST y debe ser este mismo sitio. Las llamadas
  // sin `Origin` (curl, pruebas) las frena el límite por IP.
  if (!origenPermitido(request)) return respuesta("Origen no permitido.", 403);
  // Un formulario HTML de otro sitio solo puede enviar text/plain o form-urlencoded sin permiso
  // CORS: exigir JSON lo descarta.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return respuesta("Se esperaba application/json.", 415);
  }
  if (limite && !limiteDesactivado()) {
    const r = await revisarLimite(limite, ipDelCliente(request));
    if (!r.permitido) {
      return respuesta("Demasiadas solicitudes. Intenta de nuevo en un momento.", 429, {
        "Retry-After": String(r.reintentarEnSeg),
      });
    }
  }
  return null;
}

/**
 * Lee el cuerpo como texto (cubre también cuerpos sin Content-Length, "chunked"), aplica el tope
 * de tamaño (auditoría 2026-10-12: se aceptaban 2 MB) y lo interpreta como JSON.
 */
async function leerJson(request: Request): Promise<{ body: unknown } | { rechazo: NextResponse }> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { rechazo: respuesta("Body invalido, se esperaba JSON.", 400) };
  }
  if (raw.length > MAX_BODY_CHARS) return { rechazo: respuesta("Request demasiado grande.", 413) };
  try {
    return { body: JSON.parse(raw) as unknown };
  } catch {
    return { rechazo: respuesta("Body invalido, se esperaba JSON.", 400) };
  }
}

/** Traduce un fallo al hablar con SIBOX a una respuesta genérica; el detalle solo va a los registros. */
function traducirError(err: unknown, opts: { endpoint: string; notFoundMessage: string; genericErrorMessage: string }) {
  if (err instanceof SiboxBlockedError) {
    logError(err.message);
    return respuesta("El servicio no está disponible por el momento. Intenta más tarde.", 503);
  }
  if (err instanceof SiboxApiError) {
    if (err.message.trim() === "") return respuesta(opts.notFoundMessage, 404);
    // El texto de SIBOX puede ser un error interno con detalles de base de datos (p.ej. "Could
    // not find stored procedure 'GP_Valida_...'", visto en ObtieneDetalleCostos 2026-10-12):
    // nunca llega al navegador.
    logError(`${opts.endpoint}: SIBOX respondio result:1`, err.message);
    return respuesta(opts.genericErrorMessage, 502);
  }
  if (err instanceof DOMException && err.name === "TimeoutError") {
    logError(`${opts.endpoint}: SIBOX no respondio a tiempo`);
    return respuesta("El servicio tardó demasiado en responder. Intenta de nuevo.", 504);
  }
  logError(`${opts.endpoint}: error inesperado`, err);
  return respuesta(opts.genericErrorMessage, 500);
}

export async function proxySibox<Req, Res>(
  request: Request,
  opts: {
    endpoint: string;
    requestSchema: z.ZodType<Req>;
    responseSchema: z.ZodType<Res>;
    notFoundMessage: string;
    genericErrorMessage: string;
    /** Límite de peticiones por IP (429 + Retry-After). Ver `rate-limit.ts`. */
    limite?: ConfigLimite;
  },
) {
  const rechazo = await rechazarEntrada(request, opts.limite);
  if (rechazo) return rechazo;

  const leido = await leerJson(request);
  if ("rechazo" in leido) return leido.rechazo;

  const parsedRequest = opts.requestSchema.safeParse(leido.body);
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
      // La forma de datos que regreso SIBOX no coincidio con lo esperado -- no se pasa tal cual al
      // cliente, se reporta como error de servidor para que quede visible en logs.
      logError(
        `${opts.endpoint}: respuesta con forma inesperada`,
        parsedResponse.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      );
      return respuesta("SIBOX regreso datos con una forma inesperada.", 502);
    }
    return NextResponse.json({ data: parsedResponse.data });
  } catch (err) {
    return traducirError(err, opts);
  }
}
