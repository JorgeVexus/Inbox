import Image from "next/image";

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

export function SomosHistoria() {
  return (
    <section className="mx-auto flex max-w-[1330px] flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-16">
      <div className="flex w-full flex-col divide-y divide-neutral-line lg:max-w-[796px]">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:gap-8"
          >
            <h3 className="w-full shrink-0 font-display text-xl font-bold text-black sm:w-[220px] sm:text-[25px]">
              {card.title}
            </h3>
            <p className="text-xs text-black">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="relative h-[280px] w-full shrink-0 lg:h-[444px] lg:w-[665px]">
        <Image
          src="/images/somos-auto.png"
          alt="Camioneta de reparto Inbox"
          fill
          className="object-contain"
        />
      </div>
    </section>
  );
}
