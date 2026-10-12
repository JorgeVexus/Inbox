import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Soporte",
  descripcion: "Contáctanos por teléfono, correo o formulario. Nuestro equipo de servicio al cliente te ayuda con tu envío.",
  ruta: "/soporte",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
