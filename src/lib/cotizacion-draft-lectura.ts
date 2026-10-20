import { leerBorradorCotizacion } from "@/lib/almacen-schemas";
import { CLAVE_BORRADOR } from "@/lib/cotizacion-draft";
import type { CotizacionInput } from "@/types/cotizacion";

/** Lee el borrador que dejó Home y lo borra. Solo la usa /cotizar (ver nota en `cotizacion-draft.ts`). */
export function readAndClearCotizacionDraft(): CotizacionInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CLAVE_BORRADOR);
    if (!raw) return null;
    window.sessionStorage.removeItem(CLAVE_BORRADOR);
    return leerBorradorCotizacion(JSON.parse(raw));
  } catch {
    return null;
  }
}
