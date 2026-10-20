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
    const { Estatus: _e, ...sin } = REAL[0] as (typeof REAL)[number];
    void _e;
    expect(rastreoDetalleResponseSchema.safeParse([sin]).success).toBe(false);
  });
});

describe("versión pública del historial (sin datos de clientes)", () => {
  it("anula Observaciones y Recibio (traen correos y notas internas)", () => {
    const real = [
      {
        OficinaEstatus: "MYSIBOX",
        F_Estatus: "08-MAY-2026  09:35",
        Estatus: "PRE-DOCUMENTADA",
        Recibio: null,
        Observaciones: "Cliente MySibox: 974,   Usuario:  lupita27.ygc@gmail.com",
        K_Estado_Guia: "0",
        K_Historia_Guia: "1",
        F_Historia: null,
      },
      {
        OficinaEstatus: "TAMPICO AGUADULCE",
        F_Estatus: "27-MAY-2026  12:59",
        Estatus: "ENTREGADA",
        Recibio: "CECILIO DOMINGUES",
        Observaciones: "Entrega MOVIL",
        K_Estado_Guia: "8",
        K_Historia_Guia: "2",
        F_Historia: null,
      },
    ];
    const salida = rastreoDetalleResponseSchema.parse(real);
    expect(salida.every((e) => e.Observaciones === null && e.Recibio === null)).toBe(true);
    const json = JSON.stringify(salida);
    expect(json).not.toContain("@");
    expect(json).not.toContain("CECILIO");
    expect(salida[1]?.Estatus).toBe("ENTREGADA");
  });
});
