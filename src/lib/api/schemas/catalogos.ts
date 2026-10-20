import { z } from "zod";
import type { ResultadoCP } from "@/types/codigo-postal";
import type { HorarioRecoleccion } from "@/types/recoleccion";
import type { Sucursal } from "@/types/sucursal";

/**
 * Esquemas de los endpoints de LECTURA de SIBOX, ajustados contra la API real
 * (QA 2026-10-12). Todavia no estan conectados a ninguna ruta ni a la UI: son
 * el contrato verificado para cuando se conecten los seams. Diferencias reales
 * respecto a los tipos del mock (y al PDF):
 *  - los ids vienen como TEXTO ("17"), no numeros;
 *  - `B_Ocurre`/`B_Frontera` son "SI"/"NO", no booleanos;
 *  - `ListadoOficinas` NO trae `D_Estado` (solo `C_Estado`, p.ej. "TAM");
 *  - Latitud/Longitud vienen null en ~55% de las oficinas (39 de 71);
 *  - `BusquedaCP` y `ObtenerHorariosPorCP` NO regresan vacio para un CP
 *    inexistente: devuelven filas de OTROS CPs (o el catalogo completo), asi
 *    que hay que validar el CP de entrada y descartar respuestas ambiguas;
 *  - los nombres de colonia traen tabuladores y hay una fila falsa
 *    "Especifique Otra Colonia" (K_Colonia = -1).
 */

/** CP de 5 digitos. 00000 y 99999 son centinelas que SIBOX responde con basura. */
export const codigoPostalSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "Código postal inválido")
  .refine((cp) => cp !== "00000" && cp !== "99999", "Código postal inválido");

// ---------------------------------------------------------------- Oficinas

/** Request de ListadoOficinas: sin filtros = todas las oficinas (public, sin datos personales). */
export const oficinasRequestSchema = z.strictObject({}).transform(() => ({
  K_Oficina: "",
  D_Oficina: "",
  K_Estado: "",
  K_Ciudad: "",
  CP: "",
  K_UsuarioApp: 0,
  Session: "",
  NombreDispositivo: "web",
  B_Operadores: false,
  Mensaje: "",
}));

/** `ListadoOficinas` no regresa el nombre del estado: tabla de los codigos vistos. */
const NOMBRE_ESTADO: Record<string, string> = {
  TAM: "TAMAULIPAS",
  VER: "VERACRUZ",
  SLP: "SAN LUIS POTOSI",
  GTO: "GUANAJUATO",
  NL: "NUEVO LEON",
  COAH: "COAHUILA",
};

const entero = z.coerce.number().int();
const coordenada = z.union([z.string(), z.number(), z.null()]).transform((v) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
});

const oficinaSchema = z
  .object({
    K_Oficina: entero,
    D_Oficina: z.string(),
    C_Oficina: z.string(),
    K_Estado: entero,
    C_Estado: z.string(),
    K_Ciudad: entero,
    D_Ciudad: z.string(),
    Calle: z.string().nullable(),
    Codigo_Postal: z.string().nullable(),
    Telefono: z.string().nullable(),
    B_Ocurre: z.string(),
    B_Frontera: z.string(),
    Latitud: coordenada,
    Longitud: coordenada,
    Observaciones: z.string().nullable(),
  })
  .transform((o): Sucursal => ({
    K_Oficina: o.K_Oficina,
    D_Oficina: o.D_Oficina.trim(),
    C_Oficina: o.C_Oficina.trim(),
    K_Estado: o.K_Estado,
    C_Estado: o.C_Estado,
    D_Estado: NOMBRE_ESTADO[o.C_Estado] ?? o.C_Estado,
    K_Ciudad: o.K_Ciudad,
    D_Ciudad: o.D_Ciudad.trim(),
    Calle: (o.Calle ?? "").trim(),
    Codigo_Postal: (o.Codigo_Postal ?? "").trim(),
    Telefono: o.Telefono?.trim() ? o.Telefono.trim() : null,
    B_Ocurre: o.B_Ocurre.toUpperCase() === "SI",
    B_Frontera: o.B_Frontera.toUpperCase() === "SI",
    Latitud: o.Latitud,
    Longitud: o.Longitud,
    Observaciones: o.Observaciones?.trim() ? o.Observaciones.trim() : null,
    // `tipo` no existe en la API: se infiere de B_Ocurre (ver types/sucursal.ts).
    tipo: o.B_Ocurre.toUpperCase() === "SI" ? "sucursal" : "distribucion",
  }));

export const oficinasResponseSchema = z.array(oficinaSchema);

// ------------------------------------------------------------- BusquedaCP

/** Lo unico que acepta el navegador: un CP. El resto del payload lo fija el servidor. */
export const busquedaCpRequestSchema = z.strictObject({ CP: codigoPostalSchema }).transform(({ CP }) => ({
  CP,
  Colonia: "",
  Estado: "",
  NombreEstado: "",
  Ciudad: "",
  NombreCiudad: "",
  B_Remitente: false,
  B_Destinatario: false,
  B_Cobertura: false,
  B_SoloCiudades: false,
  B_BusquedaMAPS: false,
  K_UsuarioApp: 0,
  Session: "web",
  NombreDispositivo: "web",
  B_Operadores: false,
}));

const filaCpSchema = z.object({
  D_Estado: z.string(),
  D_Ciudad: z.string(),
  K_Colonia: z.number(),
  D_Colonia: z.string(),
  CodigoPostal: z.union([z.number(), z.string()]).transform((v) => String(v).padStart(5, "0")),
});

/**
 * Agrupa las filas (una por colonia) en un ResultadoCP. Si las filas no
 * pertenecen todas al MISMO CP (SIBOX responde asi cuando el CP no existe),
 * se considera "no encontrado": regresa [] en lugar de asignar un estado/ciudad
 * equivocado al usuario.
 */
export const busquedaCpResponseSchema = z.array(filaCpSchema).transform((filas): ResultadoCP[] => {
  if (filas.length === 0) return [];
  const cps = new Set(filas.map((f) => f.CodigoPostal));
  if (cps.size !== 1) return [];
  const colonias = [
    ...new Set(
      filas
        .filter((f) => f.K_Colonia !== -1)
        .map((f) => f.D_Colonia.trim())
        .filter(Boolean),
    ),
  ];
  const [primera] = filas;
  if (!primera) return [];
  return [
    {
      cp: primera.CodigoPostal,
      estado: primera.D_Estado.trim(),
      ciudad: primera.D_Ciudad.trim(),
      colonias,
    },
  ];
});

// ---------------------------------------------------- ObtenerHorariosPorCP

/** OJO: el parametro se llama `Codigo_Postal` (no `CP`). */
export const horariosRequestSchema = z.strictObject({ Codigo_Postal: codigoPostalSchema });

const horaSchema = z.string().regex(/^\d{1,2}:\d{2}/);

export const horariosResponseSchema = z
  .array(
    z.object({
      K_Oficina: z.number(),
      D_Oficina: z.string(),
      Hora_Minima: horaSchema,
      Hora_Maxima: horaSchema,
      Hora_Limite_Captura: horaSchema,
      B_Lunes: z.boolean(),
      B_Martes: z.boolean(),
      B_Miercoles: z.boolean(),
      B_Jueves: z.boolean(),
      B_Viernes: z.boolean(),
      B_Sabado: z.boolean(),
      B_Domingo: z.boolean(),
    }),
  )
  .transform((filas): HorarioRecoleccion[] =>
    filas.map((h) => ({
      kOficina: h.K_Oficina,
      oficina: h.D_Oficina.trim(),
      horaMinima: h.Hora_Minima,
      horaMaxima: h.Hora_Maxima,
      horaLimiteCaptura: h.Hora_Limite_Captura,
      dias: {
        lunes: h.B_Lunes,
        martes: h.B_Martes,
        miercoles: h.B_Miercoles,
        jueves: h.B_Jueves,
        viernes: h.B_Viernes,
        sabado: h.B_Sabado,
        domingo: h.B_Domingo,
      },
    })),
  );
