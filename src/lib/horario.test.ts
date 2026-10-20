import { describe, expect, it } from "vitest";
import { estadoHorario, interpretarHorario } from "./horario";
import { HORARIOS_REALES } from "./horario.fixtures";

/** Fecha en hora de Ciudad de México (UTC-6, sin horario de verano desde 2022). dia: 1=lun ... 0=dom */
function mx(dia: number, h: number, m = 0): Date {
  // 2026-10-12 es lunes
  const base = new Date(Date.UTC(2026, 9, 12 + ((dia + 6) % 7), h + 6, m));
  return base;
}

describe("horarios reales de las 71 oficinas", () => {
  it("todos los textos con contenido se interpretan (nunca 'cerrado' por no entender)", () => {
    const sinEntender = HORARIOS_REALES.filter((t) => interpretarHorario(t) === null);
    expect(sinEntender).toEqual([]);
  });
});

describe("estadoHorario", () => {
  it("sin texto es desconocido, no cerrado", () => {
    expect(estadoHorario(null)).toBe("desconocido");
    expect(estadoHorario("")).toBe("desconocido");
    expect(estadoHorario("   ")).toBe("desconocido");
    expect(estadoHorario("Consultar en sucursal")).toBe("desconocido");
  });

  it("'Lunes a Sábado 12:00  a 17:00 hrs'", () => {
    const t = "Lunes a Sábado 12:00  a 17:00 hrs";
    expect(estadoHorario(t, mx(1, 13))).toBe("abierto");
    expect(estadoHorario(t, mx(1, 11))).toBe("cerrado");
    expect(estadoHorario(t, mx(6, 16))).toBe("abierto");
    expect(estadoHorario(t, mx(0, 13))).toBe("cerrado"); // domingo
  });

  it("distingue horario de entre semana y de sábado", () => {
    const t = "Lunes a Viernes 08:00 a 20:00 hrs.\r\nSábado 08:00 a 16:00 hrs.";
    expect(estadoHorario(t, mx(3, 19))).toBe("abierto");
    expect(estadoHorario(t, mx(6, 19))).toBe("cerrado");
    expect(estadoHorario(t, mx(6, 15))).toBe("abierto");
  });

  it("turnos partidos ('y de 16:00 a 18:00') y jueves con horario propio", () => {
    const t =
      "Lunes, Martes, Miércoles, Viernes y Sábado\r\nde 9:00 a 14:00 y de 16:00 a 18:00\r\n\r\nJueves\r\n9:00 a 12:00 y de 14:00 a 18:00";
    expect(estadoHorario(t, mx(1, 15))).toBe("cerrado"); // lunes en la pausa
    expect(estadoHorario(t, mx(1, 17))).toBe("abierto");
    expect(estadoHorario(t, mx(4, 13))).toBe("cerrado"); // jueves pausa 12-14
    expect(estadoHorario(t, mx(4, 15))).toBe("abierto");
  });

  it("formato am/pm", () => {
    const t = "Lunes a Sábado de 8:30 am a 9:30 am y de 11:00 am  a 4:30 pm";
    expect(estadoHorario(t, mx(2, 9))).toBe("abierto");
    expect(estadoHorario(t, mx(2, 10))).toBe("cerrado");
    expect(estadoHorario(t, mx(2, 16))).toBe("abierto");
    expect(estadoHorario(t, mx(2, 17))).toBe("cerrado");
  });

  it("'CERRADO LOS DIAS JUEVES' gana sobre el resto", () => {
    const t =
      "Lunes-Martes-Miercoles-Viernes-Sabado y Domingo\r\n07:00 hrs-10:30 hrs. y\r\n17:00 hrs - 20:50 hrs.\r\nCERRADO LOS DIAS JUEVES";
    expect(estadoHorario(t, mx(4, 8))).toBe("cerrado");
    expect(estadoHorario(t, mx(3, 8))).toBe("abierto");
    expect(estadoHorario(t, mx(0, 18))).toBe("abierto");
    expect(estadoHorario(t, mx(1, 12))).toBe("cerrado");
  });

  it("grupos de días distintos en la misma línea", () => {
    const t = "Lunes 13:00 a 15:00 hrs.    Martes a viernes 15:00 a 17:00 hrs.";
    expect(estadoHorario(t, mx(1, 14))).toBe("abierto");
    expect(estadoHorario(t, mx(1, 16))).toBe("cerrado");
    expect(estadoHorario(t, mx(3, 16))).toBe("abierto");
    expect(estadoHorario(t, mx(6, 16))).toBe("cerrado");
  });

  it("sin día: aplica todos los días", () => {
    expect(estadoHorario("09:00 - 18:00", mx(0, 10))).toBe("abierto");
  });

  it("usa la hora de México aunque el navegador esté en otra zona", () => {
    // 15:00 UTC del lunes = 09:00 en CDMX
    expect(estadoHorario("Lunes a Viernes 09:00 - 18:00", new Date(Date.UTC(2026, 9, 12, 15, 0)))).toBe("abierto");
    // 02:00 UTC del lunes = domingo 20:00 en CDMX (cerrado)
    expect(estadoHorario("Lunes a Viernes 09:00 - 18:00", new Date(Date.UTC(2026, 9, 12, 2, 0)))).toBe("cerrado");
  });
});
