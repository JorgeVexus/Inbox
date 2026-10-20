# Aviso de privacidad — BORRADOR para revisión legal

> ⚠️ **Este documento NO es un aviso de privacidad válido.** Es un borrador técnico que ordena lo que el sitio realmente hace con los datos (ver `docs/fases/REVISION_360_FASES.md`, Fase 2 §4) para que **Legal** lo redacte, corrija y apruebe. Los textos entre `[CORCHETES]` son datos que solo el cliente puede dar. **No publicar en `/privacidad` sin aprobación de Legal.** La normativa mexicana de protección de datos personales de particulares se reformó en 2025 (incluida la autoridad competente): Legal debe confirmar los requisitos vigentes de contenido, plazos y forma.

---

## Aviso de privacidad integral

**Fecha de última actualización:** [FECHA]

### 1. Responsable del tratamiento
[RAZÓN SOCIAL DE INBOX], con domicilio en [DOMICILIO COMPLETO], es responsable del tratamiento de tus datos personales conforme a este aviso. Contacto de privacidad: [CORREO DEL ÁREA DE PRIVACIDAD] · [TELÉFONO]. Persona o departamento responsable: [NOMBRE / ÁREA].

### 2. Datos personales que recabamos
Según lo que hagas en el sitio, podemos recabar:

| Categoría | Datos | Cuándo |
|---|---|---|
| Identificación y contacto | Nombre, teléfono, correo electrónico | Al cotizar y documentar un envío (remitente y destinatario), al escribirnos, al guardar contactos o iniciar sesión |
| Domicilio | Calle, números, colonia, ciudad, estado, código postal, referencias | Al documentar un envío, guardar direcciones o agendar una recolección |
| Fiscales | RFC, régimen fiscal, domicilio fiscal, constancia de situación fiscal | Si solicitas factura |
| Del envío | Número de guía, estado del envío, contenido declarado, valor declarado | Al rastrear o documentar un envío |
| Técnicos | Dirección IP (de forma transitoria, para limitar abusos), tipo de navegador | Al usar el sitio |
| Pago | **El sitio no almacena números de tarjeta.** [Si se integra un proveedor de pagos: los datos de pago los recibe directamente el proveedor [NOMBRE], no Inbox.] | Al pagar |

**Datos personales sensibles:** no recabamos datos personales sensibles [Legal: confirmar].
**Menores de edad:** el sitio no está dirigido a menores de [18] años [Legal: confirmar].

### 3. Finalidades
**Necesarias para el servicio** (sin ellas no podemos prestarlo):
- Cotizar, documentar y entregar tus envíos, y permitir su rastreo.
- Programar recolecciones.
- Emitir facturas.
- Atender tus mensajes, dudas y aclaraciones.
- Gestionar tu cuenta y sus contactos y direcciones guardadas [cuando exista el registro].
- Prevenir fraudes y abusos del sitio y cumplir obligaciones legales.

**Secundarias** (puedes oponerte sin que afecte el servicio) [Legal/Marketing: confirmar si habrá alguna; si no, eliminar esta sección]:
- [Envío de promociones o encuestas de satisfacción.]
- [Estadísticas del uso del sitio de forma agregada.]

Si no deseas que usemos tus datos para las finalidades secundarias, escríbenos a [CORREO] indicándolo; puedes hacerlo en cualquier momento.

### 4. Con quién compartimos tus datos (transferencias y encargados)

| Destinatario | Para qué | Tipo |
|---|---|---|
| [Grupo Transpaís / empresas del grupo que operan el sistema de guías (SIBOX)] | Documentar, trasladar y rastrear tus envíos | Transferencia o encargado [Legal: definir] |
| Proveedor de alojamiento del sitio (Vercel Inc.) | Operar el sitio | Encargado |
| [Proveedor de pagos, cuando exista] | Procesar pagos | Encargado/transferencia |
| OpenStreetMap Foundation (mapas) | Mostrar el mapa de cobertura: tu navegador solicita imágenes del mapa y el proveedor ve tu IP | Tercero [Legal: evaluar; B11 puede cambiar el proveedor] |
| [Proveedor de analítica, si se elige] | Medir el uso del sitio sin datos personales | Encargado |
| Autoridades competentes | Cuando la ley lo exija | Obligación legal |

[Legal: precisar si alguna requiere consentimiento expreso y si hay transferencias fuera de México (el alojamiento y herramientas de terceros pueden estar en el extranjero).]

### 5. Derechos ARCO y revocación del consentimiento
Tienes derecho a **Acceder** a tus datos, **Rectificarlos**, **Cancelarlos** y **Oponerte** a su tratamiento, y a revocar tu consentimiento. Para ejercerlos envía una solicitud a [CORREO ARCO] con: tu nombre y medio para responderte, documentos que acrediten tu identidad, descripción clara de los datos y del derecho que ejerces, y cualquier elemento que facilite localizarlos. Responderemos en un máximo de [PLAZO LEGAL] días hábiles. Procedimiento interno: `docs/legal/PROCEDIMIENTO_ARCO.md`.

### 6. Limitación del uso y divulgación
[Medios para limitar el uso: lista de exclusión / contacto a [CORREO].]

### 7. Tecnologías de rastreo
**Hoy el sitio no usa cookies ni tecnologías de seguimiento propias.** Guarda en tu navegador (almacenamiento local) datos que **tú** capturas para tu comodidad —contactos, direcciones, datos de facturación y el nombre que das a un envío— que permanecen en tu dispositivo y puedes borrar desde la configuración del navegador. [Si se agrega analítica con cookies: actualizar esta sección y mostrar aviso de consentimiento.]

### 8. Conservación
[Plazos de conservación por categoría; propuesta técnica en `docs/legal/INVENTARIO_DATOS_RETENCION.md`.]

### 9. Seguridad
Aplicamos medidas técnicas y administrativas razonables para proteger tus datos (conexión cifrada, acceso restringido, validación de entradas, registros sin datos personales). Ninguna medida es infalible; si ocurre una vulneración que afecte significativamente tus derechos te lo informaremos [Legal: forma y plazo].

### 10. Cambios al aviso
Publicaremos cualquier cambio en esta página [y, si es sustancial, por correo]. 

### 11. Autoridad
Si consideras que tu derecho fue vulnerado, puedes acudir a la autoridad de protección de datos competente [NOMBRE VIGENTE: Legal].

---

## Aviso de privacidad simplificado (el que aparece junto a los formularios)

Ya implementado en el sitio como `AvisoPrivacidadCorto` (`src/components/ui/aviso-privacidad-corto.tsx`):

> "Usaremos tus datos únicamente para **[finalidad]**. Conoce cómo los protegemos en el **Aviso de privacidad**."

Aparece en: contacto de soporte, correo del chat, datos del envío (paso Confirmar), datos de facturación, contactos guardados, direcciones guardadas y agendado de recolección. Legal debe confirmar que el texto y el enlace cumplen con el formato de aviso simplificado (identidad del responsable, finalidades, cómo conocer el aviso integral) y si hace falta una casilla de aceptación expresa en algún caso.
