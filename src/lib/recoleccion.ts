import { MOCK_HORARIOS } from "./mock/recoleccion";
import { DIAS_SEMANA } from "@/types/recoleccion";
import type {
  HorarioRecoleccion,
  ResultadoRecoleccion,
  SolicitudRecoleccion,
} from "@/types/recoleccion";

const LATENCIA_MOCK_MS = 350;

function esperarMock(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MOCK_MS));
}

/**
 * Seam for "Obtener Horarios Por CP para Recolección". Real endpoint takes
 * just `{ Codigo_Postal }` and, on `result: 0`, returns an array of offices
 * (a CP can be covered by more than one) — this mock only ever has one
 * office per CP, so it returns at most one entry, but callers should treat
 * the result as a list from day one to not need a shape change later.
 *
 *   export async function obtenerHorariosPorCP(cp: string) {
 *     const res = await fetch("/api/recoleccion/horarios", {
 *       method: "POST",
 *       body: JSON.stringify({ Codigo_Postal: cp }),
 *     });
 *     const json = await res.json();
 *     if (json.resp.result !== 0) return [];
 *     return json.resp.data.map(mapHorarioApiAUi);
 *   }
 */
export async function obtenerHorariosPorCP(cp: string): Promise<HorarioRecoleccion[]> {
  await esperarMock();
  const horario = MOCK_HORARIOS[cp.trim()];
  return horario ? [horario] : [];
}

/** Next 7 calendar days (including today) where `horario` has pickup service. */
export function diasDisponibles(horario: HorarioRecoleccion, hoy: Date = new Date()): Date[] {
  const dias: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + i);
    const nombreDia = DIAS_SEMANA[fecha.getDay()];
    if (horario.dias[nombreDia]) dias.push(fecha);
  }
  return dias;
}

/** Time slots (1h windows) between horaMinima and horaMaxima, e.g. "14:00–15:00". */
export function ventanasDisponibles(horario: HorarioRecoleccion): { inicio: string; fin: string }[] {
  const [hMin] = horario.horaMinima.split(":").map(Number);
  const [hMax] = horario.horaMaxima.split(":").map(Number);
  const ventanas: { inicio: string; fin: string }[] = [];
  for (let h = hMin; h < hMax; h++) {
    ventanas.push({
      inicio: `${String(h).padStart(2, "0")}:00`,
      fin: `${String(Math.min(h + 1, hMax)).padStart(2, "0")}:00`,
    });
  }
  return ventanas;
}

export function validarSolicitudRecoleccion(
  datos: Pick<SolicitudRecoleccion, "domicilioId" | "fecha" | "horaInicio" | "contacto" | "paquetes">,
): { ok: true } | { ok: false; mensaje: string } {
  if (!datos.domicilioId) return { ok: false, mensaje: "Selecciona una dirección de recolección." };
  if (!datos.fecha || !datos.horaInicio) return { ok: false, mensaje: "Selecciona fecha y horario." };
  if (datos.contacto.trim().length < 3) {
    return { ok: false, mensaje: "El nombre de contacto debe tener al menos 3 caracteres." };
  }
  if (datos.paquetes < 1) return { ok: false, mensaje: "Indica cuántos paquetes se van a recolectar." };
  return { ok: true };
}

/**
 * Seam for "Generación de Recolección" (`wsGeneracionRecoleccion`). The real
 * request needs `K_Cliente` (int) to identify the account — but `Login`
 * (see src/types/auth.ts) only ever returns a `token`, no client ID or
 * profile data. There's no documented way to get `K_Cliente` from the
 * session today; this mock stands in with the example value from the API
 * doc (62801) until backend clarifies where it should come from.
 *
 * The real endpoint has no field for referencing existing guías — pickup is
 * scheduled by domicilio + package count, not by guía number. When the
 * caller already has guías for this pickup (the common case per the
 * client), they're folded into `Observaciones` here so the pickup crew
 * still sees them, since that's the only free-text field available.
 *
 *   export async function programarRecoleccion(datos: SolicitudRecoleccion) {
 *     const res = await fetch("/api/recoleccion", {
 *       method: "POST",
 *       body: JSON.stringify({
 *         K_Cliente: session.kCliente, // ⚠ not available yet, see comment above
 *         K_Domicilio: datos.domicilioId,
 *         F_Solicitud: `${datos.fecha}T${datos.horaInicio}:00`,
 *         F_Fin: `${datos.fecha}T${datos.horaFin}:00`,
 *         Paquetes: datos.paquetes,
 *         Contacto: datos.contacto,
 *         Observaciones: observacionesConGuias(datos),
 *       }),
 *     });
 *     const json = await res.json();
 *     if (json.resp.result !== 0) return { ok: false, mensaje: json.resp.data };
 *     return { ok: true, folio: json.resp.data.K_Recoleccion };
 *   }
 */
export async function programarRecoleccion(
  datos: SolicitudRecoleccion,
): Promise<ResultadoRecoleccion> {
  const validacion = validarSolicitudRecoleccion(datos);
  if (!validacion.ok) return validacion;

  await esperarMock();

  return { ok: true, folio: 1000000 + Math.floor(Math.random() * 900000) };
}

export function observacionesConGuias(datos: Pick<SolicitudRecoleccion, "observaciones" | "guiasReferencia">): string {
  const guias = datos.guiasReferencia.filter((g) => g.trim() !== "");
  if (guias.length === 0) return datos.observaciones.trim();
  const lineaGuias = `Guías a recolectar: ${guias.join(", ")}`;
  return datos.observaciones.trim()
    ? `${lineaGuias}\n${datos.observaciones.trim()}`
    : lineaGuias;
}
