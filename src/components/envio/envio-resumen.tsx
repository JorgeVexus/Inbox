import Image from "next/image";
import { pasoDesdeEstatus } from "@/types/rastreo";
import type { EnvioPerfil } from "@/types/envio";

const PASOS = [
  { label: "Paquete recibido", icono: "/icons/package2.svg" },
  { label: "En tránsito", icono: "/icons/delivery-truck-speed.svg" },
  { label: "En proceso de entrega", icono: "/icons/markunread-mailbox.svg" },
  { label: "Entregado", icono: "/icons/hand-package.svg" },
] as const;

type EnvioResumenProps = {
  envio: EnvioPerfil;
  detalleAbierto: boolean;
  onToggleDetalle: () => void;
  onEditarNombre: () => void;
};

export function EnvioResumen({
  envio,
  detalleAbierto,
  onToggleDetalle,
  onEditarNombre,
}: EnvioResumenProps) {
  const pasoActual = pasoDesdeEstatus(envio.rastreo.Estatus);

  return (
    <section className="rounded-md border border-neutral-line bg-white p-5 shadow-card-sm sm:p-7">
      <div className="flex flex-col gap-5 border-b border-neutral-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-secondary-dark">Nombre del envío</p>
          <div className="mt-1 flex items-center gap-3">
            <h2 className="truncate font-display text-xl font-bold text-black sm:text-2xl">
              {envio.nombre || "Envío sin nombre"}
            </h2>
            <button
              type="button"
              onClick={onEditarNombre}
              aria-label={envio.nombre ? "Editar nombre del envío" : "Asignar nombre al envío"}
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold leading-none text-white shadow-card-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <Dato label="Número de guía" valor={envio.guia} />
          <Dato label="Código de rastreo" valor={envio.rastreo.Guia} />
          <Dato label="Fecha aproximada de entrega" valor={envio.fechaProgramada} />
        </dl>
      </div>

      <div className="py-7">
        <ol aria-label="Progreso del envío" className="grid grid-cols-4 gap-1 sm:gap-3">
          {PASOS.map((paso, indice) => {
            const alcanzado = indice <= pasoActual;
            const completado = indice < pasoActual;

            return (
              <li key={paso.label} className="relative flex min-w-0 flex-col items-center text-center">
                {indice > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-1/2 top-7 -z-0 w-full border-t-2 border-dashed sm:top-9 ${
                      completado || indice <= pasoActual
                        ? "border-primary"
                        : "border-secondary-dark/50"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex size-14 items-center justify-center rounded-full border-2 bg-white p-2 sm:size-[74px] sm:p-3 ${
                    alcanzado ? "border-primary" : "border-secondary-dark/50"
                  }`}
                >
                  <Image
                    src={paso.icono}
                    alt=""
                    width={48}
                    height={48}
                    className={`size-full object-contain ${alcanzado ? "" : "grayscale opacity-50"}`}
                  />
                </span>
                <span
                  className={`mt-2 max-w-[130px] text-[10px] font-medium leading-tight sm:text-sm ${
                    alcanzado ? "text-black" : "text-secondary-dark"
                  }`}
                >
                  {paso.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex justify-center border-t border-neutral-line pt-5">
        <button
          type="button"
          onClick={onToggleDetalle}
          aria-expanded={detalleAbierto}
          className="flex min-h-10 items-center gap-2 rounded-md border-2 border-primary bg-white px-5 py-2 font-display text-sm font-bold text-primary transition-colors hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {detalleAbierto ? "Ver menos" : "Ver detalles"}
          <Image
            src="/icons/chevron.svg"
            alt=""
            width={16}
            height={16}
            className={`size-4 transition-transform ${detalleAbierto ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </section>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-secondary-dark">{label}</dt>
      <dd className="mt-1 break-words font-bold text-primary">{valor}</dd>
    </div>
  );
}
