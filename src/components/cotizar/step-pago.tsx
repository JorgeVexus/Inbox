"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoEnvioCard } from "@/components/cotizar/info-envio-card";
import { FacturacionModal } from "@/components/facturacion/facturacion-modal";
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
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [errorGuia, setErrorGuia] = useState(false);

  const total = opcion.precio + (confirmar.seguro ? 200 : 0);

  useEffect(() => {
    let cancelado = false;
    generarGuia(cotizacion, confirmar, opcion)
      .then((res) => {
        if (!cancelado) setGuia(res);
      })
      .catch(() => {
        if (!cancelado) setErrorGuia(true);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finalizarPago(metodo: MetodoPago) {
    if (procesando) return; // evita doble envío (p. ej. Enter repetido)
    setProcesando(true);
    setErrorPago(null);
    try {
      const { ok } = await procesarPago(metodo, metodo === "tarjeta" ? tarjeta : undefined);
      if (!ok) throw new Error("pago rechazado");
      setSub("exito");
    } catch {
      setErrorPago("No pudimos procesar el pago. Revisa tus datos e inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  }

  if (sub === "exito" && guia) {
    return <PagoExitoso guia={guia} cotizacion={cotizacion} />;
  }

  const paquete = cotizacion.paquetes[0];
  const medidasLabel = paquete
    ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm`
    : "—";

  return (
    <div className="flex w-full flex-col gap-8 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12 min-[1400px]:flex-row min-[1400px]:items-start">
      <div className="flex w-full max-w-[729px] flex-col items-end gap-6">
        {errorGuia && (
          <p role="alert" className="w-full rounded-md bg-white p-4 text-sm font-medium text-red-700 shadow-card-sm">
            No pudimos generar tu guía. Regresa e inténtalo de nuevo en unos minutos.
          </p>
        )}
        {errorPago && (
          <p role="alert" className="w-full rounded-md bg-white p-4 text-sm font-medium text-red-700 shadow-card-sm">
            {errorPago}
          </p>
        )}
        {sub === "datos" && (
          <DatosPrincipales
            folio={guia?.folio ?? null}
            errorGuia={errorGuia}
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
  errorGuia,
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
  errorGuia: boolean;
}) {
  const digitos = telefono.replace(/\D/g, "");
  const canSubmit =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    /^[\d\s()+-]+$/.test(telefono.trim()) &&
    digitos.length >= 10 &&
    digitos.length <= 13;
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
            <input autoComplete="off"
              type="text"
              autoFocus
              value={referencia}
              onChange={(e) => onReferenciaChange(e.target.value)}
              onBlur={onToggleEditarReferencia}
              aria-label="Referencia del envío" placeholder="XAXX0101001000"
              className="h-[36px] w-[180px] rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
            />
          ) : (
            <span className="font-medium">{referencia || "Sin asignar"}</span>
          )}
          <span className="h-[23px] w-px bg-neutral-line" />
          <button
            type="button"
            onClick={onToggleEditarReferencia}
            className="py-2 font-display text-xs text-primary"
          >
            {referencia ? "Editar referencia" : "Asignar referencia"}
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 rounded-md bg-white p-6 shadow-card">
        <div className="flex w-full flex-wrap gap-8">
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label className="text-xs font-medium text-black">Email</label>
            <input autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              aria-label="Correo electrónico" placeholder="Correo electrónico"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label className="text-xs font-medium text-black">Teléfono</label>
            <input autoComplete="tel"
              type="tel"
              value={telefono}
              onChange={(e) => onTelefonoChange(e.target.value)}
              aria-label="Número celular" placeholder="Número celular"
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

      {!canSubmit && (
        <p role="status" className="self-start text-xs font-medium text-black/60">
          Escribe un correo válido y un teléfono de 10 dígitos para continuar.
        </p>
      )}
      <Button
        onClick={onContinuar}
        disabled={!canSubmit || !folio || errorGuia}
        className="disabled:cursor-not-allowed disabled:opacity-50"
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

/**
 * Card number/expiry formatting and network detection are pure client-side
 * logic (Luhn-style prefix ranges) — they don't depend on SIBOX or any
 * backend. Identifying the *issuing bank* (e.g. "BBVA") instead of just the
 * network would require a BIN-lookup service, which is a separate external
 * API (not part of the SIBOX spec) — intentionally not wired here.
 */
function formatNumeroTarjeta(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

function formatVencimiento(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Algoritmo de Luhn: detecta números de tarjeta mal capturados. */
function luhnValido(numero: string): boolean {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length < 13 || digitos.length > 19) return false;
  let suma = 0;
  let doble = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = Number(digitos[i]);
    if (doble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    doble = !doble;
  }
  return suma % 10 === 0;
}

/** MM/AA con mes 01–12 y que no esté vencida (vale hasta el fin del mes indicado). */
function vencimientoValido(valor: string, hoy: Date = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(valor);
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  return anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);
}

type MarcaTarjeta = "visa" | "mastercard" | "amex" | null;

function detectarMarca(numero: string): MarcaTarjeta {
  const digits = numero.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return null;
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
          <p className="font-display text-2xl font-bold text-black">
            Datos de la tarjeta
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full flex-col gap-4 rounded-md bg-white p-6 shadow-card sm:max-w-[400px]">
            <Field label="Número de tarjeta">
              <input autoComplete="cc-number"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={value.numero}
                onChange={(e) => set("numero", formatNumeroTarjeta(e.target.value))}
                aria-label="Número de tarjeta" placeholder="0000 0000 0000 0000"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
            <Field label="Nombre del titular">
              <input autoComplete="cc-name"
                type="text"
                value={value.nombreTitular}
                onChange={(e) => set("nombreTitular", e.target.value)}
                aria-label="Nombre del titular" placeholder="Como aparece en la tarjeta"
                className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </Field>
            <div className="flex gap-4">
              <Field label="Vencimiento" className="flex-1">
                <input autoComplete="cc-exp"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={value.vencimiento}
                  onChange={(e) => set("vencimiento", formatVencimiento(e.target.value))}
                  aria-label="Vencimiento (MM/AA)" placeholder="MM/AA"
                  className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
                />
              </Field>
              <Field label="CVV" className="flex-1">
                <input autoComplete="cc-csc"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={value.cvv}
                  onChange={(e) => set("cvv", e.target.value.replace(/\D/g, ""))}
                  aria-label="Código de seguridad CVV" placeholder="123"
                  className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
                />
              </Field>
            </div>
          </div>

          <CardPreview
            numero={value.numero}
            nombreTitular={value.nombreTitular}
            vencimiento={value.vencimiento}
          />
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

      <p className="mt-8 font-mono text-lg tracking-widest">
        {groups.join(" ")}
      </p>

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
    return (
      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
        AMEX
      </span>
    );
  }
  return null;
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
  const [facturarAbierto, setFacturarAbierto] = useState(false);
  const [facturado, setFacturado] = useState(false);

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
            className="inline-block py-2 font-display text-sm text-primary underline"
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
        {facturado ? (
          <p className="flex items-center gap-2 font-display text-sm font-bold text-green-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Datos de facturación guardados
          </p>
        ) : (
          <Button
            type="button"
            onClick={() => setFacturarAbierto(true)}
            variant="outline"
          >
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
