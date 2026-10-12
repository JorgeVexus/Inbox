# Reporte detallado de la jornada — 12 de octubre de 2026

Proyecto: rediseño web de Inbox (Next.js 16 + TypeScript + Tailwind v4), repo `JorgeVexus/Inbox`, rama `main`.
Este documento resume **todo lo realizado hoy**, por qué se hizo, qué se encontró, qué se corrigió y qué queda pendiente. El estado vivo del proyecto sigue en `INDICE_MAESTRO.md`; el detalle técnico de la QA módulo por módulo, en `docs/QA_MODULO_POR_MODULO.md`.

---

## 1. Resumen ejecutivo

| Tema | Resultado |
|---|---|
| Objetivo del día | Retomar el proyecto tras 2 semanas de pausa, auditar a fondo todo lo construido y dejarlo listo para desplegar a Vercel. |
| Commits subidos a `main` | `a7ef70d` (índice maestro + BFF endurecido), `b777ae0` (auditoría pre-Vercel), `ff1f5a5` (QA módulo por módulo). El trabajo posterior se commiteó al cierre (sección 9). |
| Pruebas unitarias | De 84 a **152** (Vitest), todas pasando. |
| Pruebas de extremo a extremo | **Nueva suite Playwright** (Chrome, Firefox, WebKit/Safari, móvil): **248 pasaron, 0 fallos**. Ver secciones 8 y 11. |
| Verificación | tsc, ESLint, build de producción y clon limpio desde GitHub (`npm ci` + build + tests) sin errores. |
| Vulnerabilidades | 0 en dependencias de producción (las 8 restantes son solo de las herramientas de prueba). Next.js subido a 16.4.0 (parche de seguridad). |
| Rendimiento (Lighthouse móvil) | `/cotizar` 71 → 95, Home 83 → 89, Cobertura 87 → 91; accesibilidad y SEO 96–100. |
| Bloqueo principal | **B1**: Cloudflare sigue bloqueando las llamadas desde Node a SIBOX. Mensaje al cliente listo, pendiente de enviar. |
| ¿Listo para Vercel? | Sí **en modo demostración** (datos y login de ejemplo). Para producción real faltan los bloqueos B1–B11 de la sección 10. |

---

## 2. Documentación y organización del proyecto

1. **`INDICE_MAESTRO.md`** (nuevo, raíz del repo): punto de entrada y estado vivo del proyecto. Incluye la **regla de oro** de actualizarlo antes de cerrar cualquier sesión, para poder retomar en otro entorno o con otro agente. Secciones: resumen en 60 segundos, avance vs. plan de 8 semanas, mapa de módulos, matriz de endpoints SIBOX probados, bloqueos activos, qué sigue, decisiones tomadas, reglas innegociables, cómo retomar en otro entorno, mapa de documentos y bitácora de sesiones.
2. **`CLAUDE.md`**: ahora importa el índice (`@INDICE_MAESTRO.md`) y contiene la regla de sesión; se agregaron hallazgos de las pruebas reales a la API.
3. **`README.md`** reescrito apuntando al índice.
4. **`docs/mensajes/2026-10-12-cliente.md`**: mensaje de WhatsApp listo para el cliente (regla de Cloudflare, procedimiento almacenado faltante, registro/login y `K_Cliente`, compra como invitado, catálogos, más guías de prueba, URL/credenciales de producción). Lo envía el usuario.
5. **`docs/QA_MODULO_POR_MODULO.md`**: resultados de la revisión por 13 módulos.
6. **Este reporte.**

---

## 3. Auditoría de seguridad y blindaje del BFF

La capa BFF (Route Handlers `/api/rastreo` y `/api/rastreo/detalle`) es obligatoria porque SIBOX no tiene CORS. Hallazgos y correcciones:

| Hallazgo | Corrección |
|---|---|
| Next.js con vulnerabilidad grave | Actualizado a **16.4.0** (y `eslint-config-next`). |
| Sin headers de seguridad | `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS y CSP básica (`frame-ancestors 'none'`, `base-uri`, `form-action`, `object-src`); se quitó `X-Powered-By`. |
| Cada petición reintentaba el Login si fallaba (riesgo de martillar SIBOX/bloquear la cuenta de servicio) | **Single-flight** (peticiones simultáneas comparten un solo Login) + enfriamiento de 30 s tras un fallo. Verificado: 15 peticiones simultáneas con servidor frío → 1 solo Login. |
| Cuerpo de petición sin límite | Máx. 10 000 caracteres (413). |
| Guía sin validar | Regex `^[A-Za-z0-9-]{1,40}$` (defensa contra inyección; SIBOX usa SQL Server). |
| Una API lenta dejaba colgado al visitante | Timeout de 20 s → 504. |
| **Fuga de datos personales**: el rastreo es público por número de guía, pero SIBOX devolvía nombres, quién recibió, **firma en base64**, coordenadas y observaciones internas con correos de clientes | El BFF anula todo eso en el servidor. Verificado contra 4 guías reales: el JSON crudo trae datos, el BFF entrega siempre `null`. |
| Un error SQL interno de SIBOX llegaba al navegador | Mensajes genéricos (502/503); el detalle solo va a los logs. Pruebas confirman que no aparece "Cloudflare", "SIBOX", "stack" ni rutas. |
| `DomiciliosRecoleccionesCliente` toma `K_ClienteSIBOX` como parámetro (riesgo de IDOR) | Regla documentada: el BFF debe tomarlo de la sesión del servidor. Se probó además que SIBOX **ignora** ese parámetro y responde según el token. |
| Credenciales | Verificado que la contraseña de servicio no aparece en ningún archivo versionado, logs ni en el JavaScript enviado al navegador. |

Pruebas contra la API real: como Cloudflare bloquea a Node, se armó un **puente temporal con `curl`** (solo para QA, ya apagado) para validar el BFF con datos reales: 4 guías reales (200), inexistente (404), entradas hostiles (400), JSON roto (400), cuerpo de 20 KB (413), métodos incorrectos (405).

---

## 4. Contrato real de SIBOX frente a nuestro código

Se sondearon los endpoints de lectura y se comparó con los tipos del proyecto. Se creó `src/lib/api/schemas/catalogos.ts` con el contrato verificado (aún **no conectado** a la interfaz) y 25 pruebas, validado contra las **71 oficinas reales**.

Diferencias descubiertas:
- Ids como texto; `B_Ocurre`/`B_Frontera` como "SI"/"NO"; `ListadoOficinas` no trae `D_Estado`; coordenadas como texto y **nulas en 39 de 71** (el mapa mostrará solo 32 pines).
- `BusquedaCP` y `ObtenerHorariosPorCP` **no devuelven vacío con un CP inexistente**: devuelven filas de otros CP o el catálogo completo. El esquema lo trata como "no encontrado".
- Nombres de colonia con tabuladores y una fila falsa "Especifique Otra Colonia".
- `ObtenerHorariosPorCP` usa el parámetro `Codigo_Postal` (no `CP`).
- `Cobertura` devuelve 553 filas con otro formato; hay que decidir qué fuente alimenta el mapa.
- `ObtieneDetalleCostos` sigue fallando en pruebas (falta el procedimiento almacenado `GP_Valida_OrigenCotizacion`) — bloqueo B3.
- Brecha de diseño: el cotizador usa CP y ciudad como texto libre; para el cálculo real hay que resolver CP → `K_Estado/K_Ciudad/K_Colonia` con `BusquedaCP`.

---

## 5. Bugs funcionales corregidos

**Lógica y datos**
- **Fecha de recolección** se adelantaba un día después de las 6 pm (usaba UTC). Ahora usa hora local; hay pruebas con zona horaria de Ciudad de México.
- **Recolección** permitía agendar ventanas de **hoy que ya pasaron** e ignoraba la hora límite de captura.
- **Horarios de sucursales**: el lector solo entendía "HH:MM - HH:MM"; **12 de 42 textos reales** (y 28 oficinas sin horario) aparecían como "Cerrado" sin saberlo. Se reescribió (`horario.ts`): días de la semana, "a"/"-", am/pm, turnos partidos, "CERRADO LOS JUEVES", hora de Ciudad de México y un tercer estado "Horario no disponible". 42/42 textos reales interpretados; 10 pruebas.
- **Fechas de entrega fijas** ("Sáb, 02 de agosto") → calculadas desde hoy.
- Estado "LISTO PARA ENTREGAR" se mostraba como *Entregado* (tabla de estatus por valor exacto, con pruebas).
- Dirección con coma inicial cuando faltaba la calle.

**Validaciones (antes casi inexistentes)**
- Cotizador: CP de 5 dígitos solo numérico; peso/medidas > 0 y ≤ 1000; cantidad ≤ 99.
- Confirmar: teléfono de 10 dígitos, correo válido, con mensaje que explica por qué el botón está apagado.
- Pago: número de tarjeta con **Luhn**, vencimiento válido y no vencido, CVV (4 dígitos en Amex).
- Facturación: formato de **RFC**, CP, teléfono, correo, archivo ≤ 5 MB.
- Contactos y direcciones: teléfono de 10 dígitos.
- Hero: "Confirmar" exige peso y medidas; "SobrePaq" ahora muestra sus campos.
- Soporte y chat: correo válido, longitudes máximas.

**Estados "colgados" y doble envío**
- Si fallaba la red, el cotizador, el pago, la facturación, la recolección, contactos, direcciones, soporte y chat se quedaban en "Generando…/Procesando…" para siempre → ahora muestran un error.
- Los botones "apagados" solo lo parecían (`pointer-events-none`): se activaban con Enter y permitían **doble envío** → ahora están realmente deshabilitados.

**Controles muertos conectados**: lupas "Buscar sucursal" (Hero y cotizador → `/cobertura`), "Artículos prohibidos" (→ `/soporte`), lupa del menú (→ `/rastreo`). Se detectó también que "Recordarme" del login y el interruptor US/MX del Hero son decorativos (pendiente de definir).

**Rastreo**: aceptaba guías con código HTML y **sin límite de cantidad** (una URL con cientos de guías = cientos de llamadas a SIBOX). Ahora valida formato y limita a **10** (`src/lib/guias.ts`, 5 pruebas).

**Cobertura**: mensaje cuando no hay resultados, filtros con nombres únicos, interruptores con `aria-pressed`.

**Robustez del almacenamiento local (hallazgo de la 3.ª ronda)**
- Datos con forma equivocada en `localStorage` tumbaban `/perfil` (`a.map is not a function`).
- Un borrador corrupto tumbaba `/cotizar`.
- Con el almacenamiento **bloqueado por el navegador** (modo privado / datos del sitio bloqueados, común en Safari) `/cotizar` fallaba por completo.
- Corrección: `src/lib/almacen-schemas.ts` valida con Zod todo lo que se lee (lo inválido se descarta), acceso seguro con `try/catch`, 5 pruebas.

---

## 6. Responsividad, accesibilidad y rendimiento

**Responsividad** (barrido de 320 a 1920 px en todas las páginas, incluidas las privadas y los modales):
- `/cotizar` a 1024 px: desborde de 191 px; pasos Confirmar y Tarjeta +257 / +22 px → la tarjeta de resumen ahora se apila hasta 1400 px.
- `/cotizar` a **320 px**: desborde de 42 px (campo de CP y fila de medidas) → corregido (detectado por la suite E2E).
- `/somos` a 1024 px (+90 px por la imagen de la camioneta).
- **Navbar con sesión iniciada a 1024 px**: el saludo + "Cerrar sesión" no cabían y desbordaban todas las páginas privadas; ahora el nombre se trunca.
- Zonas táctiles < 24 px en múltiples controles (campos del Hero, flechas de cantidad, "Quitar guía", lupas, enlaces del pie, del login, migas de pan, "Editar/Eliminar" de perfil).

**Accesibilidad**
- Todos los campos con nombre accesible (antes ~10 por página sin etiqueta); pines del mapa con nombre; un solo `<main>` por página; `<h1>` en todas; títulos por página.
- **Modales** (login, facturación, dirección, contacto): foco atrapado, foco inicial, foco devuelto al cerrar, scroll de fondo bloqueado, Escape — hook compartido `use-modal-a11y.ts`, verificado con teclado real.
- Indicador de foco global (`:focus-visible`); antes casi todo tenía `outline-none`.
- Carrusel de servicios navegable por teclado; menú móvil con `aria-expanded`.
- Contraste: texto pequeño en gris claro (2.3:1) → gris oscuro (4.8:1); enlaces del navbar a contraste completo.

**Rendimiento / SEO**
- Imágenes de 4–9 MB → WebP de ~150 KB (originales guardados fuera del repo, en `../originales-imagenes`).
- Desplazamiento de diseño (CLS) de `/cotizar`: 0.39 → 0.
- Mapa de Leaflet carga solo al acercarse a esa sección.
- `robots.txt` (oculta API y rutas privadas), `sitemap.xml` (requiere `SITE_URL` en Vercel), `noindex` en rutas privadas.
- Páginas 404 y de error propias en español.

**Contenido y enlaces rotos**
- `/privacidad`, `/terminos` y `/trabaja-en-inbox` daban 404 desde el pie → ahora existen como "Próximamente" (sin texto legal inventado).
- Catálogo de CP de la demo ampliado de 4 a 16 para que la demo no falle con el primer CP que escriba quien la pruebe.

---

## 7. Métodos de verificación usados

1. Análisis estático: `tsc`, ESLint.
2. Pruebas unitarias (Vitest): 152.
3. Build de producción local y **clon limpio desde GitHub** (`npm ci`, tests, build, arranque, 13 rutas, BFF sin variables de entorno → 500 genérico).
4. Modo desarrollo: sin advertencias de React/hidratación.
5. Navegador integrado con **auditor automático propio** (desbordes, elementos fuera de pantalla, imágenes rotas, controles sin nombre, ids duplicados, encabezados, tamaño táctil) en 11 anchos de pantalla.
6. Pruebas funcionales manuales con datos válidos, vacíos, hostiles (XSS, SQL, traversal) y teclado real.
7. Lighthouse móvil (Chrome headless) en Home, Cotizar y Cobertura.
8. `npm audit`.
9. **Suite Playwright** de extremo a extremo en Chrome, Firefox, WebKit y móvil (sección 8).
10. Prueba de carga del BFF (preparada; ver sección 8).

---

## 8. Suite de extremo a extremo (Playwright)

Nueva carpeta `e2e/` y `playwright.config.ts`. Se corre con `npm run build && npm run test:e2e`.

Cubre: carga y consola limpia de las 11 páginas, 404, ningún enlace interno roto, **sin desborde horizontal a 320/375/768/1024/1280/1440/1920 px**, flujo completo de cotización y pago con todas sus validaciones, facturación, rastreo (duplicadas, formato inválido, máximo 10, XSS por URL), chat, login (vacío/incorrecto/hostil), foco atrapado y devuelto, contactos, direcciones, alias de envío, recolección, cierre de sesión, **datos locales corruptos**, almacenamiento bloqueado, sin red, doble clic en pagar, **zona horaria** (lunes 10 pm / 9 am en CDMX y visitante en Nueva Zelanda), headers de seguridad, iframes, API con entradas hostiles, ausencia de credenciales en el JavaScript enviado, cero cookies, `robots`/`sitemap`/`noindex`.

**Resultados**: ver sección 11.

---

## 9. Estado del código

Subido a `main`: `a7ef70d`, `b777ae0`, `ff1f5a5` y un cuarto commit de cierre con la suite `e2e/` (`playwright.config.ts`, `@playwright/test`, scripts `test:e2e`), `src/lib/almacen-schemas.ts` con sus pruebas, las correcciones de 320 y 1280 px, y este reporte. Para repetir la suite: `npm run build && npm run test:e2e`.

---

## 10. Bloqueos y decisiones abiertas

| # | Bloqueo | Quién |
|---|---|---|
| B1 | Cloudflare reta a Node aunque la IP esté en el whitelist (huella TLS). Hace falta regla WAF *Skip*/IP Access *Allow* en Cloudflare. | Cliente / sistemas |
| B2 | Registro y login de usuario final, y su `K_Cliente` propio. SIBOX responde según el token, no según el cliente pedido: "Mis direcciones" por persona requiere login por cliente. | Backend |
| B3 | `ObtieneDetalleCostos` falla (procedimiento almacenado faltante): cotizador real bloqueado. | Backend |
| B4 | Endpoints de pago, webhooks y sandbox. | Backend |
| B5 | IP fija para producción (Vercel no la da; plan: proxy en VPS de ~$5–8/mes). | Decisión del jefe |
| B6 | URL y credenciales de producción; confirmar si tiene la misma protección. | Cliente |
| B7 | Más guías de prueba en tránsito. | Cliente |
| B8 | Los formularios de Soporte y del chat **no envían nada**: solo simulan éxito. Decidir destino (correo, CRM, webhook o chat de terceros). | Producto |
| B9 | Modo demo en producción: login de ejemplo, datos y pagos simulados. | Depende de B2–B4 |
| B10 | Contenido del cliente: respuestas reales del FAQ (las 4 muestran el mismo texto), redes sociales reales, correo oficial de soporte (el sitio mezcla `soporte@` e `info@`), aviso de privacidad y términos (obligatorios en México), bolsa de trabajo, aclarar el interruptor US/MX. | Cliente |
| B11 | Teselas del mapa: OpenStreetMap público no permite tráfico comercial intenso; elegir proveedor. | Jefe / presupuesto |

**Otros pendientes**: contraste de la marca (blanco sobre `#ff6015` = 3.02:1; un tono que cumple AA y se parece es `#CC4D11`, requiere aprobación de marca), límite de peticiones propio del BFF (necesita almacén compartido como Upstash Redis), CSP completa con nonce, conectar al BFF los endpoints de lectura ya verificados (esquemas listos), mostrar firma/quién recibió solo con endpoint autenticado.

---

## 11. Resultados de la suite E2E y de la prueba de carga

### 11.1 Suite Playwright (corrida final, 2 procesos, 1 reintento)

**248 pasaron · 1 inestable (pasó al reintentar) · 0 fallos · 3 omitidas a propósito.** Navegadores: Chrome, Firefox, WebKit (Safari) y Chrome móvil (Pixel 7).

Las omitidas son comprobaciones de tabulación que Safari no hace por defecto y una que no aplica en móvil (el botón de login vive en un menú que se cierra al pulsarlo). La inestable fue una prueba de WebKit que superó el tiempo límite una vez bajo carga.

**Qué encontró la suite que las pruebas manuales no habían visto** (todo corregido):

| Hallazgo | Detalle |
|---|---|
| `/cotizar` a 320 px | Desborde de 42 px (campo de CP y fila de medidas). |
| `/cotizar` a 1280 px en navegadores con barra de desplazamiento (Firefox) | Desborde de 33 px que Chrome sin cabeza oculta; el quiebre de Origen/Destino pasó a 1400 px. |
| Datos locales con forma equivocada | Tumbaban `/perfil` (`a.map is not a function`). |
| Borrador de cotización corrupto | Tumbaba `/cotizar`. |
| Almacenamiento bloqueado por el navegador | `/cotizar` fallaba por completo. |

Los demás fallos intermedios fueron del propio código de prueba (límite `maxlength` de los campos, reloj simulado que congelaba temporizadores, condiciones de carrera al abrir el modal, menú de hamburguesa en móvil, ruido de precargas canceladas en WebKit) y se corrigieron en las pruebas, no en la aplicación.

### 11.2 Prueba de carga del BFF (servidor de producción local)

| Prueba | Resultado |
|---|---|
| `POST /api/rastreo`, 1 000 peticiones, 100 simultáneas | 649 peticiones/s; p50 145 ms, p95 215 ms, p99 285 ms; 0 errores de red. |
| `POST /api/rastreo`, 3 000 peticiones, 300 simultáneas | 797 peticiones/s; p50 335 ms, p95 533 ms, p99 661 ms; sin caídas ni excepciones en el log. |
| Home, 500 peticiones, 50 simultáneas | 488 peticiones/s; p50 80 ms, p95 225 ms; todas 200. |

Estados de la API (la mitad de las peticiones llevaba una guía inválida a propósito): 400 para las inválidas y 503 controlado para las válidas (Cloudflare bloquea a Node, B1). El enfriamiento del Login evitó martillar a SIBOX.

**Conclusión de seguridad**: el servidor es estable bajo carga, pero **no existe ningún límite de peticiones** (nunca respondió 429). Es el pendiente que sigue abierto antes de producción: sin él, cualquier visitante puede generar cientos de llamadas por segundo hacia SIBOX.

---

## 12. Próximos pasos recomendados

1. Revisar y commitear el trabajo pendiente (sección 9).
2. Enviar el mensaje al cliente (B1, B2, B3, B7, B10).
3. Crear el proyecto en Vercel (cuenta de la persona dueña) y desplegar **en modo demostración**; definir `SITE_URL`; dejar `NEXT_PUBLIC_SIBOX_REAL` sin definir.
4. Decidir B5 (VPS con IP fija) y B11 (teselas del mapa).
5. Cuando se libere B1: conectar rastreo real, luego catálogos (oficinas, CP, horarios) con las rutas `/api/*` y límite de peticiones.
