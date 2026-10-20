import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MigasJsonLd } from "@/components/seo/json-ld";
import { paginaMeta } from "@/lib/seo";

export const metadata: Metadata = paginaMeta({
  titulo: "Quiénes somos",
  descripcion: "Conoce Inbox, parte del Grupo Transpaís: más de 90 años de experiencia moviendo lo que más te importa.",
  ruta: "/somos",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <MigasJsonLd nombre="Quiénes somos" ruta="/somos" />
      {children}
    </>
  );
}
