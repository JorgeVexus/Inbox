import { LIMITES } from "@/lib/api/rate-limit";
import { proxySibox } from "@/lib/api/route-helpers";
import { rastreoDetalleRequestSchema, rastreoDetalleResponseSchema } from "@/lib/api/schemas/rastreo-detalle";

/** SIBOX tiene un tope propio de 20 s (sibox-client.ts); la función debe poder esperarlo y responder el 504 limpio. */
export const maxDuration = 25;

export async function POST(request: Request) {
  return proxySibox(request, {
    endpoint: "/RastreoDetalle",
    requestSchema: rastreoDetalleRequestSchema,
    responseSchema: rastreoDetalleResponseSchema,
    notFoundMessage: "No encontramos el historial de esa guía.",
    genericErrorMessage: "Error al consultar el historial.",
    limite: LIMITES.rastreoDetalle,
  });
}
