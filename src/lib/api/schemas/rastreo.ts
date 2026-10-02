import { z } from "zod";

/** Request de wsRastreo -- ver PDF de API seccion 5. */
export const rastreoRequestSchema = z.object({
  Guia: z.string().trim().min(1).max(40),
});

export type RastreoRequest = z.infer<typeof rastreoRequestSchema>;

/**
 * Un registro de la respuesta de wsRastreo, ajustado contra la API real
 * (2026-10-02): el PDF no lista `F_Promesa_Entrega` pero la API sí lo
 * regresa, y varios campos vienen `null` en guías reales (p.ej. guías
 * internas/canceladas no tienen estado/ciudad de origen o destino).
 */
export const rastreoRegistroSchema = z.object({
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

export type RastreoRegistro = z.infer<typeof rastreoRegistroSchema>;

export const rastreoResponseSchema = z.array(rastreoRegistroSchema);
