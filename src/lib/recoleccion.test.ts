import { describe, expect, it } from "vitest";

import {
  diasDisponibles,
  observacionesConGuias,
  validarSolicitudRecoleccion,
  ventanasDisponibles,
} from "./recoleccion";
import type { HorarioRecoleccion } from "../types/recoleccion";

const horario: HorarioRecoleccion = {
  kOficina: 721,
  oficina: "MONTERREY-5 CONSTITUYENTES",
  horaMinima: "14:00",
  horaMaxima: "19:00",
  horaLimiteCaptura: "13:30",
  dias: {
    lunes: true,
    martes: false,
    miercoles: true,
    jueves: false,
    viernes: true,
    sabado: false,
    domingo: false,
  },
};

describe("diasDisponibles", () => {
  it("solo incluye los días de la semana marcados como activos", () => {
    // 2026-08-17 es lunes
    const lunes = new Date("2026-08-17T12:00:00");
    const dias = diasDisponibles(horario, lunes);
    const nombres = dias.map((d) => d.getDay());
    expect(nombres).toEqual([1, 3, 5]); // lunes, miércoles, viernes
  });
});

describe("ventanasDisponibles", () => {
  it("genera bloques de 1 hora entre horaMinima y horaMaxima", () => {
    expect(ventanasDisponibles(horario)).toEqual([
      { inicio: "14:00", fin: "15:00" },
      { inicio: "15:00", fin: "16:00" },
      { inicio: "16:00", fin: "17:00" },
      { inicio: "17:00", fin: "18:00" },
      { inicio: "18:00", fin: "19:00" },
    ]);
  });
});

describe("validarSolicitudRecoleccion", () => {
  const base = {
    domicilioId: "dom-1",
    fecha: "2026-08-17",
    horaInicio: "14:00",
    contacto: "Ana López",
    paquetes: 1,
  };

  it("exige una dirección seleccionada", () => {
    expect(validarSolicitudRecoleccion({ ...base, domicilioId: "" })).toEqual({
      ok: false,
      mensaje: "Selecciona una dirección de recolección.",
    });
  });

  it("exige fecha y horario", () => {
    expect(validarSolicitudRecoleccion({ ...base, fecha: "" })).toEqual({
      ok: false,
      mensaje: "Selecciona fecha y horario.",
    });
  });

  it("exige un contacto de al menos 3 caracteres", () => {
    expect(validarSolicitudRecoleccion({ ...base, contacto: "Al" })).toEqual({
      ok: false,
      mensaje: "El nombre de contacto debe tener al menos 3 caracteres.",
    });
  });

  it("exige al menos 1 paquete", () => {
    expect(validarSolicitudRecoleccion({ ...base, paquetes: 0 })).toEqual({
      ok: false,
      mensaje: "Indica cuántos paquetes se van a recolectar.",
    });
  });

  it("acepta datos completos", () => {
    expect(validarSolicitudRecoleccion(base)).toEqual({ ok: true });
  });
});

describe("observacionesConGuias", () => {
  it("no agrega nada si no hay guías de referencia", () => {
    expect(observacionesConGuias({ observaciones: "Tocar timbre", guiasReferencia: [] })).toBe("Tocar timbre");
  });

  it("antepone las guías a las observaciones existentes", () => {
    expect(
      observacionesConGuias({
        observaciones: "Tocar timbre",
        guiasReferencia: ["4003229791", "4159473741"],
      }),
    ).toBe("Guías a recolectar: 4003229791, 4159473741\nTocar timbre");
  });

  it("funciona sin observaciones adicionales", () => {
    expect(observacionesConGuias({ observaciones: "", guiasReferencia: ["4003229791"] })).toBe(
      "Guías a recolectar: 4003229791",
    );
  });
});

describe("disponibilidad del día actual", () => {
  // horario: lunes/miércoles/viernes, ventanas 14–19, límite de captura 13:30
  const lunes = (h: number, m = 0) => new Date(2026, 7, 17, h, m); // lunes 17-ago-2026

  it("hoy pasada la hora límite de captura no ofrece ninguna ventana", () => {
    const ahora = lunes(15, 10);
    const ventanas = ventanasDisponibles(horario, lunes(0), ahora);
    expect(ventanas).toEqual([]);
  });

  it("antes del límite de captura, hoy ofrece todas las ventanas futuras", () => {
    const ahora = lunes(12, 0);
    expect(ventanasDisponibles(horario, lunes(0), ahora)).toHaveLength(5);
  });

  it("otro día no se ve afectado por la hora actual", () => {
    const ahora = lunes(18, 0);
    const miercoles = new Date(2026, 7, 19);
    expect(ventanasDisponibles(horario, miercoles, ahora)).toHaveLength(5);
  });

  it("después del límite hoy desaparece de los días disponibles", () => {
    const ahora = lunes(14, 0);
    const dias = diasDisponibles(horario, ahora).map((d) => d.getDay());
    expect(dias).toEqual([3, 5]); // sin el lunes de hoy
  });

  it("sin fecha devuelve todas las ventanas del horario", () => {
    expect(ventanasDisponibles(horario)).toHaveLength(5);
  });
});
