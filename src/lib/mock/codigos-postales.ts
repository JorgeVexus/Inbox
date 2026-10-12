import type { ResultadoCP } from "@/types/codigo-postal";

/**
 * MOCK DATA — placeholder for `BusquedaCP`. Delete once
 * `buscarCodigoPostal()` in `../codigo-postal.ts` calls the BFF instead.
 * Solo una muestra de CP de las ciudades principales para que la demo no
 * falle con el primer C.P. que escriba quien la pruebe; SIBOX conoce todos.
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
  "64060": {
    cp: "64060",
    estado: "NUEVO LEÓN",
    ciudad: "MONTERREY",
    colonias: ["OBISPADO", "CENTRO"],
  },
  "66220": {
    cp: "66220",
    estado: "NUEVO LEÓN",
    ciudad: "SAN PEDRO GARZA GARCÍA",
    colonias: ["DEL VALLE", "RESIDENCIAL SAN AGUSTÍN"],
  },
  "01000": {
    cp: "01000",
    estado: "CIUDAD DE MÉXICO",
    ciudad: "ÁLVARO OBREGÓN",
    colonias: ["SAN ÁNGEL", "GUADALUPE INN"],
  },
  "06600": {
    cp: "06600",
    estado: "CIUDAD DE MÉXICO",
    ciudad: "CUAUHTÉMOC",
    colonias: ["JUÁREZ", "ROMA NORTE"],
  },
  "44100": {
    cp: "44100",
    estado: "JALISCO",
    ciudad: "GUADALAJARA",
    colonias: ["CENTRO", "AMERICANA"],
  },
  "88500": {
    cp: "88500",
    estado: "TAMAULIPAS",
    ciudad: "REYNOSA",
    colonias: ["CENTRO", "LONGORIA"],
  },
  "89100": {
    cp: "89100",
    estado: "TAMAULIPAS",
    ciudad: "TAMPICO",
    colonias: ["CENTRO", "AGUADULCE"],
  },
  "87099": {
    cp: "87099",
    estado: "TAMAULIPAS",
    ciudad: "CIUDAD VICTORIA",
    colonias: ["DOS MIL"],
  },
  "80000": {
    cp: "80000",
    estado: "SINALOA",
    ciudad: "CULIACÁN",
    colonias: ["CENTRO", "TIERRA BLANCA"],
  },
  "97000": {
    cp: "97000",
    estado: "YUCATÁN",
    ciudad: "MÉRIDA",
    colonias: ["CENTRO", "GARCÍA GINERÉS"],
  },
  "22000": {
    cp: "22000",
    estado: "BAJA CALIFORNIA",
    ciudad: "TIJUANA",
    colonias: ["ZONA RÍO", "CENTRO"],
  },
  "72000": {
    cp: "72000",
    estado: "PUEBLA",
    ciudad: "PUEBLA",
    colonias: ["CENTRO", "LA PAZ"],
  },
};
