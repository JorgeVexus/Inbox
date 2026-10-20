# Inventario de datos personales, flujos y retención — propuesta

Base: `docs/fases/REVISION_360_FASES.md`, Fase 2 §4 (2026-10-20). **Propuesta técnica** para que Legal fije los plazos definitivos; los plazos entre `[corchetes]` son sugerencias, no obligaciones.

## 1. Principios aplicados (minimización)
1. **Lo que no se necesita, no se pide.** El rastreo solo usa el número de guía; el BFF descarta del resultado nombres, firma, coordenadas y observaciones antes de mostrarlo.
2. **Los datos de tarjeta nunca tocan nuestros servidores.** Hoy son una maqueta en memoria; en producción los capturará el proveedor de pagos con campos alojados.
3. **Sin cookies ni analítica con datos personales.** Si se agrega analítica, sin PII (ver plan de medición, Fase 5 §4).
4. **Los registros del servidor enmascaran** correos, teléfonos, RFC y tokens (`src/lib/api/log.ts`).

## 2. Mapa de datos y retención propuesta

| Dato | Base y finalidad | Dónde vive (hoy → con integración real) | Retención propuesta |
|---|---|---|---|
| Número de guía consultado | Prestar el rastreo | Memoria / URL del navegador; viaja a SIBOX | No se guarda en nuestros servidores |
| IP del visitante | Limitar abusos | Memoria de la instancia (contador) | Minutos; sin registro persistente |
| Nombre, teléfono, correo, domicilio de remitente/destinatario | Documentar y entregar el envío | Hoy: memoria del navegador (la guía es simulada) → SIBOX | Lo define el sistema de guías y la ley aplicable al transporte [Legal] |
| Contactos y direcciones guardadas | Agilizar envíos y recolecciones | Hoy: `localStorage` → con cuenta real: SIBOX/MySibox | Mientras exista la cuenta; borrado al cancelarla |
| RFC, régimen, domicilio fiscal, constancia | Facturar | Hoy: `localStorage` → área fiscal | Obligación fiscal de conservación [Legal/Fiscal: típicamente años] |
| Correo y mensaje de contacto / chat | Responder | Hoy: ninguno (el envío es simulado, B8) → correo/CRM | [12 meses desde el último contacto] |
| Credencial de servicio de SIBOX | Operar el BFF | Variables de entorno de Vercel | Hasta su rotación; rotar cada [6–12 meses] |
| Líneas de registro del servidor | Diagnóstico | Vercel Logs (enmascarados) | Según el plan de Vercel (días); no se exportan |

## 3. Terceros que reciben datos (para el aviso de privacidad)

| Tercero | Recibe | Contrato/DPA | Estado |
|---|---|---|---|
| SIBOX / Grupo Transpaís | Datos del envío y de cuenta | [Pendiente] | Es del mismo grupo/cliente: confirmar figura (encargado o transferencia) |
| Vercel Inc. | Tráfico del sitio y registros | Acuerdo de procesamiento de datos de Vercel | Revisar y aceptar al crear la cuenta |
| OpenStreetMap Foundation | IP del visitante al cargar el mapa | — (servicio público) | **B11**: evaluar proveedor con contrato |
| Proveedor de pagos | Datos de pago | [Pendiente] | Con B4 |
| Proveedor de analítica | Eventos sin PII | [Pendiente] | Decisión de Fase 5 §4 |
| Sentry (si se adopta) | Errores del navegador, sin PII | [Pendiente] | Decisión de `docs/RUNBOOKS.md` §2 |

## 4. Pendientes para cerrar F14
1. Legal redacta y aprueba aviso de privacidad (`AVISO_PRIVACIDAD_BORRADOR.md`) y términos (`TERMINOS_BORRADOR.md`).
2. Cliente responde las 10 preguntas de los términos y confirma la razón social y el contacto de privacidad.
3. Definir plazos de retención definitivos (§2) y firmar este inventario.
4. Decidir proveedor de teselas (B11) y de analítica.
5. Cuando se conecten registro y cuenta (B2): revisar de nuevo este inventario (habrá datos de cuenta en servidores) y agregar el aviso en el registro.
