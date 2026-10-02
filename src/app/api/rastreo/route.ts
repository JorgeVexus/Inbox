import { proxySibox } from "@/lib/api/route-helpers";
import { rastreoRequestSchema, rastreoResponseSchema } from "@/lib/api/schemas/rastreo";

export async function POST(request: Request) {
  return proxySibox(request, {
    endpoint: "/wsRastreo",
    requestSchema: rastreoRequestSchema,
    responseSchema: rastreoResponseSchema,
    notFoundMessage: "No encontramos esa guía.",
    genericErrorMessage: "Error al consultar el rastreo.",
  });
}
