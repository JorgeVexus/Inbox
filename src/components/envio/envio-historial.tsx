import type { RastreoEvento } from "@/types/rastreo";

const MESES: Record<string, string> = {
  JAN: "ene",
  FEB: "feb",
  MAR: "mar",
  APR: "abr",
  MAY: "may",
  JUN: "jun",
  JUL: "jul",
  AUG: "ago",
  SEP: "sep",
  OCT: "oct",
  NOV: "nov",
  DEC: "dic",
};

export type FechaEvento = {
  fecha: string;
  hora: string;
  claveFecha: string;
};

export type GrupoEventos = {
  clave: string;
  fecha: string;
  eventos: RastreoEvento[];
};

/** Separa el formato documentado por SIBOX sin depender del huso horario del navegador. */
export function parsearFechaEvento(valor: string): FechaEvento {
  const limpio = valor.trim().replace(/\s+/g, " ");
  if (!limpio) {
    return { fecha: "Sin fecha", hora: "Sin hora", claveFecha: "sin-fecha" };
  }

  const coincidencia = limpio.match(/^(\d{1,2})-([A-Za-zÁÉÍÓÚÑ]{3})-(\d{4})(?:\s+(\d{1,2}:\d{2}))?$/u);

  if (!coincidencia) {
    return { fecha: limpio, hora: "Sin hora", claveFecha: limpio };
  }

  const [, dia, mesCrudo, anio, hora = "Sin hora"] = coincidencia;
  const mes = MESES[mesCrudo.toUpperCase()] ?? mesCrudo.toLocaleLowerCase("es-MX");
  const diaNormalizado = dia.padStart(2, "0");
  return {
    fecha: `${diaNormalizado} ${mes} ${anio}`,
    hora,
    claveFecha: `${anio}-${mesCrudo.toUpperCase()}-${diaNormalizado}`,
  };
}

export function agruparEventosPorFecha(eventos: RastreoEvento[]): GrupoEventos[] {
  const grupos: GrupoEventos[] = [];

  for (const evento of eventos) {
    const fecha = parsearFechaEvento(evento.F_Estatus);
    const ultimo = grupos.at(-1);
    const claveUltimaFecha = ultimo
      ? parsearFechaEvento(ultimo.eventos[0].F_Estatus).claveFecha
      : null;
    if (ultimo && claveUltimaFecha === fecha.claveFecha) {
      ultimo.eventos.push(evento);
    } else {
      grupos.push({
        clave: `${fecha.claveFecha}:${grupos.length}`,
        fecha: fecha.fecha,
        eventos: [evento],
      });
    }
  }

  return grupos;
}

type EnvioHistorialProps = {
  eventos: RastreoEvento[];
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
};

export function EnvioHistorial({
  eventos,
  cargando,
  error,
  onReintentar,
}: EnvioHistorialProps) {
  if (cargando) {
    return (
      <section aria-live="polite" aria-busy="true" className="rounded-md border border-neutral-line bg-white p-7 shadow-card-sm">
        <p className="text-center text-sm text-black/70">Cargando historial…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-md border border-neutral-line bg-white p-7 text-center shadow-card-sm">
        <p role="alert" className="text-sm text-black">{error}</p>
        <button
          type="button"
          onClick={onReintentar}
          className="mt-4 rounded-md bg-primary px-5 py-2 font-display text-sm font-bold text-white shadow-card-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (eventos.length === 0) {
    return (
      <section className="rounded-md border border-neutral-line bg-white p-7 shadow-card-sm">
        <p className="text-center text-sm text-black/70">
          Aún no hay movimientos disponibles para este envío.
        </p>
      </section>
    );
  }

  const grupos = agruparEventosPorFecha(eventos);

  return (
    <section className="overflow-hidden rounded-md border border-neutral-line bg-white shadow-card-sm">
      <h2 className="border-b border-neutral-line px-5 py-4 font-display text-lg font-bold text-black sm:px-7">
        Historial del envío
      </h2>

      <div className="hidden grid-cols-[150px_100px_1fr_1.4fr] gap-4 bg-neutral-bg px-7 py-3 text-xs font-bold text-black sm:grid">
        <span>Fecha</span>
        <span>Hora</span>
        <span>Ubicación</span>
        <span>Estado</span>
      </div>

      <div>
        {grupos.map((grupo) => (
          <div key={grupo.clave} className="border-b border-neutral-line last:border-b-0">
            {grupo.eventos.map((evento, indice) => {
              const { hora } = parsearFechaEvento(evento.F_Estatus);
              return (
                <article
                  key={evento.K_Historia_Guia || `${grupo.clave}-${indice}`}
                  className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-5 text-sm sm:grid-cols-[150px_100px_1fr_1.4fr] sm:px-7"
                >
                  <CeldaMovil label="Fecha" valor={indice === 0 ? grupo.fecha : ""} />
                  <CeldaMovil label="Hora" valor={hora} />
                  <CeldaMovil label="Ubicación" valor={evento.OficinaEstatus || "Sin ubicación"} />
                  <div className="col-span-2 sm:col-span-1">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-black/70 sm:hidden">Estado</span>
                    <p className="font-bold text-black">{evento.Estatus || "Sin estado"}</p>
                    {evento.Observaciones && (
                      <p className="mt-1 text-xs text-black/70">{evento.Observaciones}</p>
                    )}
                    {evento.Recibio && (
                      <p className="mt-1 text-xs text-black/70">Recibió: {evento.Recibio}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function CeldaMovil({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-bold uppercase text-black/70 sm:hidden">{label}</span>
      <span className={valor ? "text-black" : "text-black/70"}>{valor || "Misma fecha"}</span>
    </div>
  );
}
