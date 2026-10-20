import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Accesibilidad estricta en JSX (el preset de Next solo activa unas pocas reglas).
  { files: ["src/**/*.{ts,tsx}"], rules: { ...jsxA11y.flatConfigs.strict.rules } },
  // Seguridad: reglas útiles y de bajo ruido (se omiten las de "object injection", que dan falsos positivos en TypeScript).
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { security },
    rules: {
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-possible-timing-attacks": "warn",
    },
  },
  // Calidad: complejidad, tamaño y higiene.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.*"],
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": ["error", { allow: ["error"] }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "prefer-const": "error",
      complexity: ["warn", 15],
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "coverage/**",
    "docs/qa-baseline/**",
  ]),
]);

export default eslintConfig;
