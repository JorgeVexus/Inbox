import { calcularCostoMock } from "@/lib/mock/cotizacion";
import type {
  ConfirmarInput,
  CostoOpcion,
  CotizacionInput,
  GuiaGenerada,
  MetodoPago,
  TarjetaInput,
} from "@/types/cotizacion";

/**
 * Seam 1 of 3 for /cotizar — same pattern as sucursales/rastreo/auth: this
 * file is the only thing that should change when the BFF exists.
 *
 * Step 2 (Costo): wraps `ObtieneDetalleCostos`. Real call needs a prior
 * `BusquedaCP` per side to confirm B_cobertura PROPIA on the origin (see
 * CLAUDE.md sección 4, "Cotización Completa" criteria) — that validation
 * doesn't exist yet either, so today ANY CP is accepted.
 *
 *   export async function obtenerCotizacion(input: CotizacionInput) {
 *     const res = await fetch("/api/cotizacion", { method: "POST", body: JSON.stringify(input) });
 *     return (await res.json()) as CostoOpcion[];
 *   }
 */
export async function obtenerCotizacion(
  input: CotizacionInput,
): Promise<CostoOpcion[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return calcularCostoMock(input);
}

/**
 * Seam 2 of 3 — wraps `wsGeneracionGuiaCliente`. The real response only
 * gives `K_Guia`; the estimated dates here are invented for the demo since
 * ObtieneDetalleCostos's `F_promesa_entrega` would need to be threaded
 * through from step 2 once that's a real call.
 */
export async function generarGuia(
  cotizacion: CotizacionInput,
  confirmar: ConfirmarInput,
  opcion: CostoOpcion,
): Promise<GuiaGenerada> {
  void cotizacion;
  void confirmar;
  void opcion; // not sent anywhere yet — see doc comment above
  await new Promise((resolve) => setTimeout(resolve, 600));
  const folio = String(Math.floor(4_000_000_000 + Math.random() * 900_000_000));
  return {
    folio,
    fechaEnvioEstimada: "Vie, 01 de agosto",
    fechaLlegadaEstimada: "Sáb, 02 de agosto",
  };
}

/**
 * Seam 3 of 3 — payment. NOT wired to anything real on purpose: every
 * payment endpoint (`Obtiene referencias pagos`, `Actualizo datos pago`,
 * PayPal, MIT/Santander) is marked "pendiente ENDPOINT" in the API spec
 * (Documentacion Api Pagina WEB ver Jun26.pdf, sección Pago — also
 * CLAUDE.md sección 6, semana 7). This never sends card data anywhere, it
 * only simulates a delay and returns success — do not build real payment
 * processing on top of this without a real gateway integration.
 */
export async function procesarPago(
  metodo: MetodoPago,
  tarjeta?: TarjetaInput,
): Promise<{ ok: boolean }> {
  void metodo;
  void tarjeta; // never sent anywhere — see doc comment above
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}
