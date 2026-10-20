# Plan de pruebas de aceptación con usuarios (UAT)

Kit listo para ejecutar. **No se ha hecho ninguna sesión todavía**: requiere personas reales, un ambiente que se pueda probar (preview de Vercel) y, para algunas tareas, que los bloqueos B1–B4 estén resueltos o que se avise a los participantes de qué es demostración.

## 1. Objetivo
Comprobar que personas reales pueden completar las tareas principales del sitio **sin ayuda**, y medir cuánto tardan, dónde se equivocan y qué tan fácil les parece. El resultado alimenta el Go / No-Go (Fase 7).

## 2. Criterios de aceptación (del plan de revisión 360°, F16)
| Criterio | Umbral |
|---|---|
| Tareas completadas sin ayuda | ≥ 85 % del total de intentos (y ninguna tarea por debajo de 70 %) |
| Escala SUS (usabilidad) | ≥ 80 de media (68 es "promedio de la industria"; 80 = buena) |
| Errores graves (la persona se bloquea o entiende mal el resultado) | 0 sin resolver al cierre |
| Aceptación firmada | Responsable del cliente (formato en §9) |

## 3. Participantes (5–8)
Con 5 se detecta ~85 % de los problemas de uso; con 8 se afianzan las medidas. Mezcla recomendada:

| Perfil | Cuántos | Qué aporta |
|---|---|---|
| Cliente final que ya envía paquetes (persona o negocio pequeño) | 3–4 | El uso real: rastrear, cotizar, comprar |
| Personal de **mostrador** de Inbox | 1–2 | Conoce las dudas frecuentes y los términos del servicio |
| Personal de **soporte** de Inbox | 1–2 | Revisa los mensajes, el FAQ y los casos de error |
| Alguien que **nunca** ha usado Inbox | 1 | Claridad de lo desconocido |

Incluir al menos una persona en **teléfono** y una con **teclado/lector de pantalla** o baja visión si es posible. Reclutarlos a través del cliente; no son compañeros del equipo.

## 4. Preparación
- **Ambiente:** el preview final de Vercel con `NEXT_PUBLIC_SIBOX_REAL=1` si B1 está resuelto. Si no, avisar: "los datos son de demostración" (el sitio ya lo marca en rastreo).
- **Datos de prueba:** guías `4003229791`, `4159028044`, `4159050421`, `4159021743`; usuario demo `INBOX` / `Prueba` (cuando exista registro real, cuentas de prueba); C.P. `64000` y `37545`. Una **guía inexistente** para la tarea de error.
- **Registro:** grabar pantalla y voz **solo con consentimiento** (§8), o que un observador tome notas con la hoja de §6.
- **Equipo:** 1 moderador (guía, no ayuda) + 1 observador. Sala silenciosa o videollamada con pantalla compartida. 45–60 min por persona.
- **No** se prueba con datos personales reales de la persona: se usan los de ejemplo.

## 5. Tareas (se leen en voz alta, una a una, sin explicar cómo hacerlas)

| # | Tarea (lo que se le dice) | Éxito si… | Tiempo meta |
|---|---|---|---|
| T1 | "Quieres saber dónde va un paquete. El número de guía es 4003229791. Averigua su estado." | Ve el estado y entiende si ya llegó | < 1 min |
| T2 | "Rastrea ahora tres guías a la vez: 4003229791, 4159028044 y 4159050421." | Ve las tres | < 2 min |
| T3 | "Rastrea esta guía: 9999999999." (inexistente) | Entiende que no se encontró y qué hacer | < 1 min |
| T4 | "Quieres mandar un paquete de 3 kg de Monterrey (64000) a León (37545). Averigua cuánto cuesta y cuándo llegaría." | Llega a un costo y una fecha, y los lee bien | < 3 min |
| T5 | "Compra ese envío **sin crear una cuenta**: captura los datos del remitente y destinatario y llega hasta el pago." | Completa el flujo como invitado sin sentirse obligado a registrarse | < 6 min |
| T6 | "Después de pagar, quieres tu factura. Solicítala." | Abre y llena el formulario de facturación | < 3 min |
| T7 | "Quieres que pasen a recoger tus paquetes mañana a tu domicilio. Inicia sesión y agéndalo." | Agenda y entiende el folio | < 4 min |
| T8 | "¿Dónde está la sucursal de Inbox más cercana a Reynosa y a qué hora cierra?" | Encuentra una sucursal y su horario | < 2 min |
| T9 | "Tienes una duda que no encuentras. Contacta a Inbox." | Encuentra teléfono, correo o formulario | < 2 min |
| T10 | "¿Qué cosas no se pueden enviar?" | Encuentra la respuesta (hoy el FAQ es provisional: **esperar fallo y registrarlo**) | < 2 min |

Cada tarea se marca: **completó sin ayuda / completó con ayuda / no completó**, tiempo, número de errores y comentarios. Regla del moderador: si la persona lleva 2× el tiempo meta o dice "me rindo", se anota "no completó" y se le ayuda para seguir.

## 6. Hoja de observación (una por persona)

| Campo | |
|---|---|
| Participante (código, p. ej. P3) · perfil · dispositivo | |
| Fecha · moderador · observador | |

| Tarea | Resultado (sin ayuda / con ayuda / no) | Tiempo (mm:ss) | Errores | Lo que dijo o hizo (citas literales) | Problema observado | Gravedad (1 menor – 4 bloquea) |
|---|---|---|---|---|---|---|
| T1 | | | | | | |
| … hasta T10 | | | | | | |

**Gravedad:** 1 = molestia; 2 = confusión que se recupera; 3 = error o gran demora; 4 = no puede completar o entiende algo equivocado (p. ej. cree que pagó cuando no).

## 7. Preguntas al final (5 min)
1. ¿Qué fue lo más fácil? ¿Y lo más confuso?
2. ¿Algo que esperabas encontrar y no estaba?
3. ¿Confiarías en este sitio para pagar un envío? ¿Por qué sí o no?
4. Cuestionario SUS (`CUESTIONARIO_SUS.md`).

## 8. Consentimiento (leer y firmar antes de empezar)
> "Gracias por ayudarnos. Vamos a probar el sitio de Inbox, **no a evaluarte a ti**: si algo no se entiende, el problema es del sitio. Con tu permiso, grabaremos la pantalla y tu voz solo para analizar la prueba; la grabación se usará únicamente por el equipo del proyecto y se borrará a más tardar [30] días después. No usaremos tu nombre en los resultados. Puedes parar en cualquier momento. Todos los datos que captures son de ejemplo."
> ☐ Acepto participar  ☐ Acepto la grabación (pantalla y voz) Nombre/código: ______ Fecha: ______

## 9. Reporte y aceptación
Entregable: tabla de resultados por tarea (tasa de éxito, tiempo medio, errores), lista priorizada de problemas con su gravedad y capturas, puntuación SUS (media y por persona), y recomendación. **Todo problema de gravedad 3–4 se corrige y se vuelve a probar con 2–3 personas.**

Aceptación: "Hemos revisado los resultados de la prueba de aceptación y [aceptamos / aceptamos con las salvedades listadas] el sitio para su lanzamiento." Nombre, cargo, firma, fecha del responsable del cliente: ______________________

## 10. Qué esperar (hipótesis a verificar)
Basadas en la revisión 360°; confirman o descartan:
- T10 y T9 pueden fallar por el contenido provisional (FAQ idéntico, dos correos distintos, B13).
- T5: los formularios de remitente/destinatario son largos; vigilar abandono y errores de validación.
- T7 exige iniciar sesión (demo): preguntar si lo entienden como parte del flujo o como un muro, y si esperaban poder agendar como invitado (el cliente dijo que recolecciones **sí** exigen registro).
- T8: el mapa y la tabla; el estado "abierto/cerrado" puede mostrar "horario no disponible" en algunas sucursales.
- Después de T5, verificar que entienden que la guía de la demo **no es una guía real**.
