import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
      <section className="w-full max-w-xl rounded-md bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
        <p className="font-display text-sm font-bold text-primary">ERROR 404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
          No encontramos esta página
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
          Es posible que el enlace esté roto o que la página ya no exista.
        </p>
        <Button href="/" className="mt-7">Volver al inicio</Button>
      </section>
    </div>
  );
}
