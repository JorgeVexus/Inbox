"use client";

import Image from "next/image";
import { useState } from "react";
import { rastrearGuiaDetalle } from "@/lib/rastreo";
import { formatFechaCorta } from "@/lib/fecha";
import { pasoDesdeEstatus } from "@/types/rastreo";
import type { Rastreo, RastreoEvento } from "@/types/rastreo";

const PASOS = [
  { label: "Paquete recibido", icon: "/icons/package2.svg" },
  { label: "En tránsito", icon: "/icons/delivery-truck-speed.svg" },
  { label: "En proceso de entrega", icon: "/icons/markunread-mailbox.svg" },
  { label: "Entregado", icon: "/icons/hand-package.svg" },
];

export function RastreoCard({
  guia,
  resultado,
  onQuitar,
}: {
  guia: string;
  resultado: Rastreo | null;
  onQuitar: () => void;
}) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalle, setDetalle] = useState<RastreoEvento[] | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  async function toggleDetalle() {
    if (!detalleAbierto && detalle === null) {
      setCargandoDetalle(true);
      const eventos = await rastrearGuiaDetalle(guia);
      setDetalle(eventos ?? []);
      setCargandoDetalle(false);
    }
    setDetalleAbierto((v) => !v);
  }

  if (!resultado) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-md border border-secondary-dark/30 bg-white p-6 shadow-card-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-black">
            No encontramos información para la guía{" "}
            <span className="font-bold">{guia}</span>.
          </p>
          <button
            type="button"
            onClick={onQuitar}
            className="shrink-0 text-xs font-medium text-primary underline"
          >
            Quitar
          </button>
        </div>
      </div>
    );
  }

  const paso = pasoDesdeEstatus(resultado.Estatus);
  // "Código de rastreo" and "Fecha programada de entrega" appear in the
  // Figma but aren't part of wsRastreo's documented response — there's no
  // separate tracking code in the API, and the promised delivery date only
  // shows up in ObtieneDetalleCostos (F_promesa_entrega), not here. Using
  // the guía itself as the tracking code and the latest status date as the
  // stand-in "programada" date until backend clarifies where these should
  // really come from.
  const codigoRastreo = resultado.Guia;
  const fechaProgramada = formatFechaCorta(resultado.F_Estatus);

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-md border border-secondary-dark/20 bg-white p-6 shadow-card-sm sm:p-8">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2 font-medium">
          <Dato label="Número de guía" valor={resultado.Guia} />
          <Dato label="Código de rastreo" valor={codigoRastreo} />
          <Dato label="Fecha programada de entrega" valor={fechaProgramada} />
        </div>
        <button
          type="button"
          onClick={onQuitar}
          aria-label={`Quitar guía ${guia}`}
          className="text-black/40 hover:text-black"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
          </svg>
        </button>
      </div>

      <div className="flex w-full items-center rounded-md border border-secondary-dark/20 px-6 py-8 sm:px-16">
        {PASOS.map((p, i) => (
          <div key={p.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex size-[64px] items-center justify-center rounded-full border-2 p-3 sm:size-[80px] ${
                  i < paso
                    ? "border-primary bg-primary"
                    : i === paso
                      ? "border-primary bg-white"
                      : "border-secondary-dark/50 bg-white"
                }`}
              >
                <Image
                  src={p.icon}
                  alt=""
                  width={40}
                  height={40}
                  className={i < paso ? "invert" : ""}
                />
              </span>
              <p
                className={`max-w-[110px] text-center text-xs font-medium sm:text-sm ${
                  i <= paso ? "text-black" : "text-secondary-dark"
                }`}
              >
                {p.label}
              </p>
            </div>
            {i < PASOS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 border-t-2 border-dashed sm:mx-2 ${
                  i < paso ? "border-primary" : "border-secondary-dark/40"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleDetalle}
        className="flex items-center gap-2 rounded-md border-2 border-primary bg-white px-4 py-2 font-display text-sm font-bold text-primary"
      >
        {detalleAbierto ? "Ver menos" : "Ver detalles"}
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 fill-primary transition-transform ${
            detalleAbierto ? "rotate-90" : "-rotate-90"
          }`}
          aria-hidden
        >
          <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
        </svg>
      </button>

      {detalleAbierto && (
        <div className="flex w-full flex-col gap-3 border-t border-neutral-line pt-4">
          {cargandoDetalle && (
            <p className="text-sm text-black/60">Cargando historial…</p>
          )}
          {!cargandoDetalle && detalle?.length === 0 && (
            <p className="text-sm text-black/60">
              Sin historial detallado disponible para esta guía.
            </p>
          )}
          {detalle?.map((evento) => (
            <div
              key={evento.K_Historia_Guia}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-bg px-4 py-3 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-bold text-black">{evento.Estatus}</span>
                <span className="text-black/70">{evento.OficinaEstatus}</span>
                {evento.Observaciones && (
                  <span className="text-xs text-black/50">{evento.Observaciones}</span>
                )}
              </div>
              <span className="text-xs font-medium text-secondary-dark">
                {formatFechaCorta(evento.F_Estatus)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-black">{label}</span>
      <span className="font-bold text-primary">{valor}</span>
    </div>
  );
}
