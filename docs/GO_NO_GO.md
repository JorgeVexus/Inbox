# Acta Go / No-Go — Rediseño web de Inbox

**Fecha de la evaluación:** 20 de octubre de 2026 · **Versión evaluada:** `main` (commit indicado al final) · **Evaluador:** revisión 360° (asistente de desarrollo) · **Decide y firma:** responsable del cliente y responsable del proyecto (§9)

> Este documento resume la revisión 360° (`docs/fases/REVISION_360_FASES.md`, fases 0–7) y la convierte en una decisión. **La recomendación no es una firma**: es lo que la evidencia sostiene hoy. Se puede repetir con `npm run qa:todo` y actualizar el tablero cuando cambie algo.

---

## 0. Actualización del 27 de octubre de 2026

- **B1 (Cloudflare) quedó resuelto.** La causa no era la huella TLS de Node (diagnóstico nuestro, erróneo) sino que la petición salía por **IPv6**, que el cliente no tenía autorizada. El BFF ahora usa IPv4 primero y **el rastreo real funciona de punta a punta** (probado con las 4 guías de prueba y en la interfaz). Efecto en el tablero: **los hallazgos altos abiertos bajan de 3 a 2** (formularios que no envían, límite por instancia); lo demás no cambia. Falta confirmar lo mismo con la IPv4 de producción y `api.inbox.com.mx`.
- **Next.js 16.4.0 tenía una vulnerabilidad crítica nueva** (publicada después del 20-oct; RCE en el optimizador de imágenes con SVG, DoS en Server Actions, RCE en `use cache`). Se actualizó a **16.4.3**: `npm audit`: 0 vulnerabilidades. Lección para operación: `npm audit` debe correr en CI **semanalmente** (el flujo `seguridad.yml` ya lo hace) y Dependabot debe estar activo, porque el "0" del 20-oct dejó de ser cierto en una semana.
- **Re-ejecución tras ambos cambios (`npm run qa:todo -- --e2e --lighthouse --simulacro`): 12/12 comprobaciones correctas** — 210 pruebas unitarias, 0 vulnerabilidades, Lighthouse en presupuesto y **481 casos E2E pasan, 0 fallan** (0 reintentos).
- **El veredicto no cambia** (GO demo protegida / NO-GO producción), pero el camino se acorta: el paso 1 de §4 pasa de "esperar la regla de Cloudflare" a "autorizar la IPv4 de producción".

---

## 1. Decisión recomendada

| Destino | Veredicto | En una frase |
|---|---|---|
| **Demostración / preview protegida para el cliente y pruebas con usuarios** | ✅ **GO**, con las condiciones de §2 | El sitio es estable, seguro para lo que hace hoy, rápido y accesible; todo lo simulado se ve como simulado |
| **Producción real** (dominio público, clientes comprando y rastreando de verdad) | ⛔ **NO-GO** | Hay 2 hallazgos de severidad alta abiertos (tras resolver B1) y varios criterios del plan en rojo, la mayoría por dependencias externas: backend, textos legales y contenido del cliente |

**Por qué No-Go para producción, sin rodeos:** el rastreo real ya funciona desde Node (B1 resuelto el 27-oct, falta la IP de producción); el cotizador, la compra, el pago, el login, los envíos, el perfil y la recolección son **datos de ejemplo**; los formularios de contacto **aparentan enviar y no envían**; el aviso de privacidad y los términos **no existen**; y el contenido (FAQ, pie de página, redes, correos) es provisional. Nada de eso es un error de programación: son decisiones, textos y entregas de otras personas. El código que sí existe pasó todas las verificaciones automáticas.

---

## 2. Condiciones del GO para demostración

Todas deben cumplirse al publicar el primer preview:

1. **Previews protegidos** con contraseña o inicio de sesión de Vercel (no públicos).
2. **`NEXT_PUBLIC_SIBOX_REAL` sin definir** (modo demo: datos simulados con aviso visible "Datos de demostración") **o** definida solo si B1 ya se resolvió y se probó.
3. **Sin dominio de producción** asignado y sin enlazar el preview desde sitios públicos.
4. **Avisar por escrito** a quienes lo vean que es una demostración con datos de ejemplo y que no se debe capturar información real.
5. **Credencial de pruebas** de SIBOX en el preview (nunca la de producción).
6. Ejecutar `GET /api/salud` al publicar y confirmar `estado: ok`.

---

## 3. Tablero de criterios de salida (plan §6)

Semáforo: 🟢 cumple · 🟡 cumple en parte / aceptable con plan · 🔴 no cumple · ⚪ no evaluado.

| Área | Umbral del plan | Estado | Evidencia y brecha |
|---|---|---|---|
| **Hallazgos** | 0 Críticos y 0 Altos abiertos; Medios con plan y fecha | 🔴 | **0 críticos.** **2 altos abiertos**: formularios que no envían (R-03/B8) y límite de peticiones solo en memoria (R-01/B12, mitigado, no cerrado). *(B1/R-02 Cloudflare: resuelto el 27-oct.)* Medios abiertos con plan: contraste de marca, contenido provisional, teselas del mapa (§7) |
| **Seguridad** | 0 vulnerabilidades altas en dependencias; 0 secretos; límite activo y probado; autorización por objeto verificada; ZAP sin altos | 🟡 | Dependencias de **producción: 0** vulnerabilidades (tras actualizar Next a 16.4.3 el 27-oct, que tenía una crítica nueva). Desarrollo: 5 altas en la cadena del linter (sin ruta al sitio; aceptadas, Fase 2 §3.9). Secretos: **0** en código e historial (semgrep 0 hallazgos en 178 archivos, repetido hoy; historial de git sin contraseña ni claves). Límite activo y probado (30/min, 429) pero **por instancia** (B12). **Autorización por objeto: no aplica aún** (no hay rutas con cuenta; B2). **ZAP no se ejecutó** |
| **Código** | `tsc`/ESLint/Prettier en 0; sin código muerto ni ciclos; cobertura lib ≥ 85 % | 🟡 | `tsc` 0, ESLint **0 errores** (quedan **12 avisos** de complejidad/tamaño, deuda visible), Prettier 0, `knip` 0, ciclos 0, duplicación 1.60 %, cobertura `src/lib` > 93 % |
| **Pruebas** | Suite completa verde 3 corridas seguidas sin reintentos | 🟢 | **3 corridas seguidas de la suite completa (121 pruebas × 4 navegadores = 484 casos), sin reintentos: 481 pasan, 3 omitidas a propósito, 0 fallan en cada una** (≈ 11 min cada una). La primera serie tuvo 1 fallo intermitente en WebKit (la prueba de Home → `/cotizar` escribía antes de que React hidratara); se corrigió la prueba y se repitió la serie completa. 208 pruebas unitarias en verde |
| **Rendimiento** | Lighthouse móvil ≥ 90 en rutas públicas; LCP ≤ 2.5 s, CLS ≤ 0.1; carga objetivo sin errores | 🟡 | Lighthouse **93–96** en las 6 rutas, CLS **0**, TBT < 110 ms, carga local 900–1 200 peticiones/s sin errores. **LCP:** 1.8–2.6 s con red y CPU limitadas de verdad (4 de 6 rutas ≤ 2.5 s); 2.9–3.1 s en el laboratorio simulado. Datos de campo pendientes. Carga contra Vercel/SIBOX real: pendiente |
| **Accesibilidad** | axe 0; teclado y lector de pantalla aprobados; contraste resuelto o excepción aprobada | 🟡 | axe: **0 violaciones** en páginas, modales y flujos (salvo el contraste de marca, informado aparte); teclado y foco automatizados (Escape, foco atrapado, 4 navegadores). **Lector de pantalla humano: no hecho.** **Contraste:** blanco sobre `#ff6015` = 3.02:1 (AA exige 4.5) pendiente de decisión de marca (`#CC4D11` cumpliría) |
| **Diseño / responsividad** | 0 desviaciones Altas contra Figma; 0 desbordes en la matriz | 🟡 | **0 desbordes** de 320 a 1920 px en 4 motores. **Fidelidad contra Figma: no verificada** (requiere activar Dev Mode) |
| **Contenido y legal** | 0 contenido provisional; aviso de privacidad y términos publicados | 🔴 | Contenido provisional visible (B10/B13); aviso y términos en **borrador** (`docs/legal/`), sin aprobación de Legal. El aviso corto ya está en los 7 formularios |
| **Operación** | CI obligatorio, monitoreo y alertas activos, rollback ensayado, plan de corte aprobado | 🔴 | CI, flujo nocturno, seguridad, Dependabot y CODEOWNERS **escritos, sin activar** en GitHub (protección de rama pendiente). Monitores y Sentry **sin configurar**. Rollback **no ensayado** (nada desplegado). Plan de corte escrito, **no aprobado**. Simulacro local de incidentes: 3/3 |
| **Negocio** | UAT firmado; bloqueos B1–B11 resueltos o aceptados por escrito | 🔴 | **UAT sin hacer** (kit listo). Ningún bloqueo resuelto ni aceptado por escrito |

**Resumen:** 🟢 1 (pruebas) · 🟡 5 (seguridad, código, rendimiento, accesibilidad, diseño) · 🔴 4 (hallazgos, contenido/legal, operación, negocio).

---

## 4. Qué hay que hacer para pasar a GO de producción (en orden)

| # | Acción | Dueño | Desbloquea |
|---|---|---|---|
| 1 | Enviar el mensaje al cliente (`docs/mensajes/2026-10-27-cliente.md`): confirmar B1, pedir la IPv4 de producción autorizada y probar `api.inbox.com.mx` | Tú → cliente / sistemas | Rastreo real en producción (B1 ya resuelto en pruebas) |
| 2 | Backend libera registro/login de usuario final y su `K_Cliente`, `ObtieneDetalleCostos` corregido, endpoints de guía/etiqueta/pago | Backend de SIBOX | **B2, B3, B4** → quitar el modo demo de cotizar, pagar, envíos, perfil y recolección (B9) |
| 3 | Decidir el destino de los formularios de contacto (correo, CRM, webhook o chat de terceros) y conectarlo | Cliente + desarrollo | **B8** |
| 4 | Legal aprueba aviso de privacidad y términos; cliente da razón social, domicilio, contacto de privacidad; se publican | Cliente + Legal | Área "Contenido y legal" |
| 5 | Cliente entrega contenido real: FAQ, pie, redes, correos, teléfonos (B10/B13) | Cliente | Área "Contenido y legal" |
| 6 | Almacén compartido para el límite de peticiones (Upstash o equivalente) | Desarrollo + costo | **B12** (alto → cerrado) |
| 7 | Crear el proyecto en Vercel con las variables de `docs/DESPLIEGUE.md`, activar protección de rama, secret scanning, CodeQL, Dependabot | Tú | Operación |
| 8 | Configurar monitores y alertas; decidir Sentry; llenar contactos de escalamiento; **ensayar rollback** y el ejercicio de incidente de datos | Tú + desarrollo | Operación |
| 9 | Decidir proveedor de teselas del mapa (B11), IP fija / proxy (B5), credenciales de producción (B6) | Jefe / cliente | Seguridad y operación |
| 10 | Ejecutar **Fase 3** (funcional e integración contra SIBOX real, pruebas de contrato) y **Fase 4** (diseño contra Figma, lector de pantalla, dispositivos físicos) | Desarrollo + Figma Dev Mode + personas | Áreas "Diseño" y "Accesibilidad"; hallazgos nuevos |
| 11 | **UAT** con 5–8 personas (SUS ≥ 80) y corrección de lo grave | Cliente + tú | **Negocio** |
| 12 | Decidir el contraste de marca (R-04) y la voz de marca (R-06) | Marca / cliente | Accesibilidad |
| 13 | Medir en producción (datos de campo) y revisar tras 2 semanas | Tú | Rendimiento |
| 14 | **Repetir `npm run qa:todo -- --e2e --lighthouse --simulacro`**, actualizar el tablero de §3 y firmar | Desarrollo + cliente | Decisión final |

Orden recomendado de dependencias: **1 → (2, 3, 4, 5 en paralelo) → 6–9 → 10 → 11 → 14**. Las acciones 1, 4 y 5 son las que más tiempo tardan porque dependen de terceros; conviene pedirlas hoy.

---

## 5. Riesgos aceptados para la demostración (y quién los acepta)

| Riesgo | Por qué es tolerable en demo | Se acepta al firmar |
|---|---|---|
| Datos simulados en cotizar/pago/envíos/perfil/recolección | Marcados como demostración; sin datos reales | ☐ |
| Los formularios de contacto no envían nada | Se avisa que es demo; no hay clientes reales | ☐ |
| Límite de peticiones por instancia | Preview protegido; sin tráfico público | ☐ |
| Contenido provisional (FAQ, pie, redes) | Lo ve solo quien tiene acceso | ☐ |
| Sin monitores ni Sentry | Una demo no necesita alertas 24 h | ☐ |
| Contraste de marca 3.02:1 | Decisión de marca pendiente | ☐ |
| Teselas de OpenStreetMap | Tráfico mínimo en demo | ☐ |

**Ninguno de estos es aceptable en producción.**

---

## 6. Registro consolidado de hallazgos de la revisión

| Origen | Encontrados | Corregidos | Abiertos / aceptados |
|---|---|---|---|
| QA de 4 rondas (12-oct, `docs/REPORTE_QA.md`) | 51 (17 altos, 22 medios, 12 bajos) | 49 | 2 aceptados (D-008, D-070) |
| Fase 1: estática y limpieza | 53 de ESLint endurecido + banderas de TypeScript + 8 exports muertos + 4 tipos | todos los errores | 12 avisos de complejidad/tamaño (deuda visible) |
| Fase 2: seguridad (S-01…S-10) | 10 | 9 | 1 mitigado, no cerrado (S-01 límite por instancia → B12) |
| Fase 5: rendimiento y SEO (P-01…P-08) | 8 | 8 | 0 (LCP sobre el objetivo en laboratorio: seguimiento) |
| Fase 6: operación y privacidad (O-01…O-06) | 6 | 4 | 2 dependen de personas (O-05, O-06) |

**Riesgos abiertos hoy** (actualiza la tabla de `docs/REPORTE_QA.md` §7):

| ID | Sev. | Descripción | Estado |
|---|---|---|---|
| R-01 | A | Límite de peticiones | **Mitigado** (429 en memoria); falta almacén compartido — B12 |
| R-02 | A | Cloudflare bloquea a Node | **Resuelto 27-oct** (era IPv6; el BFF usa IPv4) — falta IP de producción |
| R-03 | A | Formularios de contacto no envían | Abierto — B8 |
| R-04 | M | Contraste de marca 3.02:1 | Abierto — decisión de marca |
| R-05 | M | Contenido provisional y textos legales | Abierto — B10/B13; borradores listos |
| R-06 | M | Voz de marca inconsistente (formal/informal) | Abierto — decisión de contenido |
| R-07 | M | Teselas OSM; 32 de 71 oficinas con coordenadas | Abierto — B11 |
| R-08 | B | CSP con `unsafe-inline` (ADR 0006), sin Sentry ni analítica, controles decorativos | Parcial: CSP completa; Sentry/analítica pendientes |
| R-09 | M | Operación sin ensayar (monitores, rollback, contactos) | Abierto — B14 |
| R-10 | M | UAT y revisión legal sin hacer | Abierto — B14 |

---

## 7. Trazabilidad de requisitos (actualizada al 2026-10-20)

Base: documento de pantallas y plan de desarrollo, contrastado en `docs/REPORTE_QA.md` §4. Cambia respecto a esa fecha: límite de peticiones (parcial), CSP, SEO, rendimiento y operación.

| Requisito | Estado | Probado por | Bloqueo / nota |
|---|---|---|---|
| Rastreo (último estado, varias guías, historial) | ✅ real vía BFF (en demo por B1) | unit (esquemas, rastreo, privacidad) + E2E (rastreo, seguridad) | B1 |
| Cotizar por C.P., tipo de entrega/envío, varios paquetes | 🟡 mock | E2E cotizar | B3 (cálculo real) |
| Confirmar como invitado o con sesión; remitente/destinatario | ✅ (invitado; sesión demo) | E2E cotizar/sesión | B2 |
| Tipo de producto SAT con búsqueda | ❌ campo libre | — | Catálogo del backend |
| Pago (tarjeta, PayPal, efectivo, cobrar al destinatario) | 🟡 solo interfaz | E2E (doble clic no duplica) | B4 |
| **Etiqueta PDF** (`Genera_Etiqueta`) | ❌ no implementada | — | Falta construirla (semana 4 del plan) |
| Facturación (datos fiscales) | 🟡 modal con mock | E2E cotizar | Flujo por guía + RFC: endpoints sin liberar |
| Sucursales: lista, mapa, filtros, horario abierto/cerrado | ✅ mock, contrato real verificado | unit horario (12 textos reales) + E2E | Falta ruta `/api/sucursales`; B1 |
| **Sucursal más cercana por ubicación** | ❌ | — | Requeriría abrir `geolocation` en `Permissions-Policy` |
| Cobertura por estado | 🟡 mock | E2E | Formato real distinto (553 filas) |
| Registro / login de usuario final | ❌ bloqueado | — | B2 |
| Recolección: domicilios, horarios por C.P., agendado | 🟡 mock | unit + E2E (zona horaria, hora límite) | B2 (`K_Cliente` propio) |
| **Historial de recolecciones** | ❌ | — | Endpoint en actualización |
| Mis envíos (historial por cuenta) | 🟡 mock | unit + E2E | Endpoint inexistente |
| Contactos guardados (regla del cliente) | 🟡 mock + local | unit + E2E | Sin endpoint |
| **Sesión expirada** | ❌ (sesión demo en memoria) | — | B2 |
| Estados vacío/carga/éxito/error/reintento | ✅ | E2E resiliencia | — |
| **Límite de peticiones 429 + Retry-After** | 🟡 en memoria | unit + E2E (`limite.spec.ts`) | B12 |
| **Monitoreo, errores y analítica** | 🟡 `/api/salud`, registros con `X-Request-Id`; **Sentry y analítica sin instalar** | unit + E2E | Decisiones pendientes (Fase 5 §4, Fase 6) |
| Accesibilidad, responsividad, rendimiento, SEO | ✅ / 🟡 | axe, desbordes 320–1920, Lighthouse, SEO | Ver §3 |
| Coincide con Figma | ⚪ no verificado | — | Figma Dev Mode |
| Compra como invitado sin registro (regla del cliente) | ✅ | E2E cotizar | — |
| Privacidad en rastreo público (sin nombres, firma, coordenadas, observaciones) | ✅ | unit + E2E | Autorizar por objeto cuando haya cuenta |

---

## 8. Lo que el plan pedía y no se hizo (transparencia)

| Plan | Estado | Motivo |
|---|---|---|
| Fases 3 (funcional/integración) y 4 (diseño, accesibilidad manual, dispositivos) | **No ejecutadas** | Dependen de B1, Figma Dev Mode, personas y dispositivos físicos; el QA de 4 rondas del 12-oct y las E2E cubren parte |
| F2 infraestructura (Vercel, GitHub, Cloudflare, DNS) | Solo documentado | Exige accesos a esos paneles |
| OWASP ZAP (análisis dinámico) | No ejecutado | Requiere un preview desplegado |
| Pruebas de mutación (Stryker), regresión visual con capturas, pruebas de contrato en CI contra respuestas grabadas completas | No hechas | Las de contrato son parciales (esquemas contra las 71 oficinas reales); mutación y visual quedan como mejora |
| `husky`/`lint-staged`/`commitlint` | No instalados | El CI ya bloquea; opcional |
| k6 / WebPageTest | Se usó `autocannon` y Lighthouse | Equivalente suficiente en local |
| Sentry, uptime monitor, página de estado, analítica | No instalados | Requieren cuentas y decisión (Fase 6) |
| Prueba de onboarding con persona nueva, UAT, SUS | No hechas | Requieren personas |

---

## 9. Firmas

Con la firma, las partes **aceptan la decisión de §1, las condiciones de §2 y los riesgos marcados en §5** (solo para la demostración). El paso a producción requiere repetir la verificación (§4, punto 14) y una nueva acta.

| Rol | Nombre | Decisión (☐ GO demo · ☐ NO-GO demo) | Firma | Fecha |
|---|---|---|---|---|
| Responsable del cliente (Inbox) | | | | |
| Responsable del proyecto | | | | |
| Legal / privacidad (solo opina sobre §3 "Contenido y legal") | | | | |

---

## 10. Cómo repetir esta evaluación

```bash
npm run qa:todo                                       # comprobaciones rápidas (≈ 3 min)
npm run qa:todo -- --e2e --lighthouse --simulacro     # todo lo automático (≈ 20 min)
```
No sustituye lo que requiere personas (UAT, Legal, lector de pantalla, Figma). Resultado de la última ejecución: ver `docs/fases/REVISION_360_FASES.md`, Fase 7.

**Versión evaluada:** commit `6ab2f0b` de `main` (GitHub `JorgeVexus/Inbox`), 20 de octubre de 2026.
