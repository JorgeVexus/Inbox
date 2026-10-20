# Fase 0 — Preparación y línea base

**Plan:** `docs/PLAN_REVISION_360.md` · **Fecha:** 20 de octubre de 2026 · **Estado:** ✅ **Completada** (con 3 puntos que dependen de ti, ver §7)

---

## 1. Objetivo

Dejar el proyecto listo para revisarse con herramientas repetibles y **medir dónde estamos hoy** en cada frente, para poder comprobar después que cada fase mejora algo (principio 5 del plan: medir antes y después).

---

## 2. Qué se hizo

### 2.1 Revisión del plan
Se releyó el plan completo contra lo construido. No se cambió su estructura; se corrigió la referencia equivocada a Webflow (el plan original habla de una implementación "originalmente contemplada" en Webflow, no de un sitio existente) y se dejó pendiente confirmar con el cliente si hay un sitio público actual (afecta F12 y F15).

### 2.2 Herramientas instaladas (solo desarrollo; nada de esto llega al sitio publicado)

| Herramienta | Versión | Para qué sirve | Frente |
|---|---|---|---|
| `knip` | 6.42 | Detecta archivos, exportaciones y dependencias sin uso | F3 |
| `jscpd` | 5.4 | Mide código duplicado | F3 |
| `madge` | 8.0 | Detecta dependencias circulares | F3 |
| `cspell` + diccionario español | 10.4 | Ortografía en código y documentos | F4/F12 |
| `html-validate` | 11.17 | Valida el HTML renderizado (estructura y accesibilidad) | F4/F11 |
| `prettier` | 3.9 | Formato único del código | F4 |
| `@vitest/coverage-v8` | 3.2 | Cobertura de pruebas unitarias | F5 |
| `@axe-core/playwright` | 4.13 | Accesibilidad automática (ya instalado antes) | F11 |
| `@playwright/test` | 1.64 | Pruebas E2E en 4 navegadores (ya instalado antes) | F5/F10 |

Se probó y **se descartó** `@next/bundle-analyzer`: no funciona con Turbopack (el empaquetador de Next 16). Se sustituyó por un script propio que mide lo que realmente descarga cada ruta.

Pendientes de instalar en la Fase 2 (no son paquetes de npm): `semgrep` (hay Python disponible) y `gitleaks` (binario; no está en esta computadora).

### 2.3 Archivos de configuración creados

| Archivo | Función |
|---|---|
| `.gitattributes` | Finales de línea LF en el repositorio; elimina los avisos LF/CRLF que salían en cada commit en Windows |
| `.editorconfig` | UTF-8, LF, 2 espacios, sin espacios al final de línea |
| `.prettierrc.json` / `.prettierignore` | Formato único (120 columnas, comas finales) |
| `cspell.json` | Español + inglés, glosario de marca y de términos técnicos, ignora identificadores de la API |
| `.htmlvalidate.json` | Solo reglas de contenido y accesibilidad (se apagaron las de estilo de serialización de React, que no son errores en HTML5) |
| `.github/workflows/ci.yml` | Integración continua (ver §2.5) |
| `scripts/resumen-cobertura.mjs` | Cobertura agrupada por capa |
| `scripts/resumen-duplicacion.mjs` | Lista legible de clones de código |
| `scripts/peso-por-ruta.mjs` | Peso de JS/CSS/imágenes/fuentes por ruta en móvil |

### 2.4 Scripts nuevos en `package.json`

`typecheck`, `test:cobertura`, `qa:muerto`, `qa:duplicacion`, `qa:ciclos`, `qa:ortografia`, `qa:formato`, `qa:peso`.

### 2.5 Integración continua (GitHub Actions)

Dos trabajos que corren en cada *push* a `main` y en cada *pull request*:
1. **Calidad:** `tsc`, ESLint, pruebas unitarias, `npm audit` de producción (falla con severidad alta), build.
2. **E2E (Chrome):** instala Chrome, compila, corre toda la suite; si falla, guarda los resultados como artefacto 7 días.

*Nota:* no se pudo ejecutar en GitHub desde aquí; la primera corrida real puede pedir ajustes menores (se verá al subirla). Se recomienda activar protección de rama para exigir que pase (frente F2).

### 2.6 Defectos de HTML corregidos (los encontró `html-validate`)

| # | Defecto | Corrección |
|---|---|---|
| 1 | `<div>` dentro de `<button>` (HTML inválido) en los interruptores "Sucursal / Centro de distribución" del mapa (3 páginas) | Se sustituyó por `<span>` |
| 2 | `<div role="region">` en lugar del elemento nativo (carrusel de servicios) | Ahora es `<section aria-label>` |
| 3 | **Clase de color duplicada** en el selector de ciudad de Cobertura: tenía `text-black` fijo y a la vez uno condicional, por lo que el naranja "seleccionado" **nunca se aplicaba** (un bug visual real) | Se quitó el color fijo; el condicional ahora funciona |

---

## 3. Línea base medida

### 3.1 Código

| Métrica | Valor |
|---|---|
| Archivos de aplicación | 114 (sin pruebas), ≈ 11 400 líneas |
| TypeScript | `strict: true`, 0 `any` explícitos |
| Ciclos de dependencias (`madge`) | **0** (133 archivos) |
| Código duplicado (`jscpd`) | **2.46 %** (14 clones, 263 líneas) |
| Código muerto (`knip`) | 0 archivos huérfanos; 8 exportaciones y 4 tipos sin uso; 0 dependencias de producción sobrantes |
| Deuda visible | 7 `eslint-disable`, 9 `TODO/FIXME`, 5 `console.*` |
| Componentes > 250 líneas | 9 (el mayor `step-pago.tsx`, 759) |
| Formato (Prettier) | **103 archivos** no cumplen el formato (src: 81; el resto docs, e2e, scripts, raíz). Se reformateará en la Fase 1 en un commit separado |
| Ortografía (`cspell`) | 165 palabras únicas desconocidas; casi todas son **comentarios de código sin acentos** ("algun", "aqui"); los textos visibles ya se habían revisado |

Clones principales (a refactorizar en la Fase 1):
- Tarjeta y campo de medidas repetidos entre el cotizador y el Hero (32 y 24 líneas).
- Estructura de los 4 modales repetida (25, 29, 17 y 14 líneas) → un `ModalShell` común.
- El "candado de inicio de sesión" repetido en `/perfil`, `/recoleccion` y `/envio` (19 y 18 líneas) → un `PaginaProtegida`.
- Carrusel de fotos repetido entre el Hero y `/somos` (15 y 12 líneas).

### 3.2 Pruebas

| Capa | Resultado |
|---|---|
| Unitarias | 155 pasan |
| E2E | 90/90 en Chrome en esta fase (≈ 360 casos en 4 navegadores en la última corrida completa) |
| **Cobertura global de sentencias** | **15.8 %** (la interfaz se cubre con E2E, no con pruebas unitarias) |
| Capa BFF y esquemas | `sibox-client` **94 %**, `route-helpers` **73 %**, `schemas` **100 %** |
| `lib/` | 58 %. Sin ninguna prueba unitaria: `auth`, `codigo-postal`, `cotizacion-draft`, `cotizacion`, `facturacion`, `seo`, `soporte`, `sucursales` |
| Componentes | `envio` 63 %, `ui` 5 %, el resto 0 % (solo E2E) |

Lectura: el riesgo está en la lógica de `lib/` sin pruebas unitarias (especialmente `seo.ts`, con la lógica de la URL pública, y `cotizacion-draft.ts`) y en que **no hay umbral de cobertura** que proteja contra retrocesos. Se atiende en la Fase 1.

### 3.3 Rendimiento — peso por ruta (móvil, comprimido)

| Ruta | JS | CSS | Imágenes | Fuentes | Total |
|---|---|---|---|---|---|
| `/` | 206 KB | 11 KB | 80 KB | 42 KB | 390 KB |
| `/cotizar` | 223 KB | 11 KB | 32 KB | 42 KB | 353 KB |
| `/rastreo` | 203 KB | 11 KB | 34 KB | 42 KB | 333 KB |
| `/cobertura` | 250 KB | 14 KB | 136 KB | 42 KB | 484 KB |
| `/somos` | 207 KB | 11 KB | 89 KB | 42 KB | 395 KB |
| `/soporte` | 208 KB | 11 KB | 28 KB | 42 KB | 331 KB |
| `/envio` | 236 KB | 11 KB | 32 KB | 42 KB | 381 KB |
| `/perfil` | 245 KB | 11 KB | 32 KB | 42 KB | 391 KB |
| `/recoleccion` | 241 KB | 11 KB | 32 KB | 42 KB | 387 KB |

Propuesta de presupuesto para la Fase 5: **JS ≤ 250 KB y total ≤ 500 KB por ruta** (hoy todas cumplen, `/cobertura` justo al límite por el mapa).

### 3.4 Calidad de HTML

`html-validate` sobre las 12 páginas renderizadas: **9 hallazgos** antes de corregir (los 3 tipos de la §2.6) → **0 pendientes tras las correcciones** (verificado con la suite E2E).

---

## 4. Verificación de cierre

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | ✅ sin errores |
| ESLint | ✅ sin advertencias |
| Pruebas unitarias | ✅ 155/155 |
| Build de producción | ✅ |
| E2E Chrome tras los cambios | ✅ 90/90 |

---

## 5. Decisiones tomadas en esta fase

1. **No reformatear todavía** con Prettier: se hará en la Fase 1 como commit aislado para que la revisión del diff sea posible.
2. **Reglas de HTML**: se mantienen solo las de contenido/accesibilidad; las de estilo se apagan porque Next serializa el HTML de una forma válida pero distinta de la que prefiere el validador.
3. **Presupuesto de peso** provisional (JS ≤ 250 KB por ruta) hasta la Fase 5.
4. **Chrome (canal `chrome`) en la CI**, igual que en local.

---

## 6. Cómo reproducir las mediciones

```bash
npm run test:cobertura && node scripts/resumen-cobertura.mjs
npm run qa:muerto
npm run qa:duplicacion
npm run qa:ciclos
npm run qa:ortografia
npm run qa:formato
npm run build && npx next start -p 3700   # en otra terminal
npm run qa:peso
```

Resultados guardados en `docs/qa-baseline/`.

---

## 7. Pendientes que dependen de ti

1. **Activar Figma Dev Mode** (Figma de escritorio → Preferencias → "Enable Dev Mode MCP Server" y reiniciar la app de Claude): necesario para la comparación visual de la Fase 4.
2. **GitHub:** confirmar que Actions está habilitado en el repositorio y, cuando quieras, activar la protección de la rama `main` para exigir que la CI pase (hace falta tu cuenta de dueño).
3. **Responder** a la pregunta que añadiré al mensaje del cliente: ¿existe hoy un sitio público de Inbox que este rediseño reemplace y en qué plataforma? (define si hay migración y redirecciones).

---

## 8. Criterios de salida de la fase

| Criterio | Estado |
|---|---|
| Herramientas instaladas y funcionando | ✅ |
| Línea base de cada frente automatizable registrada | ✅ (`docs/qa-baseline/`) |
| CI definida | ✅ (pendiente de su primera ejecución en GitHub) |
| Scripts reproducibles | ✅ |
| Todo en verde tras los cambios | ✅ |

## 9. Siguiente fase

**Fase 1 — Estática y limpieza (F3, F4, F5):** formato con Prettier (commit aislado), refactor de duplicación (`ModalShell`, `PaginaProtegida`, carrusel, campos de medidas), partir los componentes grandes, reglas ESLint adicionales (`jsx-a11y` estricto, seguridad, orden de imports), TypeScript más estricto, pruebas unitarias de `lib/` y umbrales de cobertura.
