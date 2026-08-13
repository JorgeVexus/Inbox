import Image from "next/image";
import { pasoDesdeEstatus } from "@/types/rastreo";
import type { EnvioPerfil } from "@/types/envio";

const ICONOS_ESTADO = [
  "/icons/package2.svg",
  "/icons/delivery-truck-speed.svg",
  "/icons/markunread-mailbox.svg",
  "/icons/hand-package.svg",
] as const;

type EnviosListaProps = {
  envios: EnvioPerfil[];
  seleccionado: string | null;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  onSeleccionar: (guia: string) => void;
};

export function EnviosLista({
  envios,
  seleccionado,
  busqueda,
  onBusquedaChange,
  onSeleccionar,
}: EnviosListaProps) {
  return (
    <aside className="w-full overflow-hidden rounded-md border border-neutral-line bg-white shadow-card-sm lg:max-w-[310px]">
      <div className="border-b border-neutral-line px-5 py-5">
        <h2 className="font-display text-xl font-bold text-black">Guías</h2>
        <label htmlFor="buscar-envio" className="sr-only">
          Buscar envío
        </label>
        <div className="mt-4 flex h-11 items-center gap-3 rounded-md border border-secondary-dark/50 bg-white px-4 shadow-card-sm focus-within:border-primary">
          <input
            id="buscar-envio"
            type="search"
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar envío"
            className="min-w-0 flex-1 bg-transparent font-display text-sm text-black outline-none placeholder:text-secondary-dark"
          />
          <Image src="/icons/search2.svg" alt="" width={20} height={20} />
        </div>
      </div>

      {envios.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-black/70">
          No encontramos envíos que coincidan con tu búsqueda.
        </p>
      ) : (
        <ul aria-label="Tus guías" className="divide-y divide-neutral-line">
          {envios.map((envio) => {
            const activo = envio.guia === seleccionado;
            const paso = pasoDesdeEstatus(envio.rastreo.Estatus);

            return (
              <li key={envio.guia}>
                <button
                  type="button"
                  onClick={() => onSeleccionar(envio.guia)}
                  aria-current={activo ? "true" : undefined}
                  className={`flex w-full items-center gap-4 border-l-4 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
                    activo
                      ? "border-primary bg-secondary/20"
                      : "border-transparent bg-white hover:bg-neutral-bg"
                  }`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary bg-white">
                    <Image
                      src={ICONOS_ESTADO[paso]}
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 object-contain"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold text-black">
                      {envio.nombre || "Envío sin nombre"}
                    </span>
                    <span className="mt-1 block text-xs text-black/70">
                      Guía {envio.guia}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
