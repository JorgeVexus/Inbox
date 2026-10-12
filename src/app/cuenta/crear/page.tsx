import type { Metadata } from "next";
import { Proximamente } from "@/components/cuenta/proximamente";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function CrearCuentaPage() {
  return (
    <Proximamente
      eyebrow="CREAR CUENTA"
      titulo="El registro de cuenta está en camino"
      descripcion="Estamos trabajando en el registro y la asociación con tu cuenta de Inbox. Por ahora puedes seguir usando el sitio como invitado."
    />
  );
}
