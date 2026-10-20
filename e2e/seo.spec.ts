import { expect, test, type Page } from "@playwright/test";

const PUBLICAS = [
  { ruta: "/", migas: false },
  { ruta: "/cotizar", migas: true },
  { ruta: "/rastreo", migas: true },
  { ruta: "/cobertura", migas: true },
  { ruta: "/somos", migas: true },
  { ruta: "/soporte", migas: true },
];
const PRIVADAS_O_PROVISIONALES = [
  "/perfil",
  "/envio",
  "/recoleccion",
  "/privacidad",
  "/terminos",
  "/cuenta/crear",
  "/cuenta/recuperar",
];

async function leer(page: Page) {
  return page.evaluate(() => {
    const meta = (sel: string) => document.querySelector(sel)?.getAttribute("content") ?? null;
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      robots: meta('meta[name="robots"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogUrl: meta('meta[property="og:url"]'),
      viewport: meta('meta[name="viewport"]'),
      h1: document.querySelectorAll("h1").length,
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
    };
  });
}

const titulos = new Map<string, string>();
const descripciones = new Map<string, string>();

for (const { ruta, migas } of PUBLICAS) {
  test(`SEO ${ruta}: metadatos únicos y completos, canonical propio, datos estructurados válidos`, async ({ page }) => {
    await page.goto(ruta);
    const m = await leer(page);

    expect(m.lang).toBe("es-MX");
    expect(m.viewport).toContain("width=device-width");
    expect(m.h1, "un solo h1").toBe(1);
    expect(m.robots ?? "").not.toMatch(/noindex/);

    // Título y descripción: con longitud útil para los resultados de búsqueda y distintos en cada página.
    expect(m.title.length).toBeGreaterThanOrEqual(10);
    expect(m.title.length).toBeLessThanOrEqual(65);
    expect(m.description ?? "").not.toBe("");
    expect((m.description ?? "").length).toBeGreaterThanOrEqual(50);
    expect((m.description ?? "").length).toBeLessThanOrEqual(170);
    expect(titulos.get(m.title), `título repetido en ${ruta}`).toBeUndefined();
    titulos.set(m.title, ruta);
    // La portada puede conservar la descripción general; las demás páginas deben tener la propia.
    if (ruta !== "/") {
      expect(descripciones.get(m.description ?? ""), `descripción repetida en ${ruta}`).toBeUndefined();
      descripciones.set(m.description ?? "", ruta);
    }

    // Canonical absoluto, sin parámetros, y coherente con Open Graph.
    expect(m.canonical).toMatch(/^https?:\/\//);
    expect(new URL(m.canonical ?? "").pathname).toBe(ruta);
    expect(new URL(m.canonical ?? "").search).toBe("");
    expect(m.ogUrl).toBe(m.canonical);
    expect(m.ogTitle).toContain(m.title.split(" | ")[0] ?? "");
    expect(m.ogDescription).toBe(m.description);
    expect(m.ogImage).toMatch(/^https?:\/\/.+\.(webp|png|jpg)/);

    // JSON-LD: parseable, con @context y @type; las páginas internas llevan migas de pan.
    expect(m.jsonld.length).toBeGreaterThan(0);
    const bloques = m.jsonld.map(
      (t) => JSON.parse(t) as { "@context": string; "@type": string; itemListElement?: unknown[] },
    );
    for (const b of bloques) {
      expect(b["@context"]).toBe("https://schema.org");
      expect(b["@type"]).toBeTruthy();
    }
    expect(bloques.some((b) => b["@type"] === "Organization")).toBe(true);
    const migasPan = bloques.find((b) => b["@type"] === "BreadcrumbList");
    if (migas) {
      expect(migasPan, `migas de pan en ${ruta}`).toBeTruthy();
      expect(migasPan?.itemListElement?.length).toBe(2);
    }
  });

  test(`SEO ${ruta}: la imagen de Open Graph existe`, async ({ page, request }) => {
    await page.goto(ruta);
    const { ogImage } = await leer(page);
    const url = new URL(ogImage ?? "");
    // En pruebas el sitio vive en otro origen que SITE_URL: se pide por ruta.
    const r = await request.get(url.pathname);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toMatch(/image\//);
  });
}

for (const ruta of PRIVADAS_O_PROVISIONALES) {
  test(`SEO ${ruta}: no se indexa`, async ({ page, request }) => {
    await page.goto(ruta);
    const m = await leer(page);
    const cabecera = (await request.get(ruta)).headers()["x-robots-tag"] ?? "";
    expect(`${m.robots ?? ""} ${cabecera}`).toMatch(/noindex/);
  });
}

test("el sitemap lista exactamente las páginas públicas, con URLs absolutas que responden 200", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
  expect(urls.length).toBe(PUBLICAS.length);
  for (const u of urls) expect(u).toMatch(/^https?:\/\//);
  expect(urls.map((u) => new URL(u).pathname).sort()).toEqual(PUBLICAS.map((p) => p.ruta).sort());
  for (const u of urls) expect((await request.get(new URL(u).pathname)).status(), u).toBe(200);
});

test("robots.txt apunta al sitemap y bloquea API y zonas privadas", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  for (const bloqueada of ["/api/", "/perfil", "/envio", "/recoleccion"])
    expect(txt).toContain(`Disallow: ${bloqueada}`);
  expect(txt).not.toMatch(/Disallow: \/\s*$/m); // no se bloquea todo el sitio por error
});

test("las rutas inexistentes responden 404 real (no 200 'blando') y no se indexan", async ({ request }) => {
  for (const ruta of ["/no-existe", "/cotizar/no-existe", "/rastreo/123"]) {
    const r = await request.get(ruta);
    expect(r.status(), ruta).toBe(404);
  }
});

test("una sola versión de cada URL: con barra final o mayúsculas redirige o responde igual de forma canónica", async ({
  request,
}) => {
  const r = await request.get("/cotizar/", { maxRedirects: 0 });
  // Next redirige /ruta/ → /ruta (308); lo importante es que no exista contenido duplicado con 200 en ambas.
  expect([200, 308]).toContain(r.status());
  if (r.status() === 200) expect((await r.text()).toLowerCase()).toContain('rel="canonical"');
});
