import { proxySibox } from "@/lib/api/route-helpers";
import {
  rastreoDetalleRequestSchema,
  rastreoDetalleResponseSchema,
} from "@/lib/api/schemas/rastreo-detalle";

export async function POST(request: Request) {
  return proxySibox(request, {
    endpoint: "/RastreoDetalle",
    requestSchema: rastreoDetalleRequestSchema,
    responseSchema: rastreoDetalleResponseSchema,
    notFoundMessage: "No encontramos el historial de esa guía.",
    genericErrorMessage: "Error al consultar el historial.",
  });
}
