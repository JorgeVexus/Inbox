# QA módulo por módulo (pre-Vercel)

Inicio: 2026-10-12. Se actualiza al terminar cada módulo. Estado: ⬜ pendiente · 🟨 en curso · ✅ verificado · ❌ con hallazgos abiertos.

Frentes por módulo: **F** funcionalidad y casos límite · **A** conexión con API (BFF/seam) · **R** responsividad (375, 768, 1024, 1440) · **X** accesibilidad, consola y red.

| # | Módulo | Estado |
|---|---|---|
| M1 | BFF y cliente SIBOX (`/api/*`, login, errores, privacidad) | ✅ |
| M2 | Endpoints SIBOX de solo lectura (contrato real vs. código) | ✅ (con hallazgos para conectar) |
| M3 | Layout global: Navbar, Footer, Chat, modal de login, AuthProvider | ✅ |
| M4 | Home (Hero, tarjeta de cotización, Servicios, Cobertura, CTA, About, FAQ) | ✅ |
| M5 | `/cotizar` (4 pasos) + modal de facturación | ✅ |
| M6 | `/rastreo` + rastreo del Hero y del chat | ✅ |
| M7 | `/cobertura` y `/somos` | ✅ |
| M8 | `/soporte` | ✅ |
| M9 | `/envio` | ✅ |
| M10 | `/perfil` (cuenta, facturación, direcciones, contactos) | ✅ |
| M11 | `/recoleccion` | ✅ |
| M12 | `/cuenta/crear`, `/cuenta/recuperar`, 404, error | ✅ |
| M13 | Transversal: seguridad (headers, secretos, dependencias), rendimiento, SEO, build | ✅ |

## Hallazgos y resultados
### M1 — BFF y cliente SIBOX ✅
Método: `curl` directo + BFF real (`next start`) detrás de un puente local que reenvía con `curl` (temporal, solo QA; evita el bloqueo B1 para poder validar la lógica con datos reales).
- Cloudflare sigue bloqueando a Node (B1): el BFF responde 503 genérico, sin mencionar Cloudflare/SIBOX; logs sin contraseña ni token.
- Con el puente: 4 guías reales (200), inexistente (404), vacía/SQLi/traversal/41 chars/no-string (400), JSON roto (400), body 20 KB (413), GET/PUT (405), OPTIONS (204 con headers de seguridad).
- 15 peticiones simultáneas con servidor frío → **1 solo Login** (single-flight).
- Privacidad: el JSON crudo de SIBOX trae `Recibio` y `Observaciones` con datos; el BFF los entrega siempre en `null` (verificado en 4 guías, 34 eventos). Sin correos ni base64 en las respuestas.
- Observaciones menores (no bloquean): se aceptan POST sin `Content-Type` (aceptable en endpoints de solo lectura; **exigir JSON y revisar `Origin` cuando haya mutaciones**); `POST /api/x` inexistente devuelve la página 404 en HTML; el detalle expone ids internos (`K_Historia_Guia`); `readJson` etiqueta cualquier respuesta no-JSON como "Cloudflare" aunque sea un 502 del origen.

### M2 — Contrato real de SIBOX vs. código ✅
Hallazgos (ya corregidos o fijados con pruebas en `src/lib/api/schemas/catalogos.ts`, **todavía no conectados a la UI**):
1. Ids como texto, `B_Ocurre`/`B_Frontera` "SI"/"NO", sin `D_Estado` en `ListadoOficinas`, coordenadas como texto y nulas en 39 de 71 → el mapa mostrará solo 32 pines (la tabla, las 71). Esquema probado con las 71 oficinas reales.
2. **`BusquedaCP` y `ObtenerHorariosPorCP` no devuelven vacío para un CP inexistente**: devuelven filas de otros CPs o el catálogo (lento). El esquema valida CP de 5 dígitos (rechaza 00000/99999) y trata respuestas con CPs mezclados como "no encontrado".
3. Colonias con tabuladores y fila falsa "Especifique Otra Colonia" (id −1): limpiadas.
4. `ObtenerHorariosPorCP` usa `Codigo_Postal`, no `CP` (con `CP` da error SQL).
5. **Bug real corregido**: `estaAbiertoAhora()` solo entendía "HH:MM - HH:MM"; 12 de 42 textos reales de horario (y 28 oficinas sin horario) mostraban "Cerrado" sin saberlo. Nuevo parser con días, "a"/"-", am/pm, turnos partidos y "CERRADO LOS JUEVES", hora de Ciudad de México, y tercer estado "Horario no disponible". 42/42 textos reales interpretados; 10 pruebas.
6. `DomiciliosRecoleccionesCliente` **ignora** `K_ClienteSIBOX` y responde con los domicilios de la cuenta del token (probado con cliente 1 → devolvió los de 63105). Bueno contra IDOR, pero implica que "Mis direcciones" por persona requiere login por cliente (B2).
7. `ObtieneDetalleCostos` sigue fallando (B3). `Cobertura` devuelve 553 filas con otro formato (minúsculas, horario en texto) y distinta de `ListadoOficinas` (71): decidir cuál alimenta el mapa.
8. Brecha de diseño: el cotizador usa CP y ciudad como texto libre; para el cálculo real hay que resolver CP → `K_Estado/K_Ciudad/K_Colonia` con `BusquedaCP` (hoy solo lo usan facturación y direcciones).


### Método de M3–M13
Servidor de producción (`next build` + `next start`), navegador integrado, auditor automático propio (desbordes, elementos fuera de pantalla, imágenes rotas, controles sin nombre, ids duplicados, encabezados, objetivos táctiles < 24 px) a **320, 375, 600, 768, 900, 1024, 1100, 1280, 1350, 1440 y 1920 px**; pruebas funcionales con datos válidos, vacíos, hostiles y teclado real; Lighthouse móvil (Chrome headless) en Home, Cotizar y Cobertura; `npm audit`.

### Bugs encontrados y corregidos en esta ronda (además de los de la ronda anterior)
**Responsividad**
- `/cotizar` a 1024 px: desborde horizontal de 191 px (Origen/Destino junto al menú de pasos). Confirmar: +257 px; Tarjeta: +22 px (la tarjeta de resumen ahora se apila hasta 1400 px).
- `/somos` a 1024 px: +90 px por la imagen de la camioneta.
- **Navbar con sesión iniciada a 1024 px**: el saludo + "Cerrar sesión" no cabían y desbordaban todas las páginas privadas. Ahora el nombre se trunca (probado con un nombre de 50 caracteres).
- Zonas táctiles < 24 px: campos de CP/ciudad del Hero, peso/medidas, flechas de cantidad, "Quitar guía", lupa de rastreo, links del pie, del login, breadcrumbs, "Editar/Eliminar" de perfil.
**Funcionalidad**
- 4 controles muertos conectados: lupas "Buscar sucursal" (Hero y cotizador → `/cobertura`), "Artículos prohibidos" (→ `/soporte`), lupa del Navbar (→ `/rastreo`).
- Hero: "Confirmar" sin validar peso/medidas; "SobrePaq" no mostraba campos; cantidad sin tope.
- `/rastreo`: aceptaba guías con markup y **sin límite** (una URL con cientos de guías = cientos de llamadas a SIBOX). Ahora formato válido y máximo 10, con aviso (`src/lib/guias.ts`, 5 pruebas).
- Cobertura: sin mensaje cuando la búsqueda no da resultados; filtros duplicados con el mismo nombre accesible; interruptores sin `aria-pressed`.
- Recolección: cantidad sin tope.
- Catálogo de CP de la demo ampliado (4 → 16) para que la demo no falle con el primer CP que escriba quien la pruebe.
- Páginas `/privacidad`, `/terminos`, `/trabaja-en-inbox` daban **404** desde el pie: ahora existen como "Próximamente" (sin texto legal inventado).
**Accesibilidad**
- Modales (login, facturación, dirección, contacto): foco atrapado, foco inicial, foco devuelto al cerrar, scroll de fondo bloqueado (`use-modal-a11y.ts`). Verificado con teclado real.
- Indicador de foco global (:focus-visible); antes casi todo tenía `outline-none`.
- Carrusel de servicios navegable por teclado; menú del Navbar a contraste completo.
- Títulos en `/cuenta/*` y 404.
**Rendimiento (Lighthouse móvil, antes → después)**: Cotizar 71 → 95 (CLS 0.39 → 0), Home 83 → 89, Cobertura 87 → 91. Mapa Leaflet ahora se carga solo al acercarse a esa sección.

### Pendientes que NO son de código (decisión o contenido del cliente)
1. **Contraste de la marca**: blanco sobre naranja `#ff6015` = 3.02:1 (AA pide 4.5 para texto < 18.7 px en negrita). Afecta botones y links. Un tono que sí cumple y se parece: `#CC4D11` (4.53:1). Requiere aprobación de marca; no se cambió. Placeholders en gris `#a9abaa` = 2.3:1.
2. **Contenido provisional**: las 4 preguntas del FAQ muestran **la misma respuesta genérica**; el FAQ del chat es de relleno; redes sociales apuntan a `facebook.com`/`instagram.com`/`linkedin.com` (sin la cuenta real); correos inconsistentes (`soporte@inbox.com.mx` en el FAQ vs `info@inbox.com.mx` en Soporte); falta el aviso de privacidad y los términos (obligatorio en México), y la bolsa de trabajo.
3. **Interruptor US/MX** del Hero: no se manda a ningún lado (el borrador de cotización no tiene país). Confirmar si hay envíos internacionales.
4. **"Recordarme"** del login es decorativo (la sesión demo vive en memoria).
5. **Teselas del mapa**: OpenStreetMap público tiene política de uso que no permite tráfico comercial intenso; para producción conviene un proveedor de teselas (MapTiler, Stadia, etc.) o un servidor propio.
6. **Mapa**: solo 32 de 71 oficinas reales traen coordenadas.
7. Rate limiting del BFF sigue pendiente (necesita almacén compartido, p. ej. Upstash Redis).
8. CSP completa con nonce y pruebas E2E automatizadas (Playwright).
