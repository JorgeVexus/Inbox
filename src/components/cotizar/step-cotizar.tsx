"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  CotizacionInput,
  Direccion,
  EntregaTipo,
  EnvioTipo,
  Paquete,
} from "@/types/cotizacion";

function nuevoPaquete(): Paquete {
  return {
    id: crypto.randomUUID(),
    cantidad: 1,
    peso: "15",
    alto: "25",
    largo: "25",
    ancho: "25",
  };
}

export function defaultCotizacionInput(): CotizacionInput {
  return {
    entrega: "domicilio",
    envio: "paquete",
    origen: { cp: "", ciudad: "", colonia: "" },
    destino: { cp: "", ciudad: "", colonia: "" },
    paquetes: [nuevoPaquete()],
  };
}

export function StepCotizar({
  initial,
  onSubmit,
}: {
  initial: CotizacionInput;
  onSubmit: (input: CotizacionInput) => void;
}) {
  const [entrega, setEntrega] = useState<EntregaTipo>(initial.entrega);
  const [envio, setEnvio] = useState<EnvioTipo>(initial.envio);
  const [origen, setOrigen] = useState<Direccion>(initial.origen);
  const [destino, setDestino] = useState<Direccion>(initial.destino);
  const [paquetes, setPaquetes] = useState<Paquete[]>(initial.paquetes);

  const canSubmit =
    origen.cp.trim() !== "" &&
    origen.ciudad.trim() !== "" &&
    destino.cp.trim() !== "" &&
    destino.ciudad.trim() !== "";

  function swap() {
    setOrigen(destino);
    setDestino(origen);
  }

  function updatePaquete(id: string, patch: Partial<Paquete>) {
    setPaquetes((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addPaquete() {
    setPaquetes((ps) => [...ps, nuevoPaquete()]);
  }

  function removePaquete(id: string) {
    setPaquetes((ps) => (ps.length > 1 ? ps.filter((p) => p.id !== id) : ps));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ entrega, envio, origen, destino, paquetes });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col items-center gap-10 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12"
    >
      <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        <DireccionCard label="Origen" value={origen} onChange={setOrigen} />
        <button
          type="button"
          onClick={swap}
          aria-label="Intercambiar origen y destino"
          className="mt-8 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-md bg-primary p-1.5"
        >
          <Image src="/icons/swap-calls.svg" alt="" width={26} height={26} className="rotate-90" />
        </button>
        <DireccionCard label="Destino" value={destino} onChange={setDestino} />
      </div>

      <div className="flex w-full flex-col gap-4">
        <p className="text-xl font-medium text-black">
          Selecciona el tipo de entrega
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <OpcionRadio
            label="Entrega en sucursal"
            checked={entrega === "sucursal"}
            onClick={() => setEntrega("sucursal")}
          />
          <OpcionRadio
            label="Entrega a domicilio"
            checked={entrega === "domicilio"}
            onClick={() => setEntrega("domicilio")}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xl font-medium text-black">Selecciona una opción</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <OpcionRadio
              label="Paquete"
              checked={envio === "paquete"}
              onClick={() => setEnvio("paquete")}
            />
            <OpcionRadio
              label="Sobre"
              checked={envio === "sobre"}
              onClick={() => setEnvio("sobre")}
            />
          </div>
        </div>

        {envio === "paquete" &&
          paquetes.map((paquete, i) => (
            <PaqueteCard
              key={paquete.id}
              index={i}
              paquete={paquete}
              removable={paquetes.length > 1}
              onChange={(patch) => updatePaquete(paquete.id, patch)}
              onRemove={() => removePaquete(paquete.id)}
            />
          ))}

        {envio === "paquete" && (
          <button
            type="button"
            onClick={addPaquete}
            aria-label="Agregar otro paquete"
            className="flex h-[46px] w-[46px] items-center justify-center self-center rounded-md bg-white p-2 shadow-card"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black" aria-hidden>
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
          </button>
        )}
      </div>

      <Button type="submit" className={canSubmit ? "" : "pointer-events-none opacity-50"}>
        Cotizar
      </Button>
    </form>
  );
}

function DireccionCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Direccion;
  onChange: (v: Direccion) => void;
}) {
  return (
    <div className="flex w-full max-w-[353px] flex-col items-center gap-4">
      <p className="font-display text-2xl font-bold text-black">{label}</p>
      <div className="flex w-full flex-col gap-3 rounded-md bg-white p-5 shadow-card">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-secondary-dark">
            Ingrese el C.P de {label.toLowerCase()}
          </p>
          <div className="flex items-start gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={value.cp}
              onChange={(e) => onChange({ ...value, cp: e.target.value })}
              placeholder="Código postal"
              className="h-[53px] flex-1 rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
            />
            <button
              type="button"
              aria-label="Buscar sucursal"
              className="flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-md border-2 border-primary bg-white p-1"
            >
              <Image src="/icons/map-search.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </div>
        <input
          type="text"
          value={value.ciudad}
          onChange={(e) => onChange({ ...value, ciudad: e.target.value })}
          placeholder="Ciudad"
          className="h-[48px] w-full rounded-md border border-secondary-dark/50 bg-white px-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
        />
        <input
          type="text"
          value={value.colonia}
          onChange={(e) => onChange({ ...value, colonia: e.target.value })}
          placeholder="Colonia"
          className="h-[48px] w-full rounded-md border border-secondary-dark/50 bg-white px-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
        />
      </div>
    </div>
  );
}

function OpcionRadio({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-medium text-black"
    >
      <span
        className={`flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 bg-white ${
          checked ? "border-primary" : "border-secondary"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function PaqueteCard({
  index,
  paquete,
  removable,
  onChange,
  onRemove,
}: {
  index: number;
  paquete: Paquete;
  removable: boolean;
  onChange: (patch: Partial<Paquete>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative flex w-full flex-col gap-4 rounded-md bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar paquete ${index + 1}`}
          className="absolute right-3 top-3 text-black/40 hover:text-black"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
          </svg>
        </button>
      )}
      <div className="flex flex-wrap items-start gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-xl font-medium text-black">Peso</p>
          <MedidaInput
            unit="Kg"
            value={paquete.peso}
            onChange={(v) => onChange({ peso: v })}
          />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xl font-medium text-black">Medidas</p>
          <div className="flex items-center gap-4">
            <MedidaInput
              unit="Cm"
              value={paquete.alto}
              onChange={(v) => onChange({ alto: v })}
            />
            <MedidaInput
              unit="Cm"
              value={paquete.largo}
              onChange={(v) => onChange({ largo: v })}
            />
            <MedidaInput
              unit="Cm"
              value={paquete.ancho}
              onChange={(v) => onChange({ ancho: v })}
            />
          </div>
          <div className="flex justify-end gap-4 pr-3 text-xs text-secondary-dark">
            <span className="w-[82px] text-right">Alto</span>
            <span className="w-[82px] text-right">Largo</span>
            <span className="w-[82px] text-right">Ancho</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-xl font-medium text-black">Cantidad</p>
          <div className="flex h-[53px] w-[86px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-3 shadow-card">
            <span className="text-sm font-medium text-black">{paquete.cantidad}</span>
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() => onChange({ cantidad: paquete.cantidad + 1 })}
                className="rotate-180"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Disminuir cantidad"
                onClick={() =>
                  onChange({ cantidad: Math.max(1, paquete.cantidad - 1) })
                }
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs font-medium text-secondary-dark">
            Peso total {(Number(paquete.peso) || 0) * paquete.cantidad} kg
          </p>
        </div>
      </div>
    </div>
  );
}

function MedidaInput({
  unit,
  value,
  onChange,
}: {
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-[53px] w-[82px] items-center justify-end gap-1 rounded-md border border-[#707372]/70 bg-white px-3 shadow-card">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full min-w-0 text-right text-xs font-medium text-black outline-none"
      />
      <span className="shrink-0 text-xs font-medium text-black">{unit}</span>
    </div>
  );
}
