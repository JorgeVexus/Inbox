import { LIMITES } from "@/lib/api/rate-limit";
import { proxySibox } from "@/lib/api/route-helpers";
import { rastreoRequestSchema, rastreoResponseSchema } from "@/lib/api/schemas/rastreo";

/** SIBOX tiene un tope propio de 20 s (sibox-client.ts); la función debe poder esperarlo y responder el 504 limpio. */
export const maxDuration = 25;

export async function POST(request: Request) {
  return proxySibox(request, {
    endpoint: "/wsRastreo",
    requestSchema: rastreoRequestSchema,
    responseSchema: rastreoResponseSchema,
    notFoundMessage: "No encontramos esa guía.",
    genericErrorMessage: "Error al consultar el rastreo.",
    limite: LIMITES.rastreo,
  });
}
