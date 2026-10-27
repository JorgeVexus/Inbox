# Guía de despliegue y variables de entorno

Cómo se publica el sitio, qué variables necesita cada ambiente y qué verificar antes de cambiar el dominio. Pensada para que alguien que **nunca** ha desplegado un sitio como este pueda hacerlo con la guía y un administrador a un lado.

> Estado: **nada está desplegado todavía** (B-Vercel, `INDICE_MAESTRO.md` §6). Esta guía se escribió sin poder probarla contra Vercel; la primera vez hay que seguirla paso a paso y corregir lo que falle.

## 1. Los tres ambientes

| Ambiente | Para qué | Cómo se crea | Datos |
|---|---|---|---|
| **Desarrollo** | Programar en tu computadora | `npm run dev` (`http://localhost:3000`) | Demo (simulados) o SIBOX de pruebas con `.env.local` |
| **Preview** | Que el cliente y el equipo vean un cambio **antes** de publicarlo | Vercel crea una dirección propia por cada rama / pull request | SIBOX de **pruebas** |
| **Producción** | El sitio real, con el dominio de Inbox | Se publica al unir un cambio a `main` | SIBOX de **producción** (cuando exista acceso) |

Regla: lo que no funciona en preview no se une a `main`.

## 2. Variables de entorno

Se definen en Vercel → Settings → Environment Variables, **una por ambiente** (Production / Preview / Development). Los valores **nunca** van al repositorio ni a chats; se guardan en el gestor de contraseñas de la empresa.

| Variable | Producción | Preview | Qué es | Secreto |
|---|---|---|---|---|
| `SIBOX_API_BASE_URL` | `https://api.inbox.com.mx` (pendiente: sin acceso, B6) | `https://apitest.inbox.com.mx` | Dirección de la API. Solo `https://` | No |
| `SIBOX_SERVICE_USER` | credencial de **producción** | credencial de pruebas (`TESTWB2025`) | Cuenta de servicio de SIBOX | **Sí** |
| `SIBOX_SERVICE_PASSWORD` | credencial de **producción** | credencial de pruebas | Contraseña de esa cuenta | **Sí** |
| `SITE_URL` | `https://<dominio final>` sin diagonal final | (vacío: usa la dirección del preview) | Dirección pública para `sitemap`, `robots` y Open Graph | No |
| `NEXT_PUBLIC_SIBOX_REAL` | `1` **solo cuando** B1 esté resuelto y rastreo real validado | `1` solo si el preview alcanza a SIBOX | Activa el rastreo real; sin ella el sitio corre en modo demo (con aviso visible) | No |
| `RATE_LIMIT_DISABLED` | **no definir** | **no definir** | Solo para pruebas E2E locales (se ignora en Vercel) | No |

Vercel pone solas: `VERCEL`, `VERCEL_GIT_COMMIT_SHA` (versión en `/api/salud`), `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`.

**Reglas de las variables:** (1) cualquier nombre que empiece con `NEXT_PUBLIC_` **se publica en el navegador**: jamás credenciales ni direcciones sensibles. (2) Cambiar una variable no cambia lo ya publicado: hay que redesplegar. (3) Producción y preview **no comparten** credenciales.

## 3. Primera publicación (una sola vez)

Quién: administrador de GitHub y de Vercel. Tiempo: ~1 hora.

1. **Cuenta y equipo**: crear el equipo en Vercel con 2FA obligatorio para todos los miembros. Plan **Pro** recomendado (previews protegidos, varias regiones, Instant Rollback, Analytics de eventos).
2. **Importar el proyecto**: Vercel → Add New → Project → elegir `JorgeVexus/Inbox`. Directorio raíz: la carpeta del repositorio (donde está `package.json`). Framework: Next.js (lo detecta solo). Comandos por defecto.
3. **Variables**: cargar la tabla de §2 (Production y Preview).
4. **Región**: ya está en `vercel.json` (`dfw1`, Dallas). Confirmar con Sistemas de Inbox dónde está su servidor.
5. **Proteger los previews**: Settings → Deployment Protection → *Vercel Authentication* (o contraseña) para Preview. Para que el cliente los vea sin cuenta: contraseña compartida o *Shareable Links*.
6. **Primer despliegue** y comprobar: `/api/salud` → `{"estado":"ok",…}`; las 6 páginas públicas; `/sitemap.xml` y `/robots.txt` con el dominio correcto.
7. **IP de salida** (B5): decidir entre Vercel Static IPs (~$100 USD/mes), proxy propio o servidor propio; pasar la **IPv4** a Sistemas de Inbox para el whitelist (solo IPv4: el servidor ya prefiere IPv4 y las IPv6 cambian). Verificar con `/api/salud` y una consulta real que Cloudflare deja pasar esa IP; B1 se resolvió en pruebas el 2026-10-27, pero es otra IP y otro host (`api.inbox.com.mx`).
8. **GitHub**: proteger `main` (PR obligatorio, CI en verde, sin *force push*), activar *secret scanning*, Dependabot y CodeQL (ver Fase 2).
9. **Monitoreo**: configurar los monitores de `docs/RUNBOOKS.md` §2.
10. **Analítica**: activar Speed Insights / Web Analytics (decisión pendiente, Fase 5 §4).

## 4. Publicación del día a día

1. Cambio en una rama → *pull request* → CI debe pasar (`calidad`, `e2e`, y `seguridad`).
2. Vercel crea el **preview**: revisarlo (y mostrarlo al cliente si aplica).
3. Unir a `main` → Vercel publica en producción solo.
4. Comprobar `/api/salud` (la `version` debe ser el commit nuevo) y una consulta de rastreo.
5. Si algo sale mal: **rollback** (`docs/RUNBOOKS.md` R5).

## 5. Checklist de salida a producción (corte)

Marcar cada punto con fecha y responsable. **No se cambia el DNS hasta que todos los puntos de "Antes" estén en verde.**

### 5.1 Pregunta previa (decide qué ruta seguir)
- [ ] **¿Existe hoy un sitio público de Inbox que este rediseño reemplace?** (Pendiente de confirmar con el cliente; su plataforma es desconocida.)
  - **Sí →** seguir §5.2 y §5.3.
  - **No →** seguir §5.2 y §5.4.

### 5.2 Antes (comunes)
- [ ] Rastreo real funcionando desde el servidor **de producción** (B1 se resolvió para pruebas el 2026-10-27; falta confirmar la IPv4 de producción y `api.inbox.com.mx`).
- [ ] B2–B4 resueltos o **ocultos** (B9: login, envíos, perfil, recolección, cotizador y pago son demo; no lanzar mostrándolos como reales).
- [ ] B8 resuelto: los formularios de contacto envían a un destino real (o se quitan).
- [ ] B10/B13: contenido real (FAQ, pie, redes, correos, teléfonos) y **aviso de privacidad y términos publicados** y revisados por Legal.
- [ ] Credenciales de **producción** de SIBOX y rotación de las de prueba (`docs/RUNBOOKS.md` R3).
- [ ] B12: almacén compartido para el límite de peticiones.
- [ ] B11: proveedor de teselas del mapa decidido.
- [ ] Monitores y alertas configurados; **simulacro de rollback hecho** (R5) y simulacro de incidente de datos (R4).
- [ ] Contactos de escalamiento completos (`docs/RUNBOOKS.md` §3).
- [ ] UAT aprobado (`docs/uat/PLAN_UAT.md`).
- [ ] Lighthouse y E2E en verde sobre el preview final; `SITE_URL` con el dominio final.
- [ ] HSTS con `preload` **solo** si el dominio ya es definitivo (después no es fácil volver atrás).

### 5.3 Si existe un sitio actual: migración
- [ ] **Inventario**: lista de URLs del sitio actual (mapa del sitio, analítica, Search Console) y de sus funciones (formularios, integraciones, scripts, chat de terceros, píxeles).
- [ ] **Paridad**: cada función del sitio actual está en el nuevo, o hay decisión escrita de retirarla.
- [ ] **Mapa de redirecciones 301** viejo → nuevo para toda URL que tenga tráfico o enlaces entrantes; probado en el preview.
- [ ] Títulos y descripciones relevantes conservados; Search Console verificado **antes** del corte.
- [ ] **TTL del DNS reducido** a 300 s al menos 48 h antes.
- [ ] Ventana de corte acordada (baja demanda, con el equipo presente) y **plan de vuelta atrás**: volver el DNS al sitio anterior (el valor viejo anotado de antemano).
- [ ] Monitoreo reforzado **72 h** después del corte.

### 5.4 Si no existe un sitio actual: alta desde cero
- [ ] Dominio comprado/transferido a nombre de Inbox (con 2FA y renovación automática).
- [ ] Registros DNS hacia Vercel; certificado TLS emitido; `www` y raíz redirigen a una sola versión.
- [ ] Si el dominio envía correo (soporte@, info@): SPF, DKIM y DMARC configurados.
- [ ] Alta en Search Console y envío del `sitemap.xml`.

### 5.5 Durante el corte
1. Confirmar rollback listo (despliegue anterior identificado).
2. Cambiar DNS / asignar dominio.
3. Verificar certificado, `/api/salud`, 6 páginas, rastreo real y formularios.
4. Anunciar al equipo; abrir canal de incidentes.

### 5.6 Después (72 h)
- [ ] Revisar registros de errores cada hora el primer día.
- [ ] Revisar Search Console (cobertura, errores 404 nuevos) y la analítica.
- [ ] Quitar `continue-on-error` del trabajo de Lighthouse en CI si ya es estable.
- [ ] Anotar el corte en la bitácora de `INDICE_MAESTRO.md`.
