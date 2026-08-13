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
- [ ] **El resto de Home sigue estático/local** — el rastreo aún no llama a
      la API SIBOX (ni al BFF, que no existe todavía). Siguiente paso
      lógico: crear `src/lib/api/` con el cliente tipado + Route Handlers
      reales, empezando por `wsRastreo` (ya tiene el seam listo en dos
      lugares: hero y chatbot) según el plan semana 1.
- [ ] Sin páginas adicionales (`/rastreo`, `/envio`, `/cobertura`, `/somos`,
      `/soporte`) — el Navbar/Footer ya enlazan a esas rutas pero no existen
      todavía (404 en Next hasta que se creen).
- [ ] Sin pruebas automatizadas (Vitest/Playwright) todavía.
- [ ] No se ha hecho el primer commit/push al remoto de GitHub.

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
