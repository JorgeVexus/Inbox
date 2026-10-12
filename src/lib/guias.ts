/** Máximo de guías por consulta: cada una es una llamada al BFF/SIBOX. */
export const MAX_GUIAS = 10;

const FORMATO_GUIA = /^[A-Za-z0-9-]{1,40}$/;

export type GuiasNormalizadas = {
  validas: string[];
  /** Entradas con formato inválido (se ignoran, no se consultan). */
  invalidas: string[];
  /** Cuántas guías válidas quedaron fuera por pasar el máximo. */
  excedentes: number;
};

/**
 * Normaliza texto libre (separado por comas/espacios) a una lista de guías
 * únicas y bien formadas, con tope de MAX_GUIAS. Es la primera barrera: el BFF
 * vuelve a validar el formato en el servidor.
 */
export function normalizarGuias(raw: string | null | undefined): GuiasNormalizadas {
  const vistas = new Set<string>();
  const invalidas: string[] = [];
  for (const parte of (raw ?? "").split(/[\s,]+/)) {
    const limpio = parte.trim();
    if (!limpio) continue;
    if (FORMATO_GUIA.test(limpio)) vistas.add(limpio);
    else invalidas.push(limpio.slice(0, 20));
  }
  const todas = [...vistas];
  return { validas: todas.slice(0, MAX_GUIAS), invalidas, excedentes: Math.max(0, todas.length - MAX_GUIAS) };
}
