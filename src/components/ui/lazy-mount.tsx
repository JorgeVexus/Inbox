"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Monta a sus hijos solo cuando el contenedor está por entrar en pantalla.
 * Se usa con el mapa de Leaflet: evita bajar su JavaScript y las teselas de
 * OpenStreetMap hasta que la persona llega a esa sección (Lighthouse móvil
 * marcaba JS sin usar y mucho bloqueo del hilo principal en Home).
 */
export function LazyMount({
  children,
  className,
  rootMargin = "400px",
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}
