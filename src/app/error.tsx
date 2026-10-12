"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
      <section role="alert" className="w-full max-w-xl rounded-md bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
        <p className="font-display text-sm font-bold text-primary">ALGO SALIÓ MAL</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
          Ocurrió un error inesperado
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
          Intenta de nuevo. Si el problema continúa, contáctanos desde Soporte.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>Reintentar</Button>
          <Button href="/soporte" variant="outline">Ir a Soporte</Button>
        </div>
      </section>
    </div>
  );
}
