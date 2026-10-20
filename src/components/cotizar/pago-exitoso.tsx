"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FacturacionModal } from "@/components/facturacion/facturacion-modal";
import type { CotizacionInput, GuiaGenerada } from "@/types/cotizacion";

export function PagoExitoso({ guia, cotizacion }: { guia: GuiaGenerada; cotizacion: CotizacionInput }) {
  const [facturarAbierto, setFacturarAbierto] = useState(false);
  const [facturado, setFacturado] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-10 rounded-xl bg-neutral-bg px-6 py-10 sm:px-16">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-3">
          <p className="font-display text-3xl font-bold text-green-700">Pago exitoso</p>
          <div className="relative h-[41px] w-[57px]">
            <Image src="/icons/credit-card.svg" alt="" fill className="object-contain opacity-70" />
            <Image src="/icons/check-circle.svg" alt="" width={22} height={22} className="absolute -right-1 -top-1" />
          </div>
        </div>
        <p className="text-xl text-black">Gracias por confiar en Inbox</p>
        <p className="text-xs text-black">Tu recibo fue enviado al correo electrónico proporcionado</p>
      </div>

      <div className="flex w-full max-w-[925px] flex-col gap-6 rounded-md bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-xl font-medium text-black">
            {cotizacion.entrega === "sucursal"
              ? "Entrega tu paquete en tu sucursal más cercana"
              : "Te avisaremos cuando el repartidor esté en camino"}
          </p>
          <Link href="/cobertura" className="inline-block py-2 font-display text-sm text-primary underline">
            Buscar otra sucursal
          </Link>
        </div>
        <div className="text-sm text-black">
          Folio de guía: <span className="font-bold">{guia.folio}</span>
        </div>
      </div>

      <div className="flex w-full max-w-[777px] flex-wrap justify-center gap-6">
        <div className="flex items-center gap-4 rounded-md bg-white px-6 py-5 shadow-card">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-black">Fecha estimada de envío</p>
            <p className="font-display text-xl font-semibold text-black">{guia.fechaEnvioEstimada}</p>
          </div>
          <Image src="/icons/delivery-truck-speed.svg" alt="" width={56} height={56} />
        </div>
        <div className="flex items-center gap-4 rounded-md bg-white px-6 py-5 shadow-card">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-black">Fecha estimada de llegada</p>
            <p className="font-display text-xl font-semibold text-black">{guia.fechaLlegadaEstimada}</p>
          </div>
          <Image src="/icons/hand-package.svg" alt="" width={56} height={56} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {facturado ? (
          <p className="flex items-center gap-2 font-display text-sm font-bold text-green-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Datos de facturación guardados
          </p>
        ) : (
          <Button type="button" onClick={() => setFacturarAbierto(true)} variant="outline">
            Facturar
          </Button>
        )}
        <p className="max-w-md text-center text-sm text-black/60">
          Puedes facturar después desde el enlace que recibirás en tu correo.{" "}
          <span className="text-black">Tienes 10 días naturales para hacerlo.</span>
        </p>
      </div>

      {facturarAbierto && (
        <FacturacionModal
          onClose={() => setFacturarAbierto(false)}
          onSuccess={() => {
            setFacturarAbierto(false);
            setFacturado(true);
          }}
        />
      )}

      <div className="flex items-center gap-8 font-display text-sm text-primary">
        <Link href="/" className="inline-block py-2 underline">
          Ir a inicio
        </Link>
        <Link href="/cuenta/crear" className="inline-block py-2 underline">
          Regístrate para llevar un seguimiento de tu envío
        </Link>
      </div>
    </div>
  );
}
