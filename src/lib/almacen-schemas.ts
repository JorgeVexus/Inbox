import { z } from "zod";
import type { CotizacionInput } from "@/types/cotizacion";
import type { ContactoGuardado } from "@/types/contacto";
import type { DatosFacturacion } from "@/types/facturacion";
import type { Domicilio } from "@/types/domicilio";

/**
 * Validación de TODO lo que se lee de localStorage/sessionStorage. Esos datos
 * los puede editar cualquiera desde las herramientas del navegador, otra
 * extensión, o venir de una versión anterior del sitio: un JSON válido pero
 * con otra forma (p. ej. `{"a":1}` en lugar de una lista) tumbaba /perfil con
 * `a.map is not a function` (hallazgo QA 2026-10-12). Regla: lo que no cumple
 * el esquema se descarta, nunca se usa "como viene".
 */
const texto = (max = 300) => z.string().max(max);

const contactoSchema: z.ZodType<ContactoGuardado> = z.object({
  id: texto(80),
  nombre: texto(120),
  cp: texto(10),
  ciudad: texto(120),
  colonia: texto(120),
  direccion: texto(200),
  numExt: texto(30),
  numInt: texto(30),
  telefono: texto(30),
  email: texto(160),
});

const domicilioSchema: z.ZodType<Domicilio> = z.object({
  id: texto(80),
  alias: texto(80),
  contacto: texto(120),
  telefono: texto(30),
  calle: texto(200),
  numero: texto(30),
  colonia: texto(120),
  cp: texto(10),
  ciudad: texto(120),
  estado: texto(120),
  referencias: texto(500),
  predeterminado: z.boolean(),
});

const datosFacturacionSchema: z.ZodType<DatosFacturacion> = z.object({
  rfc: texto(20),
  regimenFiscal: texto(20),
  cp: texto(10),
  estado: texto(120),
  ciudad: texto(120),
  colonia: texto(120),
  coloniaEspecificada: texto(120),
  direccion: texto(200),
  telefono: texto(30),
  correo: texto(160),
});

/** Lista: si NO es un arreglo se descarta todo (null); los elementos inválidos se omiten. */
function listaTolerante<T>(esquema: z.ZodType<T>) {
  return (valor: unknown): T[] | null => {
    if (!Array.isArray(valor)) return null;
    return valor.flatMap((item) => {
      const r = esquema.safeParse(item);
      return r.success ? [r.data] : [];
    });
  };
}

export const leerContactos = listaTolerante(contactoSchema);
export const leerDomicilios = listaTolerante(domicilioSchema);

export function leerDatosFacturacion(valor: unknown): DatosFacturacion | null {
  const r = datosFacturacionSchema.safeParse(valor);
  return r.success ? r.data : null;
}

const direccionBorrador = z.object({ cp: texto(10), ciudad: texto(120), colonia: texto(120) });
const borradorSchema: z.ZodType<CotizacionInput> = z.object({
  entrega: z.enum(["sucursal", "domicilio"]),
  envio: z.enum(["paquete", "sobre"]),
  origen: direccionBorrador,
  destino: direccionBorrador,
  paquetes: z
    .array(
      z.object({
        id: texto(80),
        cantidad: z.number().int().min(1).max(99),
        peso: texto(12),
        alto: texto(12),
        largo: texto(12),
        ancho: texto(12),
      }),
    )
    .min(1)
    .max(20),
});

export function leerBorradorCotizacion(valor: unknown): CotizacionInput | null {
  const r = borradorSchema.safeParse(valor);
  return r.success ? r.data : null;
}
