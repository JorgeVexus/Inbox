import type { ResultadoCP } from "@/types/codigo-postal";

/**
 * MOCK DATA — placeholder for `BusquedaCP`. Delete once
 * `buscarCodigoPostal()` in `../codigo-postal.ts` calls the BFF instead.
 */
export const MOCK_CODIGOS_POSTALES: Record<string, ResultadoCP> = {
  "37545": {
    cp: "37545",
    estado: "GUANAJUATO",
    ciudad: "LEÓN",
    colonias: ["CENTRO", "LAS TROJES", "JARDINES DEL MORAL"],
  },
  "64000": {
    cp: "64000",
    estado: "NUEVO LEÓN",
    ciudad: "MONTERREY",
    colonias: ["CENTRO", "OBISPADO"],
  },
  "91700": {
    cp: "91700",
    estado: "VERACRUZ",
    ciudad: "VERACRUZ",
    colonias: ["CENTRO", "FLORES MAGÓN"],
  },
  "87000": {
    cp: "87000",
    estado: "TAMAULIPAS",
    ciudad: "CIUDAD VICTORIA",
    colonias: ["CENTRO", "LOS FRESNOS", "REPARTO LOCAL"],
  },
};
