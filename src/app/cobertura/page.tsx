import Image from "next/image";
import Link from "next/link";
import { Cobertura } from "@/components/home/cobertura";
import { EstamosDonde } from "@/components/cobertura/estamos-donde";

export default function CoberturaPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1440px] items-center justify-end gap-2 px-6 pt-6 lg:px-16">
        <Link
          href="/"
          className="text-xs font-medium text-secondary-dark"
        >
          Inicio
        </Link>
        <svg viewBox="0 0 24 24" className="h-4 w-4 rotate-180 fill-secondary-dark" aria-hidden>
          <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
        </svg>
        <span className="flex items-center gap-1.5 text-xs font-medium text-secondary-dark">
          <Image src="/icons/globe-location-pin.svg" alt="" width={14} height={14} />
          Cobertura
        </span>
      </div>

      <Cobertura headlineImage="/images/cobertura-auto.png" />
      <EstamosDonde />
    </>
  );
}
