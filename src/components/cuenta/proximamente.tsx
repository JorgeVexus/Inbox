import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProximamenteProps = {
  eyebrow: string;
  titulo: string;
  descripcion: string;
};

export function Proximamente({ eyebrow, titulo, descripcion }: ProximamenteProps) {
  return (
    <main className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
      <section className="w-full max-w-xl rounded-md border border-neutral-line bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="font-display text-sm font-bold text-primary">{eyebrow}</p>
          <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">
            Próximamente
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
          {titulo}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
          {descripcion}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/">Volver al inicio</Button>
        </div>
        <p className="mx-auto mt-6 max-w-md text-xs text-black/50">
          Mientras tanto, puedes rastrear un envío o cotizar sin necesidad de
          una cuenta.{" "}
          <Link href="/rastreo" className="underline hover:text-primary">
            Ir a rastreo
          </Link>
        </p>
      </section>
    </main>
  );
}
