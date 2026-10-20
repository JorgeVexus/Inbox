import { FotosHero } from "@/components/ui/fotos-hero";

export function SomosHero() {
  return (
    <section className="relative">
      <div className="relative h-[577px] w-full overflow-hidden">
        <FotosHero />
      </div>

      {/* Headline card — overlaps the bottom of the banner, same pattern as
          Home's hero quote card (Figma node 324:26645). */}
      <div className="relative z-10 mx-auto -mt-[120px] flex w-full max-w-[610px] flex-col items-center gap-6 px-6 py-10 text-center sm:-mt-[150px]">
        <div className="flex w-full flex-col items-center gap-6 rounded-md bg-white px-10 py-8 shadow-card sm:px-[68px] sm:py-10">
          <h1 className="font-sans text-3xl font-bold text-primary sm:text-[40px]">
            Inbox, una solución confiable que crece contigo
          </h1>
          <p className="text-base text-black">Nuestra trayectoria, valores y visión detrás de cada entrega.</p>
        </div>
      </div>
    </section>
  );
}
