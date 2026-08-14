import { SoporteHero } from "@/components/soporte/soporte-hero";
import { ContactoForm } from "@/components/soporte/contacto-form";
import { CoberturaCTA } from "@/components/home/cobertura";
import { Faq } from "@/components/home/faq";

export default function SoportePage() {
  return (
    <>
      <SoporteHero />
      <ContactoForm />
      <div className="mt-16">
        <CoberturaCTA />
      </div>
      <div className="my-16">
        <Faq />
      </div>
    </>
  );
}
