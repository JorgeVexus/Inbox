import type { CotizacionInput } from "@/types/cotizacion";

/**
 * Client-only bridge so the Home hero's quote card can hand off what the
 * visitor already typed to /cotizar's step 1, instead of making them start
 * over. Deliberately sessionStorage (not a query string): the payload has
 * several nested fields and doesn't need to be shareable/bookmarkable.
 *
 * Read once and cleared immediately — if the visitor reloads /cotizar or
 * navigates back to it later, it should behave like a fresh quote, not
 * silently resurrect stale data.
 */
const KEY = "inbox:cotizacion-draft";

export function saveCotizacionDraft(input: CotizacionInput) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(input));
}

export function readAndClearCotizacionDraft(): CotizacionInput | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as CotizacionInput;
  } catch {
    return null;
  }
}
