# Procedimiento interno para derechos ARCO — BORRADOR

> ⚠️ Borrador operativo para que Legal lo valide. Los plazos legales exactos y la autoridad vigente los confirma Legal (la normativa se reformó en 2025). Entre `[CORCHETES]`: datos por definir.

**Qué son los derechos ARCO:** **A**cceso (saber qué datos tenemos), **R**ectificación (corregirlos), **C**ancelación (borrarlos), **O**posición (que dejemos de usarlos para algo). Más la revocación del consentimiento.

## 1. Cómo llega una solicitud
- Por correo a **[CORREO ARCO]** (el mismo que aparece en el aviso de privacidad). [Opcional: formulario en el sitio; **no existe todavía**.]
- Quien la recibe (Soporte u otra persona) la reenvía **el mismo día** al Responsable de datos personales: [NOMBRE/ÁREA]. Nadie responde por su cuenta.

## 2. Pasos y tiempos

| Paso | Qué se hace | Plazo (Legal confirma) |
|---|---|---|
| 1. Registrar | Folio, fecha de recepción, derecho solicitado, medio de respuesta | Mismo día |
| 2. Verificar identidad | Pedir identificación oficial y, si actúa un representante, carta poder. **No dar datos a quien no acredite** | [x] días desde la recepción |
| 3. Completar | Si falta información, pedirla una vez | [x] días |
| 4. Buscar | Localizar los datos en todos los lugares (tabla §3) | — |
| 5. Resolver | Acceder / rectificar / cancelar / oponer, o negar con motivo legal por escrito | Máx. [PLAZO] días hábiles desde que se acredita la identidad |
| 6. Ejecutar | Aplicar el cambio dentro de [x] días tras notificar la resolución | [x] días |
| 7. Cerrar | Registrar resultado; conservar el expediente [plazo] | — |

## 3. Dónde buscar los datos de una persona (inventario técnico, 2026-10-20)

| Lugar | Qué hay | Cómo se atiende |
|---|---|---|
| Navegador de la persona (`localStorage`/`sessionStorage`) | Contactos, direcciones, datos de facturación, alias de envíos, borrador de cotización | **Inbox no tiene copia.** La persona los borra desde su navegador. Hoy no hay datos en servidores nuestros |
| Sistema de guías (SIBOX / MySibox) | Guías, remitentes, destinatarios, domicilios, recolecciones, cuenta de cliente | **Se atiende con Sistemas de Inbox**: es la fuente de los datos de envíos. Pedir a [CONTACTO SISTEMAS] búsqueda por nombre, correo o teléfono |
| Registros del servidor (Vercel) | Líneas de error con datos enmascarados e identificador de petición; sin datos personales completos | Normalmente no aplica; la retención es corta |
| Correo de soporte / CRM [cuando exista] | Mensajes enviados por formularios | [Definir con B8] |
| Facturación (área fiscal) | Datos fiscales y facturas emitidas | Se atiende con [ÁREA FISCAL]; **la cancelación puede estar limitada por obligaciones fiscales de conservación** |

## 4. Reglas prácticas
- **Cancelar ≠ borrar todo:** hay datos que la ley obliga a conservar (fiscales, de contrato). Legal indica qué se bloquea y por cuánto tiempo.
- **Rectificar un envío ya entregado** no cambia el historial; se corrige el dato personal que aplique.
- **Nunca** enviar los datos por un canal inseguro ni a un correo distinto del acreditado.
- Si la solicitud revela un posible incidente de datos, activar **R4** de `docs/RUNBOOKS.md`.

## 5. Plantillas de respuesta (por redactar con Legal)
[Acuse de recibo] · [Solicitud de acreditación] · [Resolución favorable] · [Resolución negativa fundada] · [Aviso de ejecución].
