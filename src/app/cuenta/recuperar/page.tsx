import type { Metadata } from "next";
import { Proximamente } from "@/components/cuenta/proximamente";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarContrasenaPage() {
  return (
    <Proximamente
      eyebrow="RECUPERAR CONTRASEÑA"
      titulo="La recuperación de contraseña está en camino"
      descripcion="Estamos trabajando en este flujo con nuestro proveedor. Mientras tanto, contáctanos desde la página de soporte si necesitas ayuda con tu cuenta."
    />
  );
}
