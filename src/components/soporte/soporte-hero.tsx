import Image from "next/image";

const TARJETAS = [
  {
    icon: "/icons/call.svg",
    titulo: "Llámanos",
    contenido: (
      <>
        <span className="font-semibold text-primary">01 800 713 1000</span>{" "}
        (línea nacional gratuita)
        <br />
        <span className="font-semibold text-primary">834 171 3030</span>{" "}
        (línea directa)
        <br />
        <br />
        Lunes a sábado de 8:00 a 20:00 hrs GTM-5
      </>
    ),
  },
  {
    icon: "/icons/enviar-email.svg",
    titulo: "Envíanos un mensaje",
    contenido: (
      <>
        <span className="font-semibold text-primary">info@inbox.com.mx</span>
        <br />
        <br />
        También puedes utilizar el formulario en línea si prefieres una
        respuesta rápida.
      </>
    ),
  },
];

const REDES = [
  { icon: "/icons/facebook.svg", label: "Facebook" },
  { icon: "/icons/instagram.svg", label: "Instagram" },
  { icon: "/icons/linkedin.svg", label: "LinkedIn" },
];

export function SoporteHero() {
  return (
    <section className="relative mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-12 lg:px-16">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-black sm:text-[50px]">
          ¿Tienes dudas? Pregunta a nuestro chat
        </h1>
        <p className="max-w-3xl text-base text-black">
          Nuestro asistente está listo para ayudarte en todo momento. Haz tus
          preguntas sobre envíos, facturación, rastreo o cobertura y obtén
          respuestas al instante. Si lo necesitas, te conectamos con un
          asesor.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {TARJETAS.map((t) => (
          <div
            key={t.titulo}
            className="flex h-[201px] w-full max-w-[339px] flex-col justify-center gap-4 rounded-md border-2 border-secondary-dark/50 bg-white px-5 py-4 shadow-card"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <p className="font-display text-2xl font-bold text-black">
                {t.titulo}
              </p>
              <Image src={t.icon} alt="" width={50} height={50} />
            </div>
            <p className="text-sm text-black">{t.contenido}</p>
          </div>
        ))}

        <div className="flex h-[201px] w-full max-w-[339px] flex-col justify-between gap-4 rounded-md border-2 border-secondary-dark/50 bg-white px-6 py-6 shadow-card">
          <div className="flex flex-col gap-2">
            <p className="font-display text-2xl font-bold text-black">
              ¡Síguenos en redes!
            </p>
            <p className="text-sm text-black">
              Mantente al día con nuestras novedades, consejos de envío,
              promociones y más.
            </p>
          </div>
          <div className="flex items-center justify-between px-4">
            {REDES.map((r) => (
              <Image key={r.label} src={r.icon} alt={r.label} width={32} height={32} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
