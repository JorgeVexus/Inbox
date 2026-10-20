import type { Metadata } from "next";

/**
 * URL pública del sitio. Orden: SITE_URL (dominio final, definirla en Vercel) →
 * dominio de producción que Vercel inyecta → URL del despliegue (previews) →
 * localhost. Así, olvidar SITE_URL no deja canonical/Open Graph/sitemap
 * apuntando a localhost en un despliegue real.
 */
function urlBase(): string {
  const v = process.env;
  const crudo =
    v.SITE_URL ||
    (v.VERCEL_PROJECT_PRODUCTION_URL ? `https://${v.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (v.VERCEL_URL ? `https://${v.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return crudo.replace(/\/$/, "");
}
export const SITE_URL = urlBase();

export const NOMBRE_SITIO = "Inbox";
const DESCRIPCION_BASE =
  "Rastrea, cotiza y envía tus paquetes con Inbox. Cobertura nacional, recolección a domicilio y entrega segura.";

/**
 * Metadatos de una página. Next NO mezcla `openGraph` del layout raíz con el de
 * la página (lo reemplaza completo), así que cada página declara el suyo con
 * esta función: título y descripción propios, canonical y vista previa al compartir.
 */
export function paginaMeta(opts: { titulo: string; descripcion?: string; ruta: string; indexar?: boolean }): Metadata {
  const descripcion = opts.descripcion ?? DESCRIPCION_BASE;
  return {
    title: opts.titulo,
    description: descripcion,
    alternates: { canonical: opts.ruta },
    openGraph: {
      title: `${opts.titulo} | ${NOMBRE_SITIO}`,
      description: descripcion,
      url: opts.ruta,
      siteName: NOMBRE_SITIO,
      locale: "es_MX",
      type: "website",
      images: [{ url: "/images/hero-1.webp", width: 2000, height: 800, alt: "Camión de reparto Inbox" }],
    },
    twitter: { card: "summary_large_image", title: `${opts.titulo} | ${NOMBRE_SITIO}`, description: descripcion },
    ...(opts.indexar === false ? { robots: { index: false } } : {}),
  };
}

export { DESCRIPCION_BASE };
