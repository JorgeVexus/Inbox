/**
 * Mirrors `ObtenerHorariosPorCP` (see ../../CLAUDE.md sección 4 and
 * Documentacion Api Pagina WEB ver Jun26.pdf, endpoint "Obtener Horarios
 * Por CP para Recolección"). Field names follow the app's camelCase
 * convention; map from the API's PascalCase in the BFF route the same way
 * `sucursales.ts` does for `ListadoOficinas`.
 */
export type HorarioRecoleccion = {
  kOficina: number;
  oficina: string;
  horaMinima: string;
  horaMaxima: string;
  horaLimiteCaptura: string;
  dias: {
    lunes: boolean;
    martes: boolean;
    miercoles: boolean;
    jueves: boolean;
    viernes: boolean;
    sabado: boolean;
    domingo: boolean;
  };
};

/**
 * Input for `wsGeneracionRecoleccion`. The real endpoint only takes
 * `K_Domicilio` (or manual address fields — not supported here, see
 * lib/recoleccion.ts doc comment) plus this scheduling info. It has **no
 * field for referencing existing guías** — `guiasReferencia` is a local-only
 * addition folded into `Observaciones` before sending, so the pickup crew
 * knows which shipments to grab even though the API itself doesn't ask.
 */
export type SolicitudRecoleccion = {
  domicilioId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  paquetes: number;
  contacto: string;
  observaciones: string;
  guiasReferencia: string[];
};

export type ResultadoRecoleccion =
  | { ok: true; folio: number }
  | { ok: false; mensaje: string };

export const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];
