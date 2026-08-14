# Inbox — Notas de proyecto (para cualquier agente/colaborador)

> Este documento es una síntesis autocontenida de todo lo que se sabe del
> proyecto hasta ahora: qué es, cómo está construido, qué decisiones se
> tomaron y por qué, y qué falta. Está pensado para que **cualquier agente
> (Claude Code, otro asistente de IA, o una persona)** pueda retomar el
> trabajo sin haber estado en las sesiones anteriores.
>
> El repo también tiene un `CLAUDE.md` (con reglas específicas para sesiones
> de Claude Code) — este documento incluye todo lo relevante de ahí más
> observaciones adicionales de las sesiones de trabajo que no estaban
> escritas en ningún lado. Si `CLAUDE.md` y este documento alguna vez
> difieren, `CLAUDE.md` es el que se actualiza primero (es el que el agente
> principal edita después de cada feature); conviene revisar ambos y avisar
> si hay contradicciones.
>
> Última actualización: 2026-08-14.

---

## 1. Qué es este proyecto

Rediseño completo de la plataforma web de **Inbox** (paquetería y envíos,
parte del Grupo Transpaís), construido en Next.js a partir de diseños en
Figma, reemplazando una implementación previa en Webflow. Integración
progresiva a las APIs de **SIBOX** (el backend real de Inbox).

- **Figma file**: `uET8lmz7lTswi429zz8n8C` ("Inbox")
- **Repo GitHub**: https://github.com/JorgeVexus/Inbox.git (rama `main`)
- **Carpeta de trabajo**: el código vive en `repo/` dentro de la carpeta del
  proyecto; la documentación fuente completa (PDF de la API, plan de
  desarrollo, doc de pantallas) vive en `../Documentacion/`, un nivel arriba
  de `repo/`, **fuera de git**.
- Cliente final: Inbox. Se entregan avances demostrables cada semana según un
  plan de 8 semanas (ver sección 7).

---

## 2. Stack y decisiones de arquitectura

- **Next.js 16 (App Router) + TypeScript**, aplicación única, no monorepo.
- **Tailwind CSS v4** — configuración vía `@theme` en `src/app/globals.css`.
  **No existe `tailwind.config.*`** en este proyecto; no lo crees ni asumas
  que existe. No instalar otra librería de estilos.
- ⚠️ **Next.js 16 puede tener breaking changes** respecto al conocimiento de
  entrenamiento de un modelo de lenguaje (esto viene de un `AGENTS.md`
  auto-generado por `next dev`, que se re-agrega solo al iniciar el server —
  no lo borres del `CLAUDE.md`, es intencional). Si algo de la API o
  convención de Next no cuadra, revisar `node_modules/next/dist/docs/` en vez
  de asumir comportamiento de Next 13/14.
- **Mapas: `leaflet` + `react-leaflet` sobre tiles de OpenStreetMap**, sin API
  key. Decisión explícita del usuario (2026-08-11) sobre Google Maps/Mapbox,
  para no depender de una cuenta/facturación externa todavía. Cualquier mapa
  nuevo debe ser Client Component cargado con
  `next/dynamic({ ssr: false })` (Leaflet toca `window` en el import).
- **Hosting recomendado**: Vercel Pro para el MVP. Cloudflare Workers +
  OpenNext es alternativa válida solo si Inbox ya opera en Cloudflare — **no
  usar Cloudflare Pages** (no soporta el SSR/BFF dinámico que este proyecto
  necesita). Mantener una salida a Docker viable para no atarse a un
  proveedor.
- **Capa BFF obligatoria (aún no implementada)**: todas las llamadas a la API
  de SIBOX deben hacerse desde el servidor (Route Handlers de Next.js), nunca
  desde el navegador. El navegador jamás debe ver usuario/contraseña técnica
  ni el token de SIBOX. No usar variables `NEXT_PUBLIC_*` para credenciales o
  URLs sensibles de la API.

### Estructura de carpetas

```
repo/
  src/
    app/                    # rutas (App Router). page.tsx por ruta.
    components/
      layout/                # Navbar, Footer — compartidos en TODAS las páginas
      home/                   # secciones de Home, muchas reutilizadas en otras páginas
      somos/, cobertura/, cotizar/, rastreo/, facturacion/, auth/  # por página/feature
      ui/                     # primitivos reutilizables (Button, ChatWidget, etc.)
    lib/                      # "seams" (ver sección 4) + utilidades
      mock/                   # datos simulados, uno por seam
    types/                    # tipos que mirror las respuestas reales de SIBOX
  public/
    images/                   # fotos/PNGs exportados de Figma (kebab-case)
    icons/                    # SVGs exportados de Figma (kebab-case)
```

**Regla dura**: antes de crear un componente nuevo, revisar si ya existe algo
reutilizable en `components/ui`, `components/layout`, o en `components/home`
(muchas secciones de Home —`Servicios`, `Cobertura`/`CoberturaCTA`, `Faq`—
ya se reutilizan tal cual en otras páginas). `Navbar` y `Footer` se inyectan
una sola vez en `src/app/layout.tsx`; no volver a importarlos por página.

### Sistema de diseño (tokens)

Fuente de verdad: `src/app/globals.css`. No hardcodear hex/colores nuevos en
componentes — usar las clases de Tailwind que ya mapean a estos tokens.

| Token | Valor | Uso Tailwind |
|---|---|---|
| `--color-primary` | `#ff6015` (Pantone 021C) | `bg-primary`, `text-primary`, `border-primary` |
| `--color-secondary` | `#fe9766` | `bg-secondary` |
| `--color-secondary-dark` | `#a9abaa` | `text-secondary-dark` (placeholders, texto secundario) |
| `--color-neutral-bg` | `#eeeeee` | fondos de sección alternos |
| `--shadow-card` | `0px 4px 2px rgba(0,0,0,.25)` | `shadow-card` |
| `--shadow-nav` | `0px 3px 5.5px rgba(0,0,0,.25)` | `shadow-nav` |

Tipografía:
- **Poppins** (Google Font vía `next/font/google`, variable `--font-poppins`)
  → texto de cuerpo, es `font-sans` por defecto.
- **Trebuchet MS** (fuente de sistema, sin licencia para bundlear) → titulares
  y botones, clase `font-display`. Fallbacks: Segoe UI / Verdana.
- Escalas de headline del Figma: 50px/bold (H1 sección), 30px ExtraBold
  Poppins (hero), 28px bold (card), 25px bold, 20px medium, 16px regular
  (body), 14px, 12px (labels/placeholders).

Assets: todo lo exportado de Figma vive en `public/images`/`public/icons` con
nombres descriptivos en kebab-case — **nunca** los nombres crípticos
`imgXxxx` que trae el export crudo del MCP de Figma.

---

## 3. Cómo se trabajó: el patrón "seam" (léelo antes de tocar cualquier dato)

Este es el patrón arquitectónico más importante del proyecto y se repite en
**cada** feature que depende de datos: sucursales, rastreo, auth, cotización,
código postal, facturación. El backend real de SIBOX no está disponible
todavía, así que **todo dato debe quedar "listo para conectar"**:

1. `src/types/X.ts` — tipo TypeScript que **espeja el shape real de la
   respuesta de la API SIBOX** (nombres de campo idénticos a la API, aunque
   sea PascalCase raro). Cuando un campo no viene de la API pero la UI lo
   necesita (p. ej. `Sucursal.tipo`), se documenta explícitamente con un
   comentario que dice que es inventado en el frontend.
2. `src/lib/mock/X.ts` — datos simulados, documentados como mock, nunca
   mezclados silenciosamente con datos reales.
3. `src/lib/X.ts` — la función "seam": hoy resuelve contra el mock, pero es
   `async` (como si ya hiciera fetch) y trae un comentario mostrando la
   llamada `fetch()` real que la reemplazará contra el BFF. **Los
   componentes de React llaman siempre a esta función, nunca al mock
   directamente** — así, conectar el backend real es cambiar un archivo, no
   tocar componentes.

Cuando conectes un seam de verdad: revisar la sección 5 (formato de
respuesta de la API) porque no todos los endpoints responden igual, y la
sección 6 (reglas de seguridad) porque casi todo debe pasar por un Route
Handler, no por un `fetch` directo desde el cliente.

---

## 4. Principio de reutilización entre páginas

El usuario pidió explícitamente, para más de una página nueva, reutilizar
secciones ya construidas de Home en vez de reconstruirlas (ej.: "la sección
de tu inbox más cercana, será la misma de home" para `/somos`). El patrón que
salió de eso:

- Si una sección nueva tiene **exactamente el mismo copy y comportamiento**
  que algo que ya existe en `components/home/*` (p. ej. `Servicios`, `Faq`,
  `CoberturaCTA`), se importa **tal cual**, sin wrapper.
- Si se parece pero **difiere en algo concreto** (sin botón, imagen distinta,
  layout distinto), se prefiere un componente nuevo y separado en vez de
  forzar props condicionales sobre el componente existente — así fue con
  `SomosHistoria` vs. `AboutUs` (mismas 4 tarjetas de texto, pero sin el
  botón "Saber más" porque sería un link circular a la propia página, e
  imagen distinta).
- Si un componente compartido necesita una variación menor y genuinamente
  reutilizable (una imagen opcional junto al título, por ejemplo), se le
  agrega un **prop opcional** en vez de duplicar el componente — así fue con
  `Cobertura`, que ahora acepta `headlineImage?: string` para el camión que
  aparece en `/cobertura` pero no en Home.
- Si una mejora aplica al comportamiento de un componente compartido (como el
  panel de información al hacer clic en un pin del mapa), se agrega **al
  componente compartido**, no a un wrapper de la página nueva — así el
  comportamiento queda consistente en todos lados donde se use.

---

## 5. API SIBOX — resumen operativo

Documento completo: `../Documentacion/Documentacion Api Pagina WEB ver
Jun26.pdf` (fuera del repo). Resumen para no releerlo cada vez:

- Pruebas: `https://apitest.inbox.com.mx/` · Producción: `https://api.inbox.com.mx/`
- Auth: `POST /Login` con `{Usuario, Password}` → devuelve `token`. Todas las
  demás llamadas van con `Authorization: Bearer {token}`.
- **Formato de respuesta estándar**: `{"resp": {"result": 0|1, "data": ...}}`
  (`result: 0` = éxito, `1` = error, mensaje en `data`).
- ⚠️ **Excepción importante**: `Login` (y `Cobertura` en su rama de error)
  usan en cambio `{"success": bool, "mensaje": "...", "data": ...}`. El
  cliente API del BFF debe manejar ambos formatos, no asumir uno solo — es un
  error fácil de cometer al conectar el login de verdad.

Endpoints disponibles hoy (detalle de payloads en el PDF):

| Endpoint | Uso en el sitio |
|---|---|
| `wsRastreo` / `RastreoDetalle` | Rastreo de guía (Home + chat widget + página `/rastreo`) |
| `BusquedaCP` | Resolver CP → estado/ciudad/colonias, valida cobertura propia |
| `TipoEnvio` / `TipoEntrega` | Catálogos (sobre/paquete, ocurre/domicilio) |
| `ObtieneDetalleCostos` | Cotización (origen debe tener cobertura PROPIA) |
| `ListadoOficinas` / `Cobertura` | Sucursales, mapa de cobertura |
| `DomiciliosRecoleccionesCliente` | Domicilios pre-registrados del cliente |
| `ObtenerHorariosPorCP` | Horarios disponibles de recolección |
| `wsGeneracionRecoleccion` | Programar recolección |
| `wsGeneracionGuiaCliente` | Documentar guía |
| `Genera_Etiqueta` | Etiqueta PDF en Base64 |

**Pendientes de backend** (NO construir la integración real todavía, usar
mocks claramente identificados como tal en la UI): pagos (referencias/
actualización de pago, PayPal/Santander/MIT), registro/login de usuario y
asociación a cliente SIBOX, historial de envíos/recolecciones, facturación
(el flujo está descrito pero no hay endpoint confirmado para *guardar* datos
fiscales nuevos, solo para consultar un RFC existente).

---

## 6. Reglas de seguridad (no negociables, del plan de desarrollo)

Aplican a cualquier feature que toque la API real:

1. Nada de credenciales, token técnico o URLs de API sensibles en el
   navegador. Todo pasa por Route Handlers server-side.
2. Recalcular precio/importe en servidor antes de generar guía o cobrar;
   nunca confiar en el total que mande el cliente.
3. Autorizar por objeto: antes de mostrar guía/etiqueta/factura/domicilio,
   verificar que pertenece al cliente autenticado.
4. Validar y normalizar requests/responses (Zod en el BFF). Rechazar campos
   extra, longitudes fuera de rango.
5. Rate limiting propio en el BFF además del de SIBOX (sugerido: rastreo
   30/min, cotización 10/min y 50/hora, login 5 fallos/15min, generar guía
   5/10min). Responder 429 + `Retry-After`.
6. Sesión en cookies `Secure` + `HttpOnly` + `SameSite`. CSRF en mutaciones.
   CORS restringido a orígenes explícitos.
7. No loguear contraseñas, tokens, PII completa (RFC, teléfono, correo,
   dirección) — enmascarar en logs.
8. Etiquetas: decodificar el Base64 en servidor, servir como `attachment` con
   Content-Type validado, nunca interpretar el contenido como HTML.

**`procesarPago()` en `src/lib/cotizacion.ts` nunca debe conectarse a un
gateway real sin que alguien lo decida explícitamente** — todos los
endpoints de pago están "pendiente" en la especificación y bloqueados en el
plan (semana 7).

---

## 7. Plan de entregas (8 semanas desde 2026-08-04)

Cronograma completo en `../Documentacion/Plan de Desarrollo - Rediseño Web
Inbox.docx`. Hitos:

1. Semana 1 — Base + Home navegable + rastreo real.
2. Semana 2 — Cotizador real (`BusquedaCP`, `ObtieneDetalleCostos`).
3. Semana 3 — Checkout (remitente/destinatario/SAT) sin cobro.
4. Semana 4 — Guía + etiqueta PDF.
5. Semana 5 — Recolecciones.
6. Semana 6 — Cuenta/portal (según disponibilidad de endpoints).
7. Semana 7 — Pago y facturación (bloqueado por backend).
8. Semana 8 — Estabilización, E2E, seguridad, accesibilidad, rendimiento.

Cuando se conecte un módulo a la API real, si aún no hay endpoint liberado
usar datos simulados **claramente identificados como demo** en la UI — es el
criterio de aceptación del cliente para cada demo semanal.

---

## 8. Estado actual del código, página por página

### Global
- `Navbar` / `Footer` (`src/components/layout/`) montados una sola vez en
  `src/app/layout.tsx`.
- `AuthProvider` (`src/components/auth/auth-provider.tsx`) envuelve toda la
  app, expone `useAuth()` (`session`, `openLogin`, `closeLogin`, `login`,
  `logout`). **`session` es 100% de demo**: vive en `useState`, se pierde al
  recargar, no hay cookie ni persistencia real — no construir nada asumiendo
  que es una sesión real.
- `LoginModal` es global (Figma node `136:7385`), se abre desde cualquier
  lado con `openLogin()`. Se quitó el botón "Iniciar sesión con Google" del
  diseño (decisión explícita 2026-08-12: no hay endpoint OAuth en SIBOX ni en
  el sitio actual).
- `ChatWidget` (`src/components/ui/chat-widget.tsx`) es global, 3 pestañas:
  - **Inicio**: rastreo real de guía dentro del widget (mismo seam que
    `/rastreo`). Prueba con guías mock `4003229791` o `4159473741`.
  - **Chat**: se implementó como formulario de contacto (correo → "un asesor
    te escribe"), no como chat en vivo simulado — no existe endpoint de
    chat/ticket en SIBOX. `enviarContactoChat()` es un stub; falta decidir
    con backend/producto si termina siendo lead a CRM, webhook, o widget de
    terceros (Zendesk/Intercom).
  - **Ayuda**: buscador + acordeón con preguntas de ejemplo hardcodeadas,
    contenido de relleno pendiente de que Inbox entregue el real.

### `/` (Home)
Hero (carrusel + buscador de rastreo + tarjeta de cotización de 3 pasos),
Servicios (scroll horizontal de 11 tarjetas), Cobertura (mapa Leaflet real +
indicadores), CoberturaCTA (dropdowns Estado→Ciudad con tabla real de
sucursales, Figma node `679:20363`), AboutUs, Faq.

- Mapa real con `leaflet`+`react-leaflet` sobre `src/lib/sucursales.ts`
  (hoy lee `src/lib/mock/sucursales.ts`). Pendiente confirmar con backend si
  existe el campo que distingue "sucursal" de "centro de distribución"
  (`Sucursal.tipo` es inventado en frontend, no viene de `ListadoOficinas`).
- Estatus "abierto/cerrado" (`src/lib/horario.ts`) parsea rangos
  `HH:MM - HH:MM` del campo `Observaciones` real de la API — **no distingue
  día de la semana** (limitación documentada, aceptable como indicador
  visual, no como fuente de verdad).
- El botón "Rastrear" del Hero navega de verdad a `/rastreo?guias=...`. El
  botón "Confirmar" de la tarjeta de cotización guarda el borrador en
  `sessionStorage` (`src/lib/cotizacion-draft.ts`) y navega a `/cotizar`.

### `/cotizar`
Figma node `184:13498` — el Figma tenía 7 frames apilados como estados
independientes; se implementó como **un wizard de una sola página** con 4
pasos (`WizardStepper`: Cotizar/Costo/Confirmar/Pago) — así se leyó la
intención del diseño, no como 7 páginas separadas.

- **Paso 1 Cotizar**: soporta *varios* paquetes (el Figma solo mostraba uno,
  pero `CotizacionInput.paquetes` ya es un array).
- **Paso 2 Costo**: dos opciones vía `obtenerCotizacion()` (mock sensible a
  peso/volumen, no es tarifa real), cada una expandible con desglose.
- **Paso 3 Confirmar**: formularios completos remitente/destinatario (mismos
  campos que `wsGeneracionGuiaCliente`), seguro opcional (+$200), link
  "Inicia sesión" conectado de verdad al modal global.
- **Paso 4 Pago**: sub-estados datos → método → tarjeta → éxito. Genera un
  folio real vía `generarGuia()`, termina con fechas estimadas y botón
  Facturar. Vencimiento y número de tarjeta se auto-formatean; `CardPreview`
  detecta marca (Visa/Mastercard/Amex) por dígitos iniciales, 100% cliente.
  Identificar banco emisor requeriría un servicio externo de BIN-lookup que
  no es parte de SIBOX — deliberadamente no se agregó.
- **Gotcha ya resuelto**: `StepCotizar` siembra su estado local desde la prop
  `initial` una sola vez al montar. `CotizarPage` NO debe montar
  `StepCotizar` hasta después de leer el draft de `sessionStorage` (gate
  `ready` en `page.tsx`) — montarlo antes congela el formulario en valores
  por defecto aunque el estado del padre se actualice después.

### Modal "Datos de facturación"
Figma node `317:14223`, se abre desde "Facturar" en la pantalla de éxito de
`/cotizar`. "Sube tu constancia fiscal → autocompleta" es mock explícito (no
hay parseo real de PDF/XML). CP → Estado/Ciudad/Colonia sí resuelve de
verdad (dentro de lo mock) vía `src/lib/codigo-postal.ts`
(`buscarCodigoPostal()`), pensado para compartirse con cualquier otro campo
de CP del sitio.

### `/rastreo`
Figma node `362:37763`. Varias guías a la vez, lista vive en **query string**
(`/rastreo?guias=...`, no `sessionStorage` — un link de rastreo tiene sentido
compartirlo/guardarlo, a diferencia de un borrador de cotización). Cada guía
es un `RastreoCard` independiente (una guía que falla no rompe las demás).

- El timeline de 4 pasos **no viene así de la API** — `wsRastreo` regresa
  `Estatus` como texto libre. `pasoDesdeEstatus()` es heurística por palabras
  clave, no autoritativa, revisar contra valores reales de producción.
- "Código de rastreo" y "Fecha programada de entrega" del Figma **no están**
  en la respuesta documentada de `wsRastreo` — hoy son aproximaciones
  (comentadas explícitamente en `rastreo-card.tsx`), preguntar a backend de
  dónde deberían salir de verdad.

### `/envio`
Perfil de envíos protegido visualmente con los Figma nodes `388:39626`
(principal), `713:27881` (detalle) y `399:19075` (asignar nombre/alias).

- Usa el `AuthProvider` existente. Sin sesión abre automáticamente el popup
  global de login y no muestra ni carga los datos de envíos; si el usuario lo
  cierra, queda un estado protegido desde el que puede abrirlo otra vez.
- **Gate de demo, no autenticación ni seguridad real**: la sesión vive en
  estado React y se pierde al recargar. La versión real debe validar una cookie
  `Secure`, `HttpOnly` y `SameSite` en el BFF/servidor, además de comprobar
  autorización a nivel de objeto en cada guía solicitada.
- Lista con búsqueda y selección, timeline de 4 pasos mediante la heurística
  no autoritativa `pasoDesdeEstatus()`, y tabla de `RastreoDetalle` que se carga
  bajo demanda y queda cacheada en cliente.
- Modal de alias con máximo 60 caracteres. Persiste solo para la demo en
  `localStorage`, con clave usuario + guía; el backend futuro debe asociarlo a
  la cuenta autenticada y volver a autorizar la guía.
- Seam de datos en `src/lib/envios.ts`, actualmente respaldado por
  `src/lib/mock/envios.ts`. No hay endpoint documentado de historial asociado
  a cuenta; fechas y código de rastreo son aproximaciones. La UI lo declara con
  la etiqueta visible **"Datos demo"** para no confundirlo con información
  productiva.
- CTA "Hacer un nuevo envío" y "Cotizar nuevo envío" llevan a `/cotizar`.
  Se verificó manualmente la vista responsive en desktop/mobile y las
  interacciones de gate, búsqueda, selección, detalle, alias y CTA.

### `/somos`
Figma node `324:26623`. Composición de piezas existentes de Home (pedido
explícito del usuario). `SomosHero` es variante del banner de `Hero` sin
buscador de rastreo. `SomosHistoria` reproduce el contenido de `AboutUs` pero
es un componente separado (sin botón "Saber más", imagen distinta).
`Servicios`, `CoberturaCTA` y `Faq` se importan tal cual de `home/*`.

### `/cobertura`
Figma node `362:38174`. Reutiliza `Cobertura` de Home con un nuevo prop
opcional `headlineImage`. Sección nueva `EstamosDonde` (2 tarjetas de stats +
mapa de México decorativo, exportado como imagen de Figma por ser ~900 paths
SVG, no vale la pena recrearlo a mano). Breadcrumb "Inicio > Cobertura"
propio de esta página.

- **Pin de sucursal → panel de información** (Figma node `713:28003`): se
  agregó al componente `Cobertura` **compartido** (no solo a esta página),
  así que clic-en-pin abre el mismo panel también en el mapa de Home. Se
  quitó el `<Popup>` nativo de Leaflet para no duplicar la información.
  Pestañas "Descripción general/Opiniones/Acerca de" y buscador dentro del
  panel son decorativos (no hay nada que buscar en la ficha de una sola
  sucursal).

### `/soporte`
Figma node `341:27315`. `SoporteHero` (encabezado + 3 tarjetas: Llámanos /
Envíanos un mensaje / ¡Síguenos en redes!, reutilizando los íconos sociales
que ya usaba `Footer`) + `ContactoForm` (formulario nombre/correo/mensaje,
seam nuevo `enviarContactoSoporte()` en `src/lib/soporte.ts`, hermano de
`enviarContactoChat()` del widget de chat — mismo problema de fondo, sin
endpoint de chat/ticket en SIBOX, pero se mantienen como funciones separadas
porque son dos flujos distintos en el Figma que podrían terminar en destinos
distintos). Reutiliza `CoberturaCTA` y `Faq` de Home tal cual, mismo patrón
que `/somos`.

### Ya existen todas las páginas enlazadas desde Navbar/Footer
`/`, `/cotizar`, `/rastreo`, `/somos`, `/cobertura`, `/envio` (protegida por
login) y `/soporte`.

### Todavía pendiente
- Playwright/E2E. Vitest ya está configurado (`npm test`) y la suite incluye
  lógica pura y flujos protegidos del perfil de envíos.
- La capa BFF real (`src/lib/api/` + Route Handlers) — todo sigue siendo
  mocks resueltos client-side detrás de los seams.

---

## 9. Convenciones de código

- Componentes en PascalCase exportado con `export function X()`, archivo en
  kebab-case (`chat-widget.tsx`, no `ChatWidget.tsx`).
- Todo texto de UI en **español** (es el idioma del sitio).
- Preferir Server Components por defecto; `"use client"` solo cuando haya
  estado/interacción.
- No duplicar botones/inputs — extender `components/ui/button.tsx` en vez de
  escribir estilos de botón inline en una sección nueva.
- Imágenes locales siempre vía `next/image`.

### Patrones de React que costó resolver (para no repetir el error)

- **`react-hooks/set-state-in-effect`**: cuando un modal necesita "resetear"
  su estado al reabrirse, no lo resetees con un `useEffect` — desmonta y
  vuelve a montar el componente interno (ver `login-modal.tsx`: un
  `LoginModal` externo que renderiza condicionalmente un `LoginModalForm`
  interno fresco). Cuando el `setState` en efecto es legítimo (una bandera de
  loading al cambiar una dependencia, una lectura de `sessionStorage` una
  sola vez en cliente), usar `// eslint-disable-next-line
  react-hooks/set-state-in-effect` **justo en la línea anterior al
  `setState`**, sin comentarios explicativos multilínea antes — de lo
  contrario el disable termina silenciando la línea equivocada.
- **`useSearchParams()`** requiere un `<Suspense>` boundary alrededor (ver
  `src/app/rastreo/page.tsx`).
- **URL query string vs. `sessionStorage`** para pasar estado entre páginas:
  usar query string cuando el link tiene sentido compartirse/guardarse
  (rastreo); usar `sessionStorage` para un borrador efímero de un solo uso
  (cotización).
- `crypto.randomUUID()` para keys de listas client-side (paquetes, etc.).

---

## 10. Notas de proceso (Figma → código, verificación, workflow)

- **Flujo por página**: se pide el `get_design_context` del nodo de Figma
  correspondiente, se identifica qué reutilizar vs. qué construir de cero, se
  implementa siguiendo el patrón seam si hay datos de por medio, se verifica
  en navegador (ver abajo), se actualiza la sección 8/7 de `CLAUDE.md`, se
  corre `tsc`+`lint`, se commitea y se hace push. El usuario prefiere avanzar
  **página por página**, no todas en paralelo.
- **Assets de Figma**: para SVGs/íconos simples se usa `get_design_context`
  (ya trae las URLs). Para imágenes que son fondos/fotos o formas
  demasiado complejas para recrear a mano (p. ej. el mapa vectorial de
  México con ~900 `<path>`), se usa `download_assets` con el `export`
  aplanado (PNG) del nodo en vez de intentar reconstruir la geometría. Los
  assets bajados se renombran a kebab-case descriptivo en
  `public/images`/`public/icons` (nunca los nombres `imgXxxx` crudos) y los
  que terminan sin usarse se borran antes de commitear.
- **Verificación obligatoria antes de dar una página por terminada**:
  levantar el dev server (`preview_start`), navegar a la ruta, revisar
  consola por errores, tomar screenshots recorriendo toda la página
  (`javascript_tool` con `window.scrollBy` cuando el `computer.scroll` no
  responde), y probar la interacción principal a mano (clicks, formularios).
  Correr `npx tsc --noEmit` y `npm run lint` antes de cada commit — deben
  quedar limpios.
- **Quirks del navegador de este entorno** (útiles si algo no responde):
  - Los clicks por coordenada del tool `computer` a veces no coinciden con el
    elemento real, sobre todo después de `resize_window` — si un click "no
    hace nada", usar `javascript_tool` con `querySelector` + `.click()`.
  - Para escribir en inputs controlados por React, usar el *native setter*
    de `HTMLInputElement.prototype` + `dispatchEvent(new Event('input',
    {bubbles:true}))`; un `.value = x` directo no dispara el `onChange` de
    React.
  - Para que un `onBlur` de React se dispare de verdad, llamar `.focus()`
    real y luego `.blur()` real sobre el elemento — un `dispatchEvent(new
    Event('blur'))` sintético no lo activa.
- **Commits y push**: el usuario espera que cada feature terminada se
  commitee y se suba a `origin/main` sin tener que pedirlo cada vez — es el
  flujo ya establecido en este proyecto, no algo que haya que
  reconfirmar por feature (pero sigue aplicando el criterio general de no
  hacer nada destructivo sin confirmar).

---

## 11. Cómo correr el proyecto

```bash
cd repo
npm run dev       # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

Un `.claude/launch.json` en la raíz del proyecto (un nivel arriba de `repo/`)
ya está configurado para levantar el dev server vía la herramienta de
preview de Claude Code (`npm --prefix repo run dev`, puerto 3000).
