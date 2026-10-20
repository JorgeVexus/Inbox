import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.*", "src/lib/mock/**"],
      // Piso de calidad (`npm run test:cobertura`): la lógica de negocio y el BFF (`src/lib`)
      // deben seguir bien cubiertos; los componentes se validan con Playwright, no con Vitest,
      // por eso el piso global es bajo. Súbelo cuando se agreguen pruebas, nunca lo bajes.
      thresholds: {
        statements: 17,
        "src/lib/**": { statements: 88, branches: 80, functions: 88, lines: 88 },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
