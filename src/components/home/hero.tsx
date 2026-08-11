"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

export function Hero() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[577px] w-full overflow-hidden">
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

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center justify-center gap-10 px-6 pt-8">
        <div className="flex w-full max-w-[406px] flex-col items-center gap-5">
          <h1 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">
            Rastree su envío
          </h1>
          <form className="flex w-full items-center gap-4">
            <input
              type="text"
              placeholder="Ingrese el número de rastreo"
              className="h-[53px] flex-1 rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-secondary-dark shadow-card outline-none"
            />
            <Button type="submit">Rastrear</Button>
          </form>
        </div>

        <div className="flex w-full max-w-[574px] flex-col items-center gap-4">
          <h2 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">
            Obtenga una cotización
          </h2>
          <QuoteCard />
        </div>
      </div>
    </section>
  );
}

function QuoteCard() {
  return (
    <div className="flex w-full flex-col gap-6 rounded-md bg-white px-5 py-8 shadow-card">
      <div className="flex flex-col gap-5">
        <p className="text-xl font-medium text-black">
          Seleccione el tipo de entrega
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <label className="flex items-center gap-2 text-sm font-medium text-black">
            <input type="radio" name="tipo-entrega" defaultChecked className="h-5 w-5 accent-primary" />
            Entrega en sucursal
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-black">
            <input type="radio" name="tipo-entrega" className="h-5 w-5 accent-primary" />
            Entrega a domicilio
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
        <OriginDestinationField label="Origen" placeholder="Ingrese el C.P de origen" />

        <button
          type="button"
          aria-label="Intercambiar origen y destino"
          className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-md bg-primary p-1.5"
        >
          <Image src="/icons/swap-calls.svg" alt="" width={26} height={26} className="rotate-90" />
        </button>

        <OriginDestinationField label="Destino" placeholder="Ingrese el C.P del destino" />
      </div>
    </div>
  );
}

function OriginDestinationField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="flex w-full max-w-[209px] flex-col items-center gap-3">
      <p className="text-2xl font-bold text-black">{label}</p>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-secondary-dark">{placeholder}</p>
          <div className="flex items-start gap-2.5">
            <div className="flex h-[53px] flex-1 items-center rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card-sm">
              <span className="text-xs font-medium text-secondary-dark">
                Código postal
              </span>
            </div>
            <button
              type="button"
              aria-label="Buscar sucursal"
              className="flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-md border-2 border-primary bg-white p-1"
            >
              <Image src="/icons/map-search.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </div>
        <div className="flex h-[50px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white pl-4 pr-3.5 shadow-card">
          <span className="text-xs font-medium text-secondary-dark">Ciudad</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 fill-secondary-dark" aria-hidden>
            <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
