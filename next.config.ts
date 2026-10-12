import path from "node:path";
import type { NextConfig } from "next";

/**
 * Headers de seguridad para todas las rutas. Se auditó el 2026-10-12 que no
 * había ninguno. NO se incluye una CSP completa a propósito: el sitio carga
 * tiles de OpenStreetMap y scripts inline de Next, y una CSP estricta sin
 * probarla en preview podría romper el mapa; las directivas de abajo son las
 * que no rompen nada. Evaluar una CSP con nonce antes de producción (ver
 * INDICE_MAESTRO.md, sección de pendientes de seguridad).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Un package-lock.json suelto fuera del repo hacia que Turbopack infiriera
  // mal la raiz del workspace.
  turbopack: { root: path.resolve(import.meta.dirname) },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
