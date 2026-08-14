import { describe, expect, it } from "vitest";

import { guardarDomicilio, listarDomicilios, validarDomicilio } from "./domicilios";
import { domicilioVacio } from "../types/domicilio";

describe("validarDomicilio", () => {
  it("exige un alias", () => {
    expect(validarDomicilio({ ...domicilioVacio(), calle: "x", cp: "12345", ciudad: "y", estado: "z", telefono: "1" })).toEqual({
      ok: false,
      mensaje: "Ponle un nombre a esta dirección (ej. Casa, Oficina).",
    });
  });

  it("exige un C.P de 5 dígitos", () => {
    const base = { ...domicilioVacio(), alias: "Casa", calle: "x", ciudad: "y", estado: "z", telefono: "1" };
    expect(validarDomicilio({ ...base, cp: "123" })).toEqual({
      ok: false,
      mensaje: "Ingresa un código postal válido de 5 dígitos.",
    });
  });

  it("acepta datos completos", () => {
    expect(
      validarDomicilio({
        ...domicilioVacio(),
        alias: "Casa",
        calle: "Calle 1",
        cp: "64000",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        telefono: "8112345678",
      }),
    ).toEqual({ ok: true });
  });
});

describe("seam de domicilios", () => {
  it("siembra la lista inicial desde el mock para un usuario conocido", async () => {
    const resultado = await listarDomicilios("INBOX");
    expect(resultado.map((d) => d.alias)).toEqual(["Casa", "Oficina"]);
  });

  it("devuelve una lista vacía para un usuario sin domicilios mock", async () => {
    expect(await listarDomicilios("NUEVO_USUARIO_SIN_DATOS")).toEqual([]);
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
      const resultado = await guardarDomicilio("INBOX", {
        alias: "Casa",
        contacto: "",
        telefono: "8112345678",
        calle: "Calle 1",
        numero: "1",
        colonia: "",
        cp: "64000",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        referencias: "",
        predeterminado: false,
      });
      expect(resultado).toEqual({
        ok: false,
        mensaje: "No pudimos guardar la dirección. Intenta de nuevo.",
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
