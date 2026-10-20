/**
 * Ref para enfocar un campo en cuanto aparece (p. ej. al abrir un editor en línea).
 * Sustituye a `autoFocus`: aquí el foco lo pide una acción de la persona (abrir el
 * editor), no la carga de la página. Debe pasarse como función estable (no inline)
 * para ejecutarse solo al montar.
 */
export function enfocarAlMontar(el: HTMLElement | null): void {
  el?.focus();
}
