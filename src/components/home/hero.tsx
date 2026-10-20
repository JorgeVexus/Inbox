"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuoteCard } from "@/components/home/quote-card";
import { FotosHero } from "@/components/ui/fotos-hero";

export function Hero() {
  const router = useRouter();
  const [guia, setGuia] = useState("");

  function handleRastrear(e: React.FormEvent) {
    e.preventDefault();
    if (!guia.trim()) return;
    router.push(`/rastreo?guias=${encodeURIComponent(guia.trim())}`);
  }

  return (
    <section className="relative">
      {/* Banner: sliding photos + dark overlay + rastreo search. Clipped to a
          fixed height — the quote card below is a separate sibling that
          overlaps it via negative margin, matching the Figma layout where
          the quote card straddles the banner and the white section below. */}
      <div className="relative h-[577px] w-full overflow-hidden">
        <FotosHero />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center gap-5 px-6 pt-16 sm:pt-20">
          <h1 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">Rastree su envío</h1>
          <form onSubmit={handleRastrear} className="flex w-full max-w-[406px] items-center gap-4">
            <input
              autoComplete="off"
              type="text"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              aria-label="Ingrese el número de rastreo"
              maxLength={200}
              placeholder="Ingrese el número de rastreo"
              className="h-[53px] min-w-0 flex-1 rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
            <Button type="submit">Rastrear</Button>
          </form>
        </div>
      </div>

      {/* Quote card — overlaps the bottom of the banner and spills into the
          white section below (see Figma node 672:18562 / 672:19951). */}
      <div className="relative z-10 mx-auto -mt-[210px] flex w-full max-w-[574px] flex-col items-center gap-4 px-6 sm:-mt-[240px]">
        <h2 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">Obtenga una cotización</h2>
        <QuoteCard />
      </div>
    </section>
  );
}
