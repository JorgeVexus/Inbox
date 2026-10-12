# ÍNDICE MAESTRO — Inbox (rediseño web)

> **Este es el punto de entrada de TODO el proyecto.** Si llegas en frío (otra
> sesión, otro agente, otra persona, otra computadora), lee este archivo primero
> y completo. Resume dónde estamos, qué está bloqueado, qué sigue y dónde vive
> cada detalle. Los documentos largos (`CLAUDE.md`, `NOTAS_PROYECTO.md`) son el
> detalle; este es el mapa.

| | |
|---|---|
| **Última actualización** | 2026-10-12 (sesión 2) |
| **Estado del código** | `main` en GitHub (`JorgeVexus/Inbox`), build/tsc/eslint limpios, 84 tests pasando |
| **Fase real** | Frontend completo con datos simulados; integración con SIBOX **iniciada** (solo rastreo) y **bloqueada** por Cloudflare |

---

## 0. REGLA DE ORO — actualizar este documento (obligatorio)

**Este archivo debe estar al día en todo momento. Es lo que permite retomar el
trabajo en otra sesión u otro entorno sin perder nada.**

Cada vez que termines una sesión de trabajo, **antes del último commit**, haz
esto (5 minutos, no se negocia):

1. **Fecha** de "Última actualización" (arriba) y número de tests.
2. **§1 En 60 segundos**: reescríbelo si el panorama cambió.
3. **§2 y §3**: cambia el estado de lo que avanzó (`[HECHO]`, `[MOCK]`,
   `[BLOQUEADO]`, `[PENDIENTE]`).
4. **§4 Matriz de endpoints**: si probaste o conectaste un endpoint, anótalo
   con fecha.
5. **§5 Bloqueos**: agrega los nuevos, marca los resueltos (con fecha), no los
   borres en silencio.
6. **§6 Qué sigue**: deja la lista ordenada para que la siguiente sesión sepa
   exactamente por dónde empezar.
7. **§7 Decisiones**: toda decisión nueva (técnica, de negocio, del cliente) va
   con fecha y motivo.
8. **§11 Bitácora**: una línea por sesión, la más reciente arriba.
9. Si cambiaste reglas, estructura o seams: también `CLAUDE.md` (detalle
   técnico) y, si aplica, `NOTAS_PROYECTO.md`.

**Si algo de este documento contradice al código, gana el código: corrige el
documento en el mismo commit.** Un índice desactualizado es peor que no tener
índice. Esta regla también está en `CLAUDE.md` para que cualquier agente de IA
la vea automáticamente.

---

## 1. En 60 segundos

- **Qué es**: rediseño del sitio de **Inbox** (paquetería y envíos, Grupo
  Transpaís) en Next.js 16 + TypeScript + Tailwind v4, desde Figma, conectándolo
  poco a poco a la API **SIBOX**. 62 commits, del 2026-08-11 al 2026-10-12.
- **Pantallas**: las 11 rutas existen y funcionan (Home, cotizar, rastreo, envío,
  somos, cobertura, soporte, perfil, recolección + placeholders de registro y
  recuperar contraseña). **Casi todo corre con datos simulados ("mocks")** que
  tienen la forma exacta de la API real.
- **Lo único conectado a SIBOX de verdad**: **rastreo** (`/rastreo`, "Ver
  detalles" y el chat flotante) vía el BFF propio (`/api/rastreo`,
  `/api/rastreo/detalle`). **Por defecto corre en MODO DEMO** (datos simulados
  + aviso visible) para que el sitio funcione aunque SIBOX no sea alcanzable;
  se activa lo real con `NEXT_PUBLIC_SIBOX_REAL=1` (ver §7 y `.env.example`).
- **Pero ni eso se puede ver funcionando desde la app todavía**: **Cloudflare
  bloquea las llamadas hechas desde Node** (el BFF) aunque la IP ya está en el
  whitelist del cliente. Con `curl` sí pasa. Ver §5, bloqueo B1.
- **Lo que depende del cliente/backend** (§5): regla en Cloudflare, endpoints de
  registro/login de usuario final, un bug de su ambiente de pruebas que rompe el
  cotizador, endpoints de pago, y varias confirmaciones.
- **Lo que NO existe todavía y el plan pide**: despliegue en Vercel con previews
  (el cliente no ha podido ver nada en un link), rate limiting, pruebas E2E,
  etiqueta PDF, agenda de "Contactos", y revisión de accesibilidad/rendimiento.

---

## 2. Dónde estamos vs. el plan de 8 semanas

El plan original (`../Documentacion/Plan de Desarrollo - Rediseño Web Inbox.docx`,
inicio 2026-08-04) asumía una demo semanal en un link de Vercel. Estado real:

| Fase del plan | Estado | Detalle |
|---|---|---|
| **0 — Preparación técnica** | `[PARCIAL]` | Repo, Next.js, TS, lint, Vitest, tokens de diseño, `.env.example`, cliente SIBOX con timeout y reintento de token: hechos. **Faltan**: proyecto Vercel con despliegue automático y previews protegidos, reglas WAF/rate limit, secretos por ambiente. |
| **1 — Público y rastreo** | `[PARCIAL]` | Navbar, footer, Home, somos, cobertura, soporte: hechos. `wsRastreo` + `RastreoDetalle` conectados en código y probados contra la API real (guías de prueba) — **bloqueado por Cloudflare** para verse desde la app. **Falta la primera demo en Vercel.** |
| **2 — Cotizador** | `[MOCK]` + `[BLOQUEADO]` | UI de 4 pasos completa con mock. `BusquedaCP`, `TipoEnvio`, `TipoEntrega` probados reales (sin conectar). **`ObtieneDetalleCostos` falla en el ambiente de pruebas** (falta un stored procedure en su BD, B3). |
| **3 — Checkout, guía, etiqueta** | `[MOCK]` | Formularios remitente/destinatario/SAT hechos, guía y pago simulados (`procesarPago` **nunca** se conecta sin decisión explícita). **No existe** la etiqueta PDF (`Genera_Etiqueta`). Pagos bloqueados por backend. |
| **4 — Recolecciones y portal** | `[MOCK]` + `[BLOQUEADO]` | `/recoleccion`, `/perfil` (direcciones, facturación), `/envio` hechos con mock. Bloquea: registro/login de usuario final y su `K_Cliente` (B2), historial por cuenta, facturación. |
| **5 — Producción** | `[PENDIENTE]` | Sin E2E, rate limiting, monitoreo, analítica ni URLs/credenciales de producción. |

---

## 3. Mapa de módulos (pantalla → de dónde salen los datos)

`mock` = datos simulados en `src/lib/mock/*` detrás de un "seam" (ver §8).

| Ruta | Qué es | Datos hoy | Seam / archivo clave | Endpoint SIBOX futuro |
|---|---|---|---|---|
| `/` | Home: hero (rastreo + cotización 3 pasos), servicios, mapa de cobertura, CTA de sucursales, About, FAQ | mock (sucursales); rastreo **real** | `lib/sucursales.ts`, `components/home/*` | `ListadoOficinas`/`Cobertura` |
| `/cotizar` | Wizard 4 pasos: cotizar → costo → confirmar → pago (invitado permitido; con sesión, el paso *Confirmar* ofrece elegir de "Mis contactos") | mock | `lib/cotizacion.ts`, `components/cotizar/*` | `ObtieneDetalleCostos`, `wsGeneracionGuiaCliente`, pagos (pendiente) |
| `/rastreo` | Rastreo de varias guías + historial | **REAL vía BFF** | `lib/rastreo.ts`, `app/api/rastreo/*` | `wsRastreo`, `RastreoDetalle` |
| `/envio` | "Mis envíos" (protegida por login demo) | mock | `lib/envios.ts` | no hay endpoint documentado |
| `/perfil` | Cuenta, direcciones guardadas, **contactos**, datos de facturación (protegida) | mock + `localStorage` | `lib/domicilios.ts`, `lib/contactos.ts`, `lib/facturacion.ts` | `DomiciliosRecoleccionesCliente` (solo lectura documentada); contactos: sin endpoint (preguntado) |
| `/recoleccion` | Agendar recolección (protegida) | mock | `lib/recoleccion.ts` | `ObtenerHorariosPorCP`, `wsGeneracionRecoleccion` |
| `/cobertura` | Mapa Leaflet + panel de sucursal + "Estamos donde tú estás" | mock | `components/home/cobertura*.tsx` | `ListadoOficinas` |
| `/somos`, `/soporte` | Páginas informativas; soporte tiene formulario de contacto (stub) | estático / stub | `lib/soporte.ts` | no hay endpoint de chat/ticket |
| `/cuenta/crear`, `/cuenta/recuperar` | Placeholders "Próximamente" | — | `components/cuenta/proximamente.tsx` | registro/recuperación (sin endpoints) |
| Global | Navbar, footer, chat flotante (3 pestañas), modal de login (sesión **demo** en memoria) | mixto | `components/layout`, `ui/chat-widget.tsx`, `auth/*` | `Login` es la cuenta de **servicio**, no el login del usuario |

---

## 4. API SIBOX: matriz de endpoints (probada contra `apitest.inbox.com.mx`)

Base de pruebas: `https://apitest.inbox.com.mx` · Producción: `https://api.inbox.com.mx`
(sin acceso ni credenciales todavía). Sobre universal de respuesta:
`{"resp":{"result":0|1,"data":...}}` (excepción: el token de `Login` viene en
`resp.token`, hermano de `data`). Las pruebas se hicieron con `curl` (Node está
bloqueado, B1).

| Endpoint | Probado real | Conectado al BFF | Resultado / notas |
|---|---|---|---|
| `Login` | 2026-10-02 | **sí** (`sibox-client.ts`) | OK. Devuelve token + datos de la cuenta de servicio (`K_Cliente 63105`, "PAGINA WEB"). |
| `wsRastreo` | 2026-10-12 | **sí** | OK. Estatus reales y `F_Promesa_Entrega` poblado. Devuelve datos personales → el BFF los anula (§7). |
| `RastreoDetalle` | 2026-10-12 | **sí** | OK. `Observaciones` trae correos de clientes → el BFF las anula. |
| `ObtenerHorariosPorCP` | 2026-10-02 | no | OK (CP 64060 → oficina 721). |
| `TipoEnvio` | 2026-10-02 | no | OK: 1 SOBRE, 2 PAQUETE, 3 SOBREPAQ. |
| `TipoEntrega` | 2026-10-12 | no | OK (2 tipos). |
| `ListadoOficinas` | 2026-10-12 | no | OK, 71 oficinas. |
| `Cobertura` | 2026-10-12 | no | OK, 69 registros para estado 28. |
| `BusquedaCP` | 2026-10-12 | no | OK, 24 colonias para CP 64349. |
| `DomiciliosRecoleccionesCliente` | 2026-10-12 | no | OK con `K_ClienteSIBOX` 63105. **Ojo**: recibe el número de cliente como parámetro → el BFF **debe** verificar que pertenece al usuario autenticado (si no, cualquiera vería domicilios ajenos). |
| `ObtieneDetalleCostos` | 2026-10-12 | no | **FALLA en pruebas**: `Error interno: Could not find stored procedure 'GP_Valida_OrigenCotizacion'` (B3). |
| `wsGeneracionRecoleccion` | no (crea datos) | no | Pide `K_Cliente` propio del cliente (B2). |
| `wsGeneracionGuiaCliente` | no (crea datos) | no | Pendiente: ¿qué `K_Cliente` para invitados? |
| `Genera_Etiqueta` | no | no | Etiqueta PDF en Base64. Sin UI todavía. |
| Pagos, registro, historial, facturación | — | — | **No existen** endpoints liberados. |

---

## 5. Bloqueos activos

| # | Bloqueo | Depende de | Impacto | Estado |
|---|---|---|---|---|
| **B1** | **Cloudflare reta (403 `cf-mitigated: challenge`) a las peticiones desde Node** aunque la IP `187.189.155.14` ya está en el whitelist; `curl` desde la misma IP pasa. Es huella TLS, no headers. El whitelist se aplicó en su firewall, no en Cloudflare. | Cliente / sistemas (regla WAF *Skip* o IP Access *Allow* en Cloudflare) | **Nada del BFF funciona** (ni en dev ni en Vercel) | Mensaje listo en `docs/mensajes/2026-10-12-cliente.md`. **Por enviar.** |
| **B2** | **Registro/login de usuario final y su `K_Cliente`**. El cliente confirmó (2026-10-07): registro obligatorio para recolecciones; con sesión ve sus envíos, recolecciones y contactos. El `K_Cliente` del `Login` (63105) es de la cuenta de servicio, no de cada persona. | Backend | `/recoleccion`, `/envio`, `/perfil`, `/cuenta/crear` siguen en mock | Preguntas en el mensaje al cliente. |
| **B3** | `ObtieneDetalleCostos` falla en pruebas (falta el stored procedure `GP_Valida_OrigenCotizacion`). | Backend | Cotizador real | En el mensaje al cliente. |
| **B4** | Endpoints de **pago**, webhooks, sandbox. | Backend | Checkout productivo (`procesarPago` queda simulado) | Plan semana 3; sin novedades. |
| **B5** | **IP fija para producción**. Vercel no da IP de salida fija (Static IPs = $100/mes, descartado). Plan: proxy en VPS barato (~$5–8, Vultr/Hetzner). **Ojo**: el proxy solo resuelve la IP; **igual hace falta B1** para esa IP. | Decisión del jefe + provisionar VPS | Producción | Resumen técnico para el otro dev: artifact "IP Fija SIBOX" (`.scratch/ip-fija-sibox.html`). |
| **B6** | Sin URL/credenciales de **producción** (`api.inbox.com.mx`) ni confirmar que tenga la misma protección. | Cliente | Lanzamiento | Pendiente de preguntar. |
| **B7** | Más guías de prueba: las 3 entregadas son todas `ENTREGADA`. Faltan guías en tránsito / "LISTO PARA ENTREGAR" para validar el timeline y la fecha prometida. | Cliente | Validación del timeline | En el mensaje. |

---

## 6. Qué sigue (orden recomendado)

**A. Destrabar (no requiere código, requiere mandar un mensaje)**
1. Enviar el mensaje de `docs/mensajes/2026-10-12-cliente.md` (B1, B2, B3, B7 + preguntas).
2. Cuando el cliente confirme la regla de Cloudflare: probar `/rastreo` desde la app con las guías `4159028044`, `4159050421`, `4159021743`, `4003229791`.
3. Decidir con el jefe lo del VPS (B5) y, si procede, que el otro dev lo levante.

**B. Avanzar ya, sin esperar a nadie**
1. **Desplegar a Vercel** (proyecto + previews protegidos + variables de entorno): el plan lo pedía desde la semana 1 y el cliente aún no ve nada en un link. Probablemente choque con B1 en el preview, pero hay que tenerlo.
2. ~~Agenda de "Contactos"~~ **[HECHA en mock, 2026-10-12]**: `/perfil` → "Mis contactos" + selector en *Confirmar*. Queda cambiar el seam cuando backend responda si hay endpoint (§5 B2).
3. **Rate limiting** de `/api/*` (necesita un store compartido, p.ej. Upstash Redis; ver TODO en `route-helpers.ts`).
4. **Conectar al BFF los endpoints de lectura que ya funcionan**: `ListadoOficinas`/`Cobertura` (mapa y sucursales), `BusquedaCP`, `TipoEnvio`/`TipoEntrega`, `ObtenerHorariosPorCP` — con el mismo patrón de `proxySibox()`. Se podrán ver cuando B1 se resuelva.
5. Mostrar en `/rastreo` la **firma** y quién recibió **solo** cuando exista el endpoint autenticado (hoy se anulan por privacidad).

**C. Antes de producción**
Etiqueta PDF (`Genera_Etiqueta`, decodificar en servidor), pruebas E2E (Playwright),
accesibilidad y rendimiento, monitoreo, URLs/credenciales de producción, repetir
las pruebas de conectividad contra `api.inbox.com.mx`.

---

## 7. Decisiones tomadas (registro)

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-08-11 | Mapas con Leaflet + OpenStreetMap, sin Google/Mapbox | No depender de cuenta/facturación externa |
| 2026-08-11 | Patrón **seam** (tipo → mock → función async) en todo dato | Conectar el backend sea cambiar un archivo, no los componentes |
| 2026-08-12 | Sin "Iniciar sesión con Google" | No hay OAuth en SIBOX ni en el sitio actual |
| 2026-08-13 | `/envio` protegida por login **demo** (no seguridad real) | Gate de UX hasta que exista sesión en servidor |
| 2026-08-14 | `/perfil` y `/recoleccion` diseñados sin Figma; solo lo respaldado por la API | No inventar features sin endpoint |
| 2026-08-14 | El tab "Chat" del widget es formulario de contacto | No existe endpoint de chat; el sitio actual usa un tercero |
| 2026-08-20 | **BFF obligatorio**: SIBOX no soporta CORS | El navegador no puede llamarla; además oculta credenciales |
| 2026-08-25 | `Login` = **cuenta de servicio única** del sitio (confirmado por el cliente) | El BFF hace login una vez y reutiliza el token |
| 2026-09-23 | Whitelist del cliente es **por IP**; IP fija vía proxy en VPS, no Vercel Static IPs | $100/mes no aceptable |
| 2026-10-02 | Token de `Login` en `resp.token`; BFF lo lee ahí y expone `K_Cliente` de servicio | Forma real distinta del PDF |
| 2026-10-07 | **Comprar una guía NO requiere registro** (invitado); recolecciones **sí** | Regla del cliente; no frenar la venta |
| 2026-10-12 | Rastreo con **interruptor demo/real** (`NEXT_PUBLIC_SIBOX_REAL=1`); por defecto demo con aviso visible | El sitio/previews deben funcionar mientras Cloudflare bloquee (B1); el plan pide identificar los datos simulados. Es un flag de comportamiento, no un secreto |
| 2026-10-12 | Al elegir un contacto en *Confirmar* se **conserva el C.P. cotizado** y se avisa si difiere | El precio ya se calculó con ese C.P.; no cambiarlo en silencio |
| 2026-10-12 | El BFF **anula** nombres, quién recibió, firma, coordenadas y `Observaciones` del rastreo público | Reglas de seguridad 3 y 7: la API los devuelve con solo conocer la guía |
| 2026-10-12 | Errores internos de SIBOX **nunca** llegan al navegador (502/503/504 genéricos) | Se vio un error de SQL con nombre de stored procedure |
| siempre | `procesarPago()` **nunca** se conecta a una pasarela sin decisión explícita | Pagos bloqueados por backend |

---

## 8. Reglas innegociables (resumen — detalle en `CLAUDE.md` §5)

1. **Nada de credenciales/token/URLs sensibles en el navegador.** Todo pasa por
   Route Handlers (`src/app/api/**`) usando `src/lib/api/sibox-client.ts`.
   Nunca `NEXT_PUBLIC_*` para esto.
2. **Credenciales solo en `.env.local`** (ignorado por git). Jamás en el repo, en
   docs, en commits ni en chats.
3. **Datos de terceros**: el rastreo es público por número de guía; lo que se
   devuelva debe pasar por los esquemas "públicos" que anulan datos personales.
4. **Validar con Zod** request y respuesta en el BFF; recalcular precios en
   servidor; autorizar por objeto (un `K_ClienteSIBOX` recibido del navegador
   nunca se confía).
5. **Patrón seam** para todo dato; los componentes nunca importan mocks.
6. **No poner login obligatorio en el flujo de compra.**
7. **Todo texto de UI en español.** Tokens de `globals.css`, nada de colores
   sueltos. Reusar antes de crear (ver `CLAUDE.md` §2 y §9).
8. **Antes de cada commit**: `npx tsc --noEmit`, `npm run lint`, `npm test`
   (y `npm run build` si se tocó configuración/rutas).

---

## 9. Retomar en otra sesión o en otra computadora

```bash
git clone https://github.com/JorgeVexus/Inbox.git && cd Inbox
npm install                      # Node >= 20.9
cp .env.example .env.local       # y llenar SIBOX_SERVICE_USER / SIBOX_SERVICE_PASSWORD
npm run dev                      # http://localhost:3000
npx tsc --noEmit && npm run lint && npm test
```

- **Credenciales**: la contraseña de la cuenta de servicio de pruebas **no está
  en el repo** (a propósito). Pídela por un canal seguro (gestor de contraseñas)
  a quien la recibió del cliente. Usuario de pruebas: `TESTWB2025`.
- **IP**: la IP whitelisteada es la de la PC donde se desarrolló
  (`187.189.155.14`, dinámica). Desde otra red, `curl` a la API **no** pasará
  hasta que esa IP también se agregue (el cliente acepta varias).
- **Documentación fuera del repo** (`../Documentacion/`, **no está en git**): el
  PDF de la API, el plan de desarrollo y el doc de pantallas. **Riesgo**: si se
  pierde esa carpeta, se pierde la fuente de verdad del contrato de la API. Guarda
  una copia en un lugar privado compartido.
- **Probar la API a mano** (Cloudflare exige `curl` o headers de navegador):
  hacer `POST /Login`, tomar `resp.token`, y mandarlo como
  `Authorization: Bearer <token>`. Headers usados: `User-Agent` de Chrome,
  `Origin` y `Referer` = la URL base.
- **Archivos locales no versionados**: `.env.local`, `GUIA_PRUEBAS.md`,
  `.scratch/` (borradores), `.worktrees/`.
- **Agentes de IA**: `CLAUDE.md` importa este índice y `AGENTS.md`; leer ambos.
  Next.js 16 tiene cambios incompatibles: ante la duda, consultar
  `node_modules/next/dist/docs/`.

---

## 10. Mapa de documentos

| Documento | Para qué | Cuándo leerlo |
|---|---|---|
| **`INDICE_MAESTRO.md`** (este) | Estado, bloqueos, qué sigue, decisiones | **Siempre primero** |
| `CLAUDE.md` | Reglas técnicas completas, seguridad, estado detallado por feature, hallazgos de API con notas | Antes de tocar código |
| `NOTAS_PROYECTO.md` | Síntesis autocontenida para cualquier agente/persona, notas de proceso (Figma→código, trucos del navegador) | Onboarding profundo |
| `AGENTS.md` | Aviso de Next.js 16 (lo regenera `next dev`; no borrar) | Agentes |
| `docs/mensajes/` | Mensajes ya redactados para el cliente | Al contactar al cliente |
| `docs/superpowers/` | Spec y plan de `/envio` (histórico) | Contexto de esa feature |
| `GUIA_PRUEBAS.md` (local, ignorado) | Datos y pasos para probar la demo | Probar manualmente |
| `../Documentacion/*` (fuera del repo) | PDF de la API, plan de 8 semanas, doc de pantallas | Contrato de la API y alcance |
| Figma `uET8lmz7lTswi429zz8n8C` | Diseños (Home `672:18493`) | Pantallas nuevas |

---

## 11. Bitácora de sesiones (la más reciente arriba)

- **2026-10-12 (sesión 2)** — Modo demo/real del rastreo (con aviso en
  `/rastreo`); agenda de **Contactos** en `/perfil` y selector en *Confirmar*
  (mock); 84 tests. Se explica el flujo Vercel preview → producción al dueño del
  proyecto (primera vez con un sistema así). Pendiente: desplegar a Vercel.
- **2026-10-12** — Retomo tras ~10 días. Guías de prueba reales: se corrigió el
  timeline (LISTO PARA ENTREGAR se veía "Entregado") y se cerró una **fuga de
  datos personales** del rastreo. Auditoría completa del proyecto; probados 6
  endpoints más (hallazgo B3). Timeout de 20 s y errores internos ocultos en el
  BFF. Reglas del cliente (invitado/registro). Se crea este índice y el mensaje
  al cliente.
- **2026-10-02** — Credencial de servicio recibida: primera prueba real exitosa.
  BFF corregido (token en `resp.token`), `/rastreo` conectado, detección del
  bloqueo de Cloudflare (B1).
- **2026-09-23** — Cliente pide origen/IP para whitelist; evaluación de Vercel
  Static IPs ($100/mes) vs proxy en VPS.
- **2026-08-25** — Esqueleto del BFF; cliente confirma que `Login` es cuenta de
  servicio única; placeholders de cuenta.
- **2026-08-20** — Pruebas reales de `Login`/`wsRastreo`: sin CORS, sobre
  `{resp}` universal.
- **2026-08-14** — `/envio` (hecho por fuera), `/soporte`, `/perfil`,
  `/recoleccion`; ajustes de z-index; `NOTAS_PROYECTO.md`.
- **2026-08-11 → 08-13** — Home, Navbar/Footer, mapa Leaflet, chat flotante,
  login demo, `/cotizar`, facturación, `/rastreo`, `/somos`, `/cobertura`,
  Vitest (33 commits el 13).
