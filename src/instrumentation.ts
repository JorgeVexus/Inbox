import type { Instrumentation } from "next";
import { logError } from "@/lib/api/log";

/**
 * Al arrancar el servidor: preferir IPv4 al resolver nombres.
 *
 * Hallazgo del 2026-10-27 (resuelve B1): Cloudflare de SIBOX autoriza por IP y el cliente solo tenía
 * autorizada la IPv4. Node, cuando la máquina tiene IPv6, intenta primero IPv6 (otra dirección, no
 * autorizada) y recibía el reto "Managed Challenge" (403); `curl` usaba IPv4 y pasaba. Con IPv4
 * primero, la misma petición de Node pasa (Login, wsRastreo y BusquedaCP: HTTP 200). Además evita
 * depender de direcciones IPv6 "temporales" que cambian solas. Ver docs/RUNBOOKS.md R2.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}

/**
 * Errores no controlados del servidor (render de páginas, rutas, acciones) en una línea JSON con los
 * datos personales enmascarados. Es el punto único donde se enchufaría Sentry u otro servicio
 * (ver docs/RUNBOOKS.md, "Observabilidad"): bastaría con enviar aquí `err.digest` y la ruta.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const error = err as Error & { digest?: string };
  logError(
    `error no controlado en ${context.routeType} ${request.path.split("?")[0] ?? ""}`,
    `${error.name}: ${error.message}`,
    error.digest,
  );
};
