const MESES: Record<string, string> = {
  ENE: "01",
  FEB: "02",
  MAR: "03",
  ABR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AGO: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DIC: "12",
};

/**
 * SIBOX dates come back as "DD-MMM-YYYY HH:MM" (Oracle-style, e.g.
 * "31-OCT-2007 09:03"). This reformats just the date part to "DD/MM/YYYY"
 * for display; returns the original string unchanged if it doesn't match.
 */
export function formatFechaCorta(fecha: string): string {
  const match = fecha.match(/^(\d{2})-([A-Za-zÁ-Úá-ú]{3})-(\d{4})/);
  if (!match) return fecha;
  const [, dia, mesTexto, anio] = match;
  const mes = MESES[mesTexto.toUpperCase()];
  if (!mes) return fecha;
  return `${dia}/${mes}/${anio}`;
}
