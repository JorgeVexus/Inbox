/**
 * Mirrors what `BusquedaCP` returns (see ../../CLAUDE.md sección 4 and
 * Documentacion Api Pagina WEB ver Jun26.pdf, endpoint `BusquedaCP`):
 * one CP can map to several colonias, all sharing the same
 * estado/ciudad. Real responses are a flat array of rows (one per
 * colonia) with repeated estado/ciudad — this shape groups them,
 * which the BFF route should do before returning to the client.
 */
export type ResultadoCP = {
  cp: string;
  estado: string;
  ciudad: string;
  colonias: string[];
};
