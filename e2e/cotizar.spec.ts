import { expect, test, type Page } from "@playwright/test";
import { vigilarErrores } from "./helpers";

async function paso1(page: Page) {
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
}

async function hastaPagoExitoso(page: Page) {
  await page.goto("/cotizar");
  await paso1(page);
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await page.getByRole("button", { name: "Comprar" }).click();
  await page.getByLabel("Nombre completo (origen)").fill("Ana Pérez");
  await page.getByLabel("Nombre completo (destino)").fill("Luis Gómez");
  await page.getByLabel("Número celular (origen)").fill("5512345678");
  await page.getByLabel("Número celular (destino)").fill("8112345678");
  await page.getByLabel("Correo electrónico (origen)").fill("ana@example.com");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /Agregar tarjeta/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Número de tarjeta").fill("4242424242424242");
  await page.getByLabel("Nombre del titular").fill("ANA PEREZ");
  await page.getByLabel("Vencimiento (MM/AA)").fill("1230");
  await page.getByLabel("Código de seguridad CVV").fill("123");
  await page.getByRole("button", { name: "Confirmar pago" }).click();
}

test("paso 1: validaciones (CP, ciudad, peso y medidas)", async ({ page }) => {
  await page.goto("/cotizar");
  const cotizar = page.getByRole("button", { name: "Cotizar", exact: true });
  await expect(cotizar).toBeDisabled();
  await page.getByLabel("Código postal de origen").fill("ab12c");
  await expect(page.getByLabel("Código postal de origen")).toHaveValue("12"); // solo dígitos
  await paso1(page);
  await expect(cotizar).toBeEnabled();
  for (const mal of ["0", "-5", "1001", ""]) {
    await page.getByLabel("Peso").fill(mal);
    await expect(cotizar, `peso ${mal}`).toBeDisabled();
  }
  await page.getByLabel("Peso").fill("5");
  await expect(cotizar).toBeEnabled();
  await page.getByLabel("Código postal de destino").fill("0100");
  await expect(cotizar).toBeDisabled();
});

test("flujo completo hasta el pago exitoso, validando cada paso", async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto("/cotizar");
  await paso1(page);
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();

  await expect(page.getByText("Recolección de paquete a domicilio")).toBeVisible();
  await expect(page.getByText(/agosto/)).toHaveCount(0); // fechas calculadas desde hoy
  await page.getByRole("button", { name: "Comprar" }).click();

  const continuar = page.getByRole("button", { name: "Continuar" });
  await expect(continuar).toBeDisabled();
  await page.getByLabel("Nombre completo (origen)").fill("Ana Pérez");
  await page.getByLabel("Nombre completo (destino)").fill("Luis Gómez");
  await page.getByLabel("Número celular (origen)").fill("abc");
  await page.getByLabel("Número celular (destino)").fill("8112345678");
  await expect(continuar).toBeDisabled();
  await page.getByLabel("Número celular (origen)").fill("55 1234 5678");
  await page.getByLabel("Correo electrónico (origen)").fill("mal@");
  await expect(continuar).toBeDisabled();
  await page.getByLabel("Correo electrónico (origen)").fill("ana@example.com");
  await expect(continuar).toBeEnabled();
  await continuar.click();

  await expect(page.getByText(/Folio:\s*\d{10}/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: /Agregar tarjeta/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const pagar = page.getByRole("button", { name: "Confirmar pago" });
  await expect(pagar).toBeDisabled();
  await page.getByLabel("Número de tarjeta").fill("4242 4242 4242 4241"); // Luhn inválido
  await page.getByLabel("Nombre del titular").fill("ANA PEREZ");
  await page.getByLabel("Vencimiento (MM/AA)").fill("12/30");
  await page.getByLabel("Código de seguridad CVV").fill("123");
  await expect(pagar).toBeDisabled();
  await page.getByLabel("Número de tarjeta").fill("4242 4242 4242 4242");
  await page.getByLabel("Vencimiento (MM/AA)").fill("01/20"); // vencida
  await expect(pagar).toBeDisabled();
  await page.getByLabel("Vencimiento (MM/AA)").fill("13/30"); // mes inválido
  await expect(pagar).toBeDisabled();
  await page.getByLabel("Vencimiento (MM/AA)").fill("12/30");
  await expect(pagar).toBeEnabled();
  await pagar.click();
  await expect(page.getByRole("button", { name: /Facturar/ })).toBeVisible();
  expect(errores).toEqual([]);
});

test("modal de facturación: RFC, CP, teléfono y correo validados", async ({ page }) => {
  await hastaPagoExitoso(page);
  await page.getByRole("button", { name: /Facturar/ }).click();
  const dlg = page.getByRole("dialog", { name: "Datos de facturación" });
  await expect(dlg).toBeVisible();
  const aceptar = dlg.getByRole("button", { name: "Aceptar" });
  await expect(aceptar).toBeDisabled();
  await dlg.getByLabel("RFC").fill("abc123");
  await expect(dlg.getByText(/formato válido/)).toBeVisible();
  await dlg.getByLabel("RFC").fill("vecj880326xxx");
  await expect(dlg.getByLabel("RFC")).toHaveValue("VECJ880326XXX");
  await dlg.getByLabel("Régimen fiscal").selectOption({ index: 1 });
  await dlg.getByLabel("Código postal").fill("x64y0");
  await expect(dlg.getByLabel("Código postal")).toHaveValue("640"); // solo dígitos
  await dlg.getByLabel("Código postal").fill("64060");
  await dlg.getByLabel("Código postal").blur();
  await expect(dlg.getByText("NUEVO LEÓN")).toBeVisible();
  await dlg.getByLabel("Colonia", { exact: true }).selectOption({ index: 1 });
  await expect(aceptar).toBeEnabled();
  await dlg.getByLabel("Teléfono").fill("123");
  await expect(aceptar).toBeDisabled();
  await dlg.getByLabel("Teléfono").fill("8112345678");
  await dlg.getByLabel("Correo electrónico").fill("mal");
  await expect(aceptar).toBeDisabled();
  await dlg.getByLabel("Correo electrónico").fill("f@example.com");
  await expect(aceptar).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
});

test("recargar a mitad del flujo no rompe nada y vuelve al paso 1", async ({ page }) => {
  await page.goto("/cotizar");
  await paso1(page);
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await expect(page.getByText("Recolección de paquete a domicilio")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Código postal de origen")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Cotizar", exact: true })).toBeDisabled();
});

test("tarjeta de cotización del Home pasa los datos a /cotizar", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("0100");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await expect(page.getByRole("button", { name: "Continuar" })).toHaveCount(0);
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Paquete", { exact: true }).click();
  const confirmar = page.getByRole("button", { name: "Confirmar" });
  await expect(confirmar).toBeDisabled();
  await page.getByLabel("Peso").fill("3");
  await page.getByLabel("Alto").fill("10");
  await page.getByLabel("Largo").fill("20");
  await page.getByLabel("Ancho").fill("15");
  await confirmar.click();
  await expect(page).toHaveURL(/\/cotizar/);
  await expect(page.getByLabel("Código postal de origen")).toHaveValue("64060");
  await expect(page.getByLabel("Ciudad de destino")).toHaveValue("CDMX");
  await expect(page.getByLabel("Peso")).toHaveValue("3");
});
