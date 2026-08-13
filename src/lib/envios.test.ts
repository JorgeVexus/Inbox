import { describe, expect, it } from "vitest";

import {
  asignarNombreEnvio,
  claveAliasEnvio,
  filtrarEnvios,
  listarEnvios,
  obtenerDetalleEnvio,
  validarNombreEnvio,
} from "./envios";
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

describe("seam de envios", () => {
  it("genera una clave de alias estable y aislada por usuario", () => {
    expect(claveAliasEnvio("INBOX", "4003229791")).toBe(
      "inbox:envio-alias:INBOX:4003229791",
    );
    expect(claveAliasEnvio("OTRO", "4003229791")).not.toBe(
      claveAliasEnvio("INBOX", "4003229791"),
    );
  });

  it("normaliza la identidad del usuario para compartir sus aliases", () => {
    expect(claveAliasEnvio(" inbox ", "4003229791")).toBe(
      claveAliasEnvio("INBOX", "4003229791"),
    );
  });

  it("unifica formas unicode equivalentes de la identidad del usuario", () => {
    expect(claveAliasEnvio("JOSÉ", "4003229791")).toBe(
      claveAliasEnvio("JOSE\u0301", "4003229791"),
    );
  });

  it("devuelve aliases iniciales en SSR", async () => {
    const resultado = await listarEnvios("INBOX");

    expect(resultado.map(({ guia, nombre }) => ({ guia, nombre }))).toEqual([
      { guia: "4003229791", nombre: "Paquete ropa" },
      { guia: "4159473741", nombre: "Paquete cositas" },
      { guia: "4157067169", nombre: "Pkt mamá" },
    ]);
  });

  it("obtiene detalle clonado y devuelve null para una guia desconocida", async () => {
    const detalle = await obtenerDetalleEnvio("4003229791");

    expect(detalle?.guia).toBe("4003229791");
    expect(detalle?.eventos).not.toHaveLength(0);
    expect(await obtenerDetalleEnvio("desconocida")).toBeNull();
  });

  it("no finge exito cuando localStorage rechaza la escritura", async () => {
    const descriptorOriginal = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => null,
          setItem: () => {
            throw new Error("storage bloqueado");
          },
        },
      },
    });

    try {
      expect(await asignarNombreEnvio("INBOX", "4003229791", "  Ropa  ")).toEqual({
        ok: false,
        mensaje: "No pudimos guardar el nombre del envío. Intenta de nuevo.",
      });
    } finally {
      if (descriptorOriginal) {
        Object.defineProperty(globalThis, "window", descriptorOriginal);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });
});
