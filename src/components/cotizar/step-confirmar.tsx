"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoEnvioCard } from "@/components/cotizar/info-envio-card";
import { useAuth } from "@/components/auth/auth-provider";
import { pesoTotalPaquetes } from "@/lib/mock/cotizacion";
import type {
  ConfirmarInput,
  ContactoEnvio,
  CostoOpcion,
  CotizacionInput,
} from "@/types/cotizacion";

function contactoVacio(cp: string, ciudad: string, colonia: string): ContactoEnvio {
  return {
    nombre: "",
    cp,
    ciudad,
    colonia,
    direccion: "",
    numExt: "",
    numInt: "",
    telefono: "",
    email: "",
  };
}

export function StepConfirmar({
  cotizacion,
  opcion,
  initial,
  onEditar,
  onContinuar,
}: {
  cotizacion: CotizacionInput;
  opcion: CostoOpcion;
  initial: ConfirmarInput | null;
  onEditar: () => void;
  onContinuar: (input: ConfirmarInput) => void;
}) {
  const { session, openLogin } = useAuth();

  const [remitente, setRemitente] = useState<ContactoEnvio>(
    initial?.remitente ??
      contactoVacio(cotizacion.origen.cp, cotizacion.origen.ciudad, cotizacion.origen.colonia),
  );
  const [destinatario, setDestinatario] = useState<ContactoEnvio>(
    initial?.destinatario ??
      contactoVacio(cotizacion.destino.cp, cotizacion.destino.ciudad, cotizacion.destino.colonia),
  );
  const [contenido, setContenido] = useState(initial?.contenido ?? "");
  const [tipoContenido, setTipoContenido] = useState(initial?.tipoContenido ?? "");
  const [seguro, setSeguro] = useState(initial?.seguro ?? false);

  const paquete = cotizacion.paquetes[0];
  const medidasLabel = paquete
    ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm`
    : "—";
  const total = opcion.precio + (seguro ? 200 : 0);

  const canSubmit =
    remitente.nombre.trim() !== "" &&
    remitente.telefono.trim() !== "" &&
    destinatario.nombre.trim() !== "" &&
    destinatario.telefono.trim() !== "";

  function autocompletarConSesion() {
    if (!session) return openLogin();
    setRemitente((r) => ({ ...r, nombre: session.nombre, email: r.email }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onContinuar({ remitente, destinatario, contenido, tipoContenido, seguro });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-8 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12 lg:flex-row lg:items-start"
    >
      <div className="flex w-full flex-col gap-6">
        <button
          type="button"
          onClick={autocompletarConSesion}
          className="self-end font-display text-sm"
        >
          {session ? (
            <span className="text-black">
              Usar datos de <span className="font-bold">{session.nombre}</span>
            </span>
          ) : (
            <span>
              <span className="font-bold text-primary underline">Inicia sesión</span>{" "}
              <span className="text-black">para completar tu información.</span>
            </span>
          )}
        </button>

        <div className="flex flex-col gap-8 rounded-md bg-white p-6 shadow-card lg:flex-row lg:items-start lg:justify-center lg:divide-x lg:divide-neutral-line">
          <ContactoForm
            titulo="Origen"
            value={remitente}
            onChange={setRemitente}
            nombreLabel="Nombre del remitente"
          />
          <div className="lg:pl-8">
            <ContactoForm
              titulo="Destino"
              value={destinatario}
              onChange={setDestinatario}
              nombreLabel="Nombre del destinatario"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label className="text-xs font-medium text-black">
              Detalle del contenido
            </label>
            <input
              type="text"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Descripción del contenido"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
            <button
              type="button"
              className="mt-2 flex items-center gap-3 text-sm text-black"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black/70" aria-hidden>
                <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              Artículos prohibidos
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-xs font-medium text-black">
              Tipo de contenido
            </label>
            <input
              type="text"
              value={tipoContenido}
              onChange={(e) => setTipoContenido(e.target.value)}
              placeholder="Producto SAT"
              className="h-[43px] w-full max-w-[303px] rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
        </div>
      </div>

      <InfoEnvioCard
        origenLabel={`${cotizacion.origen.ciudad || "—"}, ${cotizacion.origen.cp}`}
        destinoLabel={`${cotizacion.destino.ciudad || "—"}, ${cotizacion.destino.cp}`}
        numPaquetes={cotizacion.paquetes.length}
        medidasLabel={medidasLabel}
        pesoLabel={`${pesoTotalPaquetes(cotizacion.paquetes)} kg`}
        onEditar={onEditar}
        seguro={seguro}
        onToggleSeguro={() => setSeguro((v) => !v)}
        total={total}
      >
        <Button
          type="submit"
          className={canSubmit ? "" : "pointer-events-none opacity-50"}
        >
          Continuar
        </Button>
      </InfoEnvioCard>
    </form>
  );
}

function ContactoForm({
  titulo,
  value,
  onChange,
  nombreLabel,
}: {
  titulo: string;
  value: ContactoEnvio;
  onChange: (v: ContactoEnvio) => void;
  nombreLabel: string;
}) {
  function set<K extends keyof ContactoEnvio>(key: K, v: ContactoEnvio[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex w-full max-w-[320px] flex-col items-center gap-6">
      <p className="font-display text-2xl font-bold text-black">{titulo}</p>
      <div className="flex w-full flex-col gap-4">
        <Field label={nombreLabel}>
          <input
            type="text"
            value={value.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Nombre completo"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <div className="flex gap-2.5">
          <Field label="C.P" className="w-[86px]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={value.cp}
              onChange={(e) => set("cp", e.target.value)}
              className="h-[43px] w-[86px] rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black shadow-card outline-none"
            />
          </Field>
          <Field label="Ciudad" className="flex-1">
            <input
              type="text"
              value={value.ciudad}
              onChange={(e) => set("ciudad", e.target.value)}
              placeholder="Estado"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <Field label="Colonia" className="flex-1">
            <input
              type="text"
              value={value.colonia}
              onChange={(e) => set("colonia", e.target.value)}
              placeholder="Colonia"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            type="text"
            value={value.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            placeholder={`Dirección del ${titulo === "Origen" ? "remitente" : "destinatario"}`}
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <div className="flex gap-4">
          <Field label="No. Exterior" className="flex-1">
            <input
              type="text"
              value={value.numExt}
              onChange={(e) => set("numExt", e.target.value)}
              placeholder="No. ext"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <Field label="No. Interior" className="flex-1">
            <input
              type="text"
              value={value.numInt}
              onChange={(e) => set("numInt", e.target.value)}
              placeholder="No. int"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
        </div>

        <Field label="Teléfono">
          <input
            type="tel"
            value={value.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            placeholder="Número celular"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Correo electrónico"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-medium text-black">{label}</label>
      {children}
    </div>
  );
}
