import { describe, expect, it } from "vitest";
import { MAX_GUIAS, normalizarGuias } from "./guias";

describe("normalizarGuias", () => {
  it("separa por comas y espacios, quita vacíos y duplicados", () => {
    expect(normalizarGuias("4003229791, 4159473741  ,,4003229791").validas).toEqual(["4003229791", "4159473741"]);
  });

  it("descarta formatos inválidos (markup, símbolos, rutas)", () => {
    const r = normalizarGuias("123 <b>x</b> ../../etc 1'OR'1 ok-1");
    expect(r.validas).toEqual(["123", "ok-1"]);
    expect(r.invalidas.length).toBe(3);
  });

  it("descarta guías de más de 40 caracteres", () => {
    expect(normalizarGuias("A".repeat(41)).validas).toEqual([]);
    expect(normalizarGuias("A".repeat(40)).validas).toHaveLength(1);
  });

  it(`limita a ${MAX_GUIAS} guías y reporta los excedentes`, () => {
    const muchas = Array.from({ length: 500 }, (_, i) => String(1000000000 + i)).join(",");
    const r = normalizarGuias(muchas);
    expect(r.validas).toHaveLength(MAX_GUIAS);
    expect(r.excedentes).toBe(500 - MAX_GUIAS);
  });

  it("acepta null/undefined/vacío", () => {
    expect(normalizarGuias(null).validas).toEqual([]);
    expect(normalizarGuias(undefined).validas).toEqual([]);
    expect(normalizarGuias("").validas).toEqual([]);
  });
});
