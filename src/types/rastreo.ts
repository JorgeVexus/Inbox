/**
 * Mirrors the `wsRastreo` response shape (see ../../CLAUDE.md and
 * Documentacion Api Pagina WEB ver Jun26.pdf, endpoint `wsRastreo`). Field
 * names match the API on purpose.
 */
export type Rastreo = {
  Guia: string;
  F_Documentacion: string | null;
  OficinaEstatus: string | null;
  F_Estatus: string | null;
  Estatus: string;
  Remitente: string | null;
  EstadoOrigen: string | null;
  CdOrigen: string | null;
  Origen: string | null;
  Destinatario: string | null;
  EstadoDestino: string | null;
  CdDestino: string | null;
  Destino: string | null;
  Recibio: string | null;
  /** Fecha prometida de entrega (la "fecha programada" del Figma). La API
   * la regresa aunque el PDF no la liste; null en guias ya entregadas. */
  F_Promesa_Entrega?: string | null;
};

/**
 * Mirrors `RastreoDetalle`'s response shape (same docs, endpoint
 * `RastreoDetalle`) — the chronological history behind "Ver detalles".
 */
export type RastreoEvento = {
  OficinaEstatus: string | null;
  F_Estatus: string;
  Estatus: string;
  Recibio: string | null;
  Observaciones: string | null;
  K_Historia_Guia: string;
};

/**
 * The 4-stage progress bar (Paquete recibido / En tránsito / En proceso de
 * entrega / Entregado) is a UI simplification the API doesn't provide
 * directly — `Estatus` is free text ("DOCUMENTADA", "EN RUTA", "ENTREGADA",
 * etc.), not a fixed stage enum. This keyword heuristic maps it to one of
 * the 4 steps for the timeline; it's not authoritative and should be
 * revisited once real Estatus values from production are known.
 */
export type PasoRastreo = 0 | 1 | 2 | 3;

export function pasoDesdeEstatus(estatus: string): PasoRastreo {
  const s = estatus.toUpperCase();
  if (s.includes("ENTREG")) return 3;
  if (s.includes("PROCESO") || s.includes("SUCURSAL") || s.includes("OCURRE")) return 2;
  if (s.includes("RUTA") || s.includes("TRANSITO") || s.includes("TRÁNSITO") || s.includes("REPARTO")) return 1;
  return 0;
}
