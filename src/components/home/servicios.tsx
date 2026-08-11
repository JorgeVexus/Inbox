import Image from "next/image";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    icon: "/icons/warehouse.svg",
    title: "Entrega en sucursal",
    description:
      "Recoge tus envíos en cualquiera de nuestras cómodas sucursales, disponibles desde las 8:00 a.m. hasta las 10:00 p.m. *Consulta restricciones aplicables.",
  },
  {
    icon: "/icons/shopping-bag-speed.svg",
    title: "Entrega el mismo día",
    description:
      "Sabemos que el tiempo es clave. Por eso ofrecemos entregas el mismo día en la zona Noreste del país. *Aplican restricciones según cobertura.",
  },
  {
    icon: "/icons/hand-package.svg",
    title: "Entrega a domicilio",
    description:
      "¿Prefieres recibir tu paquete en casa o en la oficina? Lo llevamos hasta tu puerta por un costo mínimo.",
  },
  {
    icon: "/icons/in-home-mode.svg",
    title: "Recolección a domicilio",
    description:
      "Nosotros pasamos por tus envíos donde tú nos indiques. Solicítalo en línea o llama al 01 800 713 1000. ¡Fácil y rápido!",
  },
  {
    icon: "/icons/package2.svg",
    title: "Empaque y fleje seguro",
    description:
      "Contamos con cajas de cartón y materiales de empaque para proteger tus envíos y darles mayor seguridad.",
  },
  {
    icon: "/icons/beenhere.svg",
    title: "Seguro por valor declarado",
    description:
      "Protege tu envío al 100% en caso de daño o pérdida. Puedes declarar hasta $10,000 MXN.",
  },
  {
    icon: "/icons/order-approve.svg",
    title: "Acuse de Recibo",
    description:
      "Recibe un comprobante firmado con los datos completos de quien recibe tu envío. *Consulta condiciones del servicio.",
  },
  {
    icon: "/images/cheque.png",
    title: "Acuse electrónico",
    description:
      "Te enviamos por correo electrónico el nombre y hora exacta de la persona que recibió tu paquete. ¡Sin costo extra!",
  },
  {
    icon: "/icons/hand-package2.svg",
    title: "Flete por cobrar",
    description:
      "Tú envías el paquete, pero quien lo recibe paga el costo del envío. Ideal si vendes productos o haces entregas a terceros.",
  },
  {
    icon: "/icons/siren-check.svg",
    title: "Servicio urgente",
    description:
      "¿Tienes una emergencia? Embarcamos tu envío en la próxima unidad disponible para entrega inmediata en sucursal. *Consulta disponibilidad.",
  },
  {
    icon: "/icons/map.svg",
    title: "Guías anticipadas",
    description:
      "Ahorra tiempo y dinero con nuestras guías prepagadas. Úsalas en cualquier zona de cobertura con tarifas especiales.",
  },
];

export function Servicios() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-16 lg:px-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
            Servicios que se adaptan a ti
          </h2>
          <p className="max-w-2xl text-base text-black">
            Cotiza tu envío en segundos y descubre lo fácil que es enviar con
            inbox®. Rápido, seguro y a tu medida. ¡Haz tu envío hoy mismo!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Button href="/envio">Hacer envío</Button>
          <Button href="/cotizar" variant="outline">
            Cotizar
          </Button>
        </div>
      </div>

      <div className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-4 lg:-mx-16 lg:px-16">
        {SERVICES.map((service) => (
          <article
            key={service.title}
            className="flex h-[300px] w-[300px] shrink-0 flex-col justify-center gap-6 rounded-md border-2 border-secondary-dark/50 bg-white p-6 shadow-card sm:w-[345px]"
          >
            <Image src={service.icon} alt="" width={64} height={64} className="h-[64px] w-[64px] object-contain" />
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-2xl font-bold text-black">
                {service.title}
              </h3>
              <p className="text-sm text-black">{service.description}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mx-auto max-w-3xl text-center text-base text-black">
        En inbox® te ofrecemos soluciones confiables y eficientes para cubrir
        todas tus necesidades de envío. Con atención personalizada y
        cobertura nacional, trabajamos para que tu experiencia sea ágil,
        segura y sin complicaciones.
      </p>
    </section>
  );
}
