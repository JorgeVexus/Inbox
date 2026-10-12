import { z } from "zod";
import { rastreoRequestSchema } from "./rastreo";

/** Request de RastreoDetalle -- mismo parametro que wsRastreo. */
export const rastreoDetalleRequestSchema = rastreoRequestSchema;

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

/**
 * Version PUBLICA del evento. `Observaciones` es texto libre interno del
 * operador y en guias reales trae datos de clientes (p.ej. "Cliente MySibox:
 * 974, Usuario: <correo del cliente>") y de operacion ("MOVIL - Reco No.
 * 1016947"); `Recibio` es el nombre de quien recibio. Se anulan en el
 * servidor porque este historial es publico por numero de guia (regla de
 * seguridad 3 y 7 de CLAUDE.md). Confirmar con el cliente si alguna
 * observacion esta pensada para ser publica antes de reabrirla.
 */
export const rastreoEventoPublicoSchema = rastreoEventoSchema.transform((e) => ({
  ...e,
  Recibio: null,
  Observaciones: null,
}));

export const rastreoDetalleResponseSchema = z.array(rastreoEventoPublicoSchema);
