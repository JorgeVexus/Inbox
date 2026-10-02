import { describe, expect, it } from "vitest";
import { rastreoDetalleResponseSchema } from "./rastreo-detalle";

// Respuesta real de RastreoDetalle (apitest.inbox.com.mx, 2026-10-02).
const REAL = [
  {
    OficinaEstatus: "REYNOSA HIDALGO",
    F_Estatus: "31-OCT-2007  09:03",
    Estatus: "ENTREGADA",
    Recibio: "CARLOS   ZARATE",
    Observaciones: null,
    K_Estado_Guia: "8",
    K_Historia_Guia: "307256",
    F_Historia: "31/10/2007 09:03:00 a. m.",
  },
  {
    OficinaEstatus: "VICTORIA",
    F_Estatus: "30-OCT-2007  19:00",
    Estatus: "DOCUMENTADA",
    Recibio: null,
    Observaciones: null,
    K_Estado_Guia: "1",
    K_Historia_Guia: "302197",
    F_Historia: "30/10/2007 07:00:00 p. m.",
  },
];

describe("rastreoDetalleResponseSchema", () => {
  it("acepta la respuesta real del historial", () => {
    expect(rastreoDetalleResponseSchema.safeParse(REAL).success).toBe(true);
  });

  it("rechaza un evento sin Estatus", () => {
    const { Estatus: _e, ...sin } = REAL[0];
    void _e;
    expect(rastreoDetalleResponseSchema.safeParse([sin]).success).toBe(false);
  });
});
