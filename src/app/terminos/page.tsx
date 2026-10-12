import type { Metadata } from "next";
import { Proximamente } from "@/components/cuenta/proximamente";

export const metadata: Metadata = { title: "Términos y condiciones", robots: { index: false } };

export default function Page() {
  return (
    <Proximamente
      eyebrow="LEGAL"
      titulo="Términos y condiciones"
      descripcion="Estamos preparando la publicación de nuestros términos y condiciones de servicio. Si tienes dudas, contáctanos desde la sección de Soporte."
    />
  );
}
