import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MigasJsonLd } from "@/components/seo/json-ld";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Cobertura",
  descripcion:
    "Encuentra la sucursal Inbox más cercana: mapa de cobertura, horarios, direcciones y teléfonos por estado y ciudad.",
  ruta: "/cobertura",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <MigasJsonLd nombre="Cobertura" ruta="/cobertura" />
      {children}
    </>
  );
}
