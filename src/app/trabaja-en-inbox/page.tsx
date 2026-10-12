import type { Metadata } from "next";
import { Proximamente } from "@/components/cuenta/proximamente";

export const metadata: Metadata = { title: "Trabaja en Inbox", robots: { index: false } };

export default function Page() {
  return (
    <Proximamente
      eyebrow="BOLSA DE TRABAJO"
      titulo="Trabaja en Inbox"
      descripcion="Pronto publicaremos nuestras vacantes. Mientras tanto, puedes escribirnos desde la sección de Soporte."
    />
  );
}
