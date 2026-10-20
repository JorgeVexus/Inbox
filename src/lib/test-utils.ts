/** Utilidades solo para pruebas. */

/** Devuelve el único/primer elemento de un arreglo o falla con un mensaje claro (útil con noUncheckedIndexedAccess). */
export function primero<T>(arreglo: readonly T[]): T {
  const [x] = arreglo;
  if (x === undefined) throw new Error("se esperaba al menos un elemento");
  return x;
}
