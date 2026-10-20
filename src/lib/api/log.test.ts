import { afterEach, describe, expect, it, vi } from "vitest";

import { enmascarar, logError } from "./log";

describe("enmascarar", () => {
  it("oculta correos, teléfonos/números largos, RFC y tokens", () => {
    const sucio =
      "Cliente MySibox: 974, Usuario: ana.perez@correo.com, tel 5512345678, RFC VECJ880326XXX, " +
      "Authorization: Bearer abcdefghijklmnop1234 y eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.firmaFirmaFirma";
    const limpio = enmascarar(sucio);
    expect(limpio).not.toMatch(/ana\.perez|5512345678|VECJ880326|abcdefghijklmnop|eyJhbGci/);
    expect(limpio).toContain("[correo]");
    expect(limpio).toContain("[rfc]");
    expect(limpio).toContain("[número]");
    expect(limpio).toContain("[token]");
    // Lo que no es dato personal se conserva (el número de cliente corto sirve para depurar).
    expect(limpio).toContain("MySibox: 974");
  });
});

describe("logError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("imprime contexto y detalle enmascarado, y recorta mensajes enormes", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("/wsX: SIBOX respondio result:1", "Usuario: a@b.com " + "x".repeat(2000));
    const [linea] = espia.mock.calls[0] ?? [];
    expect(linea).toContain("/wsX: SIBOX respondio result:1 -> Usuario: [correo]");
    expect(String(linea).length).toBeLessThan(600);
  });

  it("de un Error solo registra nombre y mensaje, no el objeto completo", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = Object.assign(new TypeError("fetch failed"), { cause: { body: "secreto@x.com" } });
    logError("/wsX: error inesperado", err);
    expect(espia.mock.calls[0]).toEqual(["/wsX: error inesperado -> TypeError: fetch failed"]);
  });

  it("acepta llamarse sin detalle", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("solo contexto");
    expect(espia.mock.calls[0]).toEqual(["solo contexto"]);
  });
});
