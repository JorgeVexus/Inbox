import { datosDesdeArchivoMock } from "@/lib/mock/facturacion";
import type { DatosFacturacion } from "@/types/facturacion";

function claveFacturacionLocal(usuario: string): string {
  const usuarioCanonico = usuario.trim().normalize("NFC").toLocaleUpperCase("es-MX");
  return `inbox:facturacion:${encodeURIComponent(usuarioCanonico)}`;
}

/**
 * Local-only cache of the last `DatosFacturacion` saved via
 * `guardarDatosFacturacion()`, so `/perfil` can show "your saved fiscal
 * data" without a dedicated GET endpoint — there isn't one documented (the
 * plan only mentions consulting an *existing* RFC, not a generic "get my
 * saved data" call). This is a convenience for the demo only; the real BFF
 * should have its own way to fetch saved fiscal data by client, and this
 * cache should be removed once that exists.
 */
export function obtenerDatosFacturacionGuardados(usuario: string): DatosFacturacion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(claveFacturacionLocal(usuario));
    return raw ? (JSON.parse(raw) as DatosFacturacion) : null;
  } catch {
    return null;
  }
}

function guardarDatosFacturacionLocal(usuario: string, datos: DatosFacturacion): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(claveFacturacionLocal(usuario), JSON.stringify(datos));
  } catch {
    // Best-effort cache only — a failure here doesn't affect the "real" save.
  }
}

/**
 * Seam 1 of 2. The API spec's plan doc describes the flow ("se pide el
 * número de guía, se especifica el RFC... en caso que no exista, pide que
 * se guarden los nuevos datos") but doesn't name a concrete endpoint for
 * *saving* fiscal data — only for consuming an existing RFC. Confirm the
 * real endpoint with backend before wiring this; until then it always
 * succeeds.
 *
 *   export async function guardarDatosFacturacion(datos: DatosFacturacion) {
 *     const res = await fetch("/api/facturacion", { method: "POST", body: JSON.stringify(datos) });
 *     return (await res.json()) as { ok: boolean; mensaje?: string };
 *   }
 */
export async function guardarDatosFacturacion(
  datos: DatosFacturacion,
  usuario?: string,
): Promise<{ ok: boolean; mensaje?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (!datos.rfc.trim()) {
    return { ok: false, mensaje: "El RFC es obligatorio." };
  }
  if (usuario) guardarDatosFacturacionLocal(usuario, datos);
  return { ok: true };
}

/**
 * Seam 2 of 2 — "sube tu constancia fiscal y te llenamos el formulario".
 * No real parsing happens here (see doc comment in
 * src/lib/mock/facturacion.ts) — this only validates the file type
 * client-side and returns canned data after a delay so the upload → autofill
 * interaction can be built and reviewed. Swap the body for a real upload
 * (multipart POST to a parsing endpoint) once one exists; the modal only
 * depends on getting back a `Partial<DatosFacturacion>`.
 */
export async function extraerDatosConstanciaFiscal(
  file: File,
): Promise<Partial<DatosFacturacion>> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "xml") {
    throw new Error("Solo se aceptan archivos PDF o XML.");
  }
  await new Promise((resolve) => setTimeout(resolve, 900));
  return datosDesdeArchivoMock();
}
