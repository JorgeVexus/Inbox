import { z } from "zod";

/**
 * Formato aceptado de un numero de guia. Las guias reales son numericas
 * (10 digitos), pero no esta documentado que nunca lleven letras, asi que se
 * permite alfanumerico + guion. Lo importante: NO se reenvia a SIBOX texto
 * arbitrario (su backend es SQL Server: se vio un error de stored procedure),
 * como defensa en profundidad contra inyeccion aunque ellos parametricen.
 */
const guiaSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{1,40}$/, "Formato de guía inválido");

/** Request de wsRastreo -- ver PDF de API seccion 5. */
export const rastreoRequestSchema = z.object({ Guia: guiaSchema });

/**
 * Un registro de la respuesta de wsRastreo, ajustado contra la API real
 * (2026-10-02): el PDF no lista `F_Promesa_Entrega` pero la API sí lo
 * regresa, y varios campos vienen `null` en guías reales (p.ej. guías
 * internas/canceladas no tienen estado/ciudad de origen o destino).
 */
const rastreoRegistroSchema = z.object({
  Guia: z.string(),
  F_Documentacion: z.string().nullable(),
  OficinaEstatus: z.string().nullable(),
  F_Estatus: z.string().nullable(),
  Estatus: z.string(),
  Remitente: z.string().nullable(),
  EstadoOrigen: z.string().nullable(),
  CdOrigen: z.string().nullable(),
  Origen: z.string().nullable(),
  Destinatario: z.string().nullable(),
  EstadoDestino: z.string().nullable(),
  CdDestino: z.string().nullable(),
  Destino: z.string().nullable(),
  Recibio: z.string().nullable(),
  Firma: z.string().nullable(),
  // Siempre null en las pruebas; tipo real sin confirmar (texto o número).
  Latitud: z.union([z.string(), z.number()]).nullable(),
  Longitud: z.union([z.string(), z.number()]).nullable(),
  // Fecha prometida de entrega -- el campo que el Figma muestra como
  // "Fecha programada de entrega". Null en la guía de prueba entregada.
  F_Promesa_Entrega: z.string().nullable(),
});

/**
 * Version PUBLICA del registro: lo que el BFF puede devolver al navegador.
 *
 * El rastreo es publico (cualquiera con un numero de guia lo consulta), pero
 * wsRastreo regresa datos personales de terceros (observado 2026-10-12 con
 * guias reales): nombre de remitente y destinatario, quien recibio, la
 * imagen de la firma de entrega en base64 y coordenadas. Regla de seguridad 3
 * (CLAUDE.md): conocer un folio no debe bastar para verlos. Se anulan aqui,
 * en el servidor -- el cliente nunca los recibe, aunque la UI no los muestre.
 * Si algun dia se necesitan, deben salir por un endpoint autenticado que
 * verifique que la guia pertenece al cliente.
 */
const rastreoRegistroPublicoSchema = rastreoRegistroSchema.transform((r) => ({
  ...r,
  Remitente: null,
  Destinatario: null,
  Recibio: null,
  Firma: null,
  Latitud: null,
  Longitud: null,
}));

export const rastreoResponseSchema = z.array(rastreoRegistroPublicoSchema);
