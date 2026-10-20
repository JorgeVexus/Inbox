import type { EstadoHorario } from "@/lib/horario";

/** Presentación del estado abierto/cerrado de una sucursal (mapa, panel y tabla). */
export const PUNTO_ESTADO: Record<EstadoHorario, string> = {
  abierto: "bg-green-500",
  cerrado: "bg-secondary-dark",
  desconocido: "bg-secondary-dark/40",
};
export const ETIQUETA_ESTADO: Record<EstadoHorario, string> = {
  abierto: "Abierto",
  cerrado: "Cerrado",
  desconocido: "Horario no disponible",
};
