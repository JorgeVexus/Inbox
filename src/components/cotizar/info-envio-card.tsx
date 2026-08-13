"use client";

import type { ReactNode } from "react";

export function InfoEnvioCard({
  origenLabel,
  destinoLabel,
  numPaquetes,
  medidasLabel,
  pesoLabel,
  onEditar,
  seguro,
  onToggleSeguro,
  total,
  children,
}: {
  origenLabel: string;
  destinoLabel: string;
  numPaquetes: number;
  medidasLabel: string;
  pesoLabel: string;
  onEditar?: () => void;
  seguro?: boolean;
  onToggleSeguro?: () => void;
  total: number;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[279px] flex-col gap-5 rounded-md bg-white p-6 shadow-card">
      <p className="text-right font-display text-sm text-primary">
        Información de envío
      </p>
      <div className="flex flex-col gap-2.5 pl-1.5 text-sm text-black">
        <p>Origen: {origenLabel}</p>
        <p>Destino: {destinoLabel}</p>
      </div>
      <div className="flex flex-col gap-2.5 pl-1.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold text-black">
            {numPaquetes} Paquete{numPaquetes === 1 ? "" : "s"}
          </p>
          {onEditar && (
            <button
              type="button"
              onClick={onEditar}
              className="shrink-0 rounded-md border border-primary px-2 py-1 text-xs font-medium text-primary"
            >
              Editar
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2.5 text-sm text-black">
          <p>Medidas: {medidasLabel}</p>
          <p>Peso estimado: {pesoLabel}</p>
        </div>
      </div>

      {onToggleSeguro && (
        <button
          type="button"
          onClick={onToggleSeguro}
          className={`flex items-center justify-between gap-2 rounded-md border-2 py-3 pl-3 pr-3 font-display text-sm font-bold ${
            seguro
              ? "border-primary bg-primary text-white"
              : "border-primary bg-white text-black"
          }`}
        >
          <span className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current" aria-hidden>
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
            Agregar seguro contra pérdidas
          </span>
          <span>$200</span>
        </button>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-bold text-black">Total</p>
        <p className="font-sans text-2xl font-bold text-black">
          ${total.toFixed(2)}{" "}
          <span className="text-sm font-medium">MXN</span>
        </p>
      </div>

      {children}
    </div>
  );
}
