import type { MetadataRoute } from "next";

const BASE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/perfil", "/envio", "/recoleccion"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
