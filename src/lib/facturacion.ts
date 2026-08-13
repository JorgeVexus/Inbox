import { datosDesdeArchivoMock } from "@/lib/mock/facturacion";
import type { DatosFacturacion } from "@/types/facturacion";

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
): Promise<{ ok: boolean; mensaje?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (!datos.rfc.trim()) {
    return { ok: false, mensaje: "El RFC es obligatorio." };
  }
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
