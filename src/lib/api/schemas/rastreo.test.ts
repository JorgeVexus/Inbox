import { describe, expect, it } from "vitest";
import { rastreoRequestSchema, rastreoResponseSchema } from "./rastreo";

// Respuestas reales capturadas de apitest.inbox.com.mx el 2026-10-02.
const GUIA_ENTREGADA = {
  Guia: "4003229791",
  F_Documentacion: "30-OCT-2007  19:00",
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
  Recibio: "CARLOS   ZARATE",
  Firma: null,
  Latitud: null,
  Longitud: null,
  F_Promesa_Entrega: null,
};

const GUIA_INTERNA_CON_NULOS = {
  Guia: "0000000000",
  F_Documentacion: "27-JUL-2008  12:00",
  OficinaEstatus: "VICTORIA",
  F_Estatus: "27-JUL-2008 13:00",
  Estatus: "CANCELADA",
  Remitente: "GUIA PARA PROCESO DE FACTURAS",
  EstadoOrigen: null,
  CdOrigen: null,
  Origen: "GERENCIA INBOX",
  Destinatario: "GUIA PARA PROCESO DE FACTURAS",
  EstadoDestino: null,
  CdDestino: null,
  Destino: "GERENCIA INBOX",
  Recibio: null,
  Firma: null,
  Latitud: null,
  Longitud: null,
  F_Promesa_Entrega: null,
};

describe("rastreoResponseSchema", () => {
  it("acepta la respuesta real de una guía entregada", () => {
    expect(rastreoResponseSchema.safeParse([GUIA_ENTREGADA]).success).toBe(true);
  });

  it("acepta una guía real con estado/ciudad de origen y destino en null", () => {
    expect(rastreoResponseSchema.safeParse([GUIA_INTERNA_CON_NULOS]).success).toBe(true);
  });

  it("rechaza un registro sin Estatus", () => {
    const { Estatus: _omit, ...sinEstatus } = GUIA_ENTREGADA;
    void _omit;
    expect(rastreoResponseSchema.safeParse([sinEstatus]).success).toBe(false);
  });
});

describe("rastreoRequestSchema", () => {
  it("recorta espacios y rechaza guías vacías", () => {
    expect(rastreoRequestSchema.parse({ Guia: "  4003229791 " })).toEqual({ Guia: "4003229791" });
    expect(rastreoRequestSchema.safeParse({ Guia: "   " }).success).toBe(false);
  });
});
