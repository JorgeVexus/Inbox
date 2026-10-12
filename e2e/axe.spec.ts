import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { abrirMenuSiMovil, iniciarSesion, irA } from "./helpers";

/**
 * Accesibilidad con axe-core (WCAG 2.1 A/AA y 2.2 AA). El contraste del naranja
 * de marca (3.02:1) es un hallazgo conocido que requiere aprobación de marca
 * (ver docs/REPORTE_QA_RONDA4.md): se audita aparte y NO hace fallar la suite;
 * todo lo demás debe estar en cero.
 */
const ETIQUETAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function auditar(page: Page, nombre: string) {
  await page.waitForLoadState("networkidle");
  const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).disableRules(["color-contrast"]).analyze();
  const resumen = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  expect(resumen, `axe en ${nombre}`).toEqual([]);
}

const PUBLICAS = ["/", "/cotizar", "/rastreo?guias=4003229791", "/cobertura", "/somos", "/soporte", "/privacidad", "/cuenta/crear", "/no-existe"];

for (const ruta of PUBLICAS) {
  test(`axe: ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForTimeout(800);
    await auditar(page, ruta);
  });
}

test("axe: chat abierto en sus 3 pestañas", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir chat de soporte" }).click();
  for (const t of ["Inicio", "Chat", "Ayuda"]) {
    await page.getByRole("button", { name: t, exact: true }).click();
    await auditar(page, `chat/${t}`);
  }
});

test("axe: modal de login y menú móvil", async ({ page }) => {
  await page.goto("/");
  await abrirMenuSiMovil(page);
  await auditar(page, "menú");
  await page.keyboard.press("Escape");
  await page.goto("/perfil");
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
  await auditar(page, "modal login");
});

test("axe: pasos del cotizador", async ({ page }) => {
  await page.goto("/cotizar");
  await page.getByLabel("Código postal de origen").fill("64060");
  await page.getByLabel("Ciudad de origen").fill("Monterrey");
  await page.getByLabel("Código postal de destino").fill("01000");
  await page.getByLabel("Ciudad de destino").fill("CDMX");
  await auditar(page, "cotizar/1");
  await page.getByRole("button", { name: "Cotizar", exact: true }).click();
  await expect(page.getByText("Recolección de paquete a domicilio")).toBeVisible();
  await auditar(page, "cotizar/costo");
  await page.getByRole("button", { name: "Comprar" }).click();
  await auditar(page, "cotizar/confirmar");
  await page.getByLabel("Nombre completo (origen)").fill("Ana");
  await page.getByLabel("Nombre completo (destino)").fill("Luis");
  await page.getByLabel("Número celular (origen)").fill("5512345678");
  await page.getByLabel("Número celular (destino)").fill("8112345678");
  await page.getByLabel("Correo electrónico (origen)").fill("a@example.com");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText(/Folio:/)).toBeVisible();
  await auditar(page, "cotizar/pago-datos");
  await page.getByRole("button", { name: "Continuar" }).click();
  await auditar(page, "cotizar/metodo");
  await page.getByRole("button", { name: /Agregar tarjeta/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await auditar(page, "cotizar/tarjeta");
  await page.getByLabel("Número de tarjeta").fill("4242424242424242");
  await page.getByLabel("Nombre del titular").fill("ANA PEREZ");
  await page.getByLabel("Vencimiento (MM/AA)").fill("1230");
  await page.getByLabel("Código de seguridad CVV").fill("123");
  await page.getByRole("button", { name: "Confirmar pago" }).click();
  await expect(page.getByRole("button", { name: /Facturar/ })).toBeVisible();
  await auditar(page, "cotizar/exito");
  await page.getByRole("button", { name: /Facturar/ }).click();
  await auditar(page, "modal facturación");
});

test("axe: páginas privadas y modales (con sesión)", async ({ page }) => {
  await page.goto("/envio");
  await iniciarSesion(page);
  await expect(page.getByText("Paquete cositas")).toBeVisible();
  await auditar(page, "/envio");
  await page.getByRole("button", { name: /Paquete cositas/ }).click();
  await page.getByRole("button", { name: "Editar nombre del envío" }).click();
  await auditar(page, "modal alias");
  await page.keyboard.press("Escape");
  await irA(page, "/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await auditar(page, "/perfil");
  await page.getByRole("button", { name: "Agregar contacto" }).click();
  await auditar(page, "modal contacto");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Agregar dirección" }).click();
  await auditar(page, "modal dirección");
  await page.keyboard.press("Escape");
  await irA(page, "/recoleccion");
  await expect(page.getByLabel("Fecha de recolección")).toBeVisible();
  await auditar(page, "/recoleccion");
});

test("informe: elementos con contraste insuficiente (solo informativo)", async ({ page }, info) => {
  const total: Record<string, number> = {};
  for (const ruta of ["/", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte"]) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    const r = await new AxeBuilder({ page }).withTags(ETIQUETAS).withRules(["color-contrast"]).analyze();
    total[ruta] = r.violations.flatMap((v) => v.nodes).length;
  }
  await info.attach("contraste.json", { body: JSON.stringify(total, null, 2), contentType: "application/json" });
  console.log("CONTRASTE", JSON.stringify(total));
});
