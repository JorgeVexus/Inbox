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

// Guía real de pruebas (2026-10-12) con firma, coordenadas y nombres.
const GUIA_CON_DATOS_PERSONALES = {
  Guia: "4159021743",
  F_Documentacion: "26-MAY-2026  19:22",
  OficinaEstatus: "TAMPICO AGUADULCE",
  F_Estatus: "27-MAY-2026 12:59",
  Estatus: "ENTREGADA",
  Remitente: "ECOTECNOLOGIA EN TRATAMIENTOS SA DE CV",
  EstadoOrigen: "TAM",
  CdOrigen: "CIUDAD VICTORIA",
  Origen: "VICTORIA",
  Destinatario: "TECNICAS ESPECIALES DE REDUCCION DE ALTAMIRA SA DE CV",
  EstadoDestino: "TAM",
  CdDestino: "ALTAMIRA",
  Destino: "TAMPICO AGUADULCE",
  Recibio: "CECILIO DOMINGUES",
  Firma: "iVBORw0KGgoAAAANSUhEUgAAAmYAAACZCAYAAACFd/ZvAAAJvUlEQVR4Aeza3W7UQAwG0Ij3f2gEFOi2ySaTzK99kKDd3YzHPu7Fp4ofmz8ECBAgQIAAAQJTCAhmU6xBEwQIEIgqYC4CBEoEBLMSLc8SIECAAAECBBoKCGYNcZWOKWAqAgQIECDQSkAwayWrLgECBAgQIECgUODHthWe8DgBAgQIECBAgEATAb8xa8KqKAECBAj8E/ANAQKXBQSzy1QeJECAAAECBAi0FRDM2vqqHlPAVAQIECBAoImAYNaEVVECBAgQIECAQLnAn2BWfs4JAgQIECBAgACBygKCWWVQ5QgQIEDguw94hwCBawKC2TUnTxEgQIAAAQIEmgsIZs2JXRBTwFQECBAgQIC+gGBW31RFAgQIECBAgMAtgX/B7NZpBwgQIECAAAECBKoJCGbVKBUiQIAAgTcCPiJAgMAFAcHsApJHCBAgQIAAAQI9BASzHsruiClgKgIECBAgUFlAMKsMqhwBAgQIECBA4K7A52B2t4ZzBAgQIECAAAECFQQEswqISiBAgACBKwKeIUCAwJmAYHYm5HMCBAgQIECAQCcBwawTtGtiCpiKAAECBAgQqCkgmNXUVIsAAQIECBAg8EDgSzB7UMlRAgQIECBAgACBRwKC2SM+hwkQIECgSMDDBAi8FRDM3vL4kAABAgQIECDQT0Aw62ftppgCpiJAgAABAtUEBLNqlAoRIECAAAECBJ4JfA9mz+o5TYAAAQIECBAgcFNAMLsJ5xgBAgQI3BNwigCBYwHB7NjGJwQIECBAgACBrgKCWVdul8UUMBUBAgQIEKgjIJjVcVSFAAECBAgQIPBYYDeYPa6qAAECBAgQIECAQLGAYFZM5gABAgQIPBRwnACBAwHB7ADG2wQIECBAgACB3gKCWW9x98UUMBUBAgQIEKggIJhVQFSCAAECBAgQIFBD4CiY1aitBgECBAgQIECAQIGAYFaA5VECBAgQqCWgDgECewKC2Z6K9wgQIECAAAECAwQEswHorowpYCoCBAgQIPBUQDB7Kug8AQIECBAgQKCSwJtgVukGZQgQIECAAAECBC4JCGaXmDxEgAABAtUFFCRA4JuAYPaNxBsECBAgQIAAgTECgtkYd7fGFDAVAQIECBB4JCCYPeJzmAABAgQIECBQT+B9MKt3j0oECBAgQIAAAQInAoLZCZCPCRAgQKCdgMoECLwKCGavHl4RIECAAAECBIYJCGbD6F0cU8BUBAgQIEDgvoBgdt/OSQIECBAgQIBAVYHTYFb1NsUIECBAgAABAgQOBQSzQxofECBAgEAHAVcQIPBJQDD7hOFbAgQIECBAgMBIAcFspL67YwqYigABAgQI3BQQzG7COUaAAAECBAgQqC1wJZjVvlM9AgQIECBAgACBHQHBbAfFWwQIECDQU8BdBAj8FRDM/kr4SoAAAQIECBAYLCCYDV6A62MKmIoAAQIECNwREMzuqDlDgAABAgQIEGggcDGYNbhZSQIECBAgQIAAgRcBwewFwwsCBAgQGCLgUgIEfgsIZr8Z/EOAAAECBAgQGC8gmI3fgQ5iCpiKAAECBAgUCwhmxWQOECBAgAABAgTaCFwPZm3uV5UAAQIECBAgQOBDQDD7gPCFAAECBMYKuJ0AgW0TzPwUECBAgAABAgQmERDMJlmENiIKmIkAAQIECJQJCGZlXp4mQIAAAQIECDQTKApmzbpQmAABAgQIECBAwP8x8zNAgAABAtMIaIRAegG/MUv/IwCAAAECBAgQmEVAMJtlE/qIKWAqAgQIECBQICCYFWB5lAABAgQIECDQUqA0mLXsRW0CBAgQIECAQGoBwSz1+g1PgACB2QT0QyC3gGCWe/+mJ0CAAAECBCYSEMwmWoZWYgqYigABAgQIXBUQzK5KeY4AAQIECBAg0FjgRjBr3JHyBAgQIECAAIGkAoJZ0sUbmwABAtMKaIxAYgHBLPHyjU6AAAECBAjMJSCYzbUP3cQUMBUBAgQIELgkIJhdYvIQAQIECBAgQKC9wL1g1r4vNxAgQIAAAQIE0gkIZulWbmACBAjML6BDAlkFBLOsmzc3AQIECBAgMJ2AYDbdSjQUU8BUBAgQIEDgXEAwOzfyBAECBAgQIECgi8DtYNalO5cQIECAAAECBBIJCGaJlm1UAgQILCSgVQIpBQSzlGs3NAECBAgQIDCjgGA241b0FFPAVAQIECBA4ERAMDkB8jEBAgQIECBAoJfAk2DWq0f3ECBAgAABAgRSCAhmKdZsSAIECKwooGcC+QQEs3w7NzEBAgQIECAwqYBgNuliNBVTwFQECBAgQOCdgGD2TsdnBAgQIECAAIGOAg+DWcdOXUWAAAECBAgQCC4gmAVfsPEIECCwtIDmCSQTEMySLdy4BAgQIECAwLwCgtm8u9FZTAFTESBAgACBQwHB7JDGBwQIECBAgACBvgLPg1nfft1GgAABAgQIEAgrIJiFXa3BCBAgEEPAFAQyCQhmmbZtVgIECBAgQGBqAcFs6vVoLqaAqQgQIECAwL6AYLbv4l0CBAgQIECAQHeBKsGse9cuJECAAAECBAgEFBDMAi7VSAQIEAgmYBwCaQQEszSrNigBAgQIECAwu4BgNvuG9BdTwFQECBAgQGBHQDDbQfEWAQIECBAgQGCEQK1gNqJ3dxIgQIAAAQIEQgkIZqHWaRgCBAhEFTAXgRwCglmOPZuSAAECBAgQWEBAMFtgSVqMKWAqAgQIECDwVUAw+yritQkQIECAAAECgwQqBrNBE7iWAAECBAgQIBBEQDALskhjECBAILyAAQkkEBDMEizZiAQIECBAgMAaAoLZGnvSZUwBUxEgQIAAAQIvAoLZC4cXBAgQIECAAIFxAnWD2bg53EyAAAECBAgQWF5AMFt+hQYgQIBAHgGTEoguIJhF37D5CBAgQIAAgWUEBLNlVqXRmAKmIkCAAAEC/wUEs/8WviNAgAABAgQIDBWoHsyGTuNyAgQIECBAgMDCAoLZwsvTOgECBBIKGJlAaAHBLPR6DUeAAAECBAisJCCYrbQtvcYUMBUBAgQIEPgQEMw+IHwhQIAAAQIECIwWaBHMRs/kfgIECBAgQIDAkgKC2ZJr0zQBAgQyC5idQFwBwSzubk1GgAABAgQILCYgmC22MO3GFDAVAQIECBD4JSCY/VLwlwABAgQIECAwgUCjYDbBZFogQIAAAQIECCwmIJgttjDtEiBAgMC2bRsEAkEFBLOgizUWAQIECBAgsJ6AYLbeznQcU8BUBAgQIEBgE8z8EBAgQIAAAQIEJhFoF8wmGVAbBAgQIECAAIFVBASzVTalTwIECBB4EfCCQEQBwSziVs1EgAABAgQIEFhS4CcAAP//WtI5xQAAAAZJREFUAwBMggEzI9oTUgAAAABJRU5ErkJggg==",
  Latitud: "22.432887",
  Longitud: "-97.9441412",
  F_Promesa_Entrega: "27/05/2026",
};

describe("versión pública del rastreo (sin datos personales)", () => {
  it("anula nombres, firma y coordenadas pero conserva lo que la UI necesita", () => {
    const [r] = rastreoResponseSchema.parse([GUIA_CON_DATOS_PERSONALES]);
    expect(r.Remitente).toBeNull();
    expect(r.Destinatario).toBeNull();
    expect(r.Recibio).toBeNull();
    expect(r.Firma).toBeNull();
    expect(r.Latitud).toBeNull();
    expect(r.Longitud).toBeNull();
    expect(r.Estatus).toBe("ENTREGADA");
    expect(r.F_Promesa_Entrega).toBe("27/05/2026");
    expect(r.CdDestino).toBe("ALTAMIRA");
  });

  it("el JSON que sale al navegador no contiene ninguno de esos datos", () => {
    const json = JSON.stringify(rastreoResponseSchema.parse([GUIA_CON_DATOS_PERSONALES]));
    for (const dato of ["ECOTECNOLOGIA", "TECNICAS ESPECIALES", "CECILIO", "iVBORw0KGgo", "22.432887"]) {
      expect(json).not.toContain(dato);
    }
  });
});
