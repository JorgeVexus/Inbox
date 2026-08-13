import { SomosHero } from "@/components/somos/somos-hero";
import { SomosHistoria } from "@/components/somos/somos-historia";
import { Servicios } from "@/components/home/servicios";
import { CoberturaCTA } from "@/components/home/cobertura";
import { Faq } from "@/components/home/faq";

export default function SomosPage() {
  return (
    <>
      <SomosHero />
      <SomosHistoria />
      <Servicios />
      <CoberturaCTA />
      <Faq />
    </>
  );
}
