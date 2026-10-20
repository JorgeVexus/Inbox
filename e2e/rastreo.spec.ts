import { expect, test } from "@playwright/test";
import { vigilarErrores } from "./helpers";

test("rastreo: agrega guías, descarta duplicadas, vacías y con formato inválido", async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto("/rastreo");
  const buscar = page.getByLabel("Buscar envío");
  await buscar.fill("4003229791");
  await buscar.press("Enter");
  await expect(page).toHaveURL(/guias=4003229791$/);
  await expect(page.getByText("Número de guía").first()).toBeVisible();

  await buscar.fill("4003229791");
  await buscar.press("Enter");
  await expect(page.getByLabel(/Quitar guía/)).toHaveCount(1);

  await buscar.fill("<b>x</b> ../../etc 1'OR'1");
  await buscar.press("Enter");
  await expect(page.getByText(/formato inválido/)).toBeVisible();
  await expect(page).toHaveURL(/guias=4003229791$/);
  await expect(page.locator("main b")).toHaveCount(0);

  await buscar.fill("   ");
  await buscar.press("Enter");
  await expect(page).toHaveURL(/guias=4003229791$/);
  expect(errores).toEqual([]);
});

test("rastreo: máximo 10 guías por consulta (también por URL)", async ({ page }) => {
  const muchas = Array.from({ length: 40 }, (_, i) => String(4000000000 + i)).join(",");
  await page.goto("/rastreo?guias=" + muchas);
  await expect(
    page.getByRole("button", { name: "Quitar", exact: true }).or(page.getByLabel(/Quitar guía/)),
  ).toHaveCount(10);
});

test("rastreo: detalles se abren y 'Quitar' elimina la guía", async ({ page }) => {
  await page.goto("/rastreo?guias=4003229791,4159473741");
  await page.getByRole("button", { name: "Ver detalles" }).first().click();
  await expect(page.getByText("ENTREGADA").first()).toBeVisible();
  await page.getByLabel("Quitar guía 4003229791").click();
  await expect(page).toHaveURL(/guias=4159473741$/);
});

test("rastreo del Hero lleva a /rastreo con la guía", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle"); // esperar la hidratación de React antes de interactuar
  await page.getByLabel("Ingrese el número de rastreo").first().fill("4003229791");
  await page.getByRole("button", { name: "Rastrear" }).first().click();
  await expect(page).toHaveURL(/\/rastreo\?guias=4003229791/);
});

test("guía en la URL con script no se ejecuta ni se refleja como HTML", async ({ page }) => {
  let dialogo = false;
  page.on("dialog", async (d) => {
    dialogo = true;
    await d.dismiss();
  });
  await page.goto("/rastreo?guias=" + encodeURIComponent('<img src=x onerror=alert(1)>,"><script>alert(2)</script>'));
  await page.waitForLoadState("networkidle");
  expect(dialogo).toBe(false);
  await expect(page.locator("main img[src='x']")).toHaveCount(0);
  await expect(page.locator("main script")).toHaveCount(0);
});

test("chat: rastreo y formulario de correo con validación", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir chat de soporte" }).click();
  await page.getByRole("button", { name: "Chat", exact: true }).click();
  const enviar = page.getByRole("button", { name: "Enviar", exact: true });
  await expect(enviar).toBeDisabled();
  await page.getByLabel("Ingrese un correo electrónico").fill("mal");
  await expect(enviar).toBeDisabled();
  await page.getByLabel("Ingrese un correo electrónico").fill("a@b.co");
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page.getByText(/Recibimos tu correo/)).toBeVisible();
});
