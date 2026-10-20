import { expect, test } from "@playwright/test";
import { abrirLogin, abrirMenuSiMovil, iniciarSesion, irA, vigilarErrores } from "./helpers";

test("las páginas privadas piden iniciar sesión y no muestran datos sin ella", async ({ page }) => {
  for (const ruta of ["/envio", "/perfil", "/recoleccion"]) {
    await page.goto(ruta);
    await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByText("Guía 4003229791")).toHaveCount(0);
    await expect(page.getByText("Av. Gómez Morín")).toHaveCount(0);
  }
});

test("login: vacío, incorrecto y hostil dan error; el correcto entra", async ({ page }) => {
  await page.goto("/");
  await abrirLogin(page);
  const modal = page.getByRole("dialog", { name: "Iniciar sesión" });
  const enviar = () => modal.locator("form").evaluate((f: HTMLFormElement) => f.requestSubmit());
  await enviar();
  await expect(modal.getByText("Debe indicar el usuario/contraseña.")).toBeVisible();
  await modal.getByLabel("Correo electrónico").fill("INBOX");
  await modal.locator('input[type="password"]').fill("mala");
  await enviar();
  await expect(modal.getByText("Usuario o contraseña incorrectos.")).toBeVisible();
  await modal.getByLabel("Correo electrónico").fill("' OR 1=1 --");
  await modal.locator('input[type="password"]').fill("x".repeat(5000));
  await enviar();
  await expect(modal.getByText("Usuario o contraseña incorrectos.")).toBeVisible();
  await iniciarSesion(page);
  await abrirMenuSiMovil(page);
  await expect(
    page
      .getByText(/Hola, /)
      .locator("visible=true")
      .first(),
  ).toBeVisible();
});

test("modal de login: foco atrapado, Escape cierra y devuelve el foco", async ({ page, browserName }, info) => {
  test.skip(browserName === "webkit", "Safari no tabula botones/enlaces por defecto");
  test.skip(info.project.name === "movil", "en móvil el botón vive en un menú que se cierra al pulsarlo");
  await page.goto("/");
  const abrir = page.getByRole("button", { name: "Iniciar sesión" }).first();
  await abrir.click();
  const modal = page.getByRole("dialog", { name: "Iniciar sesión" });
  await expect(modal).toBeVisible();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    expect(await modal.evaluate((m) => m.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(abrir).toBeFocused();
});

test("contactos: alta, edición, validaciones, XSS y baja", async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto("/perfil");
  await iniciarSesion(page);
  const sec = page.locator("section", { has: page.getByRole("heading", { name: "Mis contactos" }) });
  await sec.getByRole("button", { name: "Agregar contacto" }).click();
  const dlg = page.getByRole("dialog", { name: "Agregar contacto" });
  const guardar = dlg.getByRole("button", { name: "Guardar" });
  await expect(guardar).toBeDisabled();
  await dlg.getByLabel("Nombre completo").fill("<img src=x onerror=alert(1)>");
  await dlg.getByLabel("Teléfono").fill("123");
  await expect(guardar).toBeDisabled();
  await dlg.getByLabel("Teléfono").fill("81 1234-5678");
  await expect(guardar).toBeEnabled();
  await guardar.click();
  await expect(dlg).toBeHidden();
  await expect(sec.getByText("<img src=x onerror=alert(1)>")).toBeVisible();
  await expect(page.locator("img[src='x']")).toHaveCount(0);
  await sec.getByRole("button", { name: "Eliminar" }).last().click();
  await expect(sec.getByText("<img src=x")).toHaveCount(0);
  expect(errores).toEqual([]);
});

test("direcciones: autocompleta con CP, valida y guarda", async ({ page }) => {
  await page.goto("/perfil");
  await iniciarSesion(page);
  const sec = page.locator("section", { has: page.getByRole("heading", { name: "Direcciones guardadas" }) });
  await sec.getByRole("button", { name: "Agregar dirección" }).click();
  const dlg = page.getByRole("dialog", { name: "Agregar dirección" });
  const guardar = dlg.getByRole("button", { name: "Guardar" });
  await expect(guardar).toBeDisabled();
  await dlg.getByLabel("Alias de la dirección").fill("Oficina QA");
  await dlg.getByLabel("Calle").fill("Av. Constitución");
  await dlg.getByLabel("Teléfono de contacto").fill("8112345678");
  await dlg.getByLabel("Código postal").fill("x64y0");
  await expect(dlg.getByLabel("Código postal")).toHaveValue("640"); // solo dígitos
  await dlg.getByLabel("Código postal").fill("64060");
  await dlg.getByLabel("Código postal").blur();
  await expect(dlg.getByText("NUEVO LEÓN")).toBeVisible();
  await expect(guardar).toBeEnabled();
  await guardar.click();
  await expect(sec.getByText("Oficina QA")).toBeVisible();
});

test("envío: filtro, detalle y alias con límite y XSS", async ({ page }) => {
  await page.goto("/envio");
  await iniciarSesion(page);
  await expect(page.getByText("Paquete cositas")).toBeVisible();
  await page.locator("#buscar-envio").fill("zzzz");
  await expect(page.getByText(/No encontramos envíos/)).toBeVisible();
  await page.locator("#buscar-envio").fill("cos");
  await page.getByRole("button", { name: /Paquete cositas/ }).click();
  await page.getByRole("button", { name: "Editar nombre del envío" }).click();
  const dlg = page.getByRole("dialog");
  const campo = dlg.getByLabel("¿Cómo quieres identificar este envío?");
  await campo.fill("<img src=x onerror=alert(1)>Casa");
  await dlg.getByRole("button", { name: "Aceptar" }).click();
  await expect(page.locator("img[src='x']")).toHaveCount(0);
  await page.locator("#buscar-envio").fill("");
  await expect(page.getByText("<img src=x onerror=alert(1)>Casa").first()).toBeVisible();
});

test("recolección: horarios coherentes, validación y folio", async ({ page }) => {
  await page.goto("/recoleccion");
  await iniciarSesion(page);
  const agendar = page.getByRole("button", { name: "Agendar recolección" });
  await expect(agendar).toBeDisabled();
  const fecha = page.getByLabel("Fecha de recolección");
  await expect(fecha).toBeVisible();
  await fecha.selectOption({ index: 1 });
  const horario = page.getByLabel("Horario de recolección");
  const opciones = await horario.locator("option").allTextContents();
  expect(opciones.length).toBeGreaterThan(1);
  await horario.selectOption({ index: 1 });
  await page.getByLabel("Guías a recolectar (separadas por coma)").fill("4003229791, <b>x</b>, ../etc");
  await expect(agendar).toBeEnabled();
  await agendar.click();
  await expect(page.getByText(/Recolección agendada/)).toBeVisible();
  await expect(page.getByText(/Folio de recolección #\d+/)).toBeVisible();
});

test("la sesión demo se pierde al recargar (no persiste datos sensibles)", async ({ page }) => {
  await page.goto("/perfil");
  await iniciarSesion(page);
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
  const guardado = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(guardado).not.toMatch(/Prueba/); // la contraseña no se guarda en ningún lado
});

test("cerrar sesión devuelve al estado público", async ({ page }) => {
  await page.goto("/");
  await iniciarSesion(page);
  await abrirMenuSiMovil(page);
  await page.getByRole("button", { name: "Cerrar sesión" }).locator("visible=true").first().click();
  await irA(page, "/perfil");
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
});
