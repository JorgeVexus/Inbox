@AGENTS.md

# Inbox — Rediseño Web (reglas internas del proyecto)

Este archivo es la fuente de verdad para trabajar en este repo entre sesiones.
Léelo completo antes de tocar código. La documentación fuente completa (PDF de
API, plan de desarrollo, doc de pantallas) vive en `../Documentacion/` (un
nivel arriba de este repo, fuera de git) — si necesitas releerla, está ahí.

## 1. Qué es este proyecto

Rediseño de la plataforma web de **Inbox** (paquetería y envíos, parte del
Grupo Transpaís) a partir de los diseños en Figma, reemplazando una
implementación previa en Webflow, con integración progresiva a las APIs de
**SIBOX**. Cliente final: Inbox. Se entregan avances demostrables cada semana
(ver `plan de desarrollo` resumido en la sección 6).

- Figma file: `uET8lmz7lTswi429zz8n8C` ("Inbox")
- Home node de referencia: `672:18493` (URL:
  https://www.figma.com/design/uET8lmz7lTswi429zz8n8C/Inbox?node-id=672-18493)
- Repo GitHub: https://github.com/JorgeVexus/Inbox.git (rama `main`, vacío al
  iniciar este proyecto — el código vive todo dentro de esta carpeta `repo/`)

## 2. Stack y decisiones de arquitectura

- **Next.js (App Router) + TypeScript**, una sola aplicación (no monorepo).
- **Tailwind CSS v4** (config vía `@theme` en `src/app/globals.css`, no hay
  `tailwind.config.*`). No instalar otra librería de estilos.
- **Mapas: `leaflet` + `react-leaflet` sobre tiles de OpenStreetMap** (sin
  API key). Elegido explícitamente sobre Google Maps/Mapbox para no
  depender de una cuenta/facturación externa mientras el proyecto no la
  tenga decidida — si el cliente pide después el look de Google Maps, es un
  cambio acotado a `src/components/home/cobertura-map.tsx`. Cualquier mapa
  nuevo debe ser un Client Component cargado con `next/dynamic({ ssr:
  false })` (Leaflet toca `window` en el import).
- **Hosting recomendado: Vercel Pro** para el MVP. Cloudflare Workers +
  OpenNext es alternativa válida solo si Inbox ya opera su stack en
  Cloudflare — no usar Cloudflare Pages (no soporta SSR/BFF dinámico que este
  proyecto necesita). Mantener una salida a Docker viable para no atarnos a
  un proveedor.
- **Capa BFF obligatoria**: todas las llamadas a la API de SIBOX se hacen
  desde el servidor (Route Handlers de Next.js), nunca desde el navegador.
  El navegador jamás debe ver usuario/contraseña técnica ni el token de
  SIBOX. No uses variables `NEXT_PUBLIC_*` para nada relacionado a
  credenciales o URLs sensibles de la API.
- Next.js 16 en este repo puede tener cambios de breaking changes respecto a
  tu conocimiento previo — si dudas de una API o convención, revisa
  `node_modules/next/dist/docs/` antes de asumir comportamiento de Next 13/14.

### Estructura de carpetas

```
repo/
  src/
    app/                  # rutas (App Router). page.tsx por ruta.
    components/
      layout/              # Navbar, Footer — compartidos en TODAS las páginas
      home/                 # secciones específicas de Home (Hero, Servicios, etc.)
      ui/                   # primitivos reutilizables (Button, ChatBubble, futuros: Input, Dropdown, Modal)
    lib/                    # cliente API/BFF, utilidades (por crear)
  public/
    images/                 # fotos/PNGs exportados de Figma
    icons/                  # SVGs exportados de Figma
```

**Regla dura**: antes de crear un componente nuevo, revisa si ya existe algo
reutilizable en `components/ui` o `components/layout`. `Navbar` y `Footer`
ya están construidos y se inyectan una sola vez en `src/app/layout.tsx` — no
los vuelvas a importar dentro de cada página.

## 3. Sistema de diseño (tokens)

Fuente de verdad: `src/app/globals.css`. No hardcodees hex/colores nuevos en
componentes — usa las clases de Tailwind que ya mapean a estos tokens.

| Token | Valor | Uso Tailwind |
|---|---|---|
| `--color-primary` | `#ff6015` (Pantone 021C) | `bg-primary`, `text-primary`, `border-primary` |
| `--color-secondary` | `#fe9766` | `bg-secondary` |
| `--color-secondary-dark` | `#a9abaa` | `text-secondary-dark` (placeholders, texto secundario) |
| `--color-neutral-bg` | `#eeeeee` | fondos de sección alternos |
| `--shadow-card` | `0px 4px 2px rgba(0,0,0,.25)` | `shadow-card` (tarjetas, botones, inputs) |
| `--shadow-nav` | `0px 3px 5.5px rgba(0,0,0,.25)` | `shadow-nav` (navbar) |

Tipografía:
- **Poppins** (Google Font, cargada en `layout.tsx` vía `next/font/google`,
  variable `--font-poppins`) → texto de cuerpo, es la `font-sans` por
  defecto.
- **Trebuchet MS** (fuente de sistema, sin licencia para bundlear) → titulares
  y botones. Usa la clase `font-display` (o `font-['var(--font-trebuchet)']`)
  en vez de escribir `font-family` a mano. Fallbacks ya configurados:
  Segoe UI / Verdana.
- Escalas de headline usadas en Figma: 50px/bold (H1 sección), 30px
  ExtraBold Poppins (hero), 28px bold (título de card), 25px bold, 20px
  medium, 16px regular (body), 14px, 12px (labels/placeholders).

Assets: todo lo exportado de Figma para Home vive en `public/images` y
`public/icons` con nombres descriptivos en kebab-case (no uses los nombres
crípticos `imgXxxx` que trae el export crudo de Figma). Si necesitas volver a
tirar del Figma con el MCP, los node-id de referencia están en el código
fuente (`data-node-id` quedó fuera al convertir, pero el nombre de capa se
preservó en los comentarios/estructura de cada sección de `components/home`).

## 4. API SIBOX — resumen operativo

Documento completo: `../Documentacion/Documentacion Api Pagina WEB ver
Jun26.pdf`. Resumen que necesitas para no releerlo cada vez:

- Pruebas: `https://apitest.inbox.com.mx/`　·　Producción: `https://api.inbox.com.mx/`
- Auth: `POST /Login` con `{Usuario, Password}` → devuelve `token`. Todas las
  demás llamadas van con `Authorization: Bearer {token}`.
- Formato de respuesta estándar: `{"resp": {"result": 0|1, "data": ...}}`
  (`result: 0` = éxito, `1` = error, mensaje en `data`). Dos endpoints viejos
  (`Login`, `Cobertura` en su rama de error) usan en cambio
  `{"success": bool, "mensaje": "...", "data": ...}` — maneja ambos formatos
  en el cliente API, no asumas uno solo.

Endpoints disponibles hoy (ver detalle de payloads en el PDF):

| Endpoint | Uso en el sitio |
|---|---|
| `wsRastreo` / `RastreoDetalle` | Rastreo de guía (Home + página Rastreo) |
| `BusquedaCP` | Resolver CP → estado/ciudad/colonias, valida cobertura propia |
| `TipoEnvio` / `TipoEntrega` | Catálogos (sobre/paquete, ocurre/domicilio) |
| `ObtieneDetalleCostos` | Cotización (origen debe tener cobertura PROPIA) |
| `ListadoOficinas` / `Cobertura` | Sucursales, mapa de cobertura |
| `DomiciliosRecoleccionesCliente` | Domicilios pre-registrados del cliente |
| `ObtenerHorariosPorCP` | Horarios disponibles de recolección |
| `wsGeneracionRecoleccion` | Programar recolección |
| `wsGeneracionGuiaCliente` | Documentar guía |
| `Genera_Etiqueta` | Etiqueta PDF en Base64 |

Pendientes de backend (NO construir la integración real todavía, usar mocks
identificados como tal en la UI): pagos (referencias/actualización de pago,
PayPal/Santander/MIT), registro/login de usuario y asociación a cliente
SIBOX, historial de envíos/recolecciones, facturación. Ver sección 10 del
plan de desarrollo para las prioridades exactas a pedir al backend por
semana.

## 5. Reglas de seguridad (no negociables)

Tomadas del plan de desarrollo — aplican a cualquier feature que toque la
API:

1. Nada de credenciales, token técnico o URLs de API sensibles en el
   navegador. Todo pasa por Route Handlers server-side.
2. Recalcular precio/importe en servidor antes de generar guía o cobrar;
   nunca confiar en el total que mande el cliente.
3. Autorizar por objeto: antes de mostrar guía/etiqueta/factura/domicilio,
   verificar que pertenece al cliente autenticado — conocer un folio no debe
   bastar para verlo.
4. Validar y normalizar requests/responses (Zod en el BFF). Rechazar campos
   extra, longitudes fuera de rango.
5. Rate limiting propio en el BFF además del de SIBOX (valores sugeridos en
   la sección 6.2 del plan: rastreo 30/min, cotización 10/min y 50/hora,
   login 5 fallos/15min, generar guía 5/10min, etc.). Responder 429 +
   Retry-After.
6. Sesión en cookies `Secure` + `HttpOnly` + `SameSite`. CSRF en mutaciones.
   CORS restringido a orígenes explícitos.
7. No loguear contraseñas, tokens, PII completa (RFC, teléfono, correo,
   dirección) — enmascarar en logs.
8. Etiquetas: decodificar el Base64 en servidor, servir como `attachment`
   con Content-Type validado, nunca interpretar el contenido como HTML.

## 6. Plan de entregas (resumen — 8 semanas desde 2026-08-04)

Cronograma completo en `../Documentacion/Plan de Desarrollo - Rediseño Web
Inbox.docx`. Hitos:

1. Semana 1 — Base + Home navegable + rastreo real (**estado actual: Home,
   Navbar, Footer y sistema de diseño implementados con datos/formularios
   locales; rastreo aún no conectado a `wsRastreo`**).
2. Semana 2 — Cotizador real (`BusquedaCP`, `ObtieneDetalleCostos`).
3. Semana 3 — Checkout (remitente/destinatario/SAT) sin cobro.
4. Semana 4 — Guía + etiqueta PDF.
5. Semana 5 — Recolecciones.
6. Semana 6 — Cuenta/portal (según disponibilidad de endpoints).
7. Semana 7 — Pago y facturación (bloqueado por backend).
8. Semana 8 — Estabilización, E2E, seguridad, accesibilidad, rendimiento.

Cuando conectes un módulo a la API real, si aún no hay endpoint liberado usa
datos simulados **claramente identificados como demo** en la UI (no los
mezcles silenciosamente con datos reales) — es el criterio de aceptación del
cliente para cada demo semanal.

## 7. Estado actual del código (ir actualizando esta sección)

- [x] Next.js 16 + TypeScript + Tailwind v4 scaffolded (`create-next-app`).
- [x] Tokens de diseño en `globals.css`, fuentes Poppins/Trebuchet.
- [x] `Navbar` y `Footer` reutilizables en `src/components/layout/`, montados
      en `src/app/layout.tsx` (aparecen en toda página nueva sin más trabajo).
- [x] Página Home completa (`src/app/page.tsx` + `src/components/home/*`):
      Hero con carrusel + buscador de rastreo + tarjeta de cotización de 3
      pasos (origen/destino → tipo de envío → detalle de paquete), Servicios
      (scroll horizontal de 11 tarjetas), Cobertura (mapa interactivo real +
      indicadores), CTA de cobertura por estado/ciudad, About us, FAQ
      (acordeón), chat flotante.
- [x] **Cobertura ya no es una imagen estática**: mapa real con
      `leaflet` + `react-leaflet` (OpenStreetMap, sin API key — decisión del
      usuario 2026-08-11, ver opciones descartadas: Google Maps/Mapbox
      requieren cuenta y facturación). Dropdowns Estado→Ciudad, buscador y
      leyenda de tipo de sucursal ya filtran de verdad contra
      `src/lib/sucursales.ts`. Ese archivo es el único lugar que sabe que hoy
      lee de `src/lib/mock/sucursales.ts` — swap a un fetch real contra el
      BFF (`ListadoOficinas`) sin tocar `cobertura.tsx` ni `cobertura-map.tsx`.
      Pendiente confirmar con backend si existe el campo que distingue
      "sucursal" de "centro de distribución" (`Sucursal.tipo` en
      `src/types/sucursal.ts` es un campo inventado en el frontend, no viene
      de `ListadoOficinas`).
- [x] **CTA "Tu inbox más cercana" (debajo del mapa)** ya no son solo 2
      dropdowns decorativos: al elegir un Estado cambia a una tabla real de
      sucursales (Estatus/Ciudad/Dirección/Teléfono/Oficina/Horario),
      filtrable también por Ciudad y por texto libre — Figma node
      `679:20363`. Usa la misma fuente de datos que el mapa
      (`src/lib/sucursales.ts`), así que también queda listo para conectar
      sin tocar el componente. El estatus "abierto/cerrado" se calcula en
      `src/lib/horario.ts` parseando rangos `HH:MM - HH:MM` del campo
      `Observaciones` real de la API — no distingue día de la semana
      (limitación documentada en ese archivo). El botón de dirección abre
      Google Maps con lat/long de la sucursal (o la dirección en texto si no
      hay coordenadas).
- [x] **Chatbot flotante rediseñado** (`src/components/ui/chat-widget.tsx`,
      montado globalmente en `layout.tsx`, ya no en `page.tsx`) — Figma node
      `117:8023`, las 3 pestañas (Inicio/Chat/Ayuda) con su propia barra
      inferior:
      - **Inicio**: rastreo real de guía dentro del propio widget, ya
        conectado al seam `src/lib/rastreo.ts` (`rastrearGuia()`), que hoy
        resuelve contra `src/lib/mock/rastreo.ts` — mismo patrón que
        `sucursales.ts`, swap a `wsRastreo` sin tocar el componente. Prueba
        con las guías mock `4003229791` o `4159473741`.
      - **Chat**: el Figma pide correo pero no dice qué pasa después — no
        hay endpoint de chat/ticket en la API SIBOX. Decisión tomada: se
        trata como un formulario de contacto ("déjanos tu correo, un asesor
        te escribe"), no un chat en vivo simulado. Envío va a
        `src/lib/soporte.ts` (`enviarContactoChat()`), stub que siempre
        resuelve `{ ok: true }` — falta decidir con backend/producto si esto
        termina siendo un lead a CRM, un webhook, o un widget de terceros
        (Zendesk/Intercom) antes de conectarlo de verdad.
        **Re-confirmado el 2026-08-14**: se buscó "chat"/"ticket"/"asesor"
        en las 3 fuentes de `../Documentacion/` (el PDF de la API completo
        vía `pdftotext`, y los dos `.docx` de pantallas/plan) — cero
        resultados. Si el sitio actual de Inbox ya tiene un chat en vivo,
        ese chat no es parte de la API SIBOX documentada; es casi
        seguro un widget de terceros (Zendesk/Intercom/WhatsApp Business
        o similar) integrado aparte, y conectarlo aquí requiere que el
        cliente diga cuál usa y sus credenciales — no hay endpoint propio
        que "activar".
      - **Widget siempre por encima del contenido**: el panel del chat
        (y el propio botón flotante) usan `z-[1150]` para quedar sobre el
        mapa de Leaflet de Cobertura (sus controles y paneles internos
        llegan a `z-index:1000`) y sobre el Navbar (`z-[1100]`), pero por
        debajo de los modales (`z-[1200]`) — ver sección "Reglas de
        z-index" más abajo si agregas un nuevo overlay.
      - **Ayuda**: buscador + acordeón de categorías con preguntas de
        ejemplo (`FAQ_TOPICS` hardcodeado en el mismo archivo) — contenido
        de relleno, pendiente que Inbox entregue las preguntas/respuestas
        reales.
- [x] **Modal de "Iniciar sesión"** (`src/components/auth/`) — Figma node
      `136:7385`, componente global (no de Home): `AuthProvider` envuelve
      todo en `layout.tsx` y expone `useAuth()` (`session`, `openLogin`,
      `closeLogin`, `login`, `logout`); el botón "Iniciar sesión" del
      `Navbar` solo llama `openLogin()`, así que el modal puede abrirse
      desde cualquier página sin volver a montarlo.
      - **Se quitó el botón "Iniciar sesión con Google"** del diseño: no
        hay endpoint OAuth en la especificación de la API SIBOX y el sitio
        actual tampoco lo tiene — decisión explícita del usuario
        (2026-08-12), no un olvido. Si el cliente lo pide más adelante, es
        un botón nuevo en `login-modal.tsx` + la integración OAuth
        correspondiente (NextAuth u otro), no algo que ya esté a medias.
      - Conectado a `src/lib/auth.ts` (`loginRequest()`), mismo patrón seam
        que el resto: hoy resuelve contra `src/lib/mock/auth.ts` (usuario
        `INBOX` / contraseña `Prueba`, el ejemplo exacto del PDF de la API).
        Al conectar el BFF real, importa recordar que `Login` responde
        `{success, mensaje, data}` — **no** `{resp:{result,data}}` como casi
        todos los demás endpoints (ver sección 4) — y que el token real debe
        quedar en una cookie Secure/HttpOnly puesta por el Route Handler,
        nunca devuelto al cliente (regla de seguridad 6).
      - Estados de error ya cubiertos en `login-modal.tsx`: campos vacíos
        ("Debe indicar el usuario/contraseña", mensaje real de la API),
        credenciales inválidas ("Usuario o contraseña incorrectos"), y un
        catch genérico para fallas de red una vez que sea un `fetch` real.
      - **`session` en `AuthProvider` es 100% de demo**: vive solo en
        estado de React, se pierde al recargar la página, no hay cookie ni
        persistencia. No construir nada encima asumiendo que es una sesión
        real — cuando exista el BFF, esto debe leer la sesión desde el
        servidor (cookie), no seguir siendo un `useState` local.
- [x] **Página `/cotizar`** (`src/app/cotizar/page.tsx` + `src/components/cotizar/*`)
      — Figma node `184:13498` ("cotizador"). El Figma muestra 7 frames
      apilados como estados independientes (cotizar, costo, confirmar, pago,
      pago2, pago2-completed, pago_exitoso); la implementación real es **un
      wizard de una sola página** con 4 pasos (`WizardStepper`:
      Cotizar/Costo/Confirmar/Pago) que avanza in-place y marca el paso
      anterior como completado (check verde, borde naranja, click para
      regresar) — así es como se leyó la intención del diseño, no como 7
      páginas separadas.
      - **Paso 1 Cotizar** (`step-cotizar.tsx`): origen/destino con CP,
        ciudad y colonia; tipo de entrega; tipo de envío; soporta *varios*
        paquetes (botón "+", cada uno con peso/medidas/cantidad) — el Figma
        solo mostraba uno, pero el array ya existe en
        `CotizacionInput.paquetes` para no rehacerlo cuando pidan
        multi-bulto.
      - **Paso 2 Costo** (`step-costo.tsx`): dos opciones calculadas por
        `obtenerCotizacion()` (mock en `src/lib/mock/cotizacion.ts` — no es
        la tarifa real de SIBOX, solo sensible a peso/volumen para que se
        sienta real en demo), cada una expandible ("Ver detalles") con
        desglose Flete/Servicios/IVA.
      - **Paso 3 Confirmar** (`step-confirmar.tsx`): formularios completos
        de remitente/destinatario (mismos campos que
        `wsGeneracionGuiaCliente`), seguro opcional (+$200), y el link
        "Inicia sesión" del Figma **sí está conectado** — abre el modal de
        `useAuth()` y, si ya hay sesión, ofrece autocompletar con el nombre
        de la cuenta.
      - **Paso 4 Pago** (`step-pago.tsx`, sub-estados internos: datos →
        método → tarjeta → éxito): genera un folio real vía `generarGuia()`
        al entrar, deja elegir tarjeta/PayPal/efectivo/cobrar al
        destinatario, y termina en la pantalla de éxito con fechas
        estimadas y botón Facturar.
        **`procesarPago()` en `src/lib/cotizacion.ts` NUNCA debe conectarse
        a un gateway real sin que alguien lo decida explícitamente** — todos
        los endpoints de pago están marcados "pendiente" en la
        especificación de la API (ver sección 4) y en el plan (semana 7,
        bloqueado por backend). Hoy solo simula una espera y regresa éxito;
        no envía datos de tarjeta a ningún lado.
      - **Puente Home → Cotizar**: el botón "Confirmar" de la tarjeta de
        cotización del Hero guarda lo ya escrito en `sessionStorage`
        (`src/lib/cotizacion-draft.ts`) y navega a `/cotizar`, que lo lee y
        limpia en el primer render. *Gotcha ya resuelto*: `StepCotizar`
        siembra su estado local desde la prop `initial` una sola vez (según
        el patrón de esta app, ver `login-modal.tsx`), así que
        `CotizarPage` NO debe montar `StepCotizar` hasta después de leer el
        draft (`ready` gate en `page.tsx`) — montarlo antes congela el
        formulario en los valores por defecto aunque el estado del padre se
        actualice después.
      - Todos los seams nuevos (`obtenerCotizacion`, `generarGuia`,
        `procesarPago` en `src/lib/cotizacion.ts`) siguen el mismo patrón
        que `sucursales.ts`/`rastreo.ts`/`auth.ts`: mock hoy, un `fetch` al
        BFF mañana, sin tocar los componentes.
      - El campo "Vencimiento" de la tarjeta y el número se auto-formatean
        (`06/28`, agrupado en 4) y hay un `CardPreview` en vivo que detecta
        la marca (Visa/Mastercard/Amex) por los dígitos iniciales — lógica
        100% cliente, sin API. Identificar el banco emisor (p.ej. "BBVA")
        sí requeriría un servicio externo de BIN-lookup, que **no** es parte
        de la especificación SIBOX — deliberadamente no se agregó.
- [x] **Modal "Datos de facturación"** (`src/components/facturacion/facturacion-modal.tsx`)
      — Figma node `317:14223`, se abre desde el botón "Facturar" de la
      pantalla de éxito en `/cotizar` (`step-pago.tsx`); no es un modal
      global como el de login porque hoy solo tiene un punto de entrada,
      pero está desacoplado (recibe `onClose`/`onSuccess`) para poder
      montarse desde cualquier otro lado sin refactor.
      - **Sube tu constancia fiscal → autocompleta el formulario**: el
        parseo real de PDF/XML no existe (no hay librería ni endpoint
        conectado) — `extraerDatosConstanciaFiscal()` en `src/lib/facturacion.ts`
        solo valida la extensión del archivo y regresa datos fijos después
        de una espera, documentado explícitamente como mock para no
        confundirlo con parsing real.
      - **CP → Estado/Ciudad/Colonia** sí está resuelto de verdad (dentro de
        lo mock): `src/lib/codigo-postal.ts` (`buscarCodigoPostal()`) es el
        seam de `BusquedaCP`, pensado para compartirse con cualquier otro
        campo de CP del sitio (los de Home/Cotizar siguen siendo texto
        libre y deberían migrar a este mismo seam en vez de duplicar la
        búsqueda). El campo "Especificar colonia" del Figma es el fallback
        para cuando la colonia deseada no viene en la lista que regresa el
        CP.
      - `guardarDatosFacturacion()` en `src/lib/facturacion.ts`: el plan de
        desarrollo describe el flujo de facturación pero **no nombra un
        endpoint concreto para guardar datos fiscales nuevos** (solo para
        consultar un RFC ya existente) — confirmar con backend cuál es
        antes de conectar esto de verdad.
- [x] **Página `/rastreo`** (`src/app/rastreo/page.tsx` + `src/components/rastreo/*`)
      — Figma node `362:37763`. Soporta varias guías a la vez: la lista vive
      en el query string (`/rastreo?guias=4159473741,4003229791`, coma-
      separado), no en `sessionStorage` como `/cotizar` — un link de rastreo
      es algo que tiene sentido compartir o guardar en favoritos, a
      diferencia de un borrador de cotización a medio llenar. El buscador
      "Buscar envío" de la propia página agrega guías a esa lista sin perder
      las que ya estaban.
      - El botón "Rastrear" del Hero de Home ahora navega aquí de verdad
        (`router.push('/rastreo?guias=...')`) en vez de no hacer nada — así
        es como pediste que funcionara.
      - Cada guía es un `RastreoCard` independiente con su propio estado de
        carga/no-encontrada; una guía que falla no rompe las demás.
      - El timeline de 4 pasos (Paquete recibido/En tránsito/En proceso de
        entrega/Entregado) **no viene así de la API** — `wsRastreo` regresa
        `Estatus` como texto libre ("EN RUTA", "DOCUMENTADA", etc.), no un
        enum de 4 etapas. `pasoDesdeEstatus()` en `src/types/rastreo.ts` es
        una heurística por palabras clave, marcada explícitamente como no
        autoritativa — revisar contra valores reales de producción cuando
        se conecte de verdad.
      - **"Código de rastreo" y "Fecha programada de entrega"** (columnas
        del Figma) tampoco están en la respuesta documentada de `wsRastreo`.
        Hoy el código de rastreo muestra la misma guía y la fecha usa el
        último `F_Estatus` como aproximación — están así de forma
        deliberada y comentados en `rastreo-card.tsx`; hay que preguntarle a
        backend de dónde deberían salir realmente antes de darlos por
        buenos.
      - "Ver detalles" trae el historial via el nuevo seam
        `rastrearGuiaDetalle()` (envuelve `RastreoDetalle`), cargado sólo la
        primera vez que se expande cada tarjeta (no de entrada, para no
        pedir datos que quizá nunca se vean).
      - Reutiliza el componente `Faq` de Home tal cual (las preguntas son
        genéricas, no específicas de una página).
- [x] **Página protegida `/envio`** (`src/app/envio/page.tsx` +
      `src/components/envio/*`) — Figma nodes `388:39626` (vista principal),
      `713:27881` (detalle) y `399:19075` (asignar nombre/alias).
      - Usa el `AuthProvider` global existente como gate: sin `session` abre
        automáticamente el modal de inicio de sesión y no muestra ni solicita
        la lista de envíos. Si se cierra el modal, queda un estado protegido
        con la opción de volver a abrirlo.
      - **Esto es solamente una demo cliente, no seguridad real**:
        `AuthProvider.session` vive en React y se pierde al recargar. Al
        conectar el BFF, la sesión debe validarse del lado servidor mediante
        cookie `Secure`, `HttpOnly` y `SameSite`, y cada consulta de guía debe
        aplicar autorización a nivel de objeto para impedir que una cuenta vea
        envíos ajenos.
      - Incluye búsqueda, selección de envío, timeline de 4 pasos calculado
        con la heurística no autoritativa `pasoDesdeEstatus()`, y tabla de
        detalle cargada bajo demanda desde el mock `RastreoDetalle`. El detalle
        se conserva en caché cliente después de la primera apertura.
      - El alias se edita en modal, se limita a 60 caracteres y persiste en
        `localStorage` con una clave compuesta por usuario + guía. Esa
        persistencia también es solo de demo; el BFF futuro debe guardar el
        alias asociado a la cuenta autenticada y autorizar cada guía.
      - La UI muestra la etiqueta visible **"Datos demo"**. Las fechas y el
        código de rastreo son aproximaciones porque la API documentada no
        expone todos los campos del Figma; tampoco existe aún un endpoint
        documentado para obtener el historial de envíos asociado a una
        cuenta.
      - El seam es `src/lib/envios.ts` y hoy resuelve contra
        `src/lib/mock/envios.ts`, listo para sustituirse por el BFF sin cambiar
        los componentes. Los CTA "Hacer un nuevo envío" y "Cotizar nuevo
        envío" navegan a `/cotizar`. La vista fue verificada manualmente en
        desktop y mobile, incluyendo login gate, búsqueda, selección, detalle,
        alias y CTA.
- [x] **Página `/somos`** (`src/app/somos/page.tsx` + `src/components/somos/*`)
      — Figma node `324:26623`. No trae seams nuevos: es una composición de
      piezas que ya existían para Home, tal como pediste ("la sección de tu
      inbox más cercana, será la misma de home").
      - `SomosHero` es una variante del banner de `Hero` de Home (mismas 4
        fotos rotando, mismo overlay oscuro) pero sin el buscador de rastreo;
        en su lugar tiene la tarjeta blanca de headline "Inbox, una solución
        confiable que crece contigo" superpuesta al borde inferior del
        banner, igual patrón de margen negativo que la quote card de Home.
      - `SomosHistoria` reproduce el contenido de `AboutUs` (mismas 4
        tarjetas: Nuestra historia / Conectamos destinos / Lo que nos mueve /
        Comprometidos contigo) pero **no es el mismo componente**: en el
        Figma de Somos no hay botón "Saber más" (sería un link circular a la
        propia página) y la imagen es una camioneta distinta
        (`/images/somos-auto.png`, exportada de Figma) en vez del camión de
        Home — layouts distintos, así que se separaron en vez de forzar
        props condicionales sobre `AboutUs`.
      - `Servicios`, `CoberturaCTA` y `Faq` se importan **tal cual** de
        `@/components/home/*` sin ningún wrapper — el Figma de Somos usa el
        mismo copy palabra por palabra. `Cobertura` (el mapa Leaflet) no se
        incluyó porque el Figma de esta página no lo muestra, solo la tarjeta
        de estado/ciudad de `CoberturaCTA`.
- [x] **Página `/cobertura`** (`src/app/cobertura/page.tsx` +
      `src/components/cobertura/estamos-donde.tsx`) — Figma node `362:38174`.
      Reutiliza el componente `Cobertura` de Home (el mapa Leaflet) tal cual,
      con un nuevo prop opcional `headlineImage` para el camión que el Figma
      de esta página pone junto al encabezado "Tu Inbox más cercana" (Home no
      lo pasa, así que ahí no cambia nada visualmente). Debajo va
      `EstamosDonde`, sección nueva y estática (2 tarjetas de stats + un mapa
      de México decorativo exportado de Figma como imagen — son ~900 paths
      SVG en el diseño original, no vale la pena recrearlos a mano). Arriba
      lleva un breadcrumb "Inicio > Cobertura" específico de esta página.
      - **Pin de sucursal → panel de información** (pedido explícitamente,
        Figma node `713:28003`): al hacer clic en un pin del mapa se abre un
        panel lateral (`SucursalPanel`, dentro de `cobertura.tsx`) con
        nombre, estatus abierto/cerrado (mismo heurístico de
        `estaAbiertoAhora()` que ya usaba `CoberturaCTA`), horario
        (`Observaciones`), dirección y teléfono. Es una mejora al
        componente `Cobertura` compartido, no algo exclusivo de esta
        página — el mismo clic-en-pin ahora funciona igual en el mapa de
        Home. Las pestañas "Descripción general / Opiniones / Acerca de" y
        el buscador dentro del panel son decorativos, tal como aparecen en
        el Figma (no hay nada que buscar dentro de la ficha de una sola
        sucursal).
      - Se quitó el `<Popup>` nativo de Leaflet que tenía cada marcador
        (`cobertura-map.tsx`) — mostraba la misma información dos veces
        (el popup de Leaflet y el panel nuevo) al mismo tiempo.
- [x] **Página `/soporte`** (`src/app/soporte/page.tsx` +
      `src/components/soporte/*`) — Figma node `341:27315`.
      - `SoporteHero`: encabezado "¿Tienes dudas? Pregunta a nuestro chat" +
        3 tarjetas (Llámanos, Envíanos un mensaje, ¡Síguenos en redes!). Las
        redes sociales reutilizan los mismos SVG que ya usaba `Footer`
        (`facebook.svg`/`instagram.svg`/`linkedin.svg`), solo más grandes.
        El Figma tiene una flecha decorativa apuntando al widget de chat;
        se quitó a pedido del usuario (2026-08-14) — se veía mal recortada
        junto al texto en varios anchos de pantalla.
      - `ContactoForm`: el formulario "¿Necesitas que te contactemos?"
        (nombre/correo/mensaje) es un seam nuevo,
        `enviarContactoSoporte()` en `src/lib/soporte.ts`, hermano de
        `enviarContactoChat()` que ya usaba el widget de chat — mismo
        problema (no hay endpoint de chat/ticket en SIBOX), pero se dejó
        como función separada en vez de generalizar la existente porque son
        dos flujos distintos en el Figma (uno dentro del widget global, uno
        en esta página) que podrían terminar en destinos distintos cuando
        backend decida. Botón "Enviar" deshabilitado hasta llenar los 3
        campos; al enviar limpia el formulario y muestra confirmación.
      - Reutiliza `CoberturaCTA` y `Faq` de Home **tal cual**, sin wrapper —
        mismo patrón que `/somos`.
- [x] **Página protegida `/perfil`** (`src/app/perfil/page.tsx` +
      `src/components/perfil/*`) — **sin diseño en Figma**, pedida
      explícitamente ("decide qué poner ahí... considerando la info de las
      APIs que tenemos"). Mismo patrón visual y de gate que `/envio`
      (breadcrumb, `font-display text-4xl/5xl`, badge "Datos demo",
      `neutral-bg`) para que las dos páginas de cuenta se vean como una
      familia. El Navbar ahora enlaza aquí: "Hola, {nombre}" es un link a
      `/perfil` en vez de solo texto (desktop y menú móvil).
      - **Decisión de alcance**: de todo lo que pedía el mensaje (perfil,
        direcciones, facturación, etc.), se armó solo lo que tiene una base
        real en la API SIBOX documentada, para no inventar features sin
        respaldo:
        - **Datos de mi cuenta**: solo lectura (`session.nombre` /
          `session.usuario`). No hay endpoint de perfil documentado más
          allá de `Login`, así que no se agregó edición de correo/teléfono
          — se dejó una nota explícita en la UI de por qué.
        - **Datos de facturación**: reutiliza `FacturacionModal` **tal
          cual** (antes solo se abría desde `step-pago.tsx`); se le
          agregaron props opcionales `usuario` y `datosIniciales` para
          poder reabrirlo aquí precargado y cachear el resultado. Esa
          caché es nueva: `obtenerDatosFacturacionGuardados()` /
          `guardarDatosFacturacionLocal()` en `src/lib/facturacion.ts`,
          en `localStorage` por usuario — **es solo para que la demo
          tenga algo que mostrar**, no simula un GET real (no hay
          endpoint documentado para "traer mis datos fiscales guardados",
          solo para consultar un RFC ya existente).
        - **Direcciones guardadas**: la pieza con más base real —
          `DomiciliosRecoleccionesCliente` sí es un endpoint documentado
          ("domicilios pre-registrados del cliente"). Seam nuevo en
          `src/lib/domicilios.ts` + `src/types/domicilio.ts` +
          `src/lib/mock/domicilios.ts`. **Solo la lectura tiene respaldo
          documentado** — no hay endpoint confirmado para crear/editar/
          eliminar un domicilio, así que agregar/editar/eliminar están
          implementados contra `localStorage` (mismo patrón que el alias
          de `/envio`) y quedan explícitamente marcados en el código como
          pendientes de confirmar con backend antes de conectarlos de
          verdad. El modal reutiliza el seam de `BusquedaCP`
          (`buscarCodigoPostal`) para autocompletar estado/ciudad, igual
          que `FacturacionModal`.
        - **Mis envíos**: no se duplicó nada — es solo una tarjeta con
          link a `/envio`, que ya existe.
      - Tests: `src/lib/domicilios.test.ts` cubre `validarDomicilio`, el
        sembrado desde el mock, y que un fallo de `localStorage` no finja
        éxito (mismo patrón que `envios.test.ts`).
- [x] Vitest configurado (`npm test`); la suite cubre lógica pura y flujos
      protegidos del perfil de envíos y de direcciones guardadas.
      Playwright/E2E sigue pendiente.
- [x] Ya existen todas las páginas que el Navbar/Footer enlazan: `/`,
      `/cotizar`, `/rastreo`, `/somos`, `/cobertura`, `/envio` (protegida),
      `/soporte`, `/perfil` (protegida, sin diseño en Figma).

## 8. Cómo correr el proyecto

```bash
cd repo
npm run dev     # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

Un `.claude/launch.json` en la raíz de `Inbox/` (un nivel arriba de `repo/`)
ya está configurado para levantar el dev server vía la herramienta de
preview del agente (`npm --prefix repo run dev`, puerto 3000).

## 9. Convenciones de código

- Componentes en PascalCase exportado con `export function X()`, archivo en
  kebab-case (`chat-bubble.tsx`, no `ChatBubble.tsx`).
- Todo texto de UI en **español** (es el idioma del sitio).
- Preferir Server Components por defecto; usar `"use client"` solo cuando
  haya estado/interacción (ya aplicado en `Navbar`, `Hero`, `Faq`,
  `ChatBubble`).
- No dupliques botones/inputs — extiende `components/ui/button.tsx` en vez de
  escribir estilos de botón inline en una sección nueva.
- Imágenes locales siempre vía `next/image` (ya configurado, no se necesitan
  dominios remotos en `next.config.ts` mientras los assets vivan en
  `public/`).

### Reglas de z-index

Escala fija (de menor a mayor) para que un overlay nuevo no tape ni quede
tapado por accidente — Leaflet (usado en el mapa de Cobertura) reserva
z-index hasta 1000 para sus propios controles/paneles, lo cual ya rompió el
Navbar una vez (2026-08-14) cuando este estaba en `z-50`:

| z-index | Qué lo usa |
|---|---|
| `z-40` y menores | Overlays internos de una sección (dropdowns del mapa `z-500`/`z-600`, el panel `SucursalPanel` de `cobertura.tsx`, etc.) — cualquier cosa que solo necesita ganarle a su propio contenido hermano. |
| hasta `z-index:1000` (no-Tailwind) | Reservado por Leaflet internamente (`.leaflet-top`/`.leaflet-bottom`, controles de zoom). No lo pises con nada por debajo de `z-[1100]` si esperas que quede encima del mapa. |
| `z-[1100]` | `Navbar` (sticky). |
| `z-[1150]` | `ChatWidget` flotante (botón + panel) — encima del Navbar y de Leaflet, pero por debajo de los modales. |
| `z-[1200]` | Modales de página completa (`LoginModal`, `FacturacionModal`, `DomicilioModal`, `NombreEnvioModal`) — siempre el nivel más alto, deben tapar cualquier otra cosa incluyendo el Navbar y el chat. |

Si agregas un overlay nuevo que compite visualmente con el Navbar, el chat o
un modal, usa esta tabla en vez de adivinar un número.
