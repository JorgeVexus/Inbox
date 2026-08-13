"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoEnvioCard } from "@/components/cotizar/info-envio-card";
import { obtenerCotizacion } from "@/lib/cotizacion";
import { pesoTotalPaquetes } from "@/lib/mock/cotizacion";
import type { CostoOpcion, CotizacionInput } from "@/types/cotizacion";

export function StepCosto({
  cotizacion,
  onEditar,
  onComprar,
}: {
  cotizacion: CotizacionInput;
  onEditar: () => void;
  onComprar: (opcion: CostoOpcion) => void;
}) {
  const [opciones, setOpciones] = useState<CostoOpcion[] | null>(null);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerCotizacion(cotizacion).then((res) => {
      if (cancelado) return;
      setOpciones(res);
      setSeleccionada(res[0]?.id ?? null);
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paquete = cotizacion.paquetes[0];
  const medidasLabel = paquete
    ? `${paquete.alto} cm x ${paquete.largo} cm x ${paquete.ancho}cm`
    : "—";
  const opcionElegida = opciones?.find((o) => o.id === seleccionada);

  return (
    <div className="flex w-full flex-col gap-8 rounded-xl bg-neutral-bg px-6 py-8 sm:px-12 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col items-center gap-6 lg:items-start">
        <p className="text-xl font-medium text-black">Selecciona una opción</p>

        {!opciones && (
          <p className="text-sm text-black/60">Calculando tu cotización…</p>
        )}

        <div className="flex w-full flex-col gap-8">
          {opciones?.map((opcion) => (
            <div key={opcion.id} className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setSeleccionada(opcion.id)}
                aria-label={`Seleccionar ${opcion.titulo}`}
                aria-pressed={seleccionada === opcion.id}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  seleccionada === opcion.id
                    ? "border-primary bg-primary"
                    : "border-secondary-dark/40 bg-white"
                }`}
              >
                {seleccionada === opcion.id && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </button>

              <div className="flex w-full flex-col gap-1">
                <p className="text-right text-base font-medium text-black">
                  {opcion.titulo}
                </p>
                <div className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-medium text-black">
                        Entrega estimada
                      </p>
                      <p className="font-display text-2xl font-bold text-black">
                        {opcion.entregaEstimada}
                      </p>
                      <p className="max-w-xs text-[10px] text-black">
                        {opcion.reservaAntes}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-medium text-black">
                        Precio desde
                      </p>
                      <p className="font-display text-2xl font-bold uppercase text-black">
                        ${opcion.precio.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandida(expandida === opcion.id ? null : opcion.id)
                    }
                    className="mx-auto flex items-center gap-2 rounded-md border-2 border-primary px-4 py-2 font-display text-sm font-bold text-primary"
                  >
                    {expandida === opcion.id ? "Ver menos" : "Ver detalles"}
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 fill-primary transition-transform ${
                        expandida === opcion.id ? "rotate-90" : "-rotate-90"
                      }`}
                      aria-hidden
                    >
                      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </button>

                  {expandida === opcion.id && (
                    <div className="flex flex-col items-end gap-1.5 border-t border-neutral-line pt-3">
                      {opcion.detalle.map((linea) => (
                        <div
                          key={linea.label}
                          className="flex w-full max-w-[230px] justify-between text-xs text-black"
                        >
                          <span>{linea.label}</span>
                          <span>${linea.precio.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InfoEnvioCard
        origenLabel={`${cotizacion.origen.ciudad || "—"}, ${cotizacion.origen.cp}`}
        destinoLabel={`${cotizacion.destino.ciudad || "—"}, ${cotizacion.destino.cp}`}
        numPaquetes={cotizacion.paquetes.length}
        medidasLabel={medidasLabel}
        pesoLabel={`${pesoTotalPaquetes(cotizacion.paquetes)} kg`}
        onEditar={onEditar}
        total={opcionElegida?.precio ?? 0}
      >
        <Button
          onClick={() => opcionElegida && onComprar(opcionElegida)}
          className={!opcionElegida ? "pointer-events-none opacity-50" : ""}
        >
          Comprar
        </Button>
      </InfoEnvioCard>
    </div>
  );
}
