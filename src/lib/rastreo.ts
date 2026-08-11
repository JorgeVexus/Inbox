import { MOCK_RASTREOS } from "@/lib/mock/rastreo";
import type { Rastreo } from "@/types/rastreo";

/**
 * Single seam between the UI and `wsRastreo`. Today it resolves against the
 * mock table synchronously-ish (wrapped in a Promise so callers already
 * `await` it); once the BFF exists this becomes:
 *
 *   export async function rastrearGuia(guia: string) {
 *     const res = await fetch("/api/rastreo", { method: "POST", body: JSON.stringify({ Guia: guia }) });
 *     const json = await res.json();
 *     return json.resp.result === 0 ? (json.resp.data[0] as Rastreo) : null;
 *   }
 *
 * No component that calls `rastrearGuia()` should need to change when that
 * happens — try guides 4003229791 or 4159473741 in the demo, they're the
 * only two seeded in src/lib/mock/rastreo.ts.
 */
export async function rastrearGuia(guia: string): Promise<Rastreo | null> {
  const clean = guia.trim();
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_RASTREOS[clean] ?? null;
}
