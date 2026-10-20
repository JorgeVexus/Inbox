/** Utilidades de tarjeta, 100 % locales (nada se envía a ningún servidor). */
/**
 * Card number/expiry formatting and network detection are pure client-side
 * logic (Luhn-style prefix ranges) — they don't depend on SIBOX or any
 * backend. Identifying the *issuing bank* (e.g. "BBVA") instead of just the
 * network would require a BIN-lookup service, which is a separate external
 * API (not part of the SIBOX spec) — intentionally not wired here.
 */
export function formatNumeroTarjeta(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

export function formatVencimiento(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Algoritmo de Luhn: detecta números de tarjeta mal capturados. */
export function luhnValido(numero: string): boolean {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 13 || digitos.length > 19) return false;
  let suma = 0;
  let doble = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = Number(digitos[i]);
    if (doble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    doble = !doble;
  }
  return suma % 10 === 0;
}

/** MM/AA con mes 01–12 y que no esté vencida (vale hasta el fin del mes indicado). */
export function vencimientoValido(valor: string, hoy: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(valor);
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  return anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);
}

export type MarcaTarjeta = "visa" | "mastercard" | "amex" | null;

export function detectarMarca(numero: string): MarcaTarjeta {
  const digits = numero.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return null;
}
