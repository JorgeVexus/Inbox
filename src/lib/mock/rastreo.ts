import type { Rastreo } from "@/types/rastreo";

/**
 * MOCK DATA — placeholder for `wsRastreo`. The guide numbers below are the
 * real sample values from the API spec (Documentacion Api Pagina WEB ver
 * Jun26.pdf, p.5) so the chatbot demo can be tried with a real-looking
 * number. Delete this file once `rastrearGuia()` in `../rastreo.ts` calls
 * the BFF instead.
 */
export const MOCK_RASTREOS: Record<string, Rastreo> = {
  "4003229791": {
    Guia: "4003229791",
    F_Documentacion: "30-OCT-2007 19:00",
    OficinaEstatus: "REYNOSA HIDALGO",
    F_Estatus: "31-OCT-2007 09:03",
    Estatus: "ENTREGADA",
    Remitente: "PEDRO PUGA CHARLES",
    EstadoOrigen: "TAM",
    CdOrigen: "CIUDAD VICTORIA",
    Origen: "VICTORIA",
    Destinatario: "AMERICO PUGA CHARLES",
    EstadoDestino: "TAM",
    CdDestino: "REYNOSA",
    Destino: "REYNOSA HIDALGO",
    Recibio: "CARLOS ZARATE",
  },
  "4159473741": {
    Guia: "4159473741",
    F_Documentacion: "02-AGO-2026 10:15",
    OficinaEstatus: "MONTERREY CENTRO",
    F_Estatus: "03-AGO-2026 14:40",
    Estatus: "EN RUTA",
    Remitente: "JORGE CERNA",
    EstadoOrigen: "NL",
    CdOrigen: "MONTERREY",
    Origen: "MONTERREY CENTRO",
    Destinatario: "MARIA LOPEZ",
    EstadoDestino: "CDMX",
    CdDestino: "IZTAPALAPA",
    Destino: "CDMX CENTRO DE DISTRIBUCIÓN",
    Recibio: null,
  },
};
