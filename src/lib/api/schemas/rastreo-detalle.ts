import { z } from "zod";

/** Request de RastreoDetalle -- mismo parametro que wsRastreo. */
export const rastreoDetalleRequestSchema = z.object({
  Guia: z.string().trim().min(1).max(40),
});

/**
 * Un evento del historial de RastreoDetalle, segun la respuesta real
 * (2026-10-02). Ojo: `F_Estatus` es "31-OCT-2007  09:03" (doble espacio) y
 * `F_Historia` es otro formato ("31/10/2007 09:03:00 a. m.") -- no mezclarlos.
 */
export const rastreoEventoSchema = z.object({
  OficinaEstatus: z.string().nullable(),
  F_Estatus: z.string(),
  Estatus: z.string(),
  Recibio: z.string().nullable(),
  Observaciones: z.string().nullable(),
  K_Estado_Guia: z.string(),
  K_Historia_Guia: z.string(),
  F_Historia: z.string().nullable(),
});

export const rastreoDetalleResponseSchema = z.array(rastreoEventoSchema);
