# Diccionario de seams y mocks

Un **seam** es la única función por la que la interfaz pide un dato (`src/lib/*.ts`). Hoy casi todos leen de un **mock** (`src/lib/mock/*`, datos de ejemplo con la forma de la API real); conectar la API real es cambiar el cuerpo de la función, sin tocar componentes (ADR 0002). Estado a **2026-10-20**.

Leyenda: 🟢 real (BFF) · 🟡 mock con endpoint real ya probado · 🔴 mock sin endpoint disponible · 🟣 local (solo navegador, sin servidor).

## Resumen

| Seam (archivo) | Función(es) | Hoy | Endpoint SIBOX | Estado | Bloqueo |
|---|---|---|---|---|---|
| `rastreo.ts` | `rastrearGuia`, `rastrearGuias`, `rastrearGuiaDetalle` | **BFF** (`/api/rastreo`, `/api/rastreo/detalle`) o mock `mock/rastreo.ts` según `NEXT_PUBLIC_SIBOX_REAL` | `wsRastreo`, `RastreoDetalle` | 🟢 conectado (en demo por B1) | B1 |
| `sucursales.ts` | `getSucursales`, `getEstados`, `getCiudades` | `mock/sucursales.ts` (muestra) | `ListadoOficinas` (71 oficinas reales; esquema en `api/schemas/catalogos.ts`) | 🟡 | Falta la ruta `/api/sucursales` y B1 |
| `codigo-postal.ts` | `buscarCodigoPostal` | `mock/codigos-postales.ts` | `BusquedaCP` (esquema listo) | 🟡 | Ruta `/api/codigo-postal` y B1 |
| `recoleccion.ts` | `obtenerHorariosPorCP`, `programarRecoleccion` (+ funciones puras de fechas) | `mock/recoleccion.ts` | `ObtenerHorariosPorCP` (🟡), `wsGeneracionRecoleccion` (🔴) | Mixto | El `K_Cliente` por persona (B2) |
| `cotizacion.ts` | `obtenerCotizacion` | `mock/cotizacion.ts` (fórmula de ejemplo) | `ObtieneDetalleCostos` (falla en pruebas) | 🔴 | **B3** |
| `cotizacion.ts` | `generarGuia` | folio aleatorio | `wsGeneracionGuiaCliente` | 🔴 | ¿Qué `K_Cliente` para invitados? |
| `cotizacion.ts` | `procesarPago` | simula espera y éxito; **nunca** envía datos de tarjeta | Pagos (no existen) | 🔴 | **B4** — no conectar sin decisión explícita |
| `auth.ts` | `loginRequest` | `mock/auth.ts` (`INBOX`/`Prueba`) | Registro/login de usuario final (no existen) | 🔴 | **B2** |
| `envios.ts` | `listarEnvios`, `obtenerDetalleEnvio`, `asignarNombreEnvio` | `mock/envios.ts` + alias en `localStorage` | Historial por cuenta (no existe) | 🔴/🟣 | B2 |
| `domicilios.ts` | `listarDomicilios`, `guardarDomicilio`, `eliminarDomicilio` | `mock/domicilios.ts` + `localStorage` | `DomiciliosRecoleccionesCliente` (solo lectura; ignora `K_ClienteSIBOX`) | 🟡/🟣 | B2; no hay endpoint de alta/baja |
| `contactos.ts` | `listarContactos`, `guardarContacto`, `eliminarContacto` | `mock/contactos.ts` + `localStorage` | Sin endpoint (preguntado al cliente) | 🔴/🟣 | B2 |
| `facturacion.ts` | `guardarDatosFacturacion`, `obtenerDatosFacturacionGuardados` | `localStorage` | Sin endpoint de alta de datos fiscales | 🔴/🟣 | Preguntar a backend |
| `facturacion.ts` | `extraerDatosConstanciaFiscal` | datos fijos de `mock/facturacion.ts` (no lee el archivo) | Sin endpoint | 🔴 | Definir si habrá lectura de constancia |
| `soporte.ts` | `enviarContactoChat`, `enviarContactoSoporte` | simula éxito; **no envía nada** | Sin endpoint de chat/ticket | 🔴 | **B8** (decidir destino: correo, CRM, webhook o chat de terceros) |
| `cotizacion-draft.ts` / `cotizacion-draft-lectura.ts` | guardar/leer borrador Home → `/cotizar` | `sessionStorage` | — | 🟣 (es definitivo) | Ninguno |

## Cómo conectar un seam (receta)

1. **Esquema Zod** de entrada y salida en `src/lib/api/schemas/` (estricto en la entrada; la salida debe quitar datos personales que el navegador no necesita). Si ya existe (catálogos, rastreo), úsalo.
2. **Ruta del BFF** en `src/app/api/<nombre>/route.ts` con `proxySibox()`: declara `endpoint`, esquemas, mensajes y **`limite`** (ver `rate-limit.ts`), y `maxDuration = 25`.
3. **Cambiar el seam**: que llame a `fetch("/api/<nombre>", { method: "POST", headers: { "Content-Type": "application/json" }, body })`. Distinguir "no existe" (404 → `null`) de "falló" (lanzar error con mensaje para la persona), como hace `rastreo.ts`.
4. **Pruebas**: esquema contra respuestas reales grabadas (fixtures), la ruta con `proxySibox` simulado, y el seam con `fetch` simulado. Agregar el caso 429.
5. **Retirar el mock** y su importación; borrar el almacenamiento local equivalente si lo hubiera.
6. **Cuidado con la identidad**: cualquier `K_Cliente`/`K_ClienteSIBOX` sale de la sesión **del servidor**, jamás del navegador (esquemas estrictos ya lo impiden). Autorizar por objeto antes de devolver una guía, domicilio o factura.
7. **Marcar** en `INDICE_MAESTRO.md` §3–§4 la fecha y el estado, y quitar el aviso "Datos de demostración" de esa pantalla.

## Reglas
- Los componentes **nunca** importan de `src/lib/mock/*`.
- Un mock conserva la forma exacta de la API real (nombres de campo incluidos).
- Todo lo simulado se ve como simulado en la interfaz ("Datos de demostración").
