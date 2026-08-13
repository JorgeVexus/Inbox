import { MOCK_CODIGOS_POSTALES } from "@/lib/mock/codigos-postales";
import type { ResultadoCP } from "@/types/codigo-postal";

/**
 * Seam for `BusquedaCP` — shared by any form in the app that needs
 * estado/ciudad/colonia from a CP (facturación modal today; the Home/
 * Cotizar CP fields are still plain text and should switch to this same
 * function instead of duplicating the lookup when they're wired up).
 *
 *   export async function buscarCodigoPostal(cp: string) {
 *     const res = await fetch("/api/codigo-postal", { method: "POST", body: JSON.stringify({ CP: cp }) });
 *     const json = await res.json();
 *     if (json.resp.result !== 0 || !json.resp.data.length) return null;
 *     const [first] = json.resp.data;
 *     return {
 *       cp,
 *       estado: first.D_Estado,
 *       ciudad: first.D_Ciudad,
 *       colonias: json.resp.data.map((row) => row.D_Colonia),
 *     } satisfies ResultadoCP;
 *   }
 */
export async function buscarCodigoPostal(cp: string): Promise<ResultadoCP | null> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_CODIGOS_POSTALES[cp.trim()] ?? null;
}
