import { expect, test } from "@playwright/test";
import { vigilarErrores } from "./helpers";

const PAGINAS = [
  { ruta: "/", titulo: /Inbox/ },
  { ruta: "/cotizar", titulo: /Cotizar/ },
  { ruta: "/rastreo", titulo: /Rastrear/ },
  { ruta: "/cobertura", titulo: /Cobertura/ },
  { ruta: "/somos", titulo: /Quiénes somos/ },
  { ruta: "/soporte", titulo: /Soporte/ },
  { ruta: "/privacidad", titulo: /privacidad/i },
  { ruta: "/terminos", titulo: /Términos/ },
  { ruta: "/trabaja-en-inbox", titulo: /Trabaja/ },
  { ruta: "/cuenta/crear", titulo: /Crear cuenta/ },
  { ruta: "/cuenta/recuperar", titulo: /Recuperar/ },
];

for (const { ruta, titulo } of PAGINAS) {
  test(`carga ${ruta}: título, un h1, un main y sin errores`, async ({ page }) => {
    const errores = vigilarErrores(page);
    const res = await page.goto(ruta);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(titulo);
    await expect(page.locator("h1:visible")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await page.waitForLoadState("networkidle");
    expect(errores).toEqual([]);
  });
}

test("404 propio en español con salida al inicio", async ({ page }) => {
  const res = await page.goto("/no-existe-esta-ruta");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL("/");
});

test("ningún enlace interno del sitio da 404", async ({ page, request }) => {
  const vistos = new Set<string>();
  for (const { ruta } of PAGINAS) {
    await page.goto(ruta);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const h of hrefs) if (h.startsWith("/") && !h.startsWith("//")) vistos.add(h.split("#")[0] ?? h);
  }
  for (const h of vistos) {
    const r = await request.get(h);
    expect(r.status(), `enlace ${h}`).toBeLessThan(400);
  }
});

const ANCHOS = [320, 375, 768, 1024, 1280, 1440, 1920];
for (const ancho of ANCHOS) {
  test(`sin desborde horizontal a ${ancho}px en páginas públicas`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    for (const { ruta } of PAGINAS) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      const { sw, vw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        vw: window.innerWidth,
      }));
      expect(sw, `${ruta} a ${ancho}px (scrollWidth ${sw})`).toBeLessThanOrEqual(vw + 1);
    }
  });
}

test("el primer Tab llega a un control visible", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "Safari no tabula enlaces por defecto");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const foco = await page.evaluate(() => {
    const a = document.activeElement as HTMLElement;
    const r = a.getBoundingClientRect();
    return { tag: a.tagName, visible: r.width > 0 && r.height > 0 };
  });
  expect(foco.tag).not.toBe("BODY");
  expect(foco.visible).toBe(true);
});
