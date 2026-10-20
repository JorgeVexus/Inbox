"use client";

import type { ReactNode, RefObject } from "react";

/**
 * Cascarón común de los modales: fondo oscuro que cierra al hacer clic fuera,
 * panel con `role="dialog"` y botón de cierre. El comportamiento de teclado
 * (Escape, foco atrapado, bloqueo de scroll) vive en `useModalA11y`, que cada
 * modal llama con el mismo `panelRef` que recibe aquí.
 *
 * Capa `z-[1200]`: siempre por encima del Navbar y del chat (ver CLAUDE.md, reglas de z-index).
 */
export function ModalShell({
  onClose,
  panelRef,
  label,
  labelledBy,
  className,
  backdropClassName = "px-4",
  conBotonCerrar = true,
  children,
}: {
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  /** Nombre accesible del diálogo (si no hay un título visible con `labelledBy`). */
  label?: string;
  /** `id` del título visible que nombra al diálogo. */
  labelledBy?: string;
  className: string;
  backdropClassName?: string;
  conBotonCerrar?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 ${backdropClassName}`}
      role="presentation"
      onClick={(e) => {
        // Solo el fondo cierra; un clic dentro del panel (que burbujea hasta aquí) no.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={labelledBy}
        className={className}
      >
        {conBotonCerrar ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-black/5 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
            </svg>
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
