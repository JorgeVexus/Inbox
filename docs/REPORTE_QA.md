# Reporte de QA — Rediseño web Inbox

**Fecha:** 12 de octubre de 2026 · **Versión probada:** rama `main` (Next.js 16.4.0) · **Entorno:** servidor de producción local (`next build` + `next start`), modo demostración, más un clon con `NEXT_PUBLIC_SIBOX_REAL=1` conectado a SIBOX (apitest) mediante un puente local.
**Rol:** análisis de QA exhaustivo en 4 rondas sucesivas durante la jornada, con corrección inmediata de los defectos y verificación posterior.

---

## 1. Resumen ejecutivo

| Indicador | Resultado |
|---|---|
| Hallazgos registrados | **51**: **49 corregidos** y 2 aceptados (D-008, D-070). Por severidad: 17 Alta, 22 Media, 12 Baja (sección 5) |
| Defectos / brechas **abiertos** | 8 riesgos de producto y 11 bloqueos externos (secciones 7 y 8). Ninguno es un error de código por corregir hoy; son decisiones, contenido del cliente o dependencias de backend. |
| Pruebas unitarias | **155 pasan** (Vitest, 18 archivos) |
| Pruebas de extremo a extremo | **360 casos** (≈90 pruebas × 4 navegadores: Chrome, Firefox, WebKit/Safari y Chrome móvil). Corrida final: **356 pasaron, 1 falló** (carrera de hidratación en WebKit bajo carga; pasa en aislamiento y el test se estabilizó), 3 omitidas a propósito |
| Accesibilidad (axe-core, WCAG 2.2 AA) | **0 violaciones** en 9 páginas, chat (3 pestañas), menú, 7 pasos del cotizador, 5 modales y 3 páginas privadas. Excepción conocida: contraste de la marca (45 elementos, §7) |
| Rendimiento (Lighthouse móvil) | Cotizar **95**, Cobertura **91**, Home **89**; accesibilidad 96–100, prácticas 96–100, SEO 100 |
| Seguridad | 0 vulnerabilidades en dependencias de producción; headers de seguridad; sin credenciales en el JavaScript del navegador; 0 cookies; carga de 3 000 peticiones/300 simultáneas sin caídas |
| Compatibilidad de pantalla | Sin desborde horizontal de 320 a 1920 px en todas las páginas |
| Veredicto | **Apto para desplegar a Vercel en modo demostración.** No apto para producción real hasta resolver B1 (Cloudflare), B8/B9 (formularios y datos simulados), el límite de peticiones y el contenido pendiente (B10). |

---

## 2. Alcance y estrategia

**Dentro del alcance:** las 11 páginas públicas y privadas, el chat, los 5 modales, el cotizador de 4 pasos con pago y facturación, la capa BFF (`/api/rastreo`, `/api/rastreo/detalle`), el contrato real de los endpoints de lectura de SIBOX, seguridad, accesibilidad, SEO, rendimiento, responsividad, robustez ante datos corruptos y diferencias de navegador.

**Fuera del alcance (no verificable hoy):** fidelidad visual contra Figma (la herramienta de Figma requiere activar el servidor Dev Mode en la app de escritorio; **no se verificó**), endpoints transaccionales de SIBOX (pago, guía, etiqueta: no liberados), registro/login real de usuarios, pruebas con un dispositivo físico, lector de pantalla humano (NVDA/VoiceOver), carga contra SIBOX real.

**Rondas:**
1. **Auditoría pre-Vercel:** seguridad, validaciones, flujos principales, estructura.
2. **Módulo por módulo:** 13 módulos × (funcionalidad, conexión con API, responsividad, accesibilidad/consola).
3. **Suite automática y resiliencia:** Playwright en 4 navegadores, datos corruptos, zonas horarias, sin red, carga.
4. **Analista de QA:** trazabilidad contra requisitos, modo "real" de la interfaz, axe-core, contenido sin JavaScript, metadatos, autocompletado, textos, formatos.

**Técnicas:** pruebas funcionales con datos válidos, vacíos, límite y hostiles (XSS, SQL, path traversal); valores límite; partición de equivalencia; pruebas de estado (sesión, borradores); pruebas de configuración (clon limpio sin `.env`); pruebas de robustez (almacenamiento corrupto/bloqueado, sin red, doble clic); pruebas de compatibilidad (3 motores de navegador + móvil); análisis estático; exploratorias guiadas por riesgo.

---

## 3. Inventario de pruebas

| Capa | Cantidad | Qué cubre |
|---|---|---|
| Unitarias (Vitest) | 155 | Cliente SIBOX (login único, enfriamiento, 401, timeout, Cloudflare), proxy BFF (límites, privacidad, errores), esquemas de rastreo y catálogos con datos reales, parser de horarios (42 textos reales), recolección (zona horaria, hora límite), contactos/domicilios/envíos, lecturas de almacenamiento, guías, moneda, fechas |
| E2E — públicas | 11 páginas + 404 + enlaces + 7 anchos | Título, un `h1`, un `main`, sin errores de consola, ningún enlace roto, sin desborde de 320 a 1920 px |
| E2E — flujos | cotizador, pago, facturación, rastreo, chat | Todas las validaciones campo por campo, reintentos, límite de 10 guías |
| E2E — sesión | login, perfil, envíos, recolección | Errores de login, foco del modal, CRUD, XSS, persistencia |
| E2E — resiliencia | 10 casos | Datos locales corruptos (4 formas), borrador corrupto, almacenamiento bloqueado, sin red, doble clic, 3 zonas horarias |
| E2E — seguridad | 9 casos | Headers, iframe, API hostil, JavaScript sin secretos, cookies, `robots`/`sitemap`/`noindex` |
| E2E — accesibilidad (axe) | 14 casos | 0 violaciones en todas las pantallas y estados |
| E2E — calidad | 13 casos | SEO, sin JavaScript, autocompletado, movimiento reducido, moneda, estado de rastreo |
| Manuales guiadas | ~120 | Barrido de 11 anchos con auditor propio, teclado real, foco, Lighthouse |

---

## 4. Trazabilidad contra los requisitos (documento de pantallas y plan de desarrollo)

| Requisito | Estado | Evidencia / observación |
|---|---|---|
| Rastreo con último estado (wsRastreo / RastreoDetalle) | ✅ Implementado y verificado con datos reales | Probado con 4 guías reales; ahora la tarjeta muestra el texto del último estado |
| Cotización por CP, tipo de entrega, tipo de envío, varios paquetes | ✅ (mock) | Sin `ObtieneDetalleCostos` real (B3). La UI usa CP/ciudad como texto: para el cálculo real hace falta resolver CP→estado/ciudad/colonia con `BusquedaCP` |
| Costo "de contado" vs "flete por cobrar" (TotalGuia + TotalCostoFxC) | ⚠️ Parcial | La UI muestra "recolección a domicilio" vs "entregar en sucursal"; confirmar el mapeo con negocio |
| Confirmar: invitado vs sesión; remitente/destinatario; contenido | ✅ | Con sesión solo autocompleta el nombre (el requisito pide también correo y teléfono) |
| **Tipo de producto SAT con búsqueda por nombre o código** | ❌ No implementado | Campo de texto libre (pendiente de catálogo del backend) |
| Pago (tarjeta, PayPal, efectivo, cobrar al destinatario) | ⚠️ Solo interfaz | Simulado a propósito (endpoints pendientes, B4) |
| **Impresión/descarga de etiqueta PDF** (`Genera_Etiqueta`) tras el pago | ❌ No implementado | Semana 4 del plan; no hay botón en la pantalla de éxito |
| Mostrar sucursal de depósito y fecha promesa tras pagar | ✅ | Enlace a Cobertura; fechas demo |
| Sucursales: lista, mapa, filtro por estado/ciudad | ✅ | Con mock; contrato real verificado (71 oficinas) |
| **Sucursal más cercana según la ubicación del cliente** | ❌ No implementado | Además `Permissions-Policy` bloquea geolocalización: habría que permitirla al implementarlo |
| Cobertura por estado | ✅ (mock) | El endpoint real devuelve 553 filas en otro formato |
| Registro/login (Google, Facebook, correo) | ❌ Bloqueado por backend (B2) | Google/Facebook retirados a propósito |
| Recolección: domicilios, horarios por CP, generación | ✅ (mock) | Con corrección de zona horaria y hora límite |
| **Historial de recolecciones programadas** | ❌ No implementado | Endpoint "Lista recolecciones" en actualización |
| Mis envíos (historial por cuenta) | ✅ (mock) | Endpoint pendiente |
| Facturación por guía + RFC + consulta/alta + descarga | ⚠️ Distinto | El modal captura datos fiscales; el flujo del plan (guía + RFC + validar en SIBOX + descargar factura) no existe (endpoints sin liberar) |
| Estados vacío / carga / éxito / error / **reintento** / **sesión expirada** | ⚠️ | Vacío, carga, éxito y error cubiertos; **reintento** agregado en rastreo; **sesión expirada** no existe (la sesión demo vive en memoria) |
| Rate limiting con 429 y `Retry-After` | ❌ No implementado | Necesita almacén compartido (Upstash Redis) |
| Monitoreo (Sentry) y analítica | ❌ No implementado | Previsto para la semana 8 |
| Accesibilidad, responsividad, rendimiento | ✅ | Secciones 1 y 5 |
| Coincide con Figma en escritorio y móvil | ❔ No verificado | Ver alcance |

---

## 5. Defectos encontrados y corregidos

Severidad: **A** = alta (seguridad, pérdida de datos, bloqueo de flujo o falla visible a usuarios reales), **M** = media, **B** = baja.

### 5.1 Seguridad y BFF

| ID | Sev. | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| D-001 | A | Next.js con vulnerabilidad grave (ejecución remota de código) | Actualizado a 16.4.0 | `npm audit --omit=dev`: 0 |
| D-002 | A | **Fuga de datos personales** en el rastreo público: nombres, quién recibió, **firma en base64**, coordenadas y observaciones internas con correos de clientes | El BFF los anula en el servidor | 4 guías reales: el JSON crudo trae datos, la respuesta del BFF `null`; prueba E2E |
| D-003 | A | Sin headers de seguridad | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, CSP básica; sin `X-Powered-By` | Prueba E2E en páginas y API; prueba de iframe |
| D-004 | A | Cada petición reintentaba el Login si fallaba (riesgo de bloquear la cuenta de servicio o la IP) | Login único compartido (single-flight) + enfriamiento de 30 s | 15 peticiones simultáneas → 1 Login |
| D-005 | M | Cuerpo sin límite, guía sin validar (backend SQL Server), sin timeout | 10 000 caracteres (413), regex de guía (400), timeout 20 s (504) | 8 casos hostiles E2E |
| D-006 | M | Un error SQL interno de SIBOX llegaba al navegador | Mensajes genéricos 502/503; detalle solo en logs | Prueba unitaria y E2E (sin "sibox/cloudflare/stack") |
| D-007 | M | `BusquedaCP`/`ObtenerHorariosPorCP` aceptan CP basura y devuelven catálogos completos | Esquema valida CP de 5 dígitos (rechaza 00000/99999) y trata respuestas con CP mezclados como "no encontrado" | 25 pruebas con datos reales |
| D-008 | B | Detalle de error de validación expone la estructura de Zod | Aceptado (sin datos sensibles); documentado | — |

### 5.2 Defectos funcionales y de lógica

| ID | Sev. | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| D-010 | A | **Fecha de recolección adelantada un día** después de las 6 pm (usaba UTC) | Fecha local | Pruebas con zona CDMX (lunes 10 pm) |
| D-011 | A | Permitía agendar ventanas de **hoy ya pasadas** e ignoraba la hora límite de captura | `ventanasDisponibles`/`diasDisponibles` respetan hora actual y límite | 5 pruebas unitarias + 2 E2E |
| D-012 | A | **12 de 42 horarios reales** (y 28 oficinas sin horario) se mostraban como "Cerrado" sin saberlo | Nuevo intérprete (días, "a"/"-", am/pm, turnos partidos, "cerrado los jueves"), hora de CDMX, estado "Horario no disponible" | 42/42 textos reales; 10 pruebas |
| D-013 | M | "LISTO PARA ENTREGAR" se mostraba como *Entregado*; estatus de tránsito como *recibido* | Tabla exacta del catálogo real de estatus | Pruebas unitarias |
| D-014 | M | Fechas de entrega fijas ("Sáb, 02 de agosto") | Calculadas desde hoy | E2E (no aparece "agosto") |
| D-015 | A | Validaciones casi inexistentes: CP libre, peso 0/negativo, teléfono "abc", correo malo, RFC sin formato, **tarjeta sin Luhn ni vencimiento** | Validación de cada campo con mensaje explicativo | E2E campo por campo en 4 navegadores |
| D-016 | A | Botones "apagados" (`pointer-events-none`) se activaban con Enter → **doble envío** | `disabled` real + guardas en los manejadores | E2E: doble clic en pagar, un solo folio |
| D-017 | A | Con fallos de red las pantallas quedaban en "Generando…/Procesando…" para siempre | try/catch con mensaje de error en 9 flujos | Pruebas manuales y E2E |
| D-018 | M | 4 controles muertos (lupas de sucursal, "Artículos prohibidos", lupa del menú) | Conectados a Cobertura, Soporte y Rastreo | Escaneo de botones sin acción |
| D-019 | M | Rastreo aceptaba guías con HTML y **sin límite** (cientos de llamadas por URL) | Formato válido y máximo 10 con aviso (`guias.ts`) | 5 unitarias + 2 E2E |
| D-020 | M | Hero: "Confirmar" sin validar; "SobrePaq" sin campos | Validación y campos mostrados | E2E |
| D-021 | B | Cobertura sin mensaje cuando no hay resultados; filtros con el mismo nombre accesible | Estado vacío y etiquetas únicas | Manual |
| D-022 | B | Cantidad de paquetes sin tope (3 pantallas) | Máximo 99 | E2E |
| D-023 | M | Importes sin separador de miles ("$9238.50") | `formatMXN` → "$9,238.50" | E2E + 2 unitarias |
| D-024 | M | La tarjeta de rastreo no mostraba el **último estado**; en una guía entregada el último paso aparecía con contorno ("en curso"); sin "Reintentar" ante error | Línea "Último estado", paso final completo, línea de tiempo con `aria-current` y texto accesible, botón Reintentar | Verificación visual en modo real + E2E |
| D-025 | B | Dirección mostrada con coma inicial cuando faltaba la calle | Se unen solo las partes presentes | Manual |
| D-026 | M | La demo solo conocía 4 CP: fallaba con cualquier otro | 16 CP de ciudades principales | E2E |
| D-027 | A | **Datos locales corruptos** o con forma equivocada tumbaban `/perfil` (`a.map is not a function`) | Validación Zod de todo lo leído de localStorage (`almacen-schemas.ts`) | 4 formas de corrupción × 4 navegadores |
| D-028 | A | Borrador corrupto **o almacenamiento bloqueado por el navegador** tumbaban `/cotizar` por completo | Lectura/escritura segura con try/catch y validación | E2E con `localStorage` bloqueado |
| D-029 | M | `/privacidad`, `/terminos`, `/trabaja-en-inbox` daban 404 | Páginas provisionales "Próximamente" | Prueba de enlaces |
| D-030 | B | Meses en inglés de SIBOX no se reconocían en fechas | Soportados | Unitaria |
| D-031 | B | Alias de envío guardado sin tope de longitud al leerse | Se recorta a 60 | Unitaria |

### 5.3 Responsividad

| ID | Sev. | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| D-040 | A | `/cotizar` a 1024 px: desborde de 191 px; Confirmar +257 px; Tarjeta +22 px | La tarjeta de resumen se apila hasta 1400 px | E2E 7 anchos × 4 navegadores |
| D-041 | M | `/somos` a 1024 px: +90 px | Imagen proporcional | Idem |
| D-042 | A | **Navbar con sesión iniciada a 1024 px** desbordaba todas las páginas privadas | Nombre truncado, espacios ajustados (probado con 50 caracteres) | Auditor propio |
| D-043 | A | `/cotizar` a 320 px: +42 px (campo de CP y medidas) | Campos flexibles | E2E (lo detectó la suite) |
| D-044 | M | `/cotizar` a 1280 px en navegadores **con barra de desplazamiento** (Firefox): +33 px que Chrome sin ventana ocultaba | Quiebre a 1400 px | E2E Firefox |
| D-045 | B | ~20 zonas táctiles < 24 px (campos del Hero, flechas, "Quitar", lupas, enlaces) | Áreas ampliadas | Auditor móvil |

### 5.4 Accesibilidad

| ID | Sev. | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| D-050 | M | ~10 campos por página sin nombre accesible; pines del mapa sin nombre | Etiquetas únicas y descriptivas | axe: 0 |
| D-051 | A | **Modales** sin foco atrapado ni devuelto; se podía tabular detrás | Hook `use-modal-a11y` (foco, Escape, bloqueo de scroll) | Teclado real + E2E |
| D-052 | M | Sin indicador de foco visible (67 `outline-none`) | `:focus-visible` global | Manual |
| D-053 | M | **Ningún campo declaraba `autocomplete`** (WCAG 1.3.5) | Tokens estándar en datos propios; `off` en datos de terceros (destinatario, contactos) | E2E |
| D-054 | B | El carrusel del Hero cambiaba solo aunque se pidiera "reducir movimiento" | Respeta `prefers-reduced-motion` | E2E |
| D-055 | B | Carrusel de servicios inaccesible por teclado; menú móvil sin `aria-expanded`; dos `<main>` anidados; sin `h1` en dos páginas | Corregidos | axe: 0 |
| D-056 | B | Enlaces del navbar al 80% de opacidad (contraste 2.4:1) y gris claro en textos pequeños | A contraste completo / gris oscuro | axe |

### 5.5 Rendimiento, SEO y contenido

| ID | Sev. | Hallazgo | Corrección | Verificación |
|---|---|---|---|---|
| D-060 | M | Imágenes de 4–9 MB | WebP de ~150 KB | Lighthouse |
| D-061 | A | Desplazamiento de diseño (CLS) **0.39** en `/cotizar` | Altura reservada | CLS 0 |
| D-062 | M | El mapa (Leaflet + teselas) cargaba aunque estuviera fuera de pantalla | Carga al acercarse (`LazyMount`) | Home 83→89 |
| D-063 | M | Misma descripción en todas las páginas; sin Open Graph/Twitter, canonical, `theme-color`, datos estructurados | `paginaMeta()` por página + Organization JSON-LD | 2 E2E |
| D-064 | M | `/rastreo` sin JavaScript quedaba **vacío** (sin `h1`) | Contenido estático de respaldo | E2E sin JavaScript |
| D-065 | M | Si se olvida `SITE_URL`, canonical/Open Graph/sitemap apuntarían a `localhost` | Respaldo con variables de Vercel | Revisión + build |
| D-066 | B | 404 y `/cuenta/*` sin título propio; sin `robots`/`sitemap`/páginas de error | Agregados | E2E |

### 5.6 Defectos de las propias pruebas (para transparencia)

Varios fallos intermedios de la suite fueron del código de prueba y se corrigieron en las pruebas: `maxlength` recortando el texto antes de filtrarlo, reloj simulado que congelaba temporizadores, carrera al abrir el modal, menú de hamburguesa en móvil, precargas canceladas que WebKit reporta como excepción, y una carrera de hidratación en WebKit bajo carga (ver D-070).

| ID | Sev. | Hallazgo | Estado |
|---|---|---|---|
| D-070 | B | Un formulario enviado **antes** de que React se hidrate se enviaría de forma nativa (WebKit, bajo carga). Riesgo real mínimo (milisegundos tras cargar) | Test estabilizado; riesgo aceptado |

---

## 6. Verificación del modo "real" de la interfaz

Se compiló un clon con `NEXT_PUBLIC_SIBOX_REAL=1` conectado a SIBOX (apitest) para ver la interfaz con datos reales:
- Las 3 guías de prueba entregadas por el cliente y la del PDF se muestran correctamente; la inexistente da "No encontramos información".
- Desaparece el aviso de "datos de demostración"; fechas en DD/MM/AAAA; historial de 10 eventos con oficinas; **sin datos personales** (verificado en la pantalla).
- **Con la API caída:** mensaje claro por guía ("No pudimos consultar tu envío… Intenta de nuevo") — distinto de "no encontrada" — ahora con botón **Reintentar**.
- Limitación: las 4 guías están ENTREGADAS; no se pudo validar la línea de tiempo con estados intermedios reales (B7).

---

## 7. Riesgos y defectos abiertos (no corregibles hoy)

| ID | Sev. | Descripción | Dueño |
|---|---|---|---|
| R-01 | A | **Sin límite de peticiones**: nunca devuelve 429; cualquiera puede generar cientos de llamadas por segundo hacia SIBOX | Requiere Upstash Redis o similar |
| R-02 | A | **Cloudflare bloquea a Node** (B1): el rastreo real no funciona desde Vercel | Cliente / sistemas |
| R-03 | A | Formularios de Soporte y chat **no envían nada** (B8) | Producto |
| R-04 | M | **Contraste de marca**: blanco sobre `#ff6015` = 3.02:1 (AA exige 4.5 en texto pequeño); 45 elementos. Tono equivalente que cumple: `#CC4D11` | Aprobación de marca |
| R-05 | M | Contenido provisional (B10): FAQ idéntico en las 4 preguntas, redes sociales genéricas, correos `soporte@`/`info@`, aviso de privacidad y términos | Cliente |
| R-06 | M | Voz de marca inconsistente: ~26 imperativos formales ("Ingrese", "Rastree") frente a ~24 informales ("Ingresa", "Escribe") | Decisión de contenido |
| R-07 | M | Teselas públicas de OpenStreetMap no permiten tráfico comercial intenso (B11); solo 32 de 71 oficinas reales tienen coordenadas | Presupuesto |
| R-08 | B | CSP sin nonce; sin Sentry ni analítica; "Recordarme" del login y el interruptor US/MX del Hero son decorativos; el seguro (+$200) está fijo en el código | Varios |

Brechas funcionales frente al plan (sección 4): etiqueta PDF, catálogo SAT, historial de recolecciones, sucursal más cercana, sesión expirada, flujo de facturación por guía.

---

## 8. Bloqueos externos

B1 Cloudflare · B2 registro/login y `K_Cliente` (SIBOX ignora `K_ClienteSIBOX` y responde según el token) · B3 `ObtieneDetalleCostos` (procedimiento almacenado faltante) · B4 endpoints de pago · B5 IP fija (VPS) · B6 URL/credenciales de producción · B7 guías de prueba en tránsito · B8 destino de los formularios de contacto · B9 modo demostración · B10 contenido del cliente · B11 proveedor de teselas. Detalle en `INDICE_MAESTRO.md` §5.

---

## 9. Recomendaciones (en orden)

1. **Enviar el mensaje al cliente** (`docs/mensajes/2026-10-12-cliente.md`): B1, B2, B3, B7 y B10.
2. **Desplegar a Vercel en modo demostración** y probar con personas reales; definir `SITE_URL`; dejar `NEXT_PUBLIC_SIBOX_REAL` sin definir.
3. Implementar **límite de peticiones** (R-01) antes de abrir cualquier ruta pública que llame a SIBOX.
4. Decidir R-04 (contraste), R-06 (voz de marca) y B11 (teselas).
5. Activar el servidor Dev Mode de Figma y hacer una pasada de **fidelidad visual** (hoy no verificada).
6. Cuando se libere B1: conectar rastreo real y luego catálogos (esquemas ya listos en `schemas/catalogos.ts`).
7. Antes de producción: Sentry, CSP con nonce, prueba con lector de pantalla humano y dispositivos reales.

---

## 10. Cómo reproducir las verificaciones

```bash
npm run lint && npx tsc --noEmit      # análisis estático
npm test                                # 155 pruebas unitarias
npm run build && npm run test:e2e       # 360 casos en 4 navegadores
```

Documentos relacionados: `INDICE_MAESTRO.md` (estado vivo), `docs/QA_MODULO_POR_MODULO.md` (detalle técnico por módulo), `docs/REPORTE_SESION_2026-10-12.md` (bitácora de la jornada).
