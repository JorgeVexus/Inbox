import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Agendar recolección",
  descripcion: "Programa la recolección de tus paquetes a domicilio.",
  ruta: "/recoleccion",
  indexar: false,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
