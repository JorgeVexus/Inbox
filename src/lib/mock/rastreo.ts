import type { Rastreo, RastreoEvento } from "@/types/rastreo";

/**
 * MOCK DATA — placeholder for `wsRastreo`/`RastreoDetalle`. Guide numbers
 * are the real sample values from the API spec (Documentacion Api Pagina
 * WEB ver Jun26.pdf, p.5 and "Pagina web Inbox - Pantallas para determinar
 * APIs.docx") so the demo can be tried with real-looking numbers. Delete
 * this file once the functions in `../rastreo.ts` call the BFF instead.
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
  "4159476188": {
    Guia: "4159476188",
    F_Documentacion: "01-AGO-2026 09:00",
    OficinaEstatus: "GUADALAJARA CENTRO",
    F_Estatus: "01-AGO-2026 09:00",
    Estatus: "DOCUMENTADA",
    Remitente: "ANA TORRES",
    EstadoOrigen: "JAL",
    CdOrigen: "GUADALAJARA",
    Origen: "GUADALAJARA CENTRO",
    Destinatario: "LUIS RAMÍREZ",
    EstadoDestino: "TAM",
    CdDestino: "REYNOSA",
    Destino: "REYNOSA CENTRAL",
    Recibio: null,
  },
  "4157067169": {
    Guia: "4157067169",
    F_Documentacion: "30-JUL-2026 16:20",
    OficinaEstatus: "VERACRUZ PUERTO",
    F_Estatus: "01-AGO-2026 08:10",
    Estatus: "EN PROCESO DE ENTREGA",
    Remitente: "CLIENTE INBOX",
    EstadoOrigen: "VER",
    CdOrigen: "VERACRUZ",
    Origen: "VERACRUZ PUERTO",
    Destinatario: "SOFÍA MENDOZA",
    EstadoDestino: "GTO",
    CdDestino: "LEÓN",
    Destino: "LEÓN CENTRO",
    Recibio: null,
  },
};

export const MOCK_RASTREO_DETALLE: Record<string, RastreoEvento[]> = {
  "4003229791": [
    {
      OficinaEstatus: "REYNOSA HIDALGO",
      F_Estatus: "31-OCT-2007 09:03",
      Estatus: "ENTREGADA",
      Recibio: "CARLOS ZARATE",
      Observaciones: null,
      K_Historia_Guia: "309950",
    },
    {
      OficinaEstatus: "REYNOSA HIDALGO",
      F_Estatus: "31-OCT-2007 07:40",
      Estatus: "EN REPARTO",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "309940",
    },
    {
      OficinaEstatus: "VICTORIA",
      F_Estatus: "30-OCT-2007 18:50",
      Estatus: "DOCUMENTADA",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "302100",
    },
  ],
  "4159473741": [
    {
      OficinaEstatus: "MONTERREY CENTRO",
      F_Estatus: "03-AGO-2026 14:40",
      Estatus: "EN RUTA",
      Recibio: null,
      Observaciones: "Salió a reparto en unidad 12",
      K_Historia_Guia: "500213",
    },
    {
      OficinaEstatus: "MONTERREY CENTRO",
      F_Estatus: "02-AGO-2026 20:05",
      Estatus: "EN PROCESO DE ENTREGA",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "500190",
    },
    {
      OficinaEstatus: "MONTERREY CENTRO",
      F_Estatus: "02-AGO-2026 10:15",
      Estatus: "DOCUMENTADA",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "500180",
    },
  ],
  "4159476188": [
    {
      OficinaEstatus: "GUADALAJARA CENTRO",
      F_Estatus: "01-AGO-2026 09:00",
      Estatus: "DOCUMENTADA",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "500001",
    },
  ],
  "4157067169": [
    {
      OficinaEstatus: "LEÓN CENTRO",
      F_Estatus: "01-AGO-2026 08:10",
      Estatus: "EN PROCESO DE ENTREGA",
      Recibio: null,
      Observaciones: "En espera de repartidor asignado",
      K_Historia_Guia: "500310",
    },
    {
      OficinaEstatus: "VERACRUZ PUERTO",
      F_Estatus: "30-JUL-2026 16:20",
      Estatus: "DOCUMENTADA",
      Recibio: null,
      Observaciones: null,
      K_Historia_Guia: "500300",
    },
  ],
};
