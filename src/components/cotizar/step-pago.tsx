"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { enfocarAlMontar } from "@/components/ui/enfocar-al-montar";
import { PagoExitoso } from "@/components/cotizar/pago-exitoso";
import { TarjetaForm } from "@/components/cotizar/tarjeta-form";
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

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(null);
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
    // Solo al montar: la guía se genera una vez al entrar al pago; repetirla emitiría folios duplicados.
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
  const medidasLabel = paquete ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm` : "—";

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
        <p className="font-display text-2xl font-bold text-black">Datos principales</p>
        <p className="text-base text-black">
          Folio: <span className="font-medium">{folio ?? "Generando…"}</span>
        </p>
        <div className="flex flex-wrap items-center gap-3 text-base text-black">
          <span>Referencia</span>
          {editandoReferencia ? (
            <input
              autoComplete="off"
              type="text"
              ref={enfocarAlMontar}
              value={referencia}
              onChange={(e) => onReferenciaChange(e.target.value)}
              onBlur={onToggleEditarReferencia}
              aria-label="Referencia del envío"
              placeholder="XAXX0101001000"
              className="h-[36px] w-[180px] rounded-md border border-secondary-dark/50 bg-white px-3 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
            />
          ) : (
            <span className="font-medium">{referencia || "Sin asignar"}</span>
          )}
          <span className="h-[23px] w-px bg-neutral-line" />
          <button type="button" onClick={onToggleEditarReferencia} className="py-2 font-display text-xs text-primary">
            {referencia ? "Editar referencia" : "Asignar referencia"}
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 rounded-md bg-white p-6 shadow-card">
        <div className="flex w-full flex-wrap gap-8">
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label htmlFor="pago-email" className="text-xs font-medium text-black">
              Email
            </label>
            <input
              autoComplete="email"
              type="email"
              id="pago-email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              aria-label="Correo electrónico"
              placeholder="Correo electrónico"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
          <div className="flex w-full max-w-[303px] flex-col gap-2">
            <label htmlFor="pago-telefono" className="text-xs font-medium text-black">
              Teléfono
            </label>
            <input
              autoComplete="tel"
              type="tel"
              id="pago-telefono"
              value={telefono}
              onChange={(e) => onTelefonoChange(e.target.value)}
              aria-label="Número celular"
              placeholder="Número celular"
              className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-black">Su comprobante de pago será enviado a esta dirección de correo</p>
      </div>

      <button type="button" onClick={onRellenar} className="flex items-center gap-2 self-start text-xs text-black">
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

type MetodoInfo = { id: MetodoPago; icon: string; label: string; width: string };

// Tupla fija (no arreglo): así METODOS[0..3] nunca es `undefined` para TypeScript.
const METODOS = [
  { id: "tarjeta", icon: "/icons/credit-card.svg", label: "Agregar tarjeta de crédito/débito", width: "w-full" },
  { id: "paypal", icon: "/icons/paypal.svg", label: "Pagar con PayPal", width: "w-[248px]" },
  { id: "efectivo", icon: "/icons/payments.svg", label: "Pagar en efectivo", width: "w-[254px]" },
  { id: "destinatario", icon: "/icons/real-estate-agent.svg", label: "Cobrar al destinatario", width: "w-[254px]" },
] as const satisfies readonly MetodoInfo[];

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
          <p className="font-display text-2xl font-bold text-black">Método de pago</p>
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

      <Button onClick={onContinuar} className={!seleccionado ? "pointer-events-none opacity-50" : ""}>
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
      <span className="font-display text-sm font-bold text-primary">{metodo.label}</span>
    </button>
  );
}
