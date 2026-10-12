import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Mis envíos",
  descripcion: "Consulta el estado y el historial de tus envíos.",
  ruta: "/envio",
  indexar: false,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
