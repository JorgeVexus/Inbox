import type { HorarioRecoleccion } from "@/types/recoleccion";

/**
 * MOCK for `ObtenerHorariosPorCP`, keyed by CP. Same two CPs already used
 * by `mock/codigos-postales.ts` so a saved domicilio's CP resolves to
 * something here too. Values match the example in the API doc
 * (K_Oficina 721, Monterrey, 14:00-19:00) for the documented CP and a
 * second made-up office for the other one.
 */
export const MOCK_HORARIOS: Record<string, HorarioRecoleccion> = {
  "64000": {
    kOficina: 721,
    oficina: "MONTERREY-5 CONSTITUYENTES",
    horaMinima: "14:00",
    horaMaxima: "19:00",
    horaLimiteCaptura: "13:30",
    dias: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false,
    },
  },
  "66220": {
    kOficina: 84,
    oficina: "SAN PEDRO GARZA GARCÍA",
    horaMinima: "10:00",
    horaMaxima: "17:00",
    horaLimiteCaptura: "12:00",
    dias: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: true,
      domingo: false,
    },
  },
};
