import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo (modo demo, sin SIBOX real). Requieren
 * `npm run build` previo: se prueba el servidor de producción, no el de
 * desarrollo. Uso: `npm run build && npm run test:e2e`.
 */
const PORT = 3400;
/** Segundo servidor, con el límite de peticiones ACTIVO, solo para e2e/limite.spec.ts. */
export const PORT_CON_LIMITE = 3401;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: [
    {
      // El límite se apaga aquí: la suite repite muchas peticiones desde una misma IP.
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      env: { RATE_LIMIT_DISABLED: "1" },
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: `npx next start -p ${PORT_CON_LIMITE}`,
      url: `http://localhost:${PORT_CON_LIMITE}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "movil", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
});
