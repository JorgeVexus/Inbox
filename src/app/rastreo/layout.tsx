import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Rastrear envío",
  descripcion: "Rastrea uno o varios envíos con tu número de guía y consulta su último estado y su historial de movimientos.",
  ruta: "/rastreo",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
