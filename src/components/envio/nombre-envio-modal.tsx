"use client";

import { useEffect, useState } from "react";
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

  return <NombreEnvioForm {...props} />;
}

function NombreEnvioForm({
  nombreInicial,
  guardando,
  error,
  onCerrar,
  onGuardar,
}: Omit<NombreEnvioModalProps, "abierto">) {
  const [nombre, setNombre] = useState(nombreInicial);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCerrar();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCerrar]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGuardar(nombre);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onCerrar}
    >
      <div
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
            className="mt-2 h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-5 text-sm font-medium text-black shadow-card outline-none placeholder:text-secondary-dark focus:border-primary"
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
              className="shrink-0 text-xs text-secondary-dark"
            >
              {nombre.length}/60
            </span>
          </div>

          <Button
            type="submit"
            variant="white"
            disabled={guardando}
            className="mx-auto mt-5 h-[43px] min-w-[116px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Aceptar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
