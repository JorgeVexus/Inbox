import type { Metadata } from "next";
import { Proximamente } from "@/components/cuenta/proximamente";

export const metadata: Metadata = { title: "Aviso de privacidad", robots: { index: false } };

export default function Page() {
  return (
    <Proximamente
      eyebrow="LEGAL"
      titulo="Aviso de privacidad"
      descripcion="Estamos preparando la publicación de nuestro aviso de privacidad. Si tienes dudas sobre el uso de tus datos, escríbenos desde la sección de Soporte."
    />
  );
}
