import { describe, expect, it } from "vitest";
import {
  busquedaCpRequestSchema,
  busquedaCpResponseSchema,
  codigoPostalSchema,
  horariosRequestSchema,
  horariosResponseSchema,
  oficinasRequestSchema,
  oficinasResponseSchema,
} from "./catalogos";

// Filas REALES (apitest, 2026-10-12).
const oficinaConCoords = {
  K_Oficina: "7", D_Oficina: "ALDAMA", C_Oficina: "ALD", C_Pais: "MEX", K_Estado: "28", C_Estado: "TAM",
  K_Ciudad: "39", D_Ciudad: "ALDAMA", K_Colonia: "28", D_Colonia: "ALDAMA",
  Calle: "CARR. EST. MANUEL- SOTO LA MARINA KM 36", Codigo_Postal: "89670", Telefono: "836 274 0862",
  B_Ocurre: "SI", B_Frontera: "NO", Contacto_Oficina: "X", Latitud: "22.92272138", Longitud: "-98.0819544",
  Observaciones: "Lunes a Viernes 09:00 a 18:00",
};
const oficinaSinCoords = {
  ...oficinaConCoords, K_Oficina: "17", D_Oficina: "ABASOLO", Telefono: "", B_Ocurre: "NO",
  Latitud: null, Longitud: null, Observaciones: "",
};

describe("ListadoOficinas", () => {
  it("el request siempre es el payload fijo del servidor (el navegador no manda nada)", () => {
    expect(oficinasRequestSchema.parse({ K_Estado: "1", cualquier: "cosa" })).toMatchObject({
      K_Oficina: "", K_Estado: "", CP: "", NombreDispositivo: "web", B_Operadores: false,
    });
  });

  it("convierte ids a número, 'SI'/'NO' a booleano y coordenadas a número", () => {
    const [o] = oficinasResponseSchema.parse([oficinaConCoords]);
    expect(o.K_Oficina).toBe(7);
    expect(o.K_Estado).toBe(28);
    expect(o.B_Ocurre).toBe(true);
    expect(o.B_Frontera).toBe(false);
    expect(o.Latitud).toBeCloseTo(22.92272, 4);
    expect(o.Longitud).toBeCloseTo(-98.08195, 4);
    expect(o.D_Estado).toBe("TAMAULIPAS");
    expect(o.tipo).toBe("sucursal");
  });

  it("acepta coordenadas nulas, teléfono y observaciones vacíos", () => {
    const [o] = oficinasResponseSchema.parse([oficinaSinCoords]);
    expect(o.Latitud).toBeNull();
    expect(o.Longitud).toBeNull();
    expect(o.Telefono).toBeNull();
    expect(o.Observaciones).toBeNull();
    expect(o.B_Ocurre).toBe(false);
    expect(o.tipo).toBe("distribucion");
  });

  it("un código de estado desconocido no rompe: usa el código como nombre", () => {
    const [o] = oficinasResponseSchema.parse([{ ...oficinaConCoords, C_Estado: "ZZZ" }]);
    expect(o.D_Estado).toBe("ZZZ");
  });

  it("coordenadas basura no son NaN", () => {
    const [o] = oficinasResponseSchema.parse([{ ...oficinaConCoords, Latitud: "abc", Longitud: "" }]);
    expect(o.Latitud).toBeNull();
    expect(o.Longitud).toBeNull();
  });
});

describe("código postal de entrada", () => {
  it.each(["64060", " 64060 ", "01000"])("acepta %j", (cp) => {
    expect(codigoPostalSchema.safeParse(cp).success).toBe(true);
  });
  it.each(["", "abc", "6406", "640601", "64 060", "00000", "99999", "64060;DROP", "6406a"])(
    "rechaza %j",
    (cp) => {
      expect(codigoPostalSchema.safeParse(cp).success).toBe(false);
    },
  );
});

describe("BusquedaCP", () => {
  it("el navegador solo manda el CP; el resto del payload lo fija el servidor", () => {
    const r = busquedaCpRequestSchema.parse({ CP: "64060", K_UsuarioApp: 999, B_Operadores: true });
    expect(r).toMatchObject({ CP: "64060", K_UsuarioApp: 0, B_Operadores: false, Session: "web" });
  });

  const fila = (cp: number, colonia: string, k = 1776, ciudad = "MONTERREY") => ({
    K_Pais: 1, C_Pais: "MEX", D_Pais: "MEXICO", K_Estado: 19, C_Estado: "NL", D_Estado: "NUEVO LEON",
    K_Ciudad: 7, D_Ciudad: ciudad, K_Colonia: k, D_Colonia: colonia, CodigoPostal: cp,
    K_Tipo_Cobertura: 1, D_Tipo_Cobertura: "PROPIA", B_Coberturaresora: false, B_Frontera: false,
    Ocurre: "True", EAD: "True", EntregaGarantizada: null, K_Oficina_corresponde: null,
  });

  it("agrupa las colonias de un CP válido", () => {
    const [r] = busquedaCpResponseSchema.parse([fila(64060, "OBISPADO"), fila(64060, "CENTRO", 3)]);
    expect(r).toEqual({ cp: "64060", estado: "NUEVO LEON", ciudad: "MONTERREY", colonias: ["OBISPADO", "CENTRO"] });
  });

  it("limpia tabuladores y descarta la fila falsa 'Especifique Otra Colonia'", () => {
    const [r] = busquedaCpResponseSchema.parse([
      fila(66655, "\tCOLINAS DE SANTA ENGRACIA", 36149),
      fila(66655, "Especifique Otra Colonia", -1),
    ]);
    expect(r.colonias).toEqual(["COLINAS DE SANTA ENGRACIA"]);
  });

  it("filas de CPs distintos (lo que SIBOX responde para un CP inexistente) = no encontrado", () => {
    expect(busquedaCpResponseSchema.parse([fila(66655, "A"), fila(64060, "B"), fila(87000, "C")])).toEqual([]);
  });

  it("respuesta vacía = no encontrado", () => {
    expect(busquedaCpResponseSchema.parse([])).toEqual([]);
  });

  it("respeta el CP con cero inicial (CodigoPostal numérico)", () => {
    const [r] = busquedaCpResponseSchema.parse([fila(1000, "CENTRO")]);
    expect(r.cp).toBe("01000");
  });
});

describe("ObtenerHorariosPorCP", () => {
  it("el parámetro se llama Codigo_Postal y se valida", () => {
    expect(horariosRequestSchema.parse({ Codigo_Postal: "64060" })).toEqual({ Codigo_Postal: "64060" });
    expect(horariosRequestSchema.safeParse({ CP: "64060" }).success).toBe(false);
    expect(horariosRequestSchema.safeParse({ Codigo_Postal: "99999" }).success).toBe(false);
  });

  it("mapea la respuesta real al tipo HorarioRecoleccion", () => {
    const [h] = horariosResponseSchema.parse([
      {
        K_Oficina: 721, D_Oficina: "MONTERREY-5 CONSTITUYENTES", Hora_Minima: "14:00", Hora_Maxima: "19:00",
        Hora_Limite_Captura: "13:30", B_Lunes: true, B_Martes: true, B_Miercoles: true, B_Jueves: true,
        B_Viernes: true, B_Sabado: false, B_Domingo: false,
      },
    ]);
    expect(h).toEqual({
      kOficina: 721,
      oficina: "MONTERREY-5 CONSTITUYENTES",
      horaMinima: "14:00",
      horaMaxima: "19:00",
      horaLimiteCaptura: "13:30",
      dias: { lunes: true, martes: true, miercoles: true, jueves: true, viernes: true, sabado: false, domingo: false },
    });
  });
});
