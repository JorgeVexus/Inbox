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
 * directly — `Estatus` is free text, not a stage enum.
 *
 * Mapeo construido con los valores REALES de `Estatus` observados en
 * apitest.inbox.com.mx (2026-10-12, 5 guías). Se compara por valor exacto,
 * NO por `includes()`: "LISTO PARA ENTREGAR" contiene "ENTREG" y aparecía
 * como "Entregado", y "DESEMBARCADA" contiene "EMBARCADA". Un estatus que no
 * esté en la tabla cae al paso 0 (y debe agregarse aquí al descubrirlo).
 * Sigue sin ser un catálogo oficial — pedirle a backend la lista completa.
 */
export type PasoRastreo = 0 | 1 | 2 | 3;

const PASO_POR_ESTATUS: Record<string, PasoRastreo> = {
  // 0 — Paquete recibido / documentado
  "VENDIDA": 0,
  "PRE-DOCUMENTADA": 0,
  "DOCUMENTADA": 0,
  "RECOLECTADA": 0,
  // 1 — En tránsito entre oficinas / con otra paquetería
  "EMBARCADA": 1,
  "DESEMBARCADA": 1,
  "TRANSBORDADA": 1,
  "TRANSMITIDA": 1,
  // 2 — En proceso de entrega (ya en la oficina destino o saliendo a reparto)
  "LISTO PARA ENTREGAR": 2,
  "EN RUTA": 2,
  // 3 — Entregado
  "ENTREGADA": 3,
};

export function pasoDesdeEstatus(estatus: string): PasoRastreo {
  return PASO_POR_ESTATUS[estatus.trim().toUpperCase()] ?? 0;
}
