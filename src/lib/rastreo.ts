import { MOCK_RASTREOS, MOCK_RASTREO_DETALLE } from "@/lib/mock/rastreo";
import type { Rastreo, RastreoEvento } from "@/types/rastreo";

/**
 * Seam for `wsRastreo`. Today it resolves against the mock table; once the
 * BFF exists this becomes:
 *
 *   export async function rastrearGuia(guia: string) {
 *     const res = await fetch("/api/rastreo", { method: "POST", body: JSON.stringify({ Guia: guia }) });
 *     const json = await res.json();
 *     return json.resp.result === 0 ? (json.resp.data[0] as Rastreo) : null;
 *   }
 *
 * No component that calls `rastrearGuia()` should need to change when that
 * happens — try guides 4003229791, 4159473741, 4159476188 or 4157067169 in
 * the demo, they're the ones seeded in src/lib/mock/rastreo.ts.
 */
export async function rastrearGuia(guia: string): Promise<Rastreo | null> {
  const clean = guia.trim();
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_RASTREOS[clean] ?? null;
}

/**
 * `/rastreo` supports tracking several guías at once (wsRastreo's own doc
 * says it "regresará la información de uno o varios envíos" — the real
 * endpoint likely accepts a batch in one call). This fires one lookup per
 * guía against the mock and keeps them in the same order as requested;
 * swap the body for a single batched request once the BFF exists instead
 * of N calls to rastrearGuia().
 */
export async function rastrearGuias(
  guias: string[],
): Promise<{ guia: string; resultado: Rastreo | null }[]> {
  return Promise.all(
    guias.map(async (guia) => ({ guia, resultado: await rastrearGuia(guia) })),
  );
}

/**
 * Seam for `RastreoDetalle` — the history behind "Ver detalles". Same
 * mock-today/fetch-tomorrow pattern as rastrearGuia().
 */
export async function rastrearGuiaDetalle(guia: string): Promise<RastreoEvento[] | null> {
  const clean = guia.trim();
  await new Promise((resolve) => setTimeout(resolve, 350));
  return MOCK_RASTREO_DETALLE[clean] ?? null;
}
