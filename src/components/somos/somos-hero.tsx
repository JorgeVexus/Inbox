"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

export function SomosHero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative">
      <div className="relative h-[577px] w-full overflow-hidden">
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1.5px]" />
      </div>

      {/* Headline card — overlaps the bottom of the banner, same pattern as
          Home's hero quote card (Figma node 324:26645). */}
      <div className="relative z-10 mx-auto -mt-[120px] flex w-full max-w-[610px] flex-col items-center gap-6 px-6 py-10 text-center sm:-mt-[150px]">
        <div className="flex w-full flex-col items-center gap-6 rounded-md bg-white px-10 py-8 shadow-card sm:px-[68px] sm:py-10">
          <h1 className="font-sans text-3xl font-bold text-primary sm:text-[40px]">
            Inbox, una solución confiable que crece contigo
          </h1>
          <p className="text-base text-black">
            Nuestra trayectoria, valores y visión detrás de cada entrega.
          </p>
        </div>
      </div>
    </section>
  );
}
