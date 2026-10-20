/**
 * Bitácora de errores del servidor con datos personales enmascarados (regla de seguridad 7
 * de CLAUDE.md): SIBOX a veces devuelve en sus mensajes de error correos, teléfonos, RFC o
 * tokens, y los registros de Vercel se conservan y se comparten con el equipo.
 */

const PATRONES: [RegExp, string][] = [
  [/eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{5,}/g, "[token]"],
  [/Bearer\s+[\w.~+/=-]{10,}/gi, "Bearer [token]"],
  [/[^\s,;<>()"']{1,100}@[^\s,;<>()"']{1,100}/g, "[correo]"],
  [/\b[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}\b/gi, "[rfc]"],
  [/\b\d{10,}\b/g, "[número]"],
];

export function enmascarar(texto: string): string {
  return PATRONES.reduce((t, [patron, reemplazo]) => t.replace(patron, reemplazo), texto);
}

function aTexto(valor: unknown): string {
  if (valor instanceof Error) return `${valor.name}: ${valor.message}`;
  if (typeof valor === "string") return valor;
  try {
    return JSON.stringify(valor) ?? String(valor);
  } catch {
    return String(valor);
  }
}

/** `console.error` seguro: nunca imprime objetos de error completos (pueden traer cuerpos de respuesta). */
export function logError(contexto: string, detalle?: unknown): void {
  const resto = detalle === undefined ? "" : ` -> ${enmascarar(aTexto(detalle).slice(0, 2000)).slice(0, 500)}`;
  console.error(`${contexto}${resto}`);
}
