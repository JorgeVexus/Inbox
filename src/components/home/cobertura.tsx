"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { getCiudades, getEstados, getSucursales } from "@/lib/sucursales";
import type { Sucursal } from "@/types/sucursal";

const CoberturaMap = dynamic(
  () => import("@/components/home/cobertura-map").then((m) => m.CoberturaMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-bg text-sm text-secondary-dark">
        Cargando mapa…
      </div>
    ),
  },
);

export function Cobertura() {
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

  const ciudades = useMemo(
    () => getCiudades(sucursales, kEstado === "" ? undefined : kEstado),
    [sucursales, kEstado],
  );

  const filtradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return sucursales.filter((s) => {
      if (kEstado !== "" && s.K_Estado !== kEstado) return false;
      if (kCiudad !== "" && s.K_Ciudad !== kCiudad) return false;
      if (!tiposVisibles[s.tipo]) return false;
      if (
        term &&
        !`${s.D_Oficina} ${s.D_Ciudad} ${s.D_Estado}`.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [sucursales, kEstado, kCiudad, tiposVisibles, busqueda]);

  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 lg:px-16">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
          Tu Inbox más cercana
        </h2>
        <Image
          src="/icons/globe-location-pin.svg"
          alt=""
          width={48}
          height={48}
          className="hidden sm:block"
        />
      </div>
      <p className="max-w-2xl text-base text-black">
        Explora nuestras ubicaciones y elige la que mejor se adapte a tus
        necesidades de envío o recolección.
      </p>

      <div className="relative flex h-[480px] w-full flex-col overflow-hidden rounded-xl sm:h-[629px]">
        <div className="absolute inset-0">
          <CoberturaMap
            sucursales={filtradas}
            onSelect={setSeleccionada}
            selectedOficina={seleccionada?.K_Oficina ?? null}
          />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-4 z-[500] flex w-full max-w-[560px] -translate-x-1/2 flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-center">
          <select
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
            value={kCiudad}
            onChange={(e) =>
              setKCiudad(e.target.value === "" ? "" : Number(e.target.value))
            }
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
              placeholder="Buscar"
              className="w-full min-w-0 font-display text-base text-black placeholder:text-secondary-dark outline-none"
            />
            <Image src="/icons/search2.svg" alt="" width={20} height={20} />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-[500] hidden sm:block">
          <div className="pointer-events-auto flex w-[220px] flex-col items-center gap-3 rounded-md bg-white px-4 py-4 shadow-card">
            <p className="text-center text-xs font-semibold uppercase text-black">
              Indicadores ({filtradas.length})
            </p>
            <button
              type="button"
              onClick={() =>
                setTiposVisibles((v) => ({ ...v, sucursal: !v.sucursal }))
              }
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-black">Sucursal</span>
              </div>
              <CheckSwatch checked={tiposVisibles.sucursal} />
            </button>
            <button
              type="button"
              onClick={() =>
                setTiposVisibles((v) => ({ ...v, distribucion: !v.distribucion }))
              }
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-gray-800" />
                <span className="text-xs font-semibold text-black">
                  Centro de distribución
                </span>
              </div>
              <CheckSwatch checked={tiposVisibles.distribucion} />
            </button>
          </div>
        </div>
      </div>

      {seleccionada && (
        <div className="flex flex-col gap-1 rounded-md border border-secondary-dark/30 bg-white p-4 shadow-card-sm">
          <p className="font-display text-lg font-bold text-black">
            {seleccionada.D_Oficina}
          </p>
          <p className="text-sm text-black/70">
            {seleccionada.Calle}, {seleccionada.D_Ciudad}, {seleccionada.D_Estado}{" "}
            — CP {seleccionada.Codigo_Postal}
          </p>
          {seleccionada.Telefono && (
            <p className="text-sm text-black/70">Tel. {seleccionada.Telefono}</p>
          )}
        </div>
      )}
    </section>
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

export function CoberturaCTA() {
  const sucursales = useMemo(() => getSucursales(), []);
  const estados = useMemo(() => getEstados(sucursales), [sucursales]);

  const [kEstado, setKEstado] = useState<number | "">("");
  const ciudades = useMemo(
    () => getCiudades(sucursales, kEstado === "" ? undefined : kEstado),
    [sucursales, kEstado],
  );

  return (
    <section className="mx-6 flex flex-col items-center gap-10 rounded-xl bg-neutral-bg px-6 py-16 lg:mx-16">
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
            Tu inbox más cercana
          </h2>
          <Image src="/icons/globe-location-pin.svg" alt="" width={40} height={40} className="hidden sm:block" />
        </div>
        <p className="text-base text-black">
          Explora nuestras ubicaciones y elige la que mejor se adapte a tus
          necesidades de envío o recolección.
        </p>
      </div>

      <div className="flex flex-col gap-14">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-xl font-medium text-black">
            Seleccione un estado del país
          </p>
          <select
            value={kEstado}
            onChange={(e) =>
              setKEstado(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="flex h-[53px] w-[259px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none"
          >
            <option value="">Estado</option>
            {estados.map((e) => (
              <option key={e.K_Estado} value={e.K_Estado}>
                {e.D_Estado}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-xl font-medium text-black">
            Seleccione una ciudad del estado
          </p>
          <select
            disabled={kEstado === ""}
            className="flex h-[53px] w-[259px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none disabled:opacity-50"
          >
            <option value="">Ciudad</option>
            {ciudades.map((c) => (
              <option key={c.K_Ciudad} value={c.K_Ciudad}>
                {c.D_Ciudad}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
