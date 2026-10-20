"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FOTOS = ["/images/hero-1.webp", "/images/hero-2.webp", "/images/hero-3.webp", "/images/hero-4.webp"];
const CAMBIO_MS = 5000;

/**
 * Fotos rotativas del banner (Home y Somos) con la capa oscura encima. Va dentro de un contenedor
 * `relative` con alto fijo.
 *
 * Rendimiento (Lighthouse móvil, revisión 360° Fase 5): solo se descarga la foto visible y la
 * siguiente. Antes se pedían las 4 a la vez y las 3 ocultas competían por el ancho de banda con la
 * imagen que define el LCP. La primera va con `preload` y `fetchPriority="high"`.
 */
export function FotosHero() {
  // `paso` cuenta los cambios de foto; la foto visible es paso % FOTOS.length.
  const [paso, setPaso] = useState(0);
  const [precargaSiguiente, setPrecargaSiguiente] = useState(false);

  useEffect(() => {
    // Respeta "reducir movimiento" del sistema (WCAG 2.2.2): sin cambio automático de fotos.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // La segunda foto se pide a mitad del primer intervalo, cuando la página ya terminó de cargar.
    const adelanto = setTimeout(() => setPrecargaSiguiente(true), CAMBIO_MS / 2);
    const id = setInterval(() => setPaso((p) => p + 1), CAMBIO_MS);
    return () => {
      clearTimeout(adelanto);
      clearInterval(id);
    };
  }, []);

  const actual = paso % FOTOS.length;
  // Se montan la foto visible y la que sigue (esta última solo después de la precarga).
  const montadas = Math.min(FOTOS.length, paso + (paso > 0 || precargaSiguiente ? 2 : 1));

  return (
    <>
      {FOTOS.slice(0, montadas).map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          {...(i === 0 ? { preload: true, fetchPriority: "high" as const } : {})}
          className={`object-cover transition-opacity duration-1000 ${i === actual ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1.5px]" />
    </>
  );
}
