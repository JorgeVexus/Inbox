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

  /** La línea se imprime como JSON de una sola línea. */
  function ultimaLinea(espia: ReturnType<typeof vi.spyOn>) {
    return JSON.parse(String(espia.mock.calls[0]?.[0])) as Record<string, string>;
  }

  it("imprime una línea JSON con contexto, detalle enmascarado y recortado, y fecha", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("/wsX: SIBOX respondio result:1", "Usuario: a@b.com " + "x".repeat(2000));
    const l = ultimaLinea(espia);
    expect(l.nivel).toBe("error");
    expect(l.evento).toBe("/wsX: SIBOX respondio result:1");
    expect(l.detalle).toContain("Usuario: [correo]");
    expect(String(espia.mock.calls[0]?.[0]).length).toBeLessThan(800);
    expect(new Date(l.t ?? "").toString()).not.toBe("Invalid Date");
  });

  it("de un Error solo registra nombre y mensaje, no el objeto completo", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = Object.assign(new TypeError("fetch failed"), { cause: { body: "secreto@x.com" } });
    logError("/wsX: error inesperado", err);
    expect(ultimaLinea(espia).detalle).toBe("TypeError: fetch failed");
    expect(String(espia.mock.calls[0]?.[0])).not.toContain("secreto");
  });

  it("incluye el requestId para correlacionar y acepta llamarse sin detalle", () => {
    const espia = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("solo contexto", undefined, "abc-123");
    const l = ultimaLinea(espia);
    expect(l).toMatchObject({ evento: "solo contexto", requestId: "abc-123" });
    expect(l.detalle).toBeUndefined();
  });
});
