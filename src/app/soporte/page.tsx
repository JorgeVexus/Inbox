import { SoporteHero } from "@/components/soporte/soporte-hero";
import { ContactoForm } from "@/components/soporte/contacto-form";
import { CoberturaCTA } from "@/components/home/cobertura";
import { Faq } from "@/components/home/faq";

export default function SoportePage() {
  return (
    <>
      <SoporteHero />
      <ContactoForm />
      <CoberturaCTA />
      <Faq />
    </>
  );
}
