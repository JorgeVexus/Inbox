import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const BASE = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/perfil", "/envio", "/recoleccion"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
