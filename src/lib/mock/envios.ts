import { MOCK_RASTREOS } from "./rastreo";
import type { EnvioPerfil } from "@/types/envio";

/**
 * MOCK DATA for the profile shipments seam. Remove this table when the BFF
 * provides the authenticated user's shipments and saved aliases.
 */
const DEFINICIONES_ENVIO = [
  { guia: "4003229791", nombre: "Paquete ropa", fechaProgramada: "2007-10-31" },
  { guia: "4159473741", nombre: "Paquete cositas", fechaProgramada: "2026-08-04" },
  { guia: "4157067169", nombre: "Pkt mamá", fechaProgramada: "2026-08-03" },
] as const;

export const MOCK_ENVIOS: EnvioPerfil[] = DEFINICIONES_ENVIO.map(
  ({ guia, nombre, fechaProgramada }) => ({
    guia,
    nombre,
    fechaProgramada,
    rastreo: { ...MOCK_RASTREOS[guia] },
  }),
);
