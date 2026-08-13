import { describe, expect, it } from "vitest";

import { filtrarEnvios, validarNombreEnvio } from "./envios";
import type { EnvioPerfil } from "../types/envio";

const envios: EnvioPerfil[] = [
  {
    guia: "1234567890",
    nombre: "Regalo para Mamá",
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
    expect(filtrarEnvios(envios, "regalo PARA mamá")).toEqual(envios);
  });

  it("busca por número de guía", () => {
    expect(filtrarEnvios(envios, "456789")).toEqual(envios);
  });

  it("devuelve la colección original si la consulta está vacía", () => {
    expect(filtrarEnvios(envios, "   ")).toBe(envios);
  });
});
