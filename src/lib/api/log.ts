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

/**
 * Registro de errores del servidor en una línea JSON (se puede buscar y filtrar en los registros de
 * Vercel). `requestId` correlaciona todas las líneas de una misma petición con el encabezado
 * `X-Request-Id` que recibe quien llamó: si alguien reporta un fallo, ese identificador lleva a la
 * línea exacta. Nunca imprime objetos de error completos (pueden traer cuerpos de respuesta).
 */
export function logError(contexto: string, detalle?: unknown, requestId?: string): void {
  const linea: Record<string, string> = { nivel: "error", evento: contexto, t: new Date().toISOString() };
  if (detalle !== undefined) linea.detalle = enmascarar(aTexto(detalle).slice(0, 2000)).slice(0, 500);
  if (requestId) linea.requestId = requestId;
  console.error(JSON.stringify(linea));
}
