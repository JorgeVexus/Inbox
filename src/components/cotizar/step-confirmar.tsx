"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AvisoPrivacidadCorto } from "@/components/ui/aviso-privacidad-corto";
import { InfoEnvioCard } from "@/components/cotizar/info-envio-card";
import { useAuth } from "@/components/auth/auth-provider";
import { listarContactos } from "@/lib/contactos";
import { pesoTotalPaquetes } from "@/lib/mock/cotizacion";
import type { ContactoGuardado } from "@/types/contacto";
import type { ConfirmarInput, ContactoEnvio, CostoOpcion, CotizacionInput } from "@/types/cotizacion";

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
    initial?.remitente ?? contactoVacio(cotizacion.origen.cp, cotizacion.origen.ciudad, cotizacion.origen.colonia),
  );
  const [destinatario, setDestinatario] = useState<ContactoEnvio>(
    initial?.destinatario ??
      contactoVacio(cotizacion.destino.cp, cotizacion.destino.ciudad, cotizacion.destino.colonia),
  );
  const [contenido, setContenido] = useState(initial?.contenido ?? "");
  const [tipoContenido, setTipoContenido] = useState(initial?.tipoContenido ?? "");
  const [seguro, setSeguro] = useState(initial?.seguro ?? false);

  const paquete = cotizacion.paquetes[0];
  const medidasLabel = paquete ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm` : "—";
  const total = opcion.precio + (seguro ? 200 : 0);

  const telefonoValido = (t: string) => {
    const digitos = t.replace(/\D/g, "");
    return /^[\d\s()+-]+$/.test(t.trim()) && digitos.length >= 10 && digitos.length <= 13;
  };
  const emailValido = (e: string) => e.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const canSubmit =
    remitente.nombre.trim() !== "" &&
    telefonoValido(remitente.telefono) &&
    emailValido(remitente.email) &&
    destinatario.nombre.trim() !== "" &&
    telefonoValido(destinatario.telefono) &&
    emailValido(destinatario.email);
  const motivo =
    remitente.nombre.trim() === "" || destinatario.nombre.trim() === ""
      ? "Escribe el nombre del remitente y del destinatario."
      : !telefonoValido(remitente.telefono) || !telefonoValido(destinatario.telefono)
        ? "Escribe teléfonos de 10 dígitos."
        : !emailValido(remitente.email) || !emailValido(destinatario.email)
          ? "Revisa que los correos electrónicos sean válidos."
          : "";

  const usuario = session?.usuario ?? null;
  const [contactos, setContactos] = useState<ContactoGuardado[]>([]);
  const [avisos, setAvisos] = useState<{ remitente: string | null; destinatario: string | null }>({
    remitente: null,
    destinatario: null,
  });

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;
    listarContactos(usuario).then((lista) => {
      if (!cancelado) setContactos(lista);
    });
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  // Sin sesión no se muestra el selector, aunque quede una lista en memoria
  // de una sesión anterior.
  const contactosVisibles = usuario ? contactos : [];

  /**
   * Vuelca un contacto guardado al formulario. El C.P./ciudad/colonia se
   * CONSERVAN de la cotización (el precio ya se calculó con ellos); si el
   * contacto tiene otro C.P. se avisa en vez de cambiarlo en silencio.
   */
  function elegirContacto(lado: "remitente" | "destinatario", id: string) {
    const c = contactosVisibles.find((x) => x.id === id);
    if (!c) return;
    const set = lado === "remitente" ? setRemitente : setDestinatario;
    set((actual) => ({
      ...actual,
      nombre: c.nombre,
      direccion: c.direccion,
      numExt: c.numExt,
      numInt: c.numInt,
      telefono: c.telefono,
      email: c.email,
    }));
    const cpCotizado = (lado === "remitente" ? cotizacion.origen : cotizacion.destino).cp;
    setAvisos((a) => ({
      ...a,
      [lado]:
        c.cp && cpCotizado && c.cp !== cpCotizado
          ? `El C.P. de este contacto (${c.cp}) es distinto al cotizado (${cpCotizado}). Se conservó el cotizado.`
          : null,
    }));
  }

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
      className="flex w-full flex-col gap-8 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12 min-[1400px]:flex-row min-[1400px]:items-start"
    >
      <div className="flex w-full flex-col gap-6">
        <button type="button" onClick={autocompletarConSesion} className="self-end py-2 font-display text-sm">
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

        <div className="flex flex-col gap-8 rounded-md bg-white p-6 shadow-card xl:flex-row xl:items-stretch">
          <div className="flex w-full xl:flex-1 xl:justify-end xl:pr-8">
            <ContactoForm
              titulo="Origen"
              value={remitente}
              onChange={setRemitente}
              nombreLabel="Nombre del remitente"
              contactos={contactosVisibles}
              onElegirContacto={(id) => elegirContacto("remitente", id)}
              aviso={avisos.remitente}
            />
          </div>
          <div className="hidden w-px shrink-0 self-stretch bg-neutral-line xl:block" />
          <div className="flex w-full xl:flex-1 xl:justify-start xl:pl-8">
            <ContactoForm
              titulo="Destino"
              value={destinatario}
              onChange={setDestinatario}
              nombreLabel="Nombre del destinatario"
              contactos={contactosVisibles}
              onElegirContacto={(id) => elegirContacto("destinatario", id)}
              aviso={avisos.destinatario}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label htmlFor="confirmar-contenido" className="text-xs font-medium text-black">
              Detalle del contenido
            </label>
            <input
              type="text"
              id="confirmar-contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              aria-label="Descripción del contenido"
              placeholder="Descripción del contenido"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
            <Link
              href="/soporte"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-3 py-2 text-sm text-black"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black/70" aria-hidden>
                <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              Artículos prohibidos
            </Link>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="confirmar-tipo-contenido" className="text-xs font-medium text-black">
              Tipo de contenido
            </label>
            <input
              type="text"
              id="confirmar-tipo-contenido"
              value={tipoContenido}
              onChange={(e) => setTipoContenido(e.target.value)}
              aria-label="Producto SAT"
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
        {motivo && (
          <p role="status" className="text-center text-xs font-medium text-black/60">
            {motivo}
          </p>
        )}
        <AvisoPrivacidadCorto finalidad="generar tu guía y entregar tu envío" />
        <Button type="submit" disabled={!canSubmit} className="disabled:cursor-not-allowed disabled:opacity-50">
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
  contactos = [],
  onElegirContacto,
  aviso = null,
}: {
  titulo: string;
  value: ContactoEnvio;
  onChange: (v: ContactoEnvio) => void;
  nombreLabel: string;
  contactos?: ContactoGuardado[];
  onElegirContacto?: (id: string) => void;
  aviso?: string | null;
}) {
  function set<K extends keyof ContactoEnvio>(key: K, v: ContactoEnvio[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex w-full max-w-[320px] flex-col items-center gap-6">
      <p className="font-display text-2xl font-bold text-black">{titulo}</p>
      {contactos.length > 0 && onElegirContacto && (
        <div className="flex w-full flex-col gap-1.5">
          <select
            aria-label={`Elegir contacto guardado para ${titulo.toLowerCase()}`}
            value=""
            onChange={(e) => e.target.value && onElegirContacto(e.target.value)}
            className="h-[43px] w-full rounded-md border border-primary bg-white px-4 text-xs font-medium text-primary shadow-card outline-none"
          >
            <option value="">Elegir de mis contactos</option>
            {contactos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {aviso && <p className="text-xs text-black/60">{aviso}</p>}
        </div>
      )}
      <div className="flex w-full flex-col gap-4">
        <Field label={nombreLabel}>
          <input
            autoComplete={titulo === "Origen" ? "name" : "off"}
            type="text"
            value={value.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            aria-label={`Nombre completo (${titulo.toLowerCase()})`}
            placeholder="Nombre completo"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <div className="flex gap-2.5">
          <Field label="C.P" className="w-[86px]">
            <input
              autoComplete={titulo === "Origen" ? "postal-code" : "off"}
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={value.cp}
              onChange={(e) => set("cp", e.target.value.replace(/\D/g, "").slice(0, 5))}
              aria-label={`Código postal (${titulo.toLowerCase()})`}
              className="h-[43px] w-[86px] rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black shadow-card outline-none"
            />
          </Field>
          <Field label="Ciudad" className="flex-1">
            <input
              autoComplete={titulo === "Origen" ? "address-level1" : "off"}
              type="text"
              value={value.ciudad}
              onChange={(e) => set("ciudad", e.target.value)}
              aria-label={`Estado (${titulo.toLowerCase()})`}
              placeholder="Estado"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <Field label="Colonia" className="flex-1">
            <input
              autoComplete={titulo === "Origen" ? "off" : "off"}
              type="text"
              value={value.colonia}
              onChange={(e) => set("colonia", e.target.value)}
              aria-label={`Colonia (${titulo.toLowerCase()})`}
              placeholder="Colonia"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            autoComplete={titulo === "Origen" ? "address-line1" : "off"}
            type="text"
            value={value.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            aria-label={`Dirección (${titulo.toLowerCase()})`}
            placeholder={`Dirección del ${titulo === "Origen" ? "remitente" : "destinatario"}`}
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <div className="flex gap-4">
          <Field label="No. Exterior" className="flex-1">
            <input
              autoComplete={titulo === "Origen" ? "off" : "off"}
              type="text"
              value={value.numExt}
              onChange={(e) => set("numExt", e.target.value)}
              aria-label={`No. ext (${titulo.toLowerCase()})`}
              placeholder="No. ext"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <Field label="No. Interior" className="flex-1">
            <input
              autoComplete={titulo === "Origen" ? "off" : "off"}
              type="text"
              value={value.numInt}
              onChange={(e) => set("numInt", e.target.value)}
              aria-label={`No. int (${titulo.toLowerCase()})`}
              placeholder="No. int"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
        </div>

        <Field label="Teléfono">
          <input
            autoComplete={titulo === "Origen" ? "tel" : "off"}
            type="tel"
            value={value.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            aria-label={`Número celular (${titulo.toLowerCase()})`}
            placeholder="Número celular"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>

        <Field label="Email">
          <input
            autoComplete={titulo === "Origen" ? "email" : "off"}
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            aria-label={`Correo electrónico (${titulo.toLowerCase()})`}
            placeholder="Correo electrónico"
            className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-medium text-black">{label}</label>
      {children}
    </div>
  );
}
