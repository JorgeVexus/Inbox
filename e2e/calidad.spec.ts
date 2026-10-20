import { expect, test } from "@playwright/test";

const PAGINAS = ["/", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte"];

test("SEO: descripción propia, canonical, Open Graph y Twitter en cada página", async ({ page }) => {
  const descripciones = new Set<string>();
  for (const ruta of PAGINAS) {
    await page.goto(ruta);
    const meta = await page.evaluate(() => {
      const g = (s: string, a = "content") => document.querySelector(s)?.getAttribute(a) ?? "";
      return {
        desc: g('meta[name="description"]'),
        canonical: g('link[rel="canonical"]', "href"),
        ogTitle: g('meta[property="og:title"]'),
        ogDesc: g('meta[property="og:description"]'),
        ogImg: g('meta[property="og:image"]'),
        ogLocale: g('meta[property="og:locale"]'),
        tw: g('meta[name="twitter:card"]'),
        theme: g('meta[name="theme-color"]'),
      };
    });
    expect(meta.desc.length, `descripción de ${ruta}`).toBeGreaterThan(40);
    expect(meta.desc.length, `descripción de ${ruta}`).toBeLessThanOrEqual(200);
    expect(meta.canonical, ruta).toMatch(
      ruta === "/" ? /^https?:\/\/[^/]+\/?$/ : new RegExp(ruta.replace("/", "\\/") + "$"),
    );
    expect(meta.ogTitle, ruta).toContain("Inbox");
    expect(meta.ogDesc, ruta).toBe(meta.desc);
    expect(meta.ogImg, ruta).toMatch(/hero-1\.webp$/);
    expect(meta.ogLocale, ruta).toBe("es_MX");
    expect(meta.tw, ruta).toBe("summary_large_image");
    expect(meta.theme, ruta).toBe("#ff6015");
    descripciones.add(meta.desc);
  }
  // Páginas con contenido distinto no deben compartir la misma descripción (salvo el Home y la base)
  expect(descripciones.size).toBeGreaterThanOrEqual(PAGINAS.length - 1);
});

test("SEO: datos estructurados Organization válidos", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator('script[type="application/ld+json"]').first().textContent();
  const datos = JSON.parse(json ?? "{}");
  expect(datos["@type"]).toBe("Organization");
  expect(datos.name).toBe("Inbox");
  expect(datos.url).toMatch(/^https?:\/\//);
});

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const ruta of ["/", "/rastreo", "/cotizar", "/cobertura", "/somos", "/soporte"]) {
    test(`${ruta} entrega un h1 y contenido en el HTML inicial`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.locator("h1").first()).toBeAttached();
      const chars = await page.evaluate(() => document.querySelector("main")?.innerText.length ?? 0);
      expect(chars).toBeGreaterThan(60);
    });
  }
});

test("autocompletado: tokens estándar en datos propios y 'off' en datos de terceros", async ({ page }) => {
  await page.goto("/cotizar");
  const ac = (label: string) => page.getByLabel(label, { exact: true }).getAttribute("autocomplete");
  expect(await ac("Código postal de origen")).toBe("postal-code");
  expect(await ac("Código postal de destino")).toBe("off");
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await page.getByRole("button", { name: "Comprar" }).click();
  expect(await ac("Nombre completo (origen)")).toBe("name");
  expect(await ac("Número celular (origen)")).toBe("tel");
  expect(await ac("Correo electrónico (origen)")).toBe("email");
  expect(await ac("Nombre completo (destino)")).toBe("off");
  expect(await ac("Número celular (destino)")).toBe("off");
  expect(await ac("Correo electrónico (destino)")).toBe("off");
});

test("autocompletado: tarjeta y login", async ({ page }) => {
  await page.goto("/cotizar");
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await page.getByRole("button", { name: "Comprar" }).click();
  await page.getByLabel("Nombre completo (origen)").fill("Ana");
  await page.getByLabel("Nombre completo (destino)").fill("Luis");
  await page.getByLabel("Número celular (origen)").fill("5512345678");
  await page.getByLabel("Número celular (destino)").fill("8112345678");
  await page.getByLabel("Correo electrónico (origen)").fill("a@example.com");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /Agregar tarjeta/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const ac = (l: string) => page.getByLabel(l, { exact: true }).getAttribute("autocomplete");
  expect(await ac("Número de tarjeta")).toBe("cc-number");
  expect(await ac("Nombre del titular")).toBe("cc-name");
  expect(await ac("Vencimiento (MM/AA)")).toBe("cc-exp");
  expect(await ac("Código de seguridad CVV")).toBe("cc-csc");
});

test.describe("reducir movimiento", () => {
  test.use({ reducedMotion: "reduce" });
  test("el carrusel del Hero no cambia de foto solo", async ({ page }) => {
    await page.goto("/");
    const fotos = () =>
      page.evaluate(() =>
        [...document.querySelectorAll("section img")]
          .slice(0, 6)
          .map((i) => getComputedStyle(i).opacity)
          .join(","),
      );
    const antes = await fotos();
    await page.waitForTimeout(6500);
    expect(await fotos()).toBe(antes);
  });
});

test("importes en formato mexicano con separador de miles", async ({ page }) => {
  await page.goto("/cotizar");
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await page.getByLabel("Peso").fill("900");
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await expect(page.getByText(/\$\d{1,3},\d{3}\.\d{2}/).first()).toBeVisible();
  await expect(page.getByText(/\$\d{4,}\.\d{2}/)).toHaveCount(0); // nunca "$9238.50"
});

test("rastreo: muestra el último estado y la línea de tiempo accesible", async ({ page }) => {
  await page.goto("/rastreo?guias=4003229791");
  await expect(page.getByText("Último estado:")).toBeVisible();
  await expect(page.locator("[aria-current='step']")).toHaveCount(1);
  await expect(page.getByText("(completado)").first()).toBeAttached();
});
