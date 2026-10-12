import { expect, type Page } from "@playwright/test";

/** Falla la prueba si la página lanza una excepción o escribe console.error propio. */
export function vigilarErrores(page: Page): string[] {
  const errores: string[] = [];
  page.on("pageerror", (e) => {
    // WebKit reporta así las precargas de Next canceladas al navegar: no es un error de la app.
    if (/access control checks|Load failed|cancelled/i.test(e.message)) return;
    errores.push("excepción: " + e.message);
  });
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // Ruido ajeno al sitio: teselas de OpenStreetMap y recursos de terceros bloqueados.
    if (/openstreetmap|ERR_BLOCKED|Failed to load resource/i.test(t)) return;
    errores.push("console.error: " + t);
  });
  return errores;
}

/** Inicia sesión con la cuenta demo desde el modal global. */
export async function iniciarSesion(page: Page) {
  const modal = page.getByRole("dialog", { name: "Iniciar sesión" });
  // Las páginas privadas abren el modal solas: darle un momento antes de pulsar el botón.
  const yaAbierto = await modal.waitFor({ state: "visible", timeout: 2_000 }).then(
    () => true,
    () => false,
  );
  if (!yaAbierto) {
    const menu = page.getByRole("button", { name: "Abrir menú" });
    if (await menu.isVisible()) await menu.click(); // móvil: el botón vive en el menú
    await page.getByRole("button", { name: "Iniciar sesión" }).locator("visible=true").first().click();
  }
  await expect(modal).toBeVisible();
  await modal.getByLabel("Correo electrónico").fill("INBOX");
  await modal.locator('input[type="password"]').fill("Prueba");
  await modal.locator("form").evaluate((f: HTMLFormElement) => f.requestSubmit());
  await expect(modal).toBeHidden();
}

/** Navegación interna sin recargar (la sesión demo vive en memoria). */
export async function irA(page: Page, ruta: string) {
  await page.evaluate((r) => (window as unknown as { next: { router: { push: (p: string) => void } } }).next.router.push(r), ruta);
  await page.waitForURL("**" + ruta);
}

/** Abre el modal de login desde el Navbar (en móvil, primero el menú de hamburguesa). */
export async function abrirLogin(page: Page) {
  const menu = page.getByRole("button", { name: "Abrir menú" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Iniciar sesión" }).locator("visible=true").first().click();
}

/** En móvil, el saludo y "Cerrar sesión" viven dentro del menú de hamburguesa. */
export async function abrirMenuSiMovil(page: Page) {
  const menu = page.getByRole("button", { name: "Abrir menú" });
  if (await menu.isVisible()) await menu.click();
}
