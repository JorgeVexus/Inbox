import type { Metadata } from "next";
import type { ReactNode } from "react";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Cotizar envío",
  descripcion:
    "Cotiza tu envío en línea: ingresa códigos postales, tipo de entrega y medidas del paquete y conoce el costo y la fecha estimada.",
  ruta: "/cotizar",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
