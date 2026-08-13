import { MOCK_RASTREOS } from "./rastreo";
import type { EnvioPerfil } from "@/types/envio";

/**
 * MOCK DATA for the profile shipments seam. Remove this table when the BFF
 * provides the authenticated user's shipments and saved aliases.
 *
 * The account-history API is not available yet, and wsRastreo does not return
 * the promised delivery date. Therefore, each fechaProgramada below is an
 * approximate demo value until the backend contract confirms the real dates.
 */
const DEFINICIONES_ENVIO = [
  { guia: "4003229791", nombre: "Paquete ropa", fechaProgramada: "31/10/2007" },
  { guia: "4159473741", nombre: "Paquete cositas", fechaProgramada: "04/08/2026" },
  { guia: "4157067169", nombre: "Pkt mamá", fechaProgramada: "03/08/2026" },
] as const;

export const MOCK_ENVIOS: EnvioPerfil[] = DEFINICIONES_ENVIO.map(
  ({ guia, nombre, fechaProgramada }) => ({
    guia,
    nombre,
    fechaProgramada,
    rastreo: { ...MOCK_RASTREOS[guia] },
  }),
);
