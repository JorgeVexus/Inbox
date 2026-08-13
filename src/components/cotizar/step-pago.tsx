"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoEnvioCard } from "@/components/cotizar/info-envio-card";
import { generarGuia, procesarPago } from "@/lib/cotizacion";
import { pesoTotalPaquetes } from "@/lib/mock/cotizacion";
import type {
  ConfirmarInput,
  CostoOpcion,
  CotizacionInput,
  GuiaGenerada,
  MetodoPago,
  TarjetaInput,
} from "@/types/cotizacion";

type PagoSubStep = "datos" | "metodo" | "tarjeta" | "exito";

export function StepPago({
  cotizacion,
  opcion,
  confirmar,
  onEditarEnvio,
}: {
  cotizacion: CotizacionInput;
  opcion: CostoOpcion;
  confirmar: ConfirmarInput;
  onEditarEnvio: () => void;
}) {
  const [sub, setSub] = useState<PagoSubStep>("datos");
  const [guia, setGuia] = useState<GuiaGenerada | null>(null);

  const [email, setEmail] = useState(confirmar.remitente.email);
  const [telefono, setTelefono] = useState(confirmar.remitente.telefono);
  const [rellenado, setRellenado] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [editandoReferencia, setEditandoReferencia] = useState(false);

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(
    null,
  );
  const [tarjeta, setTarjeta] = useState<TarjetaInput>({
    numero: "",
    nombreTitular: "",
    vencimiento: "",
    cvv: "",
  });
  const [procesando, setProcesando] = useState(false);

  const total = opcion.precio + (confirmar.seguro ? 200 : 0);

  useEffect(() => {
    let cancelado = false;
    generarGuia(cotizacion, confirmar, opcion).then((res) => {
      if (!cancelado) setGuia(res);
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finalizarPago(metodo: MetodoPago) {
    setProcesando(true);
    await procesarPago(metodo, metodo === "tarjeta" ? tarjeta : undefined);
    setProcesando(false);
    setSub("exito");
  }

  if (sub === "exito" && guia) {
    return <PagoExitoso guia={guia} cotizacion={cotizacion} />;
  }

  const paquete = cotizacion.paquetes[0];
  const medidasLabel = paquete
    ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm`
    : "—";

  return (
    <div className="flex w-full flex-col gap-8 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12 lg:flex-row lg:items-start">
      <div className="flex w-full max-w-[729px] flex-col items-end gap-6">
        {sub === "datos" && (
          <DatosPrincipales
            folio={guia?.folio ?? null}
            email={email}
            telefono={telefono}
            onEmailChange={setEmail}
            onTelefonoChange={setTelefono}
            referencia={referencia}
            onReferenciaChange={setReferencia}
            editandoReferencia={editandoReferencia}
            onToggleEditarReferencia={() => setEditandoReferencia((v) => !v)}
            rellenado={rellenado}
            onRellenar={() => {
              const activar = !rellenado;
              setRellenado(activar);
              if (activar) {
                setEmail(confirmar.remitente.email);
                setTelefono(confirmar.remitente.telefono);
              }
            }}
            onContinuar={() => setSub("metodo")}
          />
        )}

        {sub === "metodo" && (
          <MetodoPagoForm
            seleccionado={metodoSeleccionado}
            permiteCobrarDestinatario={opcion.id === "domicilio"}
            onSeleccionar={setMetodoSeleccionado}
            onVolver={() => setSub("datos")}
            onContinuar={() => {
              if (!metodoSeleccionado) return;
              if (metodoSeleccionado === "tarjeta") {
                setSub("tarjeta");
              } else {
                finalizarPago(metodoSeleccionado);
              }
            }}
          />
        )}

        {sub === "tarjeta" && (
          <TarjetaForm
            value={tarjeta}
            onChange={setTarjeta}
            onVolver={() => setSub("metodo")}
            procesando={procesando}
            onConfirmar={() => finalizarPago("tarjeta")}
          />
        )}
      </div>

      <InfoEnvioCard
        origenLabel={`${cotizacion.origen.ciudad || "—"}, ${cotizacion.origen.cp}`}
        destinoLabel={`${cotizacion.destino.ciudad || "—"}, ${cotizacion.destino.cp}`}
        numPaquetes={cotizacion.paquetes.length}
        medidasLabel={medidasLabel}
        pesoLabel={`${pesoTotalPaquetes(cotizacion.paquetes)} kg`}
        onEditar={onEditarEnvio}
        total={total}
      />
    </div>
  );
}

function DatosPrincipales({
  folio,
  email,
  telefono,
  onEmailChange,
  onTelefonoChange,
  referencia,
  onReferenciaChange,
  editandoReferencia,
  onToggleEditarReferencia,
  rellenado,
  onRellenar,
  onContinuar,
}: {
  folio: string | null;
  email: string;
  telefono: string;
  onEmailChange: (v: string) => void;
  onTelefonoChange: (v: string) => void;
  referencia: string;
  onReferenciaChange: (v: string) => void;
  editandoReferencia: boolean;
  onToggleEditarReferencia: () => void;
  rellenado: boolean;
  onRellenar: () => void;
  onContinuar: () => void;
}) {
  const canSubmit = email.trim() !== "" && telefono.trim() !== "";
  return (
    <div className="flex w-full flex-col items-end gap-6">
      <div className="flex w-full flex-col gap-3">
        <p className="font-display text-2xl font-bold text-black">
          Datos principales
        </p>
        <p className="text-base text-black">
          Folio:{" "}
          <span className="font-medium">{folio ?? "Generando…"}</span>
        </p>
        <div className="flex flex-wrap items-center gap-3 text-base text-black">
          <span>Referencia</span>
          {editandoReferencia ? (
            <input
              type="text"
              autoFocus
              value={referencia}
              onChange={(e) => onReferenciaChange(e.target.value)}
              onBlur={onToggleEditarReferencia}
              placeholder="XAXX0101001000"
              className="h-[36px] w-[180px] rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
            />
          ) : (
            <span className="font-medium">{referencia || "Sin asignar"}</span>
          )}
          <span className="h-[23px] w-px bg-neutral-line" />
          <button
            type="button"
            onClick={onToggleEditarReferencia}
            className="font-display text-xs text-primary"
          >
            {referencia ? "Editar referencia" : "Asignar referencia"}
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 rounded-md bg-white p-6 shadow-card">
        <div className="flex w-full flex-wrap gap-8">
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label className="text-xs font-medium text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Correo electrónico"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label className="text-xs font-medium text-black">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => onTelefonoChange(e.target.value)}
              placeholder="Número celular"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-black">
          Su comprobante de pago será enviado a esta dirección de correo
        </p>
      </div>

      <button
        type="button"
        onClick={onRellenar}
        className="flex items-center gap-2 self-start text-xs text-black"
      >
        <span
          className={`flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 bg-white ${
            rellenado ? "border-primary" : "border-secondary"
          }`}
        >
          {rellenado && (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </span>
        Rellenar con la info del remitente
      </button>

      <Button
        onClick={onContinuar}
        className={!canSubmit || !folio ? "pointer-events-none opacity-50" : ""}
      >
        Continuar
      </Button>
    </div>
  );
}

const METODOS: { id: MetodoPago; icon: string; label: string; width: string }[] = [
  { id: "tarjeta", icon: "/icons/credit-card.svg", label: "Agregar tarjeta de crédito/débito", width: "w-full" },
  { id: "paypal", icon: "/icons/paypal.svg", label: "Pagar con PayPal", width: "w-[248px]" },
  { id: "efectivo", icon: "/icons/payments.svg", label: "Pagar en efectivo", width: "w-[254px]" },
  { id: "destinatario", icon: "/icons/real-estate-agent.svg", label: "Cobrar al destinatario", width: "w-[254px]" },
];

function MetodoPagoForm({
  seleccionado,
  permiteCobrarDestinatario,
  onSeleccionar,
  onVolver,
  onContinuar,
}: {
  seleccionado: MetodoPago | null;
  permiteCobrarDestinatario: boolean;
  onSeleccionar: (m: MetodoPago) => void;
  onVolver: () => void;
  onContinuar: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-end gap-10">
      <div className="flex w-full flex-col gap-8">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onVolver} aria-label="Volver">
            <Image src="/icons/arrow-circle-left.svg" alt="" width={34} height={34} />
          </button>
          <p className="font-display text-2xl font-bold text-black">
            Método de pago
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-base font-medium text-black">Tarjetas</p>
          <MetodoBoton metodo={METODOS[0]} seleccionado={seleccionado} onSeleccionar={onSeleccionar} />
        </div>

        <div className="flex flex-col gap-3.5">
          <p className="text-base font-medium text-black">Otros medio de pago</p>
          <div className="flex flex-wrap gap-6">
            <MetodoBoton metodo={METODOS[1]} seleccionado={seleccionado} onSeleccionar={onSeleccionar} />
            <MetodoBoton metodo={METODOS[2]} seleccionado={seleccionado} onSeleccionar={onSeleccionar} />
          </div>
          {permiteCobrarDestinatario && (
            <MetodoBoton metodo={METODOS[3]} seleccionado={seleccionado} onSeleccionar={onSeleccionar} />
          )}
        </div>
      </div>

      <Button
        onClick={onContinuar}
        className={!seleccionado ? "pointer-events-none opacity-50" : ""}
      >
        Continuar
      </Button>
    </div>
  );
}

function MetodoBoton({
  metodo,
  seleccionado,
  onSeleccionar,
}: {
  metodo: (typeof METODOS)[number];
  seleccionado: MetodoPago | null;
  onSeleccionar: (m: MetodoPago) => void;
}) {
  const activo = seleccionado === metodo.id;
  return (
    <button
      type="button"
      onClick={() => onSeleccionar(metodo.id)}
      className={`flex h-[53px] items-center gap-4 rounded-md border-2 px-4 shadow-card ${metodo.width} ${
        activo ? "border-primary bg-primary/10" : "border-primary bg-white"
      }`}
    >
      <Image src={metodo.icon} alt="" width={32} height={32} />
      <span className="font-display text-sm font-bold text-primary">
        {metodo.label}
      </span>
    </button>
  );
}

function TarjetaForm({
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

  const canSubmit =
    value.numero.replace(/\s/g, "").length >= 15 &&
    value.nombreTitular.trim() !== "" &&
    value.vencimiento.trim() !== "" &&
    value.cvv.trim().length >= 3;

  return (
    <div className="flex w-full flex-col items-end gap-8">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onVolver} aria-label="Volver">
            <Image src="/icons/arrow-circle-left.svg" alt="" width={34} height={34} />
          </button>
          <p className="font-display text-2xl font-bold text-black">
            Datos de la tarjeta
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-card sm:max-w-[400px]">
          <Field label="Número de tarjeta">
            <input
              type="text"
              inputMode="numeric"
              maxLength={19}
              value={value.numero}
              onChange={(e) => set("numero", e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <Field label="Nombre del titular">
            <input
              type="text"
              value={value.nombreTitular}
              onChange={(e) => set("nombreTitular", e.target.value)}
              placeholder="Como aparece en la tarjeta"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Field>
          <div className="flex gap-4">
            <Field label="Vencimiento" className="flex-1">
              <input
                type="text"
                maxLength={5}
                value={value.vencimiento}
                onChange={(e) => set("vencimiento", e.target.value)}
                placeholder="MM/AA"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
            <Field label="CVV" className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={value.cvv}
                onChange={(e) => set("cvv", e.target.value)}
                placeholder="123"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
          </div>
        </div>
      </div>

      <Button
        onClick={onConfirmar}
        className={!canSubmit || procesando ? "pointer-events-none opacity-50" : ""}
      >
        {procesando ? "Procesando…" : "Confirmar pago"}
      </Button>
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

function PagoExitoso({
  guia,
  cotizacion,
}: {
  guia: GuiaGenerada;
  cotizacion: CotizacionInput;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-10 rounded-xl bg-neutral-bg px-6 py-10 sm:px-16">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-3">
          <p className="font-display text-3xl font-bold text-green-700">
            Pago exitoso
          </p>
          <div className="relative h-[41px] w-[57px]">
            <Image src="/icons/credit-card.svg" alt="" fill className="object-contain opacity-70" />
            <Image
              src="/icons/check-circle.svg"
              alt=""
              width={22}
              height={22}
              className="absolute -right-1 -top-1"
            />
          </div>
        </div>
        <p className="text-xl text-black">Gracias por confiar en Inbox</p>
        <p className="text-xs text-black">
          Tu recibo fue enviado al correo electrónico proporcionado
        </p>
      </div>

      <div className="flex w-full max-w-[925px] flex-col gap-6 rounded-md bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-xl font-medium text-black">
            {cotizacion.entrega === "sucursal"
              ? "Entrega tu paquete en tu sucursal más cercana"
              : "Te avisaremos cuando el repartidor esté en camino"}
          </p>
          <Link
            href="/cobertura"
            className="font-display text-sm text-primary underline"
          >
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
            <p className="font-display text-xl font-semibold text-black">
              {guia.fechaEnvioEstimada}
            </p>
          </div>
          <Image src="/icons/delivery-truck-speed.svg" alt="" width={56} height={56} />
        </div>
        <div className="flex items-center gap-4 rounded-md bg-white px-6 py-5 shadow-card">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-black">Fecha estimada de llegada</p>
            <p className="font-display text-xl font-semibold text-black">
              {guia.fechaLlegadaEstimada}
            </p>
          </div>
          <Image src="/icons/hand-package.svg" alt="" width={56} height={56} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button href="/facturar" variant="outline">
          Facturar
        </Button>
        <p className="max-w-md text-center text-sm text-black/60">
          Puedes facturar después desde el enlace que recibirás en tu correo.{" "}
          <span className="text-black">Tienes 10 días naturales para hacerlo.</span>
        </p>
      </div>

      <div className="flex items-center gap-8 font-display text-sm text-primary">
        <Link href="/" className="underline">
          Ir a inicio
        </Link>
        <Link href="/cuenta/crear" className="underline">
          Regístrate para llevar un seguimiento de tu envío
        </Link>
      </div>
    </div>
  );
}
