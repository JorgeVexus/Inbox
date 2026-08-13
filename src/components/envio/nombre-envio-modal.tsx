"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type NombreEnvioModalProps = {
  abierto: boolean;
  nombreInicial: string;
  guardando: boolean;
  error: string | null;
  onCerrar: () => void;
  onGuardar: (nombre: string) => void;
};

export function NombreEnvioModal(props: NombreEnvioModalProps) {
  if (!props.abierto) return null;

  // A selected shipment can change while the modal remains mounted.
  return <NombreEnvioForm key={props.nombreInicial} {...props} />;
}

function NombreEnvioForm({
  nombreInicial,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: Omit<NombreEnvioModalProps, "abierto">) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);
  const vioGuardandoRef = useRef(false);
  const onCerrarRef = useRef(onCerrar);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    const elementoAnterior = document.activeElement;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCerrarRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const elementos = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!elementos?.length) {
        event.preventDefault();
        return;
      }

      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? ultimo : primero).focus();
      } else if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (elementoAnterior instanceof HTMLElement) elementoAnterior.focus();
    };
  }, []);

  useEffect(() => {
    if (guardando) {
      vioGuardandoRef.current = true;
      return;
    }

    if (!vioGuardandoRef.current && !error) return;

    vioGuardandoRef.current = false;
    submittedRef.current = false;
    // Defer the visual reset to avoid a synchronous state update in an effect.
    const reset = window.setTimeout(() => setSolicitudEnviada(false), 0);
    return () => window.clearTimeout(reset);
  }, [guardando, error]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittedRef.current || guardando) return;

    submittedRef.current = true;
    setSolicitudEnviada(true);
    onGuardar(nombre);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onCerrar}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nombre-envio-titulo"
        className="w-full max-w-[504px] rounded-md bg-neutral-bg px-8 py-9 shadow-card sm:px-12"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="nombre-envio-titulo"
          className="text-center font-display text-2xl font-bold text-black"
        >
          Asigna un nombre a tu envío
        </h2>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col">
          <label
            htmlFor="nombre-envio"
            className="text-sm font-medium text-black"
          >
            ¿Cómo quieres identificar este envío?
          </label>
          <input
            id="nombre-envio"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ejem. Paquete de ropa"
            maxLength={60}
            autoFocus
            aria-describedby={error ? "nombre-envio-error nombre-envio-contador" : "nombre-envio-contador"}
            aria-invalid={Boolean(error)}
            className="mt-2 h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-5 text-sm font-medium text-black shadow-card outline-none placeholder:text-black/60 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />

          <div className="mt-1 flex min-h-5 items-start justify-between gap-4">
            {error ? (
              <p id="nombre-envio-error" role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            ) : (
              <span />
            )}
            <span
              id="nombre-envio-contador"
              className="shrink-0 text-xs text-black/70"
            >
              {nombre.length}/60
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={guardando || solicitudEnviada}
            className="mx-auto mt-5 h-[43px] min-w-[116px] text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Aceptar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
