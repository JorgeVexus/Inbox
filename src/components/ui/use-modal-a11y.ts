"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de accesibilidad común a los modales (se monta solo mientras
 * el modal está abierto):
 *  - Escape lo cierra.
 *  - Tab/Shift+Tab se quedan dentro del panel (no se puede tabular "detrás").
 *  - Al abrir, el foco pasa al primer campo; al cerrar, regresa al elemento
 *    que lo abrió.
 *  - Se bloquea el scroll de la página de fondo mientras está abierto.
 */
export function useModalA11y(panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      const campos = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const primerCampo = [...campos].find((el) => !/Cerrar/.test(el.getAttribute("aria-label") ?? ""));
      (primerCampo ?? campos[0] ?? panel).focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const elementos = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!elementos.length) {
        e.preventDefault();
        return;
      }
      const primero = elementos[0];
      const ultimo = elementos.at(-1);
      if (!primero || !ultimo) return;
      const activo = document.activeElement;
      if (!panelRef.current.contains(activo)) {
        e.preventDefault();
        (e.shiftKey ? ultimo : primero).focus();
      } else if (e.shiftKey && activo === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [panelRef]);
}
