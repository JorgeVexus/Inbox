"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { LazyMount } from "@/components/ui/lazy-mount";
import { useMemo, useState } from "react";
import { getCiudades, getEstados, getSucursales } from "@/lib/sucursales";
import { estadoHorario } from "@/lib/horario";
import { ETIQUETA_ESTADO, PUNTO_ESTADO } from "@/components/home/estado-horario";

import type { Sucursal } from "@/types/sucursal";

const CoberturaMap = dynamic(() => import("@/components/home/cobertura-map").then((m) => m.CoberturaMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-bg text-sm text-[#707372]">
      Cargando mapa…
    </div>
  ),
});

export function Cobertura({
  headlineImage,
}: {
  /** Optional image shown to the left of the "Tu inbox más cercana" headline
   * (used by the standalone /cobertura page, Figma node 401:19835). Home's
   * section doesn't pass this. */
  headlineImage?: string;
}) {
  const sucursales = useMemo(() => getSucursales(), []);
  const estados = useMemo(() => getEstados(sucursales), [sucursales]);

  const [kEstado, setKEstado] = useState<number | "">("");
  const [kCiudad, setKCiudad] = useState<number | "">("");
  const [busqueda, setBusqueda] = useState("");
  const [tiposVisibles, setTiposVisibles] = useState({
    sucursal: true,
    distribucion: true,
  });
  const [seleccionada, setSeleccionada] = useState<Sucursal | null>(null);

  const ciudades = useMemo(() => getCiudades(sucursales, kEstado === "" ? undefined : kEstado), [sucursales, kEstado]);

  const filtradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return sucursales.filter((s) => {
      if (kEstado !== "" && s.K_Estado !== kEstado) return false;
      if (kCiudad !== "" && s.K_Ciudad !== kCiudad) return false;
      if (!tiposVisibles[s.tipo]) return false;
      if (term && !`${s.D_Oficina} ${s.D_Ciudad} ${s.D_Estado}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [sucursales, kEstado, kCiudad, tiposVisibles, busqueda]);

  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 lg:px-16">
      <div className="flex flex-col items-center gap-8 lg:flex-row">
        {headlineImage && (
          <div className="relative h-[220px] w-full shrink-0 sm:h-[280px] lg:h-[320px] lg:w-[480px]">
            <Image
              src={headlineImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-contain"
            />
          </div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">Tu Inbox más cercana</h2>
            <Image src="/icons/globe-location-pin.svg" alt="" width={48} height={48} className="hidden sm:block" />
          </div>
          <p className="max-w-2xl text-base text-black">
            Explora nuestras ubicaciones y elige la que mejor se adapte a tus necesidades de envío o recolección.
          </p>
        </div>
      </div>

      <div className="relative flex h-[480px] w-full flex-col overflow-hidden rounded-xl sm:h-[629px]">
        <div className="absolute inset-0">
          <LazyMount className="h-full w-full">
            <CoberturaMap
              sucursales={filtradas}
              onSelect={setSeleccionada}
              selectedOficina={seleccionada?.K_Oficina ?? null}
            />
          </LazyMount>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-4 z-[500] flex w-full max-w-[560px] -translate-x-1/2 flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-center">
          <select
            aria-label="Filtrar el mapa por estado"
            value={kEstado}
            onChange={(e) => {
              setKEstado(e.target.value === "" ? "" : Number(e.target.value));
              setKCiudad("");
            }}
            className="pointer-events-auto flex h-[53px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none sm:w-[259px]"
          >
            <option value="">Estado</option>
            {estados.map((e) => (
              <option key={e.K_Estado} value={e.K_Estado}>
                {e.D_Estado}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar el mapa por ciudad"
            value={kCiudad}
            onChange={(e) => setKCiudad(e.target.value === "" ? "" : Number(e.target.value))}
            className="pointer-events-auto flex h-[53px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none sm:w-[259px]"
          >
            <option value="">Ciudad</option>
            {ciudades.map((c) => (
              <option key={c.K_Ciudad} value={c.K_Ciudad}>
                {c.D_Ciudad}
              </option>
            ))}
          </select>
        </div>

        <div className="pointer-events-none absolute right-6 top-4 z-[500] hidden sm:block">
          <div className="pointer-events-auto flex h-[53px] w-[280px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar sucursal en el mapa"
              placeholder="Buscar"
              className="w-full min-w-0 font-display text-base text-black placeholder:text-secondary-dark outline-none"
            />
            <Image src="/icons/search2.svg" alt="" width={20} height={20} />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-[500] hidden sm:block">
          <div className="pointer-events-auto flex w-[220px] flex-col items-center gap-3 rounded-md bg-white px-4 py-4 shadow-card">
            <p className="text-center text-xs font-semibold uppercase text-black">Indicadores ({filtradas.length})</p>
            <button
              type="button"
              aria-pressed={tiposVisibles.sucursal}
              onClick={() => setTiposVisibles((v) => ({ ...v, sucursal: !v.sucursal }))}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-black">Sucursal</span>
              </span>
              <CheckSwatch checked={tiposVisibles.sucursal} />
            </button>
            <button
              type="button"
              aria-pressed={tiposVisibles.distribucion}
              onClick={() => setTiposVisibles((v) => ({ ...v, distribucion: !v.distribucion }))}
              className="flex w-full items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-gray-800" />
                <span className="text-xs font-semibold text-black">Centro de distribución</span>
              </span>
              <CheckSwatch checked={tiposVisibles.distribucion} />
            </button>
          </div>
        </div>

        {filtradas.length === 0 && (
          <div
            role="status"
            className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center px-6"
          >
            <p className="rounded-md bg-white px-5 py-3 text-center text-sm font-medium text-black shadow-card">
              No encontramos sucursales con esos filtros.
            </p>
          </div>
        )}

        {seleccionada && <SucursalPanel sucursal={seleccionada} onClose={() => setSeleccionada(null)} />}
      </div>
    </section>
  );
}

/** Detail panel shown when a map pin is clicked (Figma node 713:28003).
 * Overlays the right side of the map card; the "Buscar"/tabs are decorative
 * (they mirror the Google-Maps-style reference in the Figma but aren't wired
 * to anything — there's nothing to search within a single sucursal's info). */
function SucursalPanel({ sucursal, onClose }: { sucursal: Sucursal; onClose: () => void }) {
  const estado = estadoHorario(sucursal.Observaciones);

  return (
    <div className="absolute inset-0 z-[600] flex justify-end sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[380px]">
      <div className="flex h-full w-full flex-col gap-8 overflow-y-auto bg-[rgba(238,238,238,0.9)] px-6 py-8 backdrop-blur-md sm:rounded-r-xl">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar información de sucursal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
            </svg>
          </button>
          <div className="flex h-[53px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card">
            <span className="text-sm text-[#707372]">Buscar</span>
            <Image src="/icons/search2.svg" alt="" width={18} height={18} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Image src="/icons/warehouse.svg" alt="" width={56} height={56} />
          <div className="flex flex-col">
            <p className="font-display text-2xl font-bold text-black">Inbox</p>
            <p className="font-display text-lg text-black">Paquetería y envíos</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 font-display text-sm font-bold whitespace-nowrap">
          <span className="border-b-2 border-primary pb-1 text-primary">Descripción general</span>
          <span className="text-black">Opiniones</span>
          <span className="text-black">Acerca de</span>
        </div>

        <div className="flex flex-col gap-6 rounded-md bg-white px-6 py-5 shadow-card-sm">
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${PUNTO_ESTADO[estado]}`} />
            <span className="text-xs font-semibold text-black">{ETIQUETA_ESTADO[estado]}</span>
          </div>

          <p className="font-display text-lg font-bold text-black">{sucursal.D_Oficina}</p>

          {sucursal.Observaciones && (
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-primary" aria-hidden>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.75 5v5.3l4.2 2.5-.75 1.2-5-3V7h1.55z" />
              </svg>
              <p className="whitespace-pre-line text-xs text-black">{sucursal.Observaciones}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-primary" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <p className="text-xs text-black">
              {sucursal.Calle}, {sucursal.D_Ciudad}, {sucursal.D_Estado} — CP {sucursal.Codigo_Postal}
            </p>
          </div>

          {sucursal.Telefono && (
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-primary" aria-hidden>
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z" />
              </svg>
              <p className="text-xs text-black">{sucursal.Telefono}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckSwatch({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 bg-white ${
        checked ? "border-primary" : "border-secondary-dark/40"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      )}
    </span>
  );
}
