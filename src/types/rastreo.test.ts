import { describe, expect, it } from "vitest";
import { pasoDesdeEstatus } from "./rastreo";

// Estatus reales observados en apitest.inbox.com.mx (2026-10-12).
describe("pasoDesdeEstatus", () => {
  it.each([
    ["VENDIDA", 0],
    ["PRE-DOCUMENTADA", 0],
    ["DOCUMENTADA", 0],
    ["RECOLECTADA", 0],
    ["EMBARCADA", 1],
    ["DESEMBARCADA", 1],
    ["TRANSBORDADA", 1],
    ["TRANSMITIDA", 1],
    ["LISTO PARA ENTREGAR", 2],
    ["EN RUTA", 2],
    ["ENTREGADA", 3],
  ] as const)("%s -> paso %i", (estatus, paso) => {
    expect(pasoDesdeEstatus(estatus)).toBe(paso);
  });

  it("LISTO PARA ENTREGAR nunca se muestra como Entregado", () => {
    expect(pasoDesdeEstatus("LISTO PARA ENTREGAR")).not.toBe(3);
  });

  it("ignora mayúsculas y espacios, y un estatus desconocido cae al paso 0", () => {
    expect(pasoDesdeEstatus("  entregada ")).toBe(3);
    expect(pasoDesdeEstatus("ESTATUS NUEVO")).toBe(0);
  });
});
