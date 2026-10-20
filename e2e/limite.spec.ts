import { expect, test } from "@playwright/test";
import { PORT_CON_LIMITE } from "../playwright.config";

// Servidor aparte con el límite de peticiones ACTIVO (ver playwright.config.ts).
test.use({ baseURL: `http://localhost:${PORT_CON_LIMITE}` });

/** IP inventada y única por ejecución: así los 4 navegadores no se pisan el contador. */
const ipUnica = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Date.now() % 250}`;

for (const ruta of ["/api/rastreo", "/api/rastreo/detalle"]) {
  test(`${ruta}: a partir de la petición 31 por minuto responde 429 con Retry-After`, async ({ request }) => {
    const headers = { "x-real-ip": ipUnica() };
    // Guía con formato inválido: la validación responde 400 sin tocar SIBOX, pero el límite ya cuenta.
    for (let i = 1; i <= 30; i++) {
      const r = await request.post(ruta, { data: { Guia: "mal formato!" }, headers });
      expect(r.status(), `petición ${i}`).toBe(400);
    }
    const bloqueada = await request.post(ruta, { data: { Guia: "mal formato!" }, headers });
    expect(bloqueada.status()).toBe(429);
    expect(Number(bloqueada.headers()["retry-after"])).toBeGreaterThanOrEqual(1);
    expect(Number(bloqueada.headers()["retry-after"])).toBeLessThanOrEqual(60);
    const cuerpo = await bloqueada.text();
    expect(cuerpo).not.toMatch(/stack|sibox|cloudflare|apitest/i);

    // Otra IP no se ve afectada por el bloqueo de la primera.
    const otra = await request.post(ruta, { data: { Guia: "mal formato!" }, headers: { "x-real-ip": ipUnica() } });
    expect(otra.status()).toBe(400);
  });
}

test("el límite de una ruta no consume el de la otra", async ({ request }) => {
  const headers = { "x-real-ip": ipUnica() };
  for (let i = 0; i < 31; i++) await request.post("/api/rastreo", { data: { Guia: "x!" }, headers });
  expect((await request.post("/api/rastreo", { data: { Guia: "x!" }, headers })).status()).toBe(429);
  expect((await request.post("/api/rastreo/detalle", { data: { Guia: "x!" }, headers })).status()).toBe(400);
});
