import { describe, expect, it } from "vitest";

import { filtrarEnvios, validarNombreEnvio } from "./envios";
import type { EnvioPerfil } from "../types/envio";

const envios: EnvioPerfil[] = [
  {
    guia: "1234567890",
    nombre: "Paquete para mamá",
    rastreo: {
      Guia: "1234567890",
      F_Documentacion: "2026-08-12",
      OficinaEstatus: "Monterrey",
      F_Estatus: "2026-08-13",
      Estatus: "En tránsito",
      Remitente: "Ana",
      EstadoOrigen: "Nuevo León",
      CdOrigen: "Monterrey",
      Origen: "MTY",
      Destinatario: "Luis",
      EstadoDestino: "Jalisco",
      CdDestino: "Guadalajara",
      Destino: "GDL",
      Recibio: null,
    },
    fechaProgramada: "2026-08-15",
  },
  {
    guia: "9876543210",
    nombre: "Documentos",
    rastreo: {
      Guia: "9876543210",
      F_Documentacion: "2026-08-11",
      OficinaEstatus: "Guadalajara",
      F_Estatus: "2026-08-12",
      Estatus: "Documentada",
      Remitente: "Luis",
      EstadoOrigen: "Jalisco",
      CdOrigen: "Guadalajara",
      Origen: "GDL",
      Destinatario: "Ana",
      EstadoDestino: "Nuevo León",
      CdDestino: "Monterrey",
      Destino: "MTY",
      Recibio: null,
    },
    fechaProgramada: "2026-08-16",
  },
];

describe("validarNombreEnvio", () => {
  it("rechaza un nombre compuesto solo por espacios", () => {
    expect(validarNombreEnvio("   \t  ")).toEqual({
      ok: false,
      mensaje: "Escribe un nombre para tu envío.",
    });
  });

  it("rechaza nombres de más de 60 caracteres", () => {
    expect(validarNombreEnvio("a".repeat(61))).toEqual({
      ok: false,
      mensaje: "El nombre no puede tener más de 60 caracteres.",
    });
  });

  it("recorta y colapsa los espacios del nombre", () => {
    expect(validarNombreEnvio("  Regalo   para\tMamá  ")).toEqual({
      ok: true,
      nombre: "Regalo para Mamá",
    });
  });
});

describe("filtrarEnvios", () => {
  it("busca el alias sin distinguir mayúsculas con locale es-MX", () => {
    expect(filtrarEnvios(envios, "PAQUETE PARA MAMÁ")).toEqual([envios[0]]);
  });

  it("busca aliases equivalentes con acentos en forma NFD", () => {
    expect(filtrarEnvios(envios, "MAMA\u0301")).toEqual([envios[0]]);
  });

  it("busca por número de guía", () => {
    expect(filtrarEnvios(envios, "765432")).toEqual([envios[1]]);
  });

  it("devuelve la colección original si la consulta está vacía", () => {
    expect(filtrarEnvios(envios, "   ")).toBe(envios);
  });
});
