# Runbooks de operación — Inbox web

Qué hacer cuando algo falla en producción. Cada runbook sigue el mismo orden: **síntoma → cómo confirmarlo → qué hacer → qué decirle a la gente → después**. Si es tu primera vez, lee §1 y §2 y luego el runbook que corresponda; no hace falta entender todo el sistema.

> Estado: escritos en la revisión 360° (Fase 6) **antes** del primer despliegue. Cada uno debe ensayarse una vez en el ambiente real (ver §10) y corregirse con lo que se aprenda.

## 1. Cómo se ve la salud del sitio

| Herramienta | Qué muestra | Dónde |
|---|---|---|
| `GET /api/salud` | `{estado, sibox, version, hora}`. `sibox`: `ok` (hay sesión con SIBOX), `degradado` (el último Login falló y está en enfriamiento de 30 s), `desconocido` (arranque en frío, aún no se ha intentado) | `https://<dominio>/api/salud` |
| Registros de Vercel | Una línea JSON por error del servidor: `{"nivel":"error","evento":"…","detalle":"…","requestId":"…","t":"…"}` (datos personales enmascarados) | Vercel → proyecto → Logs |
| Encabezado `X-Request-Id` | Todas las respuestas de `/api/rastreo*` lo traen. Si alguien reporta un fallo, pídele el valor (o la hora y la guía): con él se encuentra la línea exacta | Pestaña Network del navegador |
| Despliegues | Qué versión está en producción y desde cuándo; `version` de `/api/salud` coincide con los 7 primeros caracteres del commit | Vercel → Deployments |

**Buscar un error por requestId:** Vercel → Logs → buscar el valor del `X-Request-Id`.

## 2. Monitoreo y alertas recomendados (por configurar)

Decisión pendiente (ver `docs/fases/REVISION_360_FASES.md`, Fase 6): qué servicio usar. Opciones gratuitas o baratas: **UptimeRobot** (50 monitores gratis, 5 min), **Better Stack** (monitores + página de estado), **Vercel Checks**. Mínimo recomendado:

| Monitor | Qué comprueba | Frecuencia | Alerta si… |
|---|---|---|---|
| Disponibilidad | `GET /api/salud` → 200 y el texto `"estado":"ok"` | 1 min | 2 fallos seguidos |
| Página pública | `GET /` y `GET /rastreo` → 200 | 5 min | 2 fallos seguidos |
| Rastreo extremo a extremo | `POST /api/rastreo` con `{"Guia":"4003229791"}` (la guía de prueba) → 200 | 5 min | 2 fallos seguidos (indica SIBOX o Cloudflare) |
| Certificado y dominio | Vencimiento del certificado TLS y del dominio | diario | < 21 días |
| Tasa de errores | Líneas `"nivel":"error"` por hora en los registros | continuo | > 20 en 10 min |

Notas: el límite de peticiones permite hasta 60 consultas por minuto a `/api/salud` y 30 a `/api/rastreo` por IP, de sobra para estos monitores. **El monitor de rastreo gasta cupo de SIBOX**: 5 min = 288 llamadas al día, aceptable; no bajar de ahí.

### Sentry (decisión pendiente)
Hoy **no hay** servicio de captura de errores externo. Los errores del servidor van a los registros de Vercel (con `instrumentation.ts`, ya enmascarados) y los del navegador **no se capturan**. Para producción se recomienda Sentry (plan gratuito suficiente al inicio): captura errores del navegador con contexto, agrupa y avisa. Costo técnico: ~+30–50 KB de JavaScript en el navegador (afectaría el presupuesto de rendimiento de la Fase 5; se puede cargar de forma diferida) y configurar `beforeSend` para **no enviar datos personales** (correos, teléfonos, RFC, direcciones; mismas reglas que `src/lib/api/log.ts`). El punto de enganche del servidor es `src/instrumentation.ts`.

## 3. Quién es quién (completar antes de lanzar)

| Rol | Nombre | Contacto | Cuándo se le llama |
|---|---|---|---|
| Responsable técnico del sitio | _por definir_ | _por definir_ | Cualquier incidente |
| Soporte de Inbox (cliente) | _por definir_ | _por definir_ | Quejas de clientes, caída de SIBOX |
| Sistemas de Inbox / SIBOX (backend) | _por definir_ | _por definir_ | R1 y R2 |
| Administrador de Cloudflare del cliente | _por definir_ | _por definir_ | R2 |
| Administrador de Vercel / GitHub | _por definir_ | _por definir_ | R5, R3 |
| Legal / Responsable de datos personales | _por definir_ | _por definir_ | R4 |
| Dirección | _por definir_ | _por definir_ | Incidente de datos, caída > 1 h |

## R1. SIBOX no responde o responde con errores

**Síntoma:** rastreo muestra "No pudimos consultar tu envío" o "El servicio tardó demasiado"; las respuestas de `/api/rastreo` son 502/504; en los registros hay líneas `SIBOX respondio result:1` o `SIBOX no respondio a tiempo`.
**Confirmar:** (1) `/api/salud` → `sibox: "degradado"`; (2) probar a mano con `curl` desde otra red el `Login` de SIBOX (ver `INDICE_MAESTRO.md` §9); (3) preguntar a Sistemas de Inbox si hay mantenimiento.
**Hacer:**
1. Si es SIBOX: no hay nada que arreglar de nuestro lado. El sitio **degrada con gracia** (mensajes genéricos, sin datos internos) y no martilla a SIBOX: tras un Login fallido espera 30 s antes de reintentar.
2. Avisar a Sistemas de Inbox con la hora y 2–3 `requestId` de ejemplo.
3. **No** poner el sitio en modo demo para "tapar" el error: mostraría datos de ejemplo como si fueran reales (por eso el modo demo solo se usa en desarrollo y previews). Es preferible dejar el mensaje de error.
**Decir:** "El rastreo no está disponible por un problema con el sistema de guías; el resto del sitio funciona. Estamos en contacto con el proveedor."
**Después:** anotar duración y causa en la bitácora del `INDICE_MAESTRO.md`.

## R2. Cloudflare bloquea al servidor (reto 403)

**Síntoma:** todas las consultas de rastreo fallan con 503 "El servicio no está disponible por el momento"; en los registros: `Cloudflare bloqueo la peticion a /Login (reto anti-bot)`. Es el bloqueo **B1** que existe hoy.
**Confirmar:** `curl` con los mismos encabezados **pasa** y Node/`fetch` **no** (huella TLS). Anotar el **Ray ID** del encabezado `cf-ray` de la respuesta bloqueada.
**Hacer:** pedir al administrador de Cloudflare del cliente una regla WAF personalizada con acción *Skip* (o IP Access Rule *Allow*) para la IP de salida del servidor y los hosts `apitest.inbox.com.mx` / `api.inbox.com.mx`; el modo "Bot Fight" no se puede saltar con una regla de IP. Mensaje listo en `docs/mensajes/2026-10-12-cliente.md`. Recordar que en Vercel la IP de salida **cambia** salvo con IPs estáticas o proxy propio (B5): si la IP cambió, la regla deja de funcionar.
**Decir:** igual que R1.

## R3. Rotar la credencial de servicio de SIBOX

**Cuándo:** antes de producción (la actual es de pruebas), si se sospecha filtración, si sale alguien con acceso, o cada 6–12 meses.
**Pasos:**
1. Pedir a Sistemas de Inbox una credencial nueva (usuario y contraseña) por un canal seguro (gestor de contraseñas; **nunca** chat o correo).
2. En Vercel → Settings → Environment Variables: actualizar `SIBOX_SERVICE_USER` y `SIBOX_SERVICE_PASSWORD` **en el ambiente que corresponda** (Preview y Production por separado).
3. Redesplegar (las variables se leen al arrancar; un despliegue nuevo las toma).
4. Comprobar: `/api/salud` y una consulta de rastreo real. Si `sibox` queda `degradado`, revisar que no haya espacios sobrantes y que el usuario esté bien escrito.
5. Pedir a Sistemas que **revoquen la credencial anterior**.
6. Actualizar `.env.local` local de quienes desarrollan (cada quien por su cuenta).
**Si se filtró:** hacer 1–5 de inmediato, y revisar en el historial de git y los registros que no haya quedado escrita (ver `docs/fases/REVISION_360_FASES.md`, Fase 2, §2: el historial está limpio a 2026-10-20).

## R4. Incidente de datos personales (sospecha o confirmación)

**Ejemplos:** una persona ve datos de otra; se publica un registro con correos; se pierde un equipo con acceso; alguien reporta que ve su RFC en un lugar indebido; la credencial de servicio se filtra.
**Hacer, en este orden:**
1. **Contener**: si hay una ruta o función implicada, retirarla (rollback, R5, o desactivar la ruta). Rotar credenciales si aplica (R3). No borrar registros: servirán para investigar.
2. **Avisar de inmediato** al Responsable de datos personales y a Dirección (tabla §3). No esperar a entender todo.
3. **Reunir hechos**: qué datos, de cuántas personas, desde cuándo, cómo se descubrió, `requestId` implicados.
4. **Legal decide** si hay obligación de notificar a las personas y a la autoridad, y en qué plazo (la ley de protección de datos de particulares cambió en 2025 y la autoridad competente también: **Legal debe confirmar el procedimiento vigente**).
5. **Corregir la causa** y agregar una prueba automática que la detecte (como se hizo con la fuga del rastreo en 2026-10-12: `src/lib/api/schemas/rastreo.test.ts`).
6. Registrar el incidente y las lecciones en `docs/` (sin datos personales).

## R5. Reversión (rollback) de un despliegue malo

**Síntoma:** después de publicar, algo se rompió (páginas en blanco, errores, comportamiento incorrecto).
**Hacer (≈ 2 minutos, no requiere código):**
1. Vercel → proyecto → **Deployments**.
2. Buscar el último despliegue de producción que funcionaba (su `version` = commit; se compara con `/api/salud`).
3. Menú del despliegue → **Promote to Production** / **Instant Rollback**. El dominio cambia al instante; no se reconstruye nada.
4. Comprobar `/api/salud` y 2–3 páginas. La `version` debe ser la del despliegue anterior.
5. En GitHub: revertir el commit malo (`git revert <sha>`) o corregir sobre una rama; **no** reescribir `main`.
**Ojo:** el rollback revierte el código pero **no** las variables de entorno ni el DNS. Si el problema vino de una variable, corregirla (y redesplegar), no hacer rollback.

## R6. Tráfico anómalo o abuso

**Síntoma:** muchas respuestas 429; picos de peticiones a `/api/rastreo*`; alguien enumerando guías.
**Confirmar:** en los registros, volumen y IP (no se registran IP: ver el panel de Vercel → Observability). El límite actual es **en memoria** (B12): cada instancia cuenta por separado, así que un atacante distribuido puede exceder el límite real.
**Hacer:** (1) Vercel → Firewall → regla temporal para bloquear/limitar la IP o el país; (2) si es sostenido, activar el almacén compartido del límite (B12) y reglas WAF; (3) si consume el cupo de SIBOX, avisar a Sistemas. **Nada de esto requiere cambiar código.**

## R7. El Login a SIBOX entra en "enfriamiento" repetido

**Síntoma:** `/api/salud` muestra `sibox: "degradado"` varias veces seguidas; los errores se repiten cada ~30 s.
**Causa probable:** credencial incorrecta/vencida/bloqueada (R3), Cloudflare (R2) o SIBOX caído (R1). Mirar la línea de error más reciente para distinguirlas.

## R8. El sitio no abre en absoluto

1. ¿Es el dominio? `nslookup <dominio>`; ¿venció el dominio o el certificado?
2. ¿Es Vercel? Revisar `https://www.vercel-status.com/` y el panel (despliegue en error).
3. Si el último despliegue es reciente: **R5 (rollback)** primero, investigar después.
4. Avisar a Dirección si pasa de 15 minutos.

## 9. Continuidad (respaldos)

| Qué | Dónde vive | Respaldo |
|---|---|---|
| Código | GitHub (`JorgeVexus/Inbox`) | Cada colaborador tiene un clon; se recomienda un espejo mensual |
| Variables de entorno | Vercel | **No** están en el repositorio: mantener una lista de nombres (no de valores) en `docs/DESPLIEGUE.md` y los valores en el gestor de contraseñas de la empresa |
| Credencial de SIBOX | Gestor de contraseñas | Sistemas de Inbox puede emitir otra |
| Documentación de la API (PDF, plan, pantallas) | `../Documentacion/` (fuera de git) | **Copia privada compartida pendiente** |
| Diseños | Figma (`uET8lmz7lTswi429zz8n8C`) | Del cliente |
| Imágenes originales de gran tamaño | `../originales-imagenes/` (fuera de git) | Incluir en el respaldo compartido |
| DNS | Proveedor del dominio | Exportar la zona antes de cualquier cambio |

## 10. Simulacros (lo que falta ensayar en el ambiente real)

Registrar fecha, quién participó y qué se corrigió.

| Simulacro | Hecho en local (2026-10-20) | Falta en Vercel |
|---|---|---|
| R1/R2 SIBOX caído / Cloudflare bloquea | ✅ ver Fase 6 §3.4 (el bloqueo de Cloudflare es real hoy) | Repetir contra la preview |
| R3 Rotación de credencial | ❌ | Con una credencial de pruebas, de punta a punta |
| R5 Rollback | ❌ (no hay despliegue todavía) | Publicar dos versiones y revertir; medir tiempo |
| R4 Incidente de datos | ❌ | Ejercicio de mesa con Legal y Dirección (1 h) |
| Alertas | ❌ | Apagar a propósito `/api/salud` y comprobar que llega el aviso |
