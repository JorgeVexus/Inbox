"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  detectarMarca,
  formatNumeroTarjeta,
  formatVencimiento,
  luhnValido,
  vencimientoValido,
  type MarcaTarjeta,
} from "@/lib/tarjeta";
import type { TarjetaInput } from "@/types/cotizacion";

export function TarjetaForm({
  value,
  onChange,
  onVolver,
  procesando,
  onConfirmar,
}: {
  value: TarjetaInput;
  onChange: (v: TarjetaInput) => void;
  onVolver: () => void;
  procesando: boolean;
  onConfirmar: () => void;
}) {
  function set<K extends keyof TarjetaInput>(key: K, v: TarjetaInput[K]) {
    onChange({ ...value, [key]: v });
  }

  const cvvEsperado = detectarMarca(value.numero) === "amex" ? 4 : 3;
  const canSubmit =
    luhnValido(value.numero) &&
    value.nombreTitular.trim().length >= 3 &&
    vencimientoValido(value.vencimiento) &&
    value.cvv.length === cvvEsperado;

  return (
    <div className="flex w-full flex-col items-end gap-8">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onVolver} aria-label="Volver">
            <Image src="/icons/arrow-circle-left.svg" alt="" width={34} height={34} />
          </button>
          <p className="font-display text-2xl font-bold text-black">Datos de la tarjeta</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-4 rounded-md bg-white p-6 shadow-card sm:max-w-[400px]">
            <Field label="Número de tarjeta">
              <input
                autoComplete="cc-number"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={value.numero}
                onChange={(e) => set("numero", formatNumeroTarjeta(e.target.value))}
                aria-label="Número de tarjeta"
                placeholder="0000 0000 0000 0000"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
            <Field label="Nombre del titular">
              <input
                autoComplete="cc-name"
                type="text"
                value={value.nombreTitular}
                onChange={(e) => set("nombreTitular", e.target.value)}
                aria-label="Nombre del titular"
                placeholder="Como aparece en la tarjeta"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
            <div className="flex gap-4">
              <Field label="Vencimiento" className="flex-1">
                <input
                  autoComplete="cc-exp"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={value.vencimiento}
                  onChange={(e) => set("vencimiento", formatVencimiento(e.target.value))}
                  aria-label="Vencimiento (MM/AA)"
                  placeholder="MM/AA"
                  className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
                />
              </Field>
              <Field label="CVV" className="flex-1">
                <input
                  autoComplete="cc-csc"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={value.cvv}
                  onChange={(e) => set("cvv", e.target.value.replace(/\D/g, ""))}
                  aria-label="Código de seguridad CVV"
                  placeholder="123"
                  className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
                />
              </Field>
            </div>
          </div>

          <CardPreview numero={value.numero} nombreTitular={value.nombreTitular} vencimiento={value.vencimiento} />
        </div>
      </div>

      {!canSubmit && (
        <p role="status" className="self-start text-xs font-medium text-black/60">
          Revisa el número, el vencimiento (MM/AA, no vencida) y el CVV de la tarjeta.
        </p>
      )}
      <Button
        onClick={onConfirmar}
        disabled={!canSubmit || procesando}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        {procesando ? "Procesando…" : "Confirmar pago"}
      </Button>
    </div>
  );
}

function CardPreview({
  numero,
  nombreTitular,
  vencimiento,
}: {
  numero: string;
  nombreTitular: string;
  vencimiento: string;
}) {
  const digits = numero.replace(/\D/g, "");
  const marca = detectarMarca(numero);
  const padded = digits.padEnd(16, "•");
  const groups = [0, 1, 2, 3].map((i) => {
    const group = padded.slice(i * 4, i * 4 + 4);
    return i < 3 ? group.replace(/[0-9]/g, "•") : group;
  });

  return (
    <div className="relative h-[201px] w-[331px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white shadow-card">
      <div className="h-8 w-11 rounded bg-gradient-to-br from-yellow-300 to-yellow-500" />

      <p className="mt-8 font-mono text-lg tracking-widest">{groups.join(" ")}</p>

      <div className="mt-6 flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase text-white/60">Titular</span>
          <span className="max-w-[180px] truncate text-xs font-medium uppercase">
            {nombreTitular || "Nombre del titular"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] uppercase text-white/60">Vence</span>
          <span className="text-xs font-medium">{vencimiento || "MM/AA"}</span>
        </div>
      </div>

      <div className="absolute bottom-5 right-6">
        <MarcaLogo marca={marca} />
      </div>
    </div>
  );
}

function MarcaLogo({ marca }: { marca: MarcaTarjeta }) {
  if (marca === "visa") {
    return <span className="font-display text-xl italic font-bold">VISA</span>;
  }
  if (marca === "mastercard") {
    return (
      <div className="flex" aria-label="Mastercard">
        <span className="h-6 w-6 rounded-full bg-red-500/90" />
        <span className="-ml-2.5 h-6 w-6 rounded-full bg-orange-400/90 mix-blend-screen" />
      </div>
    );
  }
  if (marca === "amex") {
    return <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-800">AMEX</span>;
  }
  return null;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-medium text-black">{label}</label>
      {children}
    </div>
  );
}
