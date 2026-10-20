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
 *
 * La lectura vive en `cotizacion-draft-lectura.ts` a propósito: valida con Zod (~30 KB comprimidos) y
 * Home solo necesita guardar. Importarla aquí hacía que todo el sitio descargara Zod.
 */
export const CLAVE_BORRADOR = "inbox:cotizacion-draft";

export function saveCotizacionDraft(input: CotizacionInput) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify(input));
  } catch {
    // Almacenamiento bloqueado (modo privado / datos del sitio bloqueados): el
    // traspaso Home -> /cotizar es una comodidad, no debe romper el flujo.
  }
}
