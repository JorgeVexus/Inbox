import { z } from "zod";

/** Request de wsRastreo -- ver PDF de API seccion 5. */
export const rastreoRequestSchema = z.object({
  Guia: z.string().trim().min(1).max(40),
});

export type RastreoRequest = z.infer<typeof rastreoRequestSchema>;

/**
 * Un registro de la respuesta de wsRastreo. Todos los campos vienen de la
 * respuesta de ejemplo del PDF; se marcan nullable donde el PDF muestra
 * `null` en el ejemplo (Firma, Latitud, Longitud).
 */
export const rastreoRegistroSchema = z.object({
  Guia: z.string(),
  F_Documentacion: z.string(),
  OficinaEstatus: z.string(),
  F_Estatus: z.string(),
  Estatus: z.string(),
  Remitente: z.string(),
  EstadoOrigen: z.string(),
  CdOrigen: z.string(),
  Origen: z.string(),
  Destinatario: z.string(),
  EstadoDestino: z.string(),
  CdDestino: z.string(),
  Destino: z.string(),
  Recibio: z.string().nullable(),
  Firma: z.string().nullable(),
  Latitud: z.string().nullable(),
  Longitud: z.string().nullable(),
});

export type RastreoRegistro = z.infer<typeof rastreoRegistroSchema>;

export const rastreoResponseSchema = z.array(rastreoRegistroSchema);
