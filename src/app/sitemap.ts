import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Solo páginas públicas. La URL base viene de SITE_URL (definirla en Vercel con el dominio final). */
const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte"].map((ruta) => ({
    url: `${BASE}${ruta}`,
    changeFrequency: "monthly",
    priority: ruta === "" ? 1 : 0.7,
  }));
}
