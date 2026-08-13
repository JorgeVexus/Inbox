import { describe, expect, it } from "vitest";
import {
  agruparEventosPorFecha,
  parsearFechaEvento,
} from "./envio-historial";
import type { RastreoEvento } from "../../types/rastreo";

function evento(id: string, fecha: string): RastreoEvento {
  return {
    OficinaEstatus: "OFICINA",
    F_Estatus: fecha,
    Estatus: "DOCUMENTADA",
    Recibio: null,
    Observaciones: null,
    K_Historia_Guia: id,
  };
}

describe("agruparEventosPorFecha", () => {
  it("preserva el orden y solo agrupa fechas contiguas", () => {
    const grupos = agruparEventosPorFecha([
      evento("A1", "01-AGO-2026 08:00"),
      evento("B1", "02-AGO-2026 09:00"),
      evento("A2", "01-AGO-2026 10:00"),
    ]);

    expect(grupos.map((grupo) => grupo.eventos.map((item) => item.K_Historia_Guia))).toEqual([
      ["A1"],
      ["B1"],
      ["A2"],
    ]);
  });
});

describe("parsearFechaEvento", () => {
  it("conserva completo un valor no reconocido", () => {
    expect(parsearFechaEvento("fecha no disponible")).toEqual({
      fecha: "fecha no disponible",
      hora: "Sin hora",
      claveFecha: "fecha no disponible",
    });
  });

  it("devuelve una etiqueta y una clave estables para un valor vacío", () => {
    expect(parsearFechaEvento("   ")).toEqual({
      fecha: "Sin fecha",
      hora: "Sin hora",
      claveFecha: "sin-fecha",
    });
  });
});
