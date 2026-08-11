/**
 * Mirrors the `wsRastreo` response shape (see ../../CLAUDE.md and
 * Documentacion Api Pagina WEB ver Jun26.pdf, endpoint `wsRastreo`). Field
 * names match the API on purpose.
 */
export type Rastreo = {
  Guia: string;
  F_Documentacion: string;
  OficinaEstatus: string;
  F_Estatus: string;
  Estatus: string;
  Remitente: string;
  EstadoOrigen: string;
  CdOrigen: string;
  Origen: string;
  Destinatario: string;
  EstadoDestino: string;
  CdDestino: string;
  Destino: string;
  Recibio: string | null;
};
