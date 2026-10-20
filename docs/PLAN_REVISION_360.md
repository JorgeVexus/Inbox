# Plan de revisión 360° — Rediseño web Inbox

**Objetivo:** una revisión de punta a punta (seguridad, código, rendimiento, diseño, responsividad, accesibilidad, contenido, operación y migración) que deje una decisión **Go / No-Go** documentada para el lanzamiento y una línea base medible para seguir mejorando.

**Fecha del plan:** 20 de octubre de 2026 · **Estado de partida:** ver sección 2.

---

## 1. Principios

1. **Evidencia, no opinión.** Cada hallazgo lleva pasos para reproducirlo, severidad y captura/log. Cada corrección se verifica con una prueba que falle antes y pase después.
2. **Automatizar lo repetible.** Lo que se revisa dos veces se convierte en prueba o regla de CI.
3. **Riesgo primero.** Orden: seguridad y datos → flujos de negocio → experiencia → pulido.
4. **Lo que no se puede verificar se declara** (accesos, dispositivos, endpoints sin liberar), con dueño y fecha.
5. **Medir antes y después**, contra los umbrales de la sección 6.

**Severidades:** **Crítica** (datos expuestos, compra/pago roto, sitio caído) · **Alta** (falla visible a usuarios reales, riesgo legal o de seguridad explotable) · **Media** (degrada la experiencia, workaround existe) · **Baja** (pulido, deuda técnica).

---

## 2. Línea base actual (medida hoy)

| Métrica | Valor |
|---|---|
| Código de aplicación | 114 archivos, ~11 400 líneas (sin pruebas) |
| Pruebas | 155 unitarias · 8 archivos E2E (≈360 casos en 4 navegadores) |
| TypeScript | `strict: true`; 0 usos explícitos de `any` |
| Deuda visible | 7 `eslint-disable`, 9 `TODO/FIXME`, 5 `console.*`, 1 `dangerouslySetInnerHTML` (datos estructurados estáticos) |
| Componentes muy grandes (>250 líneas) | 9; el mayor: `step-pago.tsx` (759 líneas) |
| Dependencias de producción | 6 (`next`, `react`, `react-dom`, `leaflet`, `react-leaflet`, `zod`); 0 vulnerabilidades |
| Datos simulados (mocks) | 10 módulos en `src/lib/mock/` |
| Lighthouse móvil | Cotizar 95 · Cobertura 91 · Home 89 · accesibilidad 96–100 · SEO 100 |
| Accesibilidad (axe) | 0 violaciones (excepto contraste de marca, 45 elementos) |
| Hallazgos de QA previos | 51 registrados, 49 corregidos (`docs/REPORTE_QA.md`) |

**Bloqueos que limitan esta revisión:** B1 (Cloudflare bloquea a Node, sin conexión real a SIBOX), Figma Dev Mode sin activar (no hay comparación visual), sin dispositivos físicos ni lector de pantalla humano, endpoints de pago/guía/etiqueta no liberados.

---

## 3. Mapa de la revisión (16 frentes)

Estado: ✅ cubierto con evidencia · 🟨 parcial · ⬜ pendiente. “Hoy” = lo que ya hicimos.

| # | Frente | Hoy | Quién | Esfuerzo (persona-días) |
|---|---|---|---|---|
| F1 | Seguridad de la aplicación (OWASP) | 🟨 | Dev + Seguridad | 4 |
| F2 | Seguridad de infraestructura y accesos | ⬜ | DevOps | 2 |
| F3 | Limpieza y calidad del código | 🟨 | Dev | 5 |
| F4 | Sintaxis, estilo y análisis estático | 🟨 | Dev | 1.5 |
| F5 | Estrategia y cobertura de pruebas | 🟨 | QA + Dev | 3 |
| F6 | Funcional y reglas de negocio | 🟨 | QA + Producto | 3 |
| F7 | Integración con SIBOX y BFF | 🟨 | Dev + Backend | 3 |
| F8 | Rendimiento y escalabilidad | 🟨 | Dev | 3 |
| F9 | Diseño y fidelidad visual | ⬜ | Diseño + QA | 3 |
| F10 | Responsividad y dispositivos | 🟨 | QA | 2 |
| F11 | Accesibilidad | 🟨 | QA + Diseño | 3 |
| F12 | SEO, analítica y contenido | 🟨 | Dev + Marketing | 3 |
| F13 | Compatibilidad y condiciones de red | 🟨 | QA | 2 |
| F14 | Privacidad y cumplimiento legal | ⬜ | Legal + Dev | 3 |
| F15 | Operación: CI/CD, observabilidad y salida a producción | ⬜ | DevOps + Producto | 5 |
| F16 | Documentación y mantenibilidad; UAT con usuarios | 🟨 | Todos | 4 |
| | **Total estimado** | | | **≈ 49 persona-días** (≈ 35 con automatización agresiva) |

---

## 3.1 Seguimiento por fases (se actualiza al cerrar cada fase)

| Fase | Estado | Documento |
|---|---|---|
| 0. Preparación y línea base | ✅ Completada (2026-10-20) | `docs/fases/FASE_0_PREPARACION.md` |
| 1. Estática y limpieza (F3, F4, F5) | ⬜ Siguiente | — |
| 2. Seguridad (F1, F2, F14 inventario) | ⬜ | — |
| 3. Funcional e integración (F6, F7) | ⬜ (depende de B1) | — |
| 4. Experiencia (F9, F10, F11, F13) | ⬜ (F9 depende de Figma Dev Mode) | — |
| 5. Rendimiento y SEO (F8, F12) | ⬜ | — |
| 6. Operación, legal y UAT (F15, F14, F16) | ⬜ | — |
| 7. Cierre y Go / No-Go | ⬜ | — |

**Supuestos a confirmar:** que existan los roles de DevOps, Seguridad y Legal (si no, esas tareas las asume el equipo disponible o se contratan puntualmente); si existe un sitio público actual de Inbox y en qué plataforma; si hay analítica del sitio actual para definir la matriz de navegadores.

---

## 4. Detalle por frente

### F1 — Seguridad de la aplicación
**Alcance:** autenticación y sesión, autorización por objeto, validación de entradas, XSS/inyección/CSRF/SSRF, manejo de errores, secretos, límites de abuso, privacidad en logs.
**Qué se revisa**
- Modelo de sesión real (cookies `Secure/HttpOnly/SameSite`, rotación, expiración, cierre global). Hoy la sesión es demostración en memoria.
- Autorización por objeto (guía, etiqueta, factura, domicilio, recolección): conocer un folio no debe dar acceso.
- Validación Zod en cada Route Handler; cuerpos máximos; tipos y rangos; rechazo de campos extra.
- CSRF en mutaciones, CORS restringido, exigir `Content-Type: application/json` y revisar `Origin`.
- **Rate limiting** con 429 y `Retry-After` (valores del plan: rastreo 30/min, CP 60/min, cotización 10/min y 50/h, login 5 fallos/15 min).
- Cabeceras: pasar de CSP básica a CSP con *nonce*; `Permissions-Policy` ajustada a funciones reales (geolocalización si se implementa "sucursal más cercana").
- Idempotencia en generación de guía y pago; recalcular precio en servidor.
- Etiquetas PDF: decodificar Base64 en servidor, `attachment`, tipo validado, tamaño máximo.
**Método / herramientas:** revisión de código dirigida (checklist OWASP ASVS L2), `semgrep` + CodeQL (SAST), `gitleaks` (secretos, incluido historial de git), OWASP ZAP baseline/active (DAST) contra preview, pruebas manuales de abuso (enumeración de guías, fuerza bruta de login, payloads de 10 MB, encabezados falsificados), prueba de que ningún dato personal llega a logs (enmascarado).
**Aceptación:** 0 hallazgos Crítica/Alta abiertos; 0 secretos en repo e historial; rate limit probado con carga; pruebas E2E de autorización por objeto.
**Entregable:** informe de seguridad + pruebas automáticas de regresión.

### F2 — Seguridad de infraestructura y accesos
- **Vercel:** variables por entorno (producción vs preview), previews protegidos por contraseña/SSO, tokens con alcance mínimo, equipo con 2FA, registro de cambios.
- **GitHub:** protección de rama `main` (PR obligatorio, CI verde, sin *force push*), Dependabot/Renovate, escaneo de secretos activado, CODEOWNERS.
- **Cloudflare/DNS:** WAF y *bot management* acordes (resolver B1), regla *Skip* acotada a la IP/ruta, HSTS con *preload* (solo cuando el dominio esté estable), TLS 1.2+, CAA, SPF/DKIM/DMARC si el dominio envía correo.
- **IP fija de salida** (B5): decisión y prueba del proxy/VPS; rotación y monitoreo.
- **Rotación de credenciales** de la cuenta de servicio y política de custodia.
**Aceptación:** checklist de accesos firmado; ninguna credencial compartida por chat/correo; procedimiento de rotación probado.

### F3 — Limpieza y calidad del código
**Revisión estructural**
- **Código muerto y exportaciones sin uso:** `knip`/`ts-prune`; eliminar o justificar.
- **Duplicación:** `jscpd` (los formularios comparten patrones de validación, teléfono, correo y CP repetidos en 8+ componentes → extraer `lib/validacion.ts`).
- **Tamaño y complejidad:** dividir los 9 componentes >250 líneas (prioridad `step-pago.tsx`, `cobertura.tsx`, `hero.tsx`); medir complejidad ciclomática (objetivo ≤ 10 por función).
- **Dependencias circulares:** `madge --circular`.
- **Separación mocks/real:** un único punto de conmutación por seam, con prueba que garantice que ningún `mock/` se importa en rutas de producción real; plan de retiro de cada mock.
- **Manejo de errores uniforme:** clase de error de aplicación, mensajes en un solo catálogo, sin `catch {}` mudos injustificados.
- **Higiene:** eliminar los 5 `console.*` (o canalizarlos a un logger enmascarado), resolver o ticketear los 9 `TODO`, justificar los 7 `eslint-disable`, revisar comentarios obsoletos (hay comentarios en inglés y español mezclados → una convención).
- **Convenciones:** nombres de archivos (kebab-case), componentes (PascalCase), constantes, orden de imports, alias `@/`.
- **Fin de línea:** añadir `.gitattributes` (`* text=auto eol=lf`) — hoy hay avisos LF/CRLF en cada commit.
- **Revisión de arquitectura:** capas `components → lib (seams) → api/BFF`; ADRs para decisiones (BFF, mocks, almacenamiento local, mapa).
**Aceptación:** sin código muerto, sin duplicación >3 % , ningún archivo >350 líneas (excepciones documentadas), 0 ciclos, índice de mantenibilidad aceptable.

### F4 — Sintaxis, estilo y análisis estático
- **TypeScript:** activar `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes` (evaluar costo), `verbatimModuleSyntax`.
- **ESLint:** sumar `eslint-plugin-jsx-a11y` (estricto), `eslint-plugin-security`, `eslint-plugin-import`/orden, `eslint-plugin-unicorn` (selectivo), regla de complejidad y de tamaño.
- **Prettier** con configuración única + `lint-staged`/`husky` (pre-commit) y *commitlint*.
- **Revisión sintáctica del HTML/ARIA:** `html-validate` sobre las páginas renderizadas; validador W3C.
- **Ortografía y estilo de texto:** `cspell` con diccionario español + glosario de marca.
**Aceptación:** `tsc`, ESLint (sin warnings), Prettier y `html-validate` en 0, bloqueantes en CI.

### F5 — Estrategia y cobertura de pruebas
- **Cobertura:** medir con `vitest --coverage`; umbrales por capa (lib ≥ 85 %, BFF ≥ 90 %, componentes críticos ≥ 70 %).
- **Mutación:** Stryker sobre las funciones de dinero, fechas, horarios, validación y BFF (detecta pruebas que "pasan sin comprobar").
- **Contrato:** pruebas contra respuestas reales grabadas de SIBOX (fixtures) para que un cambio de contrato rompa la CI.
- **E2E:** ampliar a flujos con sesión real cuando exista (registro, recuperar contraseña, historial); pruebas de autorización por objeto; pruebas de concurrencia.
- **Regresión visual:** capturas de Playwright por página y ancho, con umbral de diferencia.
- **Higiene de pruebas:** cero pruebas inestables (reintentos = 0 en CI), datos de prueba aislados, reporte HTML en CI.
**Aceptación:** umbrales cumplidos; 3 corridas seguidas sin pruebas inestables.

### F6 — Funcional y reglas de negocio
- **Matriz de trazabilidad** requisito → caso → resultado (partir de `docs/REPORTE_QA.md` §4): rastreo, cotización, confirmar, pago, etiqueta, recolección, historial, facturación, cuenta.
- **Reglas del cliente:** compra como invitado sin muro de login; recolección solo con registro; con sesión ver envíos/recolecciones/contactos.
- **Funciones aún no implementadas** (a priorizar con producto): etiqueta PDF, catálogo SAT, historial de recolecciones, sucursal más cercana, sesión expirada, flete por cobrar vs contado, flujo de facturación por guía.
- **Cálculos y datos:** importes/impuestos (recalcular en servidor), fechas y zona horaria (CDMX; frontera con horario de verano), redondeos, límites (peso, medidas, cantidad), formatos (moneda, teléfonos +52, DD/MM/AAAA).
- **Estados** (definición de terminado del plan): vacío, carga, éxito, error, **reintento**, **sesión expirada** en cada pantalla.
- **Pruebas exploratorias** guiadas por sesiones (charters de 60 min) con testers que no escribieron el código.
**Aceptación:** matriz 100 % trazada; 0 casos Críticos/Altos abiertos.

### F7 — Integración con SIBOX y BFF
- **Contrato:** verificar cada endpoint contra el PDF y la respuesta real (ya hecho para lectura); completar guía, etiqueta, recolección, pagos cuando se liberen.
- **Resiliencia (caos controlado):** latencia alta, 5xx, respuestas HTML (Cloudflare), JSON roto, token expirado a media operación, caída de SIBOX; verificar tiempos de espera, enfriamiento, mensajes y reintento.
- **Cache:** qué se puede cachear (catálogos, oficinas) y por cuánto; evitar caché de datos personales.
- **Idempotencia:** doble envío de guía/pago/recolección.
- **Observabilidad:** ID de correlación por petición, métricas (latencia, tasa de error por endpoint), alertas.
- **Cloudflare/IP (B1/B5):** prueba reproducible desde Vercel y desde el VPS; checklist de “API alcanzable”.
**Aceptación:** pruebas de contrato en CI; matriz de fallos con comportamiento esperado verificado.

### F8 — Rendimiento y escalabilidad
- **Core Web Vitals** (laboratorio y, tras el lanzamiento, datos de campo): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 en p75 móvil.
- **Bundle:** `@next/bundle-analyzer`; presupuesto de JS por ruta; carga diferida de Leaflet (hecho), chat y modales; revisar `react-leaflet` (¿puede reemplazarse por algo más ligero?).
- **Imágenes y fuentes:** tamaños responsivos, `priority` solo en LCP, WebP/AVIF, subconjunto de fuentes, evitar saltos.
- **Servidor:** renderizado estático donde se pueda; tiempos de arranque en frío de funciones; límites de memoria/tiempo; región cercana a México.
- **Caché y CDN:** cabeceras de caché de estáticos, `stale-while-revalidate` en catálogos.
- **Carga:** `k6`/Artillery contra preview (rastreo, cotización, páginas): perfil esperado de tráfico del sitio actual, pico 10×, y prueba de *spike*; confirmar el comportamiento sin rate limit vs con él.
- **Redes lentas:** 3G/4G lento y CPU 4× más lenta (Lighthouse móvil y `webpagetest`).
- **Lighthouse CI** con presupuestos que bloquean el despliegue.
**Aceptación:** Lighthouse móvil ≥ 90 en Performance en las 6 rutas públicas; presupuesto de JS respetado; 0 errores bajo la carga objetivo.

### F9 — Diseño y fidelidad visual
- **Comparación con Figma** (requiere activar Dev Mode): cada pantalla en escritorio y móvil con tolerancias acordadas (±2 px en espaciado, tipografía y color exactos).
- **Sistema de diseño:** tokens (color, tipografía, sombras, radios), uso consistente de componentes (`Button`, campos), estados (hover, foco, deshabilitado, error, carga, vacío), iconografía, imágenes.
- **Pantallas sin diseño de Figma** (`/perfil`, `/recoleccion`, páginas "Próximamente", 404, error): revisión de diseño con el equipo de diseño.
- **Microinteracciones y movimiento:** duración/curvas coherentes, `prefers-reduced-motion` (hecho en carrusel; revisar el resto).
- **Contenido de diseño (UX writing):** voz de marca única (hoy mezcla "usted" y "tú"), mensajes de error útiles, textos de ayuda.
- **Modo oscuro:** decidir si se soporta (hoy no).
- **Regresión visual** con capturas aprobadas como línea base.
**Aceptación:** 0 desviaciones Altas contra Figma; lista de excepciones aprobadas por diseño.

### F10 — Responsividad y dispositivos
- **Matriz de anchos** 320 / 360 / 375 / 390 / 414 / 600 / 768 / 820 / 1024 / 1100 / 1280 / 1366 / 1440 / 1536 / 1920 / 2560 en cada ruta y paso (ya hecho en gran parte; automatizado en E2E).
- **Dispositivos reales:** iPhone (SE y reciente), Android gama media/baja, iPad, laptop con barra de desplazamiento clásica (donde se halló un desborde que el navegador sin ventana ocultaba), pantalla 4K.
- **Orientación** vertical/horizontal; zoom del navegador 200 % y 400 % (reflow, WCAG 1.4.10); tamaño de texto del sistema +200 %; espaciado de texto (WCAG 1.4.12).
- **Táctil:** objetivos ≥ 24 px (idealmente 44), gestos, teclado virtual (no tapa campos; tipo de teclado correcto), *safe areas* del iPhone.
- **Impresión:** hoja de estilos de impresión para guía/confirmación.
**Aceptación:** 0 desbordes y 0 contenido cortado en la matriz; capturas aprobadas por diseño.

### F11 — Accesibilidad (WCAG 2.2 AA)
- **Automática:** axe (ya 0 violaciones), Lighthouse, `pa11y` en CI.
- **Manual:** recorrido solo con teclado de cada flujo (orden de foco, atrapado en modales, atajos), lector de pantalla humano (NVDA + Firefox/Chrome en Windows, VoiceOver en macOS e iOS, TalkBack en Android), zoom, contraste en estados (hover/foco/deshabilitado), formularios (etiquetas, errores asociados `aria-describedby`, `aria-invalid`, anuncios `aria-live`), tablas y listas semánticas (la tabla de sucursales es una rejilla de `div`: evaluar rol `table`), mapa (alternativa textual: la lista ya existe).
- **Contraste de marca** (naranja `#ff6015` sobre blanco 3.02:1): decisión de marca (tono `#CC4D11` o texto grande/negrita); gris de placeholders.
- **Cognitiva:** lenguaje claro, mensajes de error con solución, sin límites de tiempo ocultos.
- **Declaración de accesibilidad** y registro de excepciones.
**Aceptación:** 0 incumplimientos A/AA no justificados; aprobación del lector de pantalla humano en los 4 flujos críticos.

### F12 — SEO, analítica y contenido
- **SEO técnico:** metadatos (hecho), canonical, `sitemap`/`robots` con dominio final, datos estructurados válidos (Organization; evaluar LocalBusiness por sucursal, BreadcrumbList, FAQPage con las respuestas reales), enlaces internos, estados 404/410/301, rendimiento.
- **Si ya existe un sitio público de Inbox** (por confirmar con el cliente; su plataforma es desconocida): inventario de sus URLs, mapa de redirecciones 301, conservar títulos/descripciones relevantes y verificar en Search Console antes y después. Si no existe o el dominio es nuevo, este punto no aplica.
- **Analítica y eventos:** plan de medición (rastreo, cotización iniciada/completada, pago, errores), consentimiento de cookies, sin PII en eventos.
- **Contenido real:** FAQ (4 respuestas hoy genéricas), chat de ayuda, redes sociales, correos oficiales, teléfonos, textos legales; revisión ortográfica y de tono; coherencia de datos entre páginas.
**Aceptación:** SEO 100 en Lighthouse; redirecciones verificadas; 0 contenido provisional visible.

### F13 — Compatibilidad y condiciones de red
- **Navegadores:** Chrome/Edge (últimas 2), Firefox (últimas 2 + ESR), Safari macOS/iOS (últimas 2), Samsung Internet; política para versiones antiguas (soportar ≥ 98 % del tráfico actual del sitio, si el cliente puede compartir su analítica actual).
- **Condiciones:** sin JavaScript (hecho en rutas clave), extensiones (bloqueadores de anuncios que bloquean teselas/analítica), cookies/almacenamiento bloqueados (hecho), modo privado, sin red/intermitente, latencia alta, zona horaria distinta (hecho), idioma del navegador.
- **Robustez de formularios:** autocompletado del navegador, gestores de contraseñas, pegar/arrastrar, doble envío, botón Atrás/Adelante, recargar a mitad de flujo, varias pestañas.
**Aceptación:** matriz verde en los navegadores soportados.

### F14 — Privacidad y cumplimiento legal
- **Inventario de datos personales** (nombre, teléfono, correo, RFC, domicilios, guías) y flujo de cada dato; minimización y retención.
- **LFPDPPP (México):** aviso de privacidad (integral y simplificado), consentimiento, derechos ARCO, contacto responsable; **hoy `/privacidad` y `/terminos` son páginas provisionales**.
- **Cookies/almacenamiento:** hoy no hay cookies; si se agrega analítica, banner de consentimiento.
- **Terceros:** OpenStreetMap (las teselas exponen IP del visitante a un tercero), proveedores de pago, analítica, Sentry; contratos y avisos.
- **PCI DSS:** nunca tocar datos de tarjeta en nuestro servidor (campos alojados del proveedor/tokenización); la captura de tarjeta de hoy es solo maqueta y **debe sustituirse**.
- **Logs:** sin contraseñas, tokens, RFC, teléfonos, correos ni direcciones; retención definida.
- **Términos y condiciones**, política de devoluciones/seguro, facturación (CFDI) con el área fiscal.
**Aceptación:** documentos legales publicados y revisados por Legal; mapa de datos firmado.

### F15 — Operación: CI/CD, observabilidad y migración
- **CI (GitHub Actions):** instalar con `npm ci`, `tsc`, ESLint, Prettier, pruebas unitarias con cobertura, build, E2E en Chrome (y noche: 4 navegadores), Lighthouse CI, `npm audit`, escaneo de secretos, CodeQL; bloqueo de *merge* si falla.
- **Entornos:** desarrollo, preview por PR, producción; paridad de variables; despliegue y **reversión (rollback)** probados.
- **Observabilidad:** Sentry (errores front/back, sin PII), logs estructurados con correlación, métricas de negocio, *uptime monitor* externo (rastreo, cotización), alertas (error rate, latencia, caída de SIBOX, cooldown de login activo), página de estado.
- **Salida a producción:** confirmar con el cliente **si existe un sitio actual** que este rediseño reemplace (y en qué plataforma). Si existe: inventario de funciones (formularios, integraciones, scripts), paridad de contenido, plan de **corte de DNS** en ventana controlada, TTL reducido, plan de reversión al sitio anterior y monitoreo reforzado 72 h. Si no existe: alta del dominio, DNS y certificados desde cero.
- **Continuidad:** respaldo de configuración, runbooks (caída de SIBOX, bloqueo de Cloudflare, rotación de credenciales, incidente de datos), contactos de escalamiento.
**Aceptación:** simulacro de incidente y de rollback ejecutado; checklist de corte aprobado.

### F16 — Documentación, mantenibilidad y UAT
- **Documentación:** `README` e `INDICE_MAESTRO` (hecho), ADRs, guía de contribución, guía de despliegue y variables, diccionario de seams/mocks y cómo conectarlos, guía de pruebas.
- **Prueba de onboarding:** una persona nueva clona, instala, levanta y corre pruebas siguiendo solo la documentación (y se registran los tropiezos).
- **UAT:** sesiones con 5–8 usuarios reales (cliente final, mostrador, soporte): tareas (rastrear, cotizar y comprar como invitado, agendar recolección, encontrar sucursal), observación, medida de tarea completada/tiempo/errores y cuestionario SUS; aceptación firmada por el responsable del cliente.
**Aceptación:** onboarding < 30 min sin ayuda; SUS ≥ 80; UAT aprobado.

---

## 5. Calendario propuesto (≈ 5 semanas, ajustable)

| Fase | Semana | Frentes | Salida |
|---|---|---|---|
| 0. Preparación | 0 (2 días) | Instalar herramientas, activar Figma Dev Mode, fijar umbrales, crear CI base, `.gitattributes` | Línea base reproducible |
| 1. Estática y limpieza | 1 | F3, F4, F5 (cobertura/mutación) | Informe de código + PR de limpieza |
| 2. Seguridad | 1–2 | F1, F2, F14 (inventario) | Informe de seguridad; rate limit implementado |
| 3. Funcional e integración | 2–3 | F6, F7 (con B1 resuelto) | Matriz de trazabilidad; contrato en CI |
| 4. Experiencia | 3–4 | F9, F10, F11, F13 | Informe de diseño/a11y/dispositivos |
| 5. Rendimiento y SEO | 4 | F8, F12 | Presupuestos en CI; plan de redirecciones |
| 6. Operación y migración | 4–5 | F15, F14 (legal), F16 | Simulacro de rollback; UAT |
| 7. Cierre | 5 | Re-ejecución completa + decisión | **Go / No-Go** firmado |

**Dependencias críticas:** B1 (para F7 con SIBOX real), Figma Dev Mode (F9), textos legales y contenido del cliente (F12, F14), proveedor de pago y endpoints (F6, F14), dispositivos físicos y lector de pantalla humano (F10, F11).

---

## 6. Criterios de salida (Go / No-Go)

| Área | Umbral para lanzar |
|---|---|
| Hallazgos | 0 Críticos y 0 Altos abiertos; Medios con plan y fecha |
| Seguridad | 0 vulnerabilidades altas en dependencias; 0 secretos; rate limit activo y probado; autorización por objeto verificada; ZAP sin hallazgos altos |
| Código | `tsc`/ESLint/Prettier en 0; sin código muerto ni ciclos; cobertura lib ≥ 85 % |
| Pruebas | Suite completa verde 3 corridas seguidas sin reintentos |
| Rendimiento | Lighthouse móvil ≥ 90 en rutas públicas; LCP ≤ 2.5 s, CLS ≤ 0.1; carga objetivo sin errores |
| Accesibilidad | axe 0; teclado y lector de pantalla aprobados; contraste resuelto o excepción aprobada |
| Diseño/responsividad | 0 desviaciones Altas contra Figma; 0 desbordes en la matriz |
| Contenido y legal | 0 contenido provisional; aviso de privacidad y términos publicados |
| Operación | CI obligatorio, monitoreo y alertas activos, rollback ensayado, plan de corte aprobado |
| Negocio | UAT firmado; bloqueos B1–B11 resueltos o aceptados por escrito |

---

## 7. Herramientas (se instalan en la fase 0)

`knip`, `jscpd`, `madge`, `cspell`, `html-validate`, `eslint-plugin-jsx-a11y`, `eslint-plugin-security`, Prettier + `husky` + `lint-staged`, Vitest coverage, Stryker, `semgrep`, CodeQL, `gitleaks`, OWASP ZAP, `@next/bundle-analyzer`, Lighthouse CI, `k6`, `pa11y`, Playwright (ya instalado) con capturas visuales, Sentry, uptime monitor, Dependabot/Renovate.

---

## 8. Qué puede ejecutar el asistente y qué requiere personas

| Lo ejecuta el asistente (con acceso al repo) | Requiere personas o accesos |
|---|---|
| F3, F4, F5 casi completos; F1 (revisión de código, SAST, secretos, pruebas de abuso); F6, F8, F10, F13 automáticos; F11 automática; F12 técnico | F2 (paneles de Vercel/GitHub/Cloudflare), F9 (Figma Dev Mode y juicio de diseño), F11 manual (lector de pantalla humano), F10 (dispositivos físicos), F14 (Legal), F15 (decisiones de DevOps y corte de DNS), F16 (UAT con usuarios), contenido del cliente |

---

## 9. Riesgos del plan

| Riesgo | Mitigación |
|---|---|
| B1 sigue sin resolverse y F7 queda sin pruebas con SIBOX real | Seguir con el puente local para contrato; mantener la dependencia visible en el calendario |
| Se encuentran muchos hallazgos tarde | Fases ordenadas por riesgo y correcciones continuas (no acumular) |
| Cambios de alcance (etiqueta PDF, SAT, historial…) durante la revisión | Congelar alcance de la revisión; lo nuevo entra en un backlog con su propia revisión |
| Cansancio de revisión / falsos positivos de herramientas | Triage por severidad; excepciones documentadas con fecha de caducidad |
| Corte de DNS sin plan de reversión (si hay un sitio actual) | F15 lo exige como criterio de salida |

---

## 10. Entregables finales

1. Informe de cada frente (hallazgos, evidencia, correcciones, estado).
2. Matriz de trazabilidad actualizada y registro de defectos.
3. Suite automática ampliada (unitaria, E2E, contrato, visual, carga) integrada a CI.
4. Presupuestos de rendimiento y reglas de calidad que bloquean despliegues.
5. Documentación y runbooks.
6. Acta Go / No-Go firmada.
