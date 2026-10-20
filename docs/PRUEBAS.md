# Guía de pruebas

Qué hay, cómo correrlo y cómo agregar más. (Existe también un `GUIA_PRUEBAS.md` local, no versionado, con datos para probar **a mano** la demo; este documento es el de las pruebas automáticas.)

## 1. Las capas

| Capa | Herramienta | Qué prueba | Cuándo corre | Comando |
|---|---|---|---|---|
| Tipos | TypeScript estricto | Errores de tipos y de índices | CI y local | `npx tsc --noEmit` |
| Estilo y calidad | ESLint (a11y, seguridad, complejidad), Prettier | Reglas del equipo | CI y local | `npm run lint`, `npm run qa:formato` |
| Unitarias | Vitest (`src/**/*.test.ts(x)`) | Lógica pura, BFF, esquemas, seams con `fetch` simulado | CI y local | `npm test` (con cobertura: `npm run test:cobertura`) |
| E2E | Playwright (`e2e/*.spec.ts`) en Chrome, Firefox, WebKit y móvil | Flujos reales en un navegador | CI (solo Chrome) y cada noche (los 4) | `npm run build` y luego `npm run test:e2e` |
| Accesibilidad | axe-core dentro de Playwright | Violaciones WCAG en páginas y modales | Con las E2E | `e2e/axe.spec.ts` |
| Seguridad | Playwright + semgrep + gitleaks + CodeQL | Abuso del BFF, cabeceras, CSP, secretos | E2E y flujo `seguridad.yml` | `e2e/seguridad.spec.ts`, `e2e/limite.spec.ts` |
| SEO | Playwright | Metadatos, canonical, sitemap, noindex | Con las E2E | `e2e/seo.spec.ts` |
| Rendimiento | Lighthouse móvil con presupuestos | Puntuaciones y Core Web Vitals de laboratorio | CI (sin bloquear aún) | `npm run qa:lighthouse` (ver §3) |
| Código muerto / duplicado / ciclos | knip, jscpd, madge | Higiene | CI (`qa:muerto`) y local | `npm run qa:muerto` · `qa:duplicacion` · `qa:ciclos` |

Piso de cobertura exigido (`vitest.config.ts`): `src/lib` ≥ 88 % (ramas ≥ 80 %). Los componentes se prueban con E2E.

## 2. Correr las E2E

```bash
npm run build            # Playwright prueba el servidor de PRODUCCIÓN, no el de desarrollo
npm run test:e2e:chrome  # solo Chrome (≈ 2 min)
npm run test:e2e         # los 4 navegadores (≈ 11 min)
npx playwright test e2e/seo.spec.ts --project=chrome   # un archivo
```
- Playwright arranca **dos** servidores: el puerto 3400 con el límite de peticiones apagado y el 3401 con el límite activo (solo para `limite.spec.ts`). Si ya hay procesos en esos puertos los reutiliza; si una prueba se comporta raro tras recompilar, mátalos.
- **Recompila (`npm run build`) tras cualquier cambio de código** antes de las E2E, o estarás probando la versión anterior.
- En WebKit, bajo carga alta, aparecen tiempos de espera intermitentes (la suite reintenta una vez). Si una prueba falla en WebKit con 45 s de espera y pasa sola, es ese caso.
- En Windows con Git Bash, los argumentos que empiezan con `/` se convierten en rutas de Windows: escríbelos sin la diagonal inicial.

## 3. Rendimiento

```bash
npm run build && npx next start -p 3500        # en una terminal
LH_URL=http://localhost:3500 npm run qa:lighthouse   # en otra
node scripts/lighthouse-diagnostico.mjs rastreo      # explica una ruta (sin diagonal inicial)
npm run qa:peso                                       # KB de JS/CSS/imágenes por ruta
```
El laboratorio tiene ruido (±5 puntos entre corridas): el script usa la mediana de 3 y hasta 2 intentos.

## 4. Convenciones al escribir pruebas

- **Unitarias:** junto al archivo (`rastreo.ts` → `rastreo.test.ts`). Para tiempo, `vi.useFakeTimers()`; para el navegador, `vi.stubGlobal("window", …)`; para módulos con estado (token en memoria, límite), `vi.resetModules()` + `import()` dinámico. `src/lib/test-utils.ts` tiene `primero()` para arreglos con `noUncheckedIndexedAccess`.
- **E2E:** una prueba debe poder correr sola y en cualquier orden. Usa `getByRole`/`getByLabel`; los ayudantes están en `e2e/helpers.ts` (`vigilarErrores` falla la prueba si hay `console.error` o excepciones; `iniciarSesion`, `abrirMenuSiMovil`). Para el BFF usa `request` (sin navegador).
- **Datos de prueba:** guía `4003229791` (demo y real), usuario demo `INBOX` / `Prueba`, C.P. `37545`, `64000`.
- **Un fallo nuevo = una prueba nueva** que lo reproduzca antes de arreglarlo (como las de fuga de datos del rastreo y de las fechas).
- **Qué NO hacer:** esperas fijas (`waitForTimeout`) salvo para animaciones; pruebas que dependan de SIBOX real (usan el modo demo o respuestas grabadas).

## 5. Antes de cada commit

```bash
npx tsc --noEmit && npm run lint && npm test
npm run build && npm run test:e2e:chrome   # si tocaste pantallas, rutas o configuración
```
