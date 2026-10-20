# Revisión 360° — Bitácora de fases

Documento único y continuo: cada fase completada se agrega aquí, **al final**, con el mismo formato (objetivo, qué se hizo, resultados contra la línea base, verificación, remanente, siguiente). El plan completo y su justificación están en `docs/PLAN_REVISION_360.md`; el estado general del proyecto, en `INDICE_MAESTRO.md`.

## Avance

El plan tiene **8 fases en total (de la 0 a la 7)**.

| Fase | Tema | Frentes | Estado |
|---|---|---|---|
| 0 | Preparación y línea base | — | ✅ Completada (2026-10-20) |
| 1 | Estática y limpieza | F3, F4, F5 | ✅ Completada (2026-10-20) |
| 2 | Seguridad | F1, F2, F14 (inventario) | ✅ Completada (2026-10-20); 12 pendientes con dueño en su §6 |
| 3 | Funcional e integración | F6, F7 | ⬜ (depende de B1: Cloudflare) |
| 4 | Experiencia | F9, F10, F11, F13 | ⬜ (F9 depende de Figma Dev Mode) |
| 5 | Rendimiento y SEO | F8, F12 | ✅ Completada (2026-10-20); 8 pendientes con dueño en su §7 |
| 6 | Operación, legal y UAT | F15, F14, F16 | ⬜ |
| 7 | Cierre y Go / No-Go | todos | ⬜ |

Convenciones: las referencias "§N" dentro de una fase apuntan a las secciones de esa misma fase.

---

## Fase 0 — Preparación y línea base

**Plan:** `docs/PLAN_REVISION_360.md` · **Fecha:** 20 de octubre de 2026 · **Estado:** ✅ **Completada** (con 3 puntos que dependen de ti, ver §7)

---

### 1. Objetivo

Dejar el proyecto listo para revisarse con herramientas repetibles y **medir dónde estamos hoy** en cada frente, para poder comprobar después que cada fase mejora algo (principio 5 del plan: medir antes y después).

---

### 2. Qué se hizo

#### 2.1 Revisión del plan
Se releyó el plan completo contra lo construido. No se cambió su estructura; se corrigió la referencia equivocada a Webflow (el plan original habla de una implementación "originalmente contemplada" en Webflow, no de un sitio existente) y se dejó pendiente confirmar con el cliente si hay un sitio público actual (afecta F12 y F15).

#### 2.2 Herramientas instaladas (solo desarrollo; nada de esto llega al sitio publicado)

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

#### 2.3 Archivos de configuración creados

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

#### 2.4 Scripts nuevos en `package.json`

`typecheck`, `test:cobertura`, `qa:muerto`, `qa:duplicacion`, `qa:ciclos`, `qa:ortografia`, `qa:formato`, `qa:peso`.

#### 2.5 Integración continua (GitHub Actions)

Dos trabajos que corren en cada *push* a `main` y en cada *pull request*:
1. **Calidad:** `tsc`, ESLint, pruebas unitarias, `npm audit` de producción (falla con severidad alta), build.
2. **E2E (Chrome):** instala Chrome, compila, corre toda la suite; si falla, guarda los resultados como artefacto 7 días.

*Nota:* no se pudo ejecutar en GitHub desde aquí; la primera corrida real puede pedir ajustes menores (se verá al subirla). Se recomienda activar protección de rama para exigir que pase (frente F2).

#### 2.6 Defectos de HTML corregidos (los encontró `html-validate`)

| # | Defecto | Corrección |
|---|---|---|
| 1 | `<div>` dentro de `<button>` (HTML inválido) en los interruptores "Sucursal / Centro de distribución" del mapa (3 páginas) | Se sustituyó por `<span>` |
| 2 | `<div role="region">` en lugar del elemento nativo (carrusel de servicios) | Ahora es `<section aria-label>` |
| 3 | **Clase de color duplicada** en el selector de ciudad de Cobertura: tenía `text-black` fijo y a la vez uno condicional, por lo que el naranja "seleccionado" **nunca se aplicaba** (un bug visual real) | Se quitó el color fijo; el condicional ahora funciona |

---

### 3. Línea base medida

#### 3.1 Código

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

#### 3.2 Pruebas

| Capa | Resultado |
|---|---|
| Unitarias | 155 pasan |
| E2E | 90/90 en Chrome en esta fase (≈ 360 casos en 4 navegadores en la última corrida completa) |
| **Cobertura global de sentencias** | **15.8 %** (la interfaz se cubre con E2E, no con pruebas unitarias) |
| Capa BFF y esquemas | `sibox-client` **94 %**, `route-helpers` **73 %**, `schemas` **100 %** |
| `lib/` | 58 %. Sin ninguna prueba unitaria: `auth`, `codigo-postal`, `cotizacion-draft`, `cotizacion`, `facturacion`, `seo`, `soporte`, `sucursales` |
| Componentes | `envio` 63 %, `ui` 5 %, el resto 0 % (solo E2E) |

Lectura: el riesgo está en la lógica de `lib/` sin pruebas unitarias (especialmente `seo.ts`, con la lógica de la URL pública, y `cotizacion-draft.ts`) y en que **no hay umbral de cobertura** que proteja contra retrocesos. Se atiende en la Fase 1.

#### 3.3 Rendimiento — peso por ruta (móvil, comprimido)

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

#### 3.4 Calidad de HTML

`html-validate` sobre las 12 páginas renderizadas: **9 hallazgos** antes de corregir (los 3 tipos de la §2.6) → **0 pendientes tras las correcciones** (verificado con la suite E2E).

---

### 4. Verificación de cierre

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | ✅ sin errores |
| ESLint | ✅ sin advertencias |
| Pruebas unitarias | ✅ 155/155 |
| Build de producción | ✅ |
| E2E Chrome tras los cambios | ✅ 90/90 |

---

### 5. Decisiones tomadas en esta fase

1. **No reformatear todavía** con Prettier: se hará en la Fase 1 como commit aislado para que la revisión del diff sea posible.
2. **Reglas de HTML**: se mantienen solo las de contenido/accesibilidad; las de estilo se apagan porque Next serializa el HTML de una forma válida pero distinta de la que prefiere el validador.
3. **Presupuesto de peso** provisional (JS ≤ 250 KB por ruta) hasta la Fase 5.
4. **Chrome (canal `chrome`) en la CI**, igual que en local.

---

### 6. Cómo reproducir las mediciones

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

### 7. Pendientes que dependen de ti

1. **Activar Figma Dev Mode** (Figma de escritorio → Preferencias → "Enable Dev Mode MCP Server" y reiniciar la app de Claude): necesario para la comparación visual de la Fase 4.
2. **GitHub:** confirmar que Actions está habilitado en el repositorio y, cuando quieras, activar la protección de la rama `main` para exigir que la CI pase (hace falta tu cuenta de dueño).
3. **Responder** a la pregunta que añadiré al mensaje del cliente: ¿existe hoy un sitio público de Inbox que este rediseño reemplace y en qué plataforma? (define si hay migración y redirecciones).

---

### 8. Criterios de salida de la fase

| Criterio | Estado |
|---|---|
| Herramientas instaladas y funcionando | ✅ |
| Línea base de cada frente automatizable registrada | ✅ (`docs/qa-baseline/`) |
| CI definida | ✅ (pendiente de su primera ejecución en GitHub) |
| Scripts reproducibles | ✅ |
| Todo en verde tras los cambios | ✅ |

### 9. Siguiente fase

**Fase 1 — Estática y limpieza (F3, F4, F5):** formato con Prettier (commit aislado), refactor de duplicación (`ModalShell`, `PaginaProtegida`, carrusel, campos de medidas), partir los componentes grandes, reglas ESLint adicionales (`jsx-a11y` estricto, seguridad, orden de imports), TypeScript más estricto, pruebas unitarias de `lib/` y umbrales de cobertura.


---

## Fase 1 — Estática y limpieza (F3 código, F4 sintaxis/estática, F5 pruebas)

**Plan:** `docs/PLAN_REVISION_360.md` · **Fecha:** 20 de octubre de 2026 · **Estado:** ✅ **Completada** con un remanente acotado de 12 avisos de tamaño/complejidad (ver §6)

**Commits:** `486df7d` (formato), `5cf802d` (estricto + ESLint + modales), `c775685` (ModalShell, gate, código muerto, cobertura), `b85cd9d` (división de componentes) y el commit de cierre con esta documentación.

---

### 1. Objetivo

Que el compilador y los analizadores encuentren problemas **antes** que una persona: endurecer TypeScript y ESLint, eliminar código muerto y duplicado, partir los componentes más grandes y subir la red de seguridad de pruebas. Sin cambiar el comportamiento visible (todo se verificó con la suite E2E existente).

---

### 2. Resultados contra la línea base de la Fase 0

| Medida | Antes (Fase 0) | Después | Nota |
|---|---|---|---|
| Errores de TypeScript con banderas estrictas | no estaban activadas | **0** con 8 banderas nuevas | ver §3.1 |
| ESLint con reglas nuevas (a11y estricta, seguridad, calidad) | 53 hallazgos (37 errores, 16 avisos) | **0 errores, 12 avisos** | ver §3.2 |
| Código muerto (knip) | 3 archivos, 2 dependencias, 1 sin declarar, 8 exports, 4 tipos | **0** | ver §3.3 |
| Código duplicado (jscpd) | 2.46 % (14 clones) | **1.84 %** (11 clones) | ver §3.4 |
| Dependencias circulares (madge) | 0 | **0** | sin regresión |
| Pruebas unitarias | 155 | **181** (+26) | ver §3.5 |
| Cobertura de sentencias global | 15.8 % | **18.8 %** | los componentes se validan con E2E |
| Cobertura de `src/lib` | ~94 % (BFF) | **> 93 %**, con piso de 88 % exigido | umbral en `vitest.config.ts` |
| Archivo más grande | `step-pago.tsx` 759 líneas | **385** | ver §3.4 |
| Archivos con más de 400 líneas | 3 (step-pago, cobertura, hero) | **0** (con el criterio de ESLint) | |
| Peso de JS por ruta | 200–250 KB | **203–250 KB** | sin regresión |
| Formato (Prettier) | 88 archivos sin formato | **0** | ver §3.6 |

---

### 3. Qué se hizo

#### 3.1 TypeScript estricto
Se activaron en `tsconfig.json`: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters` y `forceConsistentCasingInFileNames`.

Lo importante: `noUncheckedIndexedAccess` obliga a decidir qué pasa cuando un arreglo no tiene el elemento esperado (antes TypeScript fingía que siempre existía). Se corrigió en el código de producción de forma que el caso vacío se maneje y no truene:
- `src/lib/recoleccion.ts` (horas mínima/máxima de la ventana: si no son números, devuelve lista vacía; guarda el nombre del día).
- `src/lib/horario.ts`, `src/lib/fecha.ts`, `src/lib/api/schemas/catalogos.ts` (primer elemento del arreglo).
- `src/components/ui/use-modal-a11y.ts` (último elemento enfocable).
- `src/components/cotizar/step-pago.tsx` (tupla fija de métodos de pago con `satisfies`).
- `src/lib/mock/envios.ts` (se quitó un `!`; ahora falla con un mensaje claro si falta el dato).

En pruebas se añadió `src/lib/test-utils.ts` (`primero()`), que falla con un mensaje legible si el arreglo viene vacío.

#### 3.2 ESLint endurecido (`eslint.config.mjs`)
Reglas añadidas (solo para `src/`):
- **Accesibilidad** (`jsx-a11y` en modo estricto): elementos clicables sin teclado, etiquetas sin control, `autoFocus`, `tabIndex` indebido, etc.
- **Seguridad** (`eslint-plugin-security`): `eval`, regex peligrosas (ReDoS), comparaciones de secretos no constantes, `child_process`, aleatorio débil.
- **Calidad**: `eqeqeq`, `no-console` (solo `warn`/`error` permitidos), complejidad ≤ 15, ≤ 400 líneas por archivo, ≤ 250 por función, sin `!` (non-null), `import type` consistente.
- Se ignoran `test-results`, `playwright-report` y `coverage`.

Los 53 hallazgos iniciales se resolvieron así:

| Hallazgo | Cantidad | Solución |
|---|---|---|
| Fondo de modal clicable sin teclado / roles (`click-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`) | 20 | El fondo es `role="presentation"` y cierra solo si el clic fue en el fondo (`e.target === e.currentTarget`), sin `stopPropagation` en el panel. El cierre con teclado ya lo da `useModalA11y` (Escape). Ahora vive en un solo componente (`ModalShell`). |
| `label` sin control asociado | 4 | `id` + `htmlFor` (se conservó el `aria-label` para no cambiar los nombres que usan las pruebas). |
| `autoFocus` | 2 | En el modal de nombre, el hook de modal ya enfoca el primer campo; en el editor de referencia se usa `enfocarAlMontar` (ref estable). |
| `tabIndex` en región | 1 | Es una región desplazable que **debe** ser enfocable para operarse con teclado (WCAG 2.1.1, regla `scrollable-region-focusable` de axe): se deja con `eslint-disable` y justificación escrita. |
| `!=` en lugar de `!==` | 7 | Comparaciones explícitas (los tipos son `number \| null`, no `undefined`). |
| Regex "insegura" | 2 | `envio-historial`: se dividió en dos pasos simples (fecha y hora por separado). `horario.ts`: la expresión es lineal y el texto es corto; se deja con `eslint-disable` y la razón. |
| `!` (non-null) en mock | 1 | Función `rastreoMock()` que lanza un error claro. |

Las **9 supresiones** de ESLint que hay en el código ahora tienen una línea que explica por qué (las 3 que no la tenían se corrigieron).

#### 3.3 Código muerto (knip)
- Se eliminaron: `estaAbiertoAhora` (sin uso), los tipos `RastreoRequest`, `RastreoRegistro`, `DiaSemana`; y se quitó el `export` de 8 símbolos que solo se usan dentro de su archivo (esquemas Zod, `MAX_CONSTANCIA_BYTES`, `CostoDetalleLinea`).
- `knip.json` nuevo: declara los scripts y las pruebas E2E como puntos de entrada y marca `html-validate`/`vite` como dependencias que se usan por línea de comandos o de forma indirecta.
- `eslint-plugin-jsx-a11y` pasó a ser dependencia **explícita** (antes llegaba escondida dentro de `eslint-config-next`).
- Los `console.error` que quedan están todos en `route-helpers.ts` y son la bitácora de errores del servidor (intencional; no llevan datos personales).
- `TODO` pendientes: 2, ambos con dueño: rate limiting (Fase 2) y la distinción sucursal/centro de distribución (pregunta al cliente, B-contenido).

#### 3.4 Duplicación y tamaño

| Cambio | Antes → después | Efecto |
|---|---|---|
| `ModalShell` (`src/components/ui/modal-shell.tsx`) | 5 modales con el mismo fondo, panel y botón de cierre | Un solo lugar para el comportamiento accesible de los modales |
| `PantallaSinSesion` + `useAbrirLoginSinSesion` (`src/components/auth/pantalla-sin-sesion.tsx`) | `/perfil`, `/recoleccion` y `/envio` repetían el efecto y la pantalla de "inicia sesión" | Un solo gate, mismo texto por página |
| `src/lib/tarjeta.ts` + `tarjeta-form.tsx` + `pago-exitoso.tsx` | `step-pago.tsx` 759 → 385 líneas | La lógica de tarjeta (Luhn, vencimiento, marca) ahora es pura y tiene pruebas |
| `cobertura-cta.tsx` + `estado-horario.ts` | `cobertura.tsx` 564 → 280 | |
| `quote-card.tsx` | `hero.tsx` 524 → 76 | |

**Quedan clones sin resolver (11):** formularios muy parecidos entre `contacto-modal` y `domicilio-modal`, el cotizador del Hero frente a `step-cotizar`, y el pie de página. Unificarlos exige rediseñar campos compartidos (`MedidaInput`, validación común); se deja como deuda técnica registrada, no como defecto.

#### 3.5 Pruebas nuevas (+26)
- `src/lib/costuras.test.ts` (13): login mock, búsqueda de C.P., cotización/guía/pago simulados, borrador de cotización (incluye JSON corrupto y almacenamiento bloqueado), facturación (RFC obligatorio, caché por usuario, validación de constancia: extensión y 5 MB), formularios de soporte, estados y ciudades de sucursales.
- `src/lib/seo.test.ts` (5): orden de respaldo de `SITE_URL` (variable propia → dominio de producción de Vercel → despliegue → localhost) y metadatos de página (canonical, Open Graph, `noindex`).
- `src/lib/tarjeta.test.ts` (8): formato, Luhn con números de prueba públicos, vencimiento (mes inexistente, vencida, válida hasta fin de mes) y marcas.
- **Umbrales de cobertura** en `vitest.config.ts`: global ≥ 17 % y `src/lib/**` ≥ 88 % (sentencias, líneas, funciones) y ≥ 80 % (ramas). Si una nueva contribución los baja, falla `npm run test:cobertura`. El CI ahora ejecuta ese comando y `qa:muerto` (knip).

#### 3.6 Formato
Prettier aplicado a todo el código (commit aparte, sin cambios de lógica, para que el historial sea legible). Los archivos `.md` se excluyeron del formateador (`.prettierignore`): reformatear tablas de documentación solo genera ruido, y `AGENTS.md` lo regenera Next.js.

---

### 4. Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 errores |
| `npm run lint` | 0 errores, 12 avisos |
| `npm test` / `npm run test:cobertura` | 181 pruebas pasan; umbrales cumplidos |
| `npm run qa:muerto` (knip) | limpio |
| `npm run qa:ciclos` (madge) | sin ciclos |
| `npm run qa:formato` | limpio |
| `npm run build` | compila |
| E2E Chrome (90 pruebas) | 90 pasan tras cada paso de refactor (modales, gate, división de pago/cobertura/hero) |
| E2E completa (4 navegadores, 360 casos) | 357 pasan, 3 omitidas, 0 fallan (§5) |

---

### 5. Resultado de la suite E2E completa

Corrida final sobre el código de cierre de la fase: **360 casos (90 pruebas × Chrome, Firefox, WebKit y móvil): 357 pasan, 3 omitidas a propósito, 0 fallan** (10.4 min). Las 3 omitidas son deliberadas: el primer Tab en WebKit (Safari no tabula enlaces por defecto), el foco atrapado del modal en WebKit (mismo motivo) y ese mismo caso en móvil (el botón vive en un menú que se cierra al pulsarlo).

---

### 6. Remanente y decisiones

**12 avisos de ESLint** (no bloquean; son el indicador de dónde refactorizar):

| Archivo | Función | Complejidad / líneas |
|---|---|---|
| `step-confirmar.tsx` | `StepConfirmar`, `ContactoForm` | 31 y 16 |
| `envios-view.tsx` | `EnviosView` | 26 · 265 líneas |
| `facturacion-modal.tsx` | `FacturacionModal` | 28 · 303 líneas |
| `recoleccion-view.tsx` | `FormularioRecoleccion` | 23 · 291 líneas |
| `quote-card.tsx` | `QuoteCard` | 254 líneas |
| `rastreo-card.tsx` | `RastreoCard` | 18 |
| `cobertura-cta.tsx` | `CoberturaCTA` | 16 |
| `horario.ts` | `tokenizar` | 19 |

**Decisión:** no se partieron más porque son formularios con mucho estado donde el riesgo de regresión supera el beneficio inmediato, y varios se tocarán de todos modos cuando se conecten a la API real (Fase 3) o se rediseñen según Figma (Fase 4). El criterio es: **cada vez que se toque una de estas funciones, se parte**. Los avisos se quedan visibles como recordatorio.

**Cosas que NO se hicieron y por qué:**
- Reordenar imports (opcional del plan): bajo valor.
- Ortografía (`cspell`): reporta ~1000 apariciones, casi todas comentarios en español sin tildes ("Telefono", "distribucion"). Es cosmético; se corrige archivo por archivo al tocarlo. No se agregó al CI.
- Elevar el piso global de cobertura: los componentes (≈ 80 % del código) se prueban con E2E, que no cuenta en esta métrica. La decisión de agregar pruebas de componentes (Testing Library) queda para la Fase 4.

---

### 7. Cambios de comportamiento (para no sorprender)

Ninguno visible. Un detalle técnico: dos eventos del fondo de los modales cambiaron de mecanismo (antes `stopPropagation` en el panel; ahora comprobar el origen del clic). Se verificó con las pruebas E2E de sesión, cotizar y accesibilidad (axe) en Chrome.

---

### 8. Siguiente: Fase 2 — Seguridad

Instalar `semgrep` y `gitleaks`, revisar secretos en el historial, modelo de sesión real, rate limiting del BFF (hoy nunca responde 429), cabeceras/CSP con nonce, inventario de datos personales (F14) y revisión de dependencias. Depende de ti: confirmar si existen los roles de Seguridad/DevOps.

---

## Fase 2 — Seguridad (F1 aplicación, F2 infraestructura, F14 inventario de datos)

**Plan:** `docs/PLAN_REVISION_360.md` · **Fecha:** 20 de octubre de 2026 · **Estado:** ✅ **Completada en lo que se puede hacer desde el código**; quedan acciones que dependen de ti o de decisiones de producto (ver §6)

### 1. Objetivo

Encontrar y cerrar los huecos de seguridad de lo que ya existe (el BFF, las cabeceras, los secretos, las dependencias) y dejar por escrito qué falta para el día que haya sesión real, pagos y datos reales. Un principio guió el trabajo: **no inventar una sensación de seguridad**. Donde una protección solo es parcial (el límite de peticiones en memoria, la CSP con `unsafe-inline`), queda dicho y con su razón.

### 2. Método y herramientas

| Verificación | Cómo | Resultado |
|---|---|---|
| Análisis estático de seguridad | `semgrep` 1.181 (reglas `p/typescript`, `p/react`, `p/nextjs`, `p/owasp-top-ten`, `p/secrets`), instalado en un entorno aislado fuera del proyecto | **158 archivos, 0 hallazgos** (1 aviso de sintaxis en un archivo de pruebas, irrelevante) |
| ESLint de seguridad | `eslint-plugin-security` (Fase 1) | 0 errores |
| Secretos en todo el historial de git | Búsqueda propia sobre cada commit (`gitleaks` es un ejecutable que no está en esta computadora; su versión oficial queda en CI, ver §3.7) | La contraseña de la cuenta de servicio **no aparece nunca** (0 coincidencias en ~2.8 MB de historial); sin tokens JWT, claves privadas ni llaves de AWS/GitHub/Stripe; el único archivo `.env` versionado es `.env.example` (sin valores). Aparece 3 veces el **nombre de usuario** de pruebas `TESTWB2025` en documentación (un usuario no es un secreto, pero conviene rotarlo cuando se pase a producción) |
| Dependencias de producción | `npm audit --omit=dev` | **0 vulnerabilidades** |
| Dependencias de desarrollo | `npm audit` | 9 → **5** (ver §3.9) |
| Revisión manual del código | Búsqueda de `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `window.open`, `target="_blank"` sin `noopener`, uso de `localStorage`, `process.env`, `fetch` | Un único `dangerouslySetInnerHTML` (datos estructurados fijos); los 5 `target="_blank"` llevan `noopener`; el navegador solo llama a `/api/rastreo*` |
| Pruebas de abuso | E2E: entradas hostiles (SQL, traversal, 41 caracteres, JSON roto, 20 000 caracteres, métodos incorrectos), campos extra, origen ajeno, tipo de contenido incorrecto, ráfaga de 31 peticiones | Todas rechazadas con el código esperado y sin filtrar detalles internos |

**No se hizo:** análisis dinámico con OWASP ZAP (requiere Docker o Java; no hay en esta máquina; recomendable correrlo contra la preview de Vercel en la Fase 7) ni CodeQL local (queda en CI).

### 3. Hallazgos y correcciones

| ID | Severidad | Hallazgo | Corrección | Estado |
|---|---|---|---|---|
| S-01 | **Alta** | El BFF no tenía **límite de peticiones**: cualquiera podía lanzar miles de consultas y agotar el cupo de SIBOX o disparar bloqueos | `src/lib/api/rate-limit.ts`: ventana fija por IP y por ruta, 30 por minuto en `/api/rastreo` y `/api/rastreo/detalle` (valor del plan). Responde **429** con `Retry-After`; la pantalla de rastreo muestra "Hiciste muchas consultas seguidas…". Va antes de leer el cuerpo y está detrás de una interfaz (`AlmacenLimite`) para cambiarla por un almacén compartido | 🟡 **Mitigado, no cerrado** (ver §3.1) |
| S-02 | Media | CSP casi vacía (solo `frame-ancestors`, `form-action`…) | CSP completa: `default-src 'self'`, scripts solo propios, sin `eval`, `connect-src 'self'`, imágenes propias + teselas de OpenStreetMap, `object-src 'none'`, `base-uri 'self'`, `upgrade-insecure-requests` | ✅ con una salvedad (ver §3.2) |
| S-03 | Media | Los POST del BFF no comprobaban **de dónde venían**: una página ajena podía hacer que el navegador de una persona gastara su cupo o consultara guías | Se exige `Origin` igual al sitio (**403** si no) y `Content-Type: application/json` (**415** si no, lo que descarta formularios de otros sitios) | ✅ |
| S-04 | Baja | Los esquemas de entrada **ignoraban en silencio** campos extra (p. ej. `K_Cliente`) | `strict`: ahora responde 400. Importa para que, cuando existan rutas con cuenta, el navegador no pueda colar un número de cliente | ✅ |
| S-05 | Baja | Los mensajes de error de SIBOX (que pueden traer correos, teléfonos o RFC de clientes, como ya se vio en `Observaciones`) se escribían tal cual en los registros del servidor | `src/lib/api/log.ts`: enmascara correos, números largos, RFC y tokens; recorta; nunca imprime objetos de error completos | ✅ |
| S-06 | Baja | `SIBOX_API_BASE_URL` aceptaba `http://`, con lo que la credencial de servicio viajaría sin cifrar si alguien se equivoca al configurar | Solo `https://` (o `http://localhost` para pruebas) | ✅ |
| S-07 | Baja | El JSON-LD inyectado no escapaba `<` | Se escapa a `\u003c`; ningún valor podría cerrar la etiqueta `<script>` | ✅ |
| S-08 | Info | Zod (validación en el navegador) prueba `new Function` y la CSP lo reporta como violación | `z.config({ jitless: true })` en `almacen-schemas.ts` | ✅ |
| S-09 | Info | Cabecera `Cross-Origin-Opener-Policy` ausente | `same-origin` | ✅ |
| S-10 | Media (herramienta) | `vitest` 3 con `tinypool` vulnerable (**crítica**, solo en desarrollo) | Actualizado a `vitest` 5.0.5 y `@vitest/coverage-v8` 5.0.5 (+ `@types/node` 22); 204 pruebas siguen pasando | ✅ |

#### 3.1 Límite de peticiones: por qué queda "mitigado" y no "cerrado"
El contador vive **en la memoria de cada instancia** del servidor. En Vercel (serverless) cada instancia y cada arranque en frío tienen el suyo, así que un atacante paciente puede repartir sus peticiones entre instancias. Sirve como primera barrera (frena scripts simples y ráfagas desde un navegador) pero **no es una garantía**. Antes de producción hay que cambiar el almacén por uno compartido (por ejemplo Upstash Redis, ~gratis a este volumen): el cambio es una clase que implementa `AlmacenLimite`, sin tocar rutas ni pruebas. Tampoco hay aún límite para login (no existe login real) ni para cotización/CP (aún no hay rutas). Se registró como bloqueo **B12**. La IP se toma de `x-real-ip`/`x-forwarded-for`, que Vercel pone y no se puede falsificar desde fuera; en otro hosting habría que revisarlo.

#### 3.2 CSP: lo que se probó y lo que se decidió
Se intentó la CSP más estricta posible (scripts sin `unsafe-inline`). El HTML de Next.js trae **scripts en línea** (el arranque del empaquetador y la carga de datos de cada página). Las dos formas de permitirlos con seguridad son: un *nonce* por visita (obliga a generar **todas** las páginas en cada petición: sin caché de CDN, más lento y más caro) o hashes (`experimental.sri`, que solo cubre archivos, no scripts en línea). Se eligió una CSP estática con `script-src 'self' 'unsafe-inline'`: sigue bloqueando scripts de otros orígenes, `eval`, `<object>`, `<base>` ajeno, enviar formularios hacia fuera, incrustar el sitio en un marco y **cualquier conexión del navegador que no sea a este sitio**, lo que limita el robo de datos aunque hubiese una inyección. Con el código actual no hay forma de inyectar HTML (un solo `dangerouslySetInnerHTML` con datos fijos y React escapa el resto). **Decisión pendiente (Fase 5):** pasar a nonce si el hosting y el presupuesto lo permiten. Se verificó con una prueba E2E que recorre las páginas y el mapa y **no hay ninguna violación** de la política.

#### 3.3 Autorización por objeto y sesión
Hoy **no aplica**: no hay rutas con datos de cuenta ni sesión en servidor (la sesión del modal es una demostración en memoria; B2). Lo que sí se dejó listo: (1) todos los esquemas de entrada rechazan campos extra, así que el navegador no puede mandar un `K_Cliente`; (2) las reglas de diseño para cuando exista, en §6. Las pruebas E2E de autorización por objeto se escribirán en la Fase 3 junto con las rutas.

#### 3.4 Privacidad en el rastreo público (verificado de nuevo)
Los esquemas "públicos" anulan nombres, quién recibió, firma, coordenadas y observaciones antes de responder. Las pruebas E2E y unitarias existentes siguen en verde.

#### 3.5 Tarjetas
Los datos de la tarjeta **nunca salen del navegador**: `procesarPago` los ignora a propósito y no se guardan en ningún almacenamiento. Aun así, para producción la captura debe sustituirse por campos alojados del proveedor de pagos (PCI DSS), ver F14.

#### 3.6 Cabeceras resultantes
`Content-Security-Policy` (completa), `Strict-Transport-Security` (2 años; **sin** `preload` hasta que el dominio final esté estable), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara, micrófono, geolocalización y pagos desactivados; **hay que abrir `geolocation` si se implementa "sucursal más cercana"**), `Cross-Origin-Opener-Policy: same-origin`.

#### 3.7 Archivos nuevos para GitHub (listos, hay que activarlos)
- `.github/workflows/seguridad.yml`: **gitleaks** sobre todo el historial, **CodeQL** (consultas `security-extended`) y `npm audit` de producción; corre en cada push, en cada PR y los lunes.
- `.github/dependabot.yml`: actualizaciones semanales de dependencias (menores y parches agrupados) y mensuales de acciones.
- `.github/CODEOWNERS`: quién revisa el BFF, la configuración y los flujos.
Nada de esto se pudo ejecutar desde aquí; la primera corrida en GitHub puede pedir ajustes.

#### 3.8 Sesión, CSRF y cookies del futuro
El sitio **no crea cookies hoy** (hay prueba E2E). La defensa por `Origin` y `Content-Type` de S-03 es la base que se extenderá a las rutas con sesión.

#### 3.9 Dependencias de desarrollo que siguen reportadas (5, severidad "alta")
Cadena `eslint-config-next` → `@next/eslint-plugin-next` → `micromatch`/`braces`/`fast-glob`. Son herramientas del linter, nunca llegan al sitio publicado, y el único "arreglo" que propone npm es **bajar** `eslint-config-next` a la versión 14 (rompería el proyecto). Se acepta el riesgo hasta que Next publique un parche; Dependabot avisará.

### 4. Inventario de datos personales (insumo de F14; el documento legal es de la Fase 6)

| Dato | Dónde se captura | Dónde vive hoy | A dónde viaja | Observación |
|---|---|---|---|---|
| Número de guía | Rastreo (Home, `/rastreo`, chat) | URL (`?guias=`), memoria | BFF → SIBOX | Público por diseño; el BFF anula datos personales de la respuesta |
| Nombre, teléfono, correo, domicilio (remitente/destinatario) | `/cotizar` paso Confirmar | Memoria del navegador | **Nadie** (la guía es simulada) | Cuando se conecte, viajará a `wsGeneracionGuiaCliente` |
| Contactos guardados | `/perfil` | `localStorage` (`inbox:contactos:<usuario>`) | Nadie | Solo demo; el navegador puede borrarlo |
| Direcciones guardadas | `/perfil` | `localStorage` (`inbox:domicilios:<usuario>`) | Nadie | Idem |
| RFC, régimen fiscal, domicilio fiscal, teléfono, correo | Modal de facturación | `localStorage` (`inbox:facturacion:<usuario>`) | Nadie | Idem; el RFC es dato fiscal sensible |
| Alias de un envío | `/envio` | `localStorage` (`inbox:envio-alias:…`) | Nadie | Idem |
| Borrador de cotización | Hero → `/cotizar` | `sessionStorage` (`inbox:cotizacion-draft`) | Nadie | Se borra al leerlo |
| Número, titular, vencimiento y CVV de tarjeta | `/cotizar` paso Pago | Solo memoria | **Nadie** | Maqueta; PCI DSS exige campos del proveedor |
| Correo del chat; nombre, correo y mensaje de soporte | Chat y `/soporte` | Memoria | **Nadie** (simulado, B8) | Hoy el visitante cree que se envió y no es así |
| IP del visitante | Cada petición al BFF | Memoria de la instancia (contador de límite) | Nadie | Efímera; sin registro persistente |
| IP del visitante hacia terceros | Mapa | — | **OpenStreetMap** (teselas) | Tercero que ve la IP; considerar proveedor propio (B11) |
| Credencial de servicio de SIBOX | Variables de entorno | Servidor | SIBOX | Nunca en el navegador (hay prueba E2E que lo comprueba en el JavaScript publicado) |

Sin cookies, sin analítica, sin Sentry todavía: cuando se agreguen, este inventario y el aviso de privacidad deben actualizarse.

### 5. Verificación

| Comprobación | Resultado |
|---|---|
| `tsc`, ESLint (0 errores, 12 avisos heredados de la Fase 1) | ✅ |
| Pruebas unitarias | **204 pasan** (+23 en esta fase: límite, 429, origen, tipo de contenido, bitácora enmascarada, HTTPS, esquemas estrictos, mensaje 429) |
| `knip` | limpio |
| Cobertura | `src/lib` sigue por encima de su piso (88 %). La cifra global ya **no es comparable** con la de la Fase 1 (18.8 % → 37.7 %): `vitest` 5 cuenta sentencias con otro método (2 206 en lugar de 9 140), no es que se haya probado el doble |
| E2E completa (4 navegadores) | **384 casos (96 pruebas × Chrome, Firefox, WebKit y móvil): 381 pasan, 3 omitidas a propósito (las mismas de la Fase 1), 0 fallan** (10.6 min). Una primera corrida falló en WebKit por `upgrade-insecure-requests`: Safari/WebKit lo aplica también a `http://localhost` y rompe las pruebas locales; como no hay recursos http y HSTS ya obliga a https, se quitó esa directiva |

### 6. Pendientes de seguridad (con dueño)

| # | Pendiente | Dueño | Cuándo |
|---|---|---|---|
| 1 | **B12 — almacén compartido para el límite de peticiones** (Upstash Redis o equivalente) y límites para login, cotización y CP cuando existan sus rutas | Desarrollo + decisión de costo | Antes de producción |
| 2 | Activar en GitHub: Dependabot, escaneo de secretos (*push protection*), CodeQL y **protección de la rama `main`** (PR obligatorio, CI verde, sin *force push*) | **Tú** (administrador del repositorio) | Ya |
| 3 | Vercel: separar variables de producción y de *preview*, **proteger las previews** con contraseña/SSO, tokens de mínimo alcance, 2FA en el equipo | **Tú** | Al crear el proyecto |
| 4 | Cloudflare (B1) y IP fija de salida (B5) | Cliente / jefe | En curso |
| 5 | Rotar la credencial de servicio y el usuario `TESTWB2025` antes de producción; definir quién la custodia (gestor de contraseñas, nunca por chat) | Cliente + tú | Antes de producción |
| 6 | Sesión real: cookie `HttpOnly`+`Secure`+`SameSite=Lax`, rotación al iniciar sesión, expiración, cierre global, **autorización por objeto** (el `K_Cliente` sale siempre de la sesión del servidor, nunca del navegador), CSRF (token o *double submit* además de `Origin`), 5 intentos fallidos/15 min | Desarrollo | Fase 3, cuando backend libere B2 |
| 7 | Idempotencia al generar guía y al cobrar (clave de idempotencia), recalcular el precio en servidor | Desarrollo | Fase 3 |
| 8 | Etiqueta PDF: decodificar Base64 en servidor, `Content-Disposition: attachment`, tipo y tamaño validados | Desarrollo | Cuando se construya `Genera_Etiqueta` |
| 9 | Decidir CSP con nonce (páginas dinámicas) frente a la actual | Desarrollo + jefe | Fase 5 |
| 10 | HSTS con `preload` | Desarrollo | Cuando el dominio final esté estable |
| 11 | OWASP ZAP contra la preview de Vercel y revisión externa de seguridad antes del lanzamiento | Seguridad / contratista | Fase 7 |
| 12 | Sustituir la captura de tarjeta por campos alojados del proveedor de pagos (PCI DSS) | Desarrollo + proveedor | Con el módulo de pagos (B4) |

### 7. Cambios de comportamiento que notarás

- Una persona que consulte más de 30 veces por minuto la misma ruta verá "Hiciste muchas consultas seguidas. Espera un momento…". Con uso normal no ocurre.
- Cualquier cliente que llame a `/api/rastreo*` a mano debe mandar `Content-Type: application/json` y no incluir campos extra.
- Para correr las pruebas E2E se usan **dos** servidores locales (puerto 3400 con el límite apagado y 3401 con el límite activo, solo para probarlo).

### 8. Siguiente: Fase 3 — Funcional e integración

Probar cada flujo de punta a punta contra la API real (depende de B1: Cloudflare), conectar al BFF los endpoints de lectura ya verificados (`ListadoOficinas`, `BusquedaCP`, `TipoEnvio`/`TipoEntrega`, `ObtenerHorariosPorCP`) con límite de peticiones, pruebas de contrato con respuestas reales grabadas y las pruebas de autorización por objeto. **Si B1 sigue bloqueado, se avanza con el puente local de `curl` y las respuestas grabadas, y se deja la validación contra el servidor real como condición de salida.**

---

## Fase 5 — Rendimiento y SEO (F8 rendimiento, F12 SEO, analítica y contenido)

**Plan:** `docs/PLAN_REVISION_360.md` · **Fecha:** 20 de octubre de 2026 · **Estado:** ✅ **Completada** en lo medible desde esta computadora; los datos de campo y varias decisiones dependen del lanzamiento y del cliente (ver §7)

> Las fases 3 y 4 se saltaron a propósito porque dependen de terceros (Cloudflare/SIBOX y Figma Dev Mode). El orden de las fases no es rígido; el documento conserva su numeración.

### 1. Objetivo

Que el sitio cargue rápido en un teléfono con red lenta, que los buscadores lo entiendan, y dejar **medido y vigilado** (con presupuestos que fallan en CI) para que no se degrade sin que nadie lo note.

### 2. Cómo se midió

- **Lighthouse 13 móvil** (4G lento y CPU 4× más lenta, simulado) sobre las 6 rutas públicas: mediana de 3 corridas y hasta 2 intentos, para absorber el ruido del laboratorio. Script propio `npm run qa:lighthouse` con **presupuestos que hacen fallar el proceso**: Rendimiento ≥ 90, Accesibilidad ≥ 95, Buenas prácticas ≥ 95, SEO = 100, LCP ≤ 3.3 s (límite de laboratorio; el objetivo de 2.5 s se vigila como aviso), CLS ≤ 0.1, TBT ≤ 200 ms. `scripts/lighthouse-diagnostico.mjs` explica una ruta (elemento LCP, desplazamientos, recursos pesados).
- **Medición con limitación real** (Lighthouse "devtools": la red y la CPU se limitan de verdad en el navegador, sin simulación) para contrastar el LCP simulado, que es conservador.
- **Peso por ruta** (`npm run qa:peso`), **prueba de carga** con `autocannon` y **pruebas E2E de SEO** (nuevas).

### 3. Resultados

#### 3.1 Lighthouse móvil: antes y después

| Ruta | Rendimiento antes → después | LCP simulado antes → después | CLS antes → después | TBT después |
|---|---|---|---|---|
| `/` | 90 → **94** | 3 515 → 2 998 ms | 0 → 0 | 71 ms |
| `/cotizar` | 98 → 93* | 2 129 → 3 060 ms* | 0 → 0 | 91 ms |
| `/rastreo` | **71 → 95** | 3 011 → 2 888 ms | **0.646 → 0** | 61 ms |
| `/cobertura` | 94 → 94 | 3 080 → 3 038 ms | 0 → 0 | 68 ms |
| `/somos` | 94 → 95 | 2 989 → 2 882 ms | 0 → 0 | 48 ms |
| `/soporte` | 95 → 95 | 2 888 → 2 870 ms | 0 → 0 | 57 ms |

Accesibilidad 96–100 (el 96 es el contraste del naranja de marca con texto blanco, 3.02:1, ya conocido; ver F11), Buenas prácticas 96–100, **SEO 100 en las 6**.

*`/cotizar`: el laboratorio simulado varió entre 2.1 y 3.1 s en corridas sucesivas **sin cambios en esa página** (ruido de la máquina, no regresión); en la medición con limitación real dio 2.49 s.

**LCP con la red y la CPU limitadas de verdad** (mediana de 3): `/` 2 589 ms · `/cotizar` 2 486 · `/rastreo` 1 799 · `/cobertura` 2 442 · `/somos` 2 587 · `/soporte` 1 776. **Dicho con franqueza:** el objetivo de Core Web Vitals (LCP ≤ 2.5 s) se cumple en 4 de 6 rutas y en las otras 2 queda a ~0.1 s; en laboratorio simulado las 6 quedan entre 2.9 y 3.1 s. La acreditación definitiva es con **datos de campo** (usuarios reales) tras el lanzamiento (§7).

#### 3.2 Qué se corrigió y por qué

| # | Hallazgo | Corrección | Efecto |
|---|---|---|---|
| P-01 | **`/rastreo` saltaba al cargar** (CLS 0.646, 6 veces el límite "bueno"): el marcador de carga era solo un título y el contenido real aparecía después, empujando el pie de página | `rastreo-esqueleto.tsx`: el marcador mide lo mismo que la vista real | CLS 0.646 → **0**, Rendimiento 71 → 95 |
| P-02 | Las **4 fotos del banner se pedían a la vez**; las 3 ocultas competían por el ancho de banda con la foto que define el LCP | `ui/fotos-hero.tsx` (también elimina código duplicado entre Home y Somos): se descarga la visible y, a mitad del primer intervalo, la siguiente; la primera con `preload` + `fetchPriority="high"` | Imágenes de Home 80 → 38 KB; LCP de Home −500 ms |
| P-03 | **Zod (30 KB comprimidos) se descargaba en TODAS las páginas** porque Home importaba el guardado del borrador de cotización, que arrastraba el validador | Se separó la lectura (`cotizacion-draft-lectura.ts`, solo `/cotizar`) | JS de Home 205 → **177 KB**; `/rastreo` 203 → 175; `/somos` 204 → 176; `/soporte` 205 → 177 |
| P-04 | Logos de **4096×2483 px** (626 y 517 KB) para mostrarse a 140–220 px; 2 imágenes, 10 iconos y 5 archivos de plantilla de Next sin uso | Logos a 880 px (12 y 9 KB; diferencia visual máxima 21/255 en un píxel, media 0.15; los originales quedaron fuera del repo en `../originales-imagenes`); se borró lo no usado (≈ 880 KB de fuentes) | Menos peso de repositorio y de optimización de imágenes; `sizes` en el logo del pie |
| P-05 | Los archivos de `public/` se revalidaban en cada visita (`max-age=0`) | Caché de 1 día con *stale-while-revalidate* de 7 para `/icons` y `/images`; el optimizador de imágenes cachea 7 días (antes 4 h); `/api/*` con `no-store` | Visitas repetidas sin pedir iconos |
| P-06 | `priority` de `next/image` está obsoleto en Next 16 | Reemplazado por `preload` | Sin avisos de obsolescencia |
| P-07 | La función del BFF no declaraba cuánto puede tardar, y SIBOX puede tardar hasta 20 s | `maxDuration = 25` en las dos rutas | El 504 limpio llega antes de que Vercel corte la función |
| P-08 | Región del servidor sin definir | `vercel.json` → `dfw1` (Dallas): los identificadores de Cloudflare del API de SIBOX terminan en "-DFW", así que su borde está en Dallas | Menos latencia en cada llamada del BFF; **decisión reversible** (ver §7) |

**Probado y descartado:** `experimental.inlineCss` (incrustar el CSS en el HTML) empeoró el rendimiento (Home 93 → 89, TBT 61 → 198 ms), se revirtió.

#### 3.3 Peso por ruta (KB, sin caché)

| Ruta | JS antes → después | Imágenes antes → después |
|---|---|---|
| `/` | 205 → 177 | 80 → 38 |
| `/rastreo` | 203 → 175 | 34 → 16 |
| `/somos` | 204 → 176 | 89 → 46 |
| `/soporte` | 205 → 177 | 28 → 29 |
| `/cobertura` | 250 → 222 | 136 → 137 |
| `/cotizar` | 222 → 226 | 32 → 33 |
| `/envio`, `/perfil`, `/recoleccion` | 235–244 → 239–248 | sin cambio |

(Las rutas que sí usan Zod suben ~4 KB por el tercer fragmento; es el precio de quitárselo a las demás.) Todas bajo el presupuesto de 250 KB de JS.

#### 3.4 Renderizado y servidor
**Todas las páginas son estáticas** (precompiladas, servibles desde CDN); solo las 2 rutas del BFF son dinámicas. Por eso no hay coste de render por visita. Esto es justo lo que se perdería con una CSP con *nonce* (decisión de la Fase 2: se mantiene la CSP estática).

#### 3.5 Carga (localhost, producción, `autocannon`)

| Escenario | Resultado |
|---|---|
| Home, 50 conexiones simultáneas, 15 s | **1 029 peticiones/s**, p50 46 ms, p99 84 ms, 0 errores |
| **Pico**: Home, 500 conexiones, 10 s | 900 peticiones/s, p50 533 ms, p99 775 ms, **0 errores, 0 caídas** |
| `/cotizar`, 100 conexiones, 10 s | 1 191 peticiones/s, p99 127 ms, 0 errores |
| BFF sin límite, 50 conexiones, 10 s (cuerpo inválido, rechazado antes de SIBOX) | 1 001 peticiones/s, p99 98 ms |
| BFF **con** límite, 50 conexiones, 10 s | 1 125 peticiones/s, p99 165 ms, 0 errores; tras las 30 primeras el límite responde 429 (comportamiento comprobado en `e2e/limite.spec.ts`) y no añade costo apreciable |

**Limitaciones:** es una sola máquina (también corre el generador de carga), no el despliegue real; y **no se pudo medir el BFF hablando con SIBOX** (bloqueo de Cloudflare, B1) ni las funciones en frío de Vercel. Antes del lanzamiento hay que repetirlo contra la preview con `k6` o `autocannon` (§7).

#### 3.6 SEO técnico
- **`e2e/seo.spec.ts` (nuevo, 23 pruebas por navegador)**: en las 6 páginas públicas verifica `lang="es-MX"`, un solo `h1`, título y descripción **únicos**, de longitud útil (título ≤ 65, descripción 50–170), canonical absoluto y sin parámetros, Open Graph coherente con el canonical y con imagen que existe, datos estructurados válidos; en las 7 rutas privadas o provisionales, `noindex`; el sitemap lista exactamente las 6 públicas y todas responden 200; `robots.txt` apunta al sitemap y bloquea API/zonas privadas sin bloquear todo; las rutas inexistentes dan 404 real (no "404 blando").
- **Migas de pan (BreadcrumbList)** en las 5 páginas internas, además de `Organization` en todas (`src/components/seo/json-ld.tsx`).
- `lang` pasó de `es` a `es-MX`.
- **Evaluado y no hecho:** `LocalBusiness` por sucursal (requiere los datos reales de las 71 oficinas, hoy son un ejemplo), `FAQPage` (las respuestas reales no existen aún, ver §5) y `sameAs` con redes sociales (las direcciones reales no existen aún).

### 4. Analítica: plan de medición (propuesta; no se instaló nada)

**Principio:** medir qué pasa sin guardar datos personales. Ningún evento lleva número de guía, nombre, correo, teléfono, RFC, dirección completa ni C.P. completo (como máximo los 2 primeros dígitos).

| Evento | Cuándo | Propiedades permitidas |
|---|---|---|
| `rastreo_consultado` | Se consulta una guía | origen (hero / página / chat), resultado (encontrada / no encontrada / error / límite) |
| `cotizacion_iniciada` / `cotizacion_calculada` | Paso 1 enviado / costo mostrado | tipo de envío, tipo de entrega, rango de peso |
| `checkout_confirmar` / `pago_iniciado` / `pago_exitoso` / `pago_fallido` | Pasos 3 y 4 | método de pago, motivo del fallo (sin datos de tarjeta) |
| `recoleccion_programada` | Se agenda | estado (no la dirección) |
| `login_exitoso` / `login_fallido` | Modal de acceso | — |
| `cobertura_busqueda` | Se busca sucursal | estado |
| `contacto_enviado` | Formularios de soporte/chat | formulario |
| `error_bff` | El BFF responde 4xx/5xx | ruta, código |

**Herramientas recomendadas (decisión del cliente):** *Vercel Web Analytics + Speed Insights* (sin cookies, mide Core Web Vitals reales y páginas vistas; los eventos personalizados requieren plan Pro) frente a *GA4* (más completo, pero usa cookies y exige banner de consentimiento y aviso). Con la primera no hace falta banner; sí hay que mencionarla en el aviso de privacidad (Fase 6). El embudo (cotización → pago) solo es completo cuando B2–B4 estén conectados.

### 5. Contenido provisional que sigue visible (para pedir al cliente)

| Dónde | Qué hay hoy | Qué se necesita |
|---|---|---|
| Home, Somos, Rastreo y Soporte (`Faq`) | **Las 4 respuestas son el mismo texto genérico** ("Escríbenos a soporte@…") | Respuestas reales a las 4 preguntas (y ampliar la lista) |
| Chat flotante → pestaña Ayuda | Temas y preguntas de relleno | Contenido de ayuda real o decidir si se mantiene |
| Pie de página | **Las 3 columnas son idénticas** ("Servicio al cliente" ×3 con los mismos 4 enlaces); "Enviar" lleva a `/envio` (exige iniciar sesión, pero **comprar una guía no debe exigir registro**) | Estructura real de columnas y a dónde debe llevar "Enviar" |
| Pie de página | Redes sociales con las portadas genéricas `facebook.com`, `instagram.com`, `linkedin.com` | Direcciones reales de los perfiles |
| FAQ y página de soporte | Dos correos distintos: `soporte@inbox.com.mx` e `info@inbox.com.mx` | Cuál es el oficial |
| Servicios y soporte | `01 800 713 1000` y `834 171 3030` ("línea directa") | Confirmar ambos números |
| `/privacidad`, `/terminos`, `/trabaja-en-inbox` | "Próximamente" (ya con `noindex`) | **Aviso de privacidad y términos: obligatorios en México antes de lanzar** |
| `/cuenta/crear`, `/cuenta/recuperar` | "Próximamente" | Depende de B2 |
| Rastreo, mapa y sucursales | Datos de demostración / ejemplo (el mapa muestra una muestra de oficinas, no las 71) | Conectar a la API (Fase 3) |

**Sitio actual y redirecciones 301:** sigue **sin confirmarse** si existe un sitio público de Inbox. Si existe, hay que inventariar sus URLs y armar el mapa de redirecciones **antes** de cambiar el dominio; si no, este punto no aplica. Es la pregunta pendiente de más valor para SEO.

### 6. Verificación

| Comprobación | Resultado |
|---|---|
| `tsc`, ESLint (0 errores, 12 avisos heredados), `knip`, Prettier, ciclos | ✅ |
| Pruebas unitarias | 204 pasan |
| E2E completa, 4 navegadores (**119 pruebas × 4 = 476 casos**; +23 nuevas de SEO) | 467 pasan, 3 omitidas a propósito, **4 fallaron y 2 fueron intermitentes**. Los 4 fallos eran una sola prueba de rastreo que contaba cualquier `<script>` dentro de `<main>` y ahora encuentra legítimamente los datos estructurados; se corrigió para excluirlos y las 116 pruebas de rastreo y SEO volvieron a pasar en los 4 navegadores. Las 2 intermitentes fueron tiempos de espera de WebKit bajo carga (2 servidores + 2 procesos), que pasan solas |
| Lighthouse con presupuestos | ✅ las 6 rutas dentro de presupuesto (con 6 avisos de LCP sobre el objetivo de laboratorio) |
| CI | Nuevo trabajo `rendimiento` (Lighthouse con presupuestos). **No bloquea** las primeras semanas (`continue-on-error`): los ejecutores compartidos de GitHub son más ruidosos; quitar la línea cuando salga estable |

### 7. Pendientes (con dueño)

| # | Pendiente | Dueño | Cuándo |
|---|---|---|---|
| 1 | **Datos de campo**: activar Speed Insights/Analytics y revisar LCP/INP/CLS en p75 móvil durante 2 semanas | Tú (Vercel) | Tras el lanzamiento |
| 2 | Repetir la prueba de carga contra la **preview de Vercel** (con SIBOX alcanzable) y probar funciones en frío | Desarrollo | Fase 7 / cuando B1 se resuelva |
| 3 | Confirmar la región `dfw1` con el proveedor de SIBOX (dónde está su servidor) y con el plan de Vercel (varias regiones requieren Pro) | Tú / cliente | Al crear el proyecto |
| 4 | Pendientes de contenido de §5 (**incluye aviso de privacidad y términos**) y la pregunta del **sitio actual / redirecciones 301** | Cliente | Antes de lanzar |
| 5 | Elegir herramienta de analítica (§4) | Cliente / jefe | Antes de lanzar |
| 6 | Si se quiere bajar más el LCP: 4 pesos de Poppins en lugar de 5 (−8 KB; cambia 10 textos de 600 a 700), cargar el chat solo al abrirlo (−10 KB), AVIF para fotos. Son mejoras pequeñas; se dejaron por no cambiar el diseño sin que lo decidas | Desarrollo | Opcional |
| 7 | Dominio final en `SITE_URL` (Vercel) para que sitemap, canonical y Open Graph apunten al correcto; si se omite, hay respaldos con las variables de Vercel | Tú | Al crear el proyecto |
| 8 | Quitar `continue-on-error` del trabajo de rendimiento del CI cuando sea estable | Desarrollo | Tras ~2 semanas |

### 8. Siguiente

Las fases **3** (funcional e integración; depende de B1) y **4** (experiencia; depende de Figma Dev Mode) siguen esperando a terceros. La **6** (operación, legal y UAT) puede empezar con lo que ya se sabe: aviso de privacidad (insumo: inventario de la Fase 2 y plan de analítica de esta fase), CI/CD, observabilidad y plan de migración; la **7** cierra con el Go / No-Go.
