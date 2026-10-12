import { expect, test } from "@playwright/test";
import { iniciarSesion, vigilarErrores } from "./helpers";

const MALOS = [
  ["JSON roto", "{no es json"],
  ["tipo equivocado", '{"a":1}'],
  ["lista con basura", '[1,"x",null,{}]'],
  ["campos con tipos incorrectos", '[{"id":5,"nombre":{"x":1},"telefono":[],"cp":9}]'],
] as const;

for (const [nombre, valor] of MALOS) {
  test(`datos locales corruptos (${nombre}): perfil y envíos siguen funcionando`, async ({ page }) => {
    const errores = vigilarErrores(page);
    await page.addInitScript((v) => {
      for (const k of ["inbox:contactos:INBOX", "inbox:domicilios:INBOX", "inbox:facturacion:INBOX"]) {
        localStorage.setItem(k, v);
      }
      localStorage.setItem("inbox:envio-alias:INBOX:4003229791", v);
    }, valor);
    await page.goto("/perfil");
    await iniciarSesion(page);
    await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mis contactos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Direcciones guardadas" })).toBeVisible();
    expect(errores).toEqual([]);
  });
}

test("borrador de cotización corrupto en sessionStorage no rompe /cotizar", async ({ page }) => {
  const errores = vigilarErrores(page);
  for (const valor of ["{roto", '{"a":1}', '{"origen":null,"paquetes":"x"}', "[]", "null"]) {
    await page.addInitScript((v) => sessionStorage.setItem("inbox:cotizacion-draft", v), valor);
    await page.goto("/cotizar");
    await expect(page.getByLabel("Código postal de origen")).toBeVisible();
    await page.evaluate(() => sessionStorage.clear());
  }
  expect(errores).toEqual([]);
});

test("localStorage y sessionStorage bloqueados: el sitio sigue cargando", async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.addInitScript(() => {
    const bloquear = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", { get: bloquear });
    Object.defineProperty(window, "sessionStorage", { get: bloquear });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/cotizar");
  await expect(page.getByLabel("Código postal de origen")).toBeVisible();
  expect(errores).toEqual([]);
});

test("sin red, el cotizador (todo en el navegador) sigue operando", async ({ page, context }) => {
  await page.goto("/cotizar");
  await context.setOffline(true);
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await expect(page.getByText("Recolección de paquete a domicilio")).toBeVisible();
  await context.setOffline(false);
});

test("doble clic en 'Confirmar pago' no duplica la operación", async ({ page }) => {
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
  const folio = (await page.getByText(/Folio:\s*\d{10}/).textContent()) ?? "";
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /Agregar tarjeta/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Número de tarjeta").fill("4242424242424242");
  await page.getByLabel("Nombre del titular").fill("ANA PEREZ");
  await page.getByLabel("Vencimiento (MM/AA)").fill("1230");
  await page.getByLabel("Código de seguridad CVV").fill("123");
  await page.getByRole("button", { name: "Confirmar pago" }).dblclick();
  await expect(page.getByRole("button", { name: /Facturar/ })).toBeVisible();
  await expect(page.getByText(folio.replace(/\D/g, ""))).toBeVisible(); // el folio no cambió
});

test.describe("hora de México: recolección cerca del cierre del día", () => {
  test.use({ timezoneId: "America/Mexico_City" });

  test("lunes 10 pm: no ofrece hoy ni una fecha adelantada por UTC", async ({ page }) => {
    // 2026-10-13T04:00Z = lunes 12-oct 22:00 en Ciudad de México
    await page.clock.setFixedTime(new Date("2026-10-13T04:00:00Z"));
    await page.goto("/recoleccion");
    await iniciarSesion(page);
    await expect.poll(async () => page.getByLabel("Fecha de recolección").locator("option").count()).toBeGreaterThan(1);
    const opciones = await page.getByLabel("Fecha de recolección").locator("option").allTextContents();
    const dias = opciones.slice(1);
    expect(dias.length).toBeGreaterThan(0);
    expect(dias[0]).toMatch(/martes 13/i); // hoy (lunes 12) ya no hay captura
    expect(dias.join("|")).not.toMatch(/lunes 12/i);
  });

  test("lunes 9 am: sí ofrece hoy", async ({ page }) => {
    // 2026-10-12T15:00Z = lunes 09:00 en Ciudad de México
    await page.clock.setFixedTime(new Date("2026-10-12T15:00:00Z"));
    await page.goto("/recoleccion");
    await iniciarSesion(page);
    await expect.poll(async () => page.getByLabel("Fecha de recolección").locator("option").count()).toBeGreaterThan(1);
    const opciones = await page.getByLabel("Fecha de recolección").locator("option").allTextContents();
    expect(opciones[1]).toMatch(/lunes 12/i);
  });
});

test.describe("visitante en otra zona horaria", () => {
  test.use({ timezoneId: "Pacific/Auckland" });
  test("el sitio carga y las fechas del cotizador son coherentes", async ({ page }) => {
    const errores = vigilarErrores(page);
    await page.goto("/cotizar");
    await page.getByLabel("Código postal de origen").fill("64060");
    await page.getByLabel("Ciudad de origen").fill("Monterrey");
    await page.getByLabel("Código postal de destino").fill("01000");
    await page.getByLabel("Ciudad de destino").fill("CDMX");
    await page.getByRole("button", { name: "Cotizar", exact: true }).click();
    await expect(page.getByText(/Entrega estimada/).first()).toBeVisible();
    expect(errores).toEqual([]);
  });
});
