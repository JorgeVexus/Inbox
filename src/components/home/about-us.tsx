import Image from "next/image";
import { Button } from "@/components/ui/button";

const CARDS = [
  {
    title: "Nuestra historia",
    description:
      "Como parte del Grupo Transpaís, una empresa con más de 90 años de experiencia, Inbox® nace con una misión clara: mover lo que más te importa, con la rapidez y seguridad que exiges.",
  },
  {
    title: "Conectamos destinos",
    description:
      "Contamos con una amplia red de cobertura nacional e internacional, en alianza con UPS, para llevar tus envíos a donde se necesiten.",
  },
  {
    title: "Lo que nos mueve",
    description:
      "Buscamos ser la empresa con el mejor servicio al cliente del país, superando expectativas en cada entrega.",
  },
  {
    title: "Comprometidos contigo",
    description:
      "Con un equipo comprometido, siempre dispuesto a sonreír, resolver y ofrecer una experiencia positiva en cada punto de contacto.",
  },
];

export function AboutUs() {
  return (
    <section className="mx-auto flex max-w-[1330px] flex-col items-center gap-12 px-6 py-16 lg:px-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
          Inbox, una solución confiable que crece contigo
        </h2>
        <p className="max-w-xl text-base text-black">
          Nuestra trayectoria, valores y visión detrás de cada entrega.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-stretch">
        <div className="flex w-full flex-col divide-y divide-neutral-line lg:flex-1">
          {CARDS.map((card) => (
            <div key={card.title} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:gap-8">
              <h3 className="w-full shrink-0 font-display text-xl font-bold text-black sm:w-[220px] sm:text-[25px]">
                {card.title}
              </h3>
              <p className="text-xs text-black">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-md lg:h-auto lg:w-[557px]">
          <Image
            src="/images/about-truck.png"
            alt="Camión de reparto Inbox"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <Button href="/somos">Saber más</Button>
    </section>
  );
}
