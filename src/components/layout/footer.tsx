import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Servicio al cliente",
    links: [
      { label: "Obtener cotización", href: "/cotizar" },
      { label: "Rastrear", href: "/rastreo" },
      { label: "Enviar", href: "/envio" },
      { label: "Cobertura", href: "/cobertura" },
    ],
  },
  {
    title: "Servicio al cliente",
    links: [
      { label: "Obtener cotización", href: "/cotizar" },
      { label: "Rastrear", href: "/rastreo" },
      { label: "Enviar", href: "/envio" },
      { label: "Cobertura", href: "/cobertura" },
    ],
  },
  {
    title: "Servicio al cliente",
    links: [
      { label: "Obtener cotización", href: "/cotizar" },
      { label: "Rastrear", href: "/rastreo" },
      { label: "Enviar", href: "/envio" },
      { label: "Cobertura", href: "/cobertura" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", icon: "/icons/facebook.svg" },
  { label: "Instagram", href: "https://instagram.com", icon: "/icons/instagram.svg" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "/icons/linkedin.svg" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary">
      <Image
        src="/images/footer-bg.png"
        alt=""
        fill
        className="pointer-events-none object-cover opacity-30"
      />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-14 lg:px-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative h-[90px] w-[140px] shrink-0">
            <Image
              src="/images/logo-blanco.png"
              alt="Inbox"
              fill
              className="object-contain"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-16">
            {COLUMNS.map((col, i) => (
              <div key={i} className="flex flex-col gap-2 text-center sm:text-left">
                <p className="mb-1 font-display text-base font-bold text-white">
                  {col.title}
                </p>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-base text-white/90 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="h-[2px] w-full rounded-full bg-secondary" />

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-4 font-display text-xs font-bold text-white lg:gap-6">
            <p>{new Date().getFullYear()} Inbox todos los derechos reservados</p>
            <Link href="/trabaja-en-inbox">Trabaja en Inbox</Link>
            <Link href="/privacidad">Política de privacidad</Link>
            <Link href="/terminos">Términos y condiciones</Link>
          </div>

          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                <Image src={social.icon} alt="" width={28} height={28} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
