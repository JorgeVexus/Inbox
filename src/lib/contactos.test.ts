import { describe, expect, it } from "vitest";
import { guardarContacto, listarContactos, validarContacto } from "./contactos";

const base = {
  nombre: "Ana Pérez",
  cp: "64000",
  ciudad: "Monterrey",
  colonia: "Centro",
  direccion: "Calle 1",
  numExt: "1",
  numInt: "",
  telefono: "8112345678",
  email: "",
};

describe("validarContacto", () => {
  it("exige nombre de al menos 3 caracteres", () => {
    expect(validarContacto({ ...base, nombre: "Al" })).toEqual({
      ok: false,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    });
  });

  it("exige teléfono de 10 dígitos (ignora guiones y espacios)", () => {
    expect(validarContacto({ ...base, telefono: "123" }).ok).toBe(false);
    expect(validarContacto({ ...base, telefono: "81 1234-5678" }).ok).toBe(true);
  });

  it("el correo es opcional pero, si viene, debe ser válido", () => {
    expect(validarContacto({ ...base, email: "" }).ok).toBe(true);
    expect(validarContacto({ ...base, email: "no-es-correo" }).ok).toBe(false);
    expect(validarContacto({ ...base, email: "a@b.mx" }).ok).toBe(true);
  });
});

describe("seam de contactos", () => {
  it("siembra la agenda inicial desde el mock", async () => {
    const lista = await listarContactos("INBOX");
    expect(lista.map((c) => c.nombre)).toEqual(["María López Garza", "Bodega Reynosa"]);
  });

  it("devuelve lista vacía para un usuario sin contactos", async () => {
    expect(await listarContactos("SIN_CONTACTOS")).toEqual([]);
  });

  it("no finge éxito cuando localStorage rechaza la escritura", async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "window");
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
      expect(await guardarContacto("INBOX", base)).toEqual({
        ok: false,
        mensaje: "No pudimos guardar el contacto. Intenta de nuevo.",
      });
    } finally {
      if (original) Object.defineProperty(globalThis, "window", original);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });
});
