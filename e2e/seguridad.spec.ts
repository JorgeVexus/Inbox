import { expect, test } from "@playwright/test";

test("headers de seguridad en páginas y API", async ({ request }) => {
  for (const ruta of ["/", "/cotizar", "/api/rastreo"]) {
    const r = ruta.startsWith("/api") ? await request.post(ruta, { data: {} }) : await request.get(ruta);
    const h = r.headers();
    expect(h["x-content-type-options"], ruta).toBe("nosniff");
    expect(h["x-frame-options"], ruta).toBe("DENY");
    expect(h["content-security-policy"], ruta).toContain("frame-ancestors 'none'");
    expect(h["strict-transport-security"], ruta).toContain("max-age=");
    expect(h["referrer-policy"], ruta).toBeTruthy();
    expect(h["permissions-policy"], ruta).toContain("camera=()");
    expect(h["x-powered-by"], ruta).toBeUndefined();
  }
});

test("el sitio no se puede incrustar en un iframe de otro origen", async ({ page }) => {
  await page.goto("about:blank");
  const bloqueado = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const f = document.createElement("iframe");
        f.src = "http://localhost:3400/";
        f.onload = () => {
          try {
            resolve(!f.contentDocument || f.contentDocument.body.childElementCount === 0);
          } catch {
            resolve(true);
          }
        };
        document.body.appendChild(f);
        setTimeout(() => resolve(true), 4000);
      }),
  );
  expect(bloqueado).toBe(true);
});

test.describe("API /api/rastreo y /api/rastreo/detalle: entradas hostiles", () => {
  for (const ruta of ["/api/rastreo", "/api/rastreo/detalle"]) {
    test(`${ruta}: validación antes de tocar SIBOX`, async ({ request }) => {
      const casos: [string, unknown, number][] = [
        ["guía vacía", { Guia: "" }, 400],
        ["guía no string", { Guia: 123 }, 400],
        ["inyección SQL", { Guia: "1' OR '1'='1" }, 400],
        ["traversal", { Guia: "../../Login" }, 400],
        ["41 caracteres", { Guia: "A".repeat(41) }, 400],
        ["sin campo", {}, 400],
        ["campo extra (K_Cliente ajeno)", { Guia: "4003229791", K_Cliente: 1 }, 400],
        ["arreglo", [], 400],
        ["null", null, 400],
      ];
      for (const [nombre, data, estado] of casos) {
        const r = await request.post(ruta, { data: data as object });
        expect(r.status(), `${nombre}`).toBe(estado);
        const t = await r.text();
        expect(t).not.toMatch(/stack|at Object|node_modules|sibox|cloudflare|apitest/i);
      }
    });

    test(`${ruta}: JSON roto, cuerpo enorme y métodos incorrectos`, async ({ request }) => {
      expect(
        (await request.post(ruta, { data: "{roto", headers: { "content-type": "application/json" } })).status(),
      ).toBe(400);
      expect((await request.post(ruta, { data: { Guia: "A".repeat(20_000) } })).status()).toBe(413);
      for (const m of ["get", "put", "delete", "patch"] as const) {
        expect((await request[m](ruta)).status(), m).toBe(405);
      }
    });
  }
});

test("el JavaScript que se envía al navegador no contiene credenciales ni la URL de la API", async ({
  page,
  request,
}) => {
  const urls = new Set<string>();
  page.on("response", (r) => {
    if (r.url().includes("/_next/static/") && r.url().endsWith(".js")) urls.add(r.url());
  });
  for (const ruta of ["/", "/cotizar", "/rastreo", "/cobertura", "/perfil"]) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
  }
  expect(urls.size).toBeGreaterThan(3);
  for (const u of urls) {
    const js = await (await request.get(u)).text();
    expect(js, u).not.toMatch(/SIBOX_SERVICE|SIBOX_API_BASE_URL|apitest\.inbox\.com\.mx|api\.inbox\.com\.mx/);
    expect(js, u).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./); // tokens JWT
  }
});

test("el HTML no filtra datos personales del rastreo ni la contraseña demo", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/Prueba|password"\s*:/i);
});

test("el sitio no crea cookies", async ({ page, context }) => {
  await page.goto("/");
  await page.goto("/cotizar");
  expect(await context.cookies()).toEqual([]);
});

test("robots.txt oculta privadas y API; sitemap solo lista públicas", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const p of ["/api/", "/perfil", "/envio", "/recoleccion"]) expect(robots).toContain(`Disallow: ${p}`);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/cotizar");
  expect(sitemap).not.toMatch(/\/perfil|\/envio|\/recoleccion|\/api/);
});

test("rutas privadas no se indexan (meta robots noindex)", async ({ page }) => {
  for (const ruta of ["/perfil", "/envio", "/recoleccion"]) {
    await page.goto(ruta);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("la política de seguridad de contenido se cumple en todo el sitio (sin violaciones)", async ({ page }) => {
  const violaciones: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  for (const ruta of ["/", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte"]) {
    const r = await page.goto(ruta);
    expect(r?.headers()["content-security-policy"], ruta).toMatch(/default-src 'self'.*frame-ancestors 'none'/);
    await page.waitForLoadState("networkidle");
    await page.mouse.wheel(0, 4000); // llega al mapa (carga perezosa de Leaflet y teselas)
    await page.waitForTimeout(600);
    violaciones.push(...(await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? [])));
  }
  expect(violaciones).toEqual([]);
});

test("la CSP impide scripts de otros orígenes, eval y conexiones externas", async ({ request }) => {
  const csp = (await request.get("/")).headers()["content-security-policy"] ?? "";
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toMatch(/script-src[^;]*(\*|https?:)/);
  expect(csp).not.toContain("unsafe-eval");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'self'");
});

test("las API rechazan peticiones de otro sitio (Origin ajeno) y cuerpos que no son JSON", async ({ request }) => {
  for (const ruta of ["/api/rastreo", "/api/rastreo/detalle"]) {
    const ajeno = await request.post(ruta, {
      data: { Guia: "4003229791" },
      headers: { origin: "https://sitio-malicioso.example" },
    });
    expect(ajeno.status(), `${ruta} con Origin ajeno`).toBe(403);

    const mismoSitio = await request.post(ruta, {
      data: { Guia: "mal formato!" },
      headers: { origin: "http://localhost:3400" },
    });
    expect(mismoSitio.status(), `${ruta} con Origin propio`).toBe(400);

    const texto = await request.post(ruta, {
      data: '{"Guia":"4003229791"}',
      headers: { "content-type": "text/plain" },
    });
    expect(texto.status(), `${ruta} con text/plain`).toBe(415);
  }
});
