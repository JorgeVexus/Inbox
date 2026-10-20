import path from "node:path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy (Fase 2 de la revisión 360°). Se probó una CSP más estricta y se
 * descartó, con esta razón: el HTML de Next.js incluye scripts en línea (el arranque del
 * empaquetador y la carga de datos `self.__next_f.push(...)`, distintos en cada página). Para
 * prohibir `'unsafe-inline'` en scripts hay dos caminos y ninguno es gratis:
 *   1. nonce por petición (`proxy.ts`): obliga a que TODAS las páginas se generen en cada
 *      visita (sin caché en CDN, más lento y más caro);
 *   2. `experimental.sri` (hashes): solo cubre archivos .js, no los scripts en línea, así que
 *      con `script-src 'self'` esos scripts quedarían bloqueados.
 * Se eligió una CSP estática que **sí** bloquea lo más peligroso: scripts de otros orígenes,
 * `eval`, `<object>`, `<base>` ajeno, formularios hacia fuera, incrustar el sitio en un iframe
 * y cualquier conexión del navegador que no sea a este sitio (SIBOX nunca se llama desde el
 * navegador), lo que limita la exfiltración aunque hubiese una inyección. Pasar a nonce queda
 * como decisión de la Fase 5 (estrategia de renderizado), cuando se conozca el hosting.
 *
 * - Imágenes: propias, `data:`/`blob:` (iconos del mapa) y las teselas de OpenStreetMap. Si se
 *   cambia el proveedor de teselas (INDICE_MAESTRO B11) hay que ajustar `img-src`.
 * - Los estilos en línea se permiten (React y Leaflet escriben atributos `style`).
 * - No se incluye `upgrade-insecure-requests`: no hay recursos http en el sitio, HSTS ya obliga a https, y WebKit lo aplica
 *   también a http://localhost, lo que rompe las pruebas E2E locales.
 * - En desarrollo se permite `'unsafe-eval'` y WebSocket para el recargado en caliente.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** Headers de seguridad para todas las rutas (auditoría 2026-10-12; CSP completa: Fase 2 de la revisión 360°). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/**
 * Caché de archivos estáticos (revisión 360°, Fase 5). Los de `/_next/static` ya llevan hash en el
 * nombre y Next los marca como inmutables; los de `public/` no (Next los sirve con `max-age=0`,
 * es decir, el navegador los revalida en cada visita). Sus nombres no llevan hash, así que se
 * cachean un día y se sirven viejos hasta una semana mientras se revalidan: un cambio de logo
 * tarda como máximo un día en verse, y las visitas repetidas no vuelven a pedir los iconos.
 */
const cacheEstaticos = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // El optimizador de imágenes cachea 7 días (por defecto 4 horas): los originales casi no cambian.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Un package-lock.json suelto fuera del repo hacia que Turbopack infiriera
  // mal la raiz del workspace.
  turbopack: { root: path.resolve(import.meta.dirname) },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: cacheEstaticos }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: cacheEstaticos }] },
      // Las respuestas del BFF dependen de quién pregunta y del momento: nunca se cachean.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
