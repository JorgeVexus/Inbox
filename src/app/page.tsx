import { Hero } from "@/components/home/hero";
import { Servicios } from "@/components/home/servicios";
import { Cobertura, CoberturaCTA } from "@/components/home/cobertura";
import { AboutUs } from "@/components/home/about-us";
import { Faq } from "@/components/home/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <Servicios />
      <Cobertura />
      <CoberturaCTA />
      <AboutUs />
      <Faq />
    </>
  );
}
