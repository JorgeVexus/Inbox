import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Mi perfil",
  descripcion: "Administra tus datos, direcciones, contactos y facturación.",
  ruta: "/perfil",
  indexar: false,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
