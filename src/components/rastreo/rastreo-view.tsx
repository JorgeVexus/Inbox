"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { RastreoCard } from "@/components/rastreo/rastreo-card";
import { Faq } from "@/components/home/faq";
import { rastrearGuias } from "@/lib/rastreo";
import type { Rastreo } from "@/types/rastreo";

function parseGuias(raw: string | null): string[] {
  if (!raw) return [];
  const vistas = new Set<string>();
  for (const parte of raw.split(",")) {
    const limpio = parte.trim();
    if (limpio) vistas.add(limpio);
  }
  return [...vistas];
}

export function RastreoView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, openLogin } = useAuth();

  const guias = useMemo(() => parseGuias(searchParams.get("guias")), [searchParams]);

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Record<string, Rastreo | null>>({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    // Loading flag toggled at the start of an async fetch triggered by a
    // dependency change (guias) — the standard pattern, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(guias.length > 0);
    rastrearGuias(guias).then((res) => {
      if (cancelado) return;
      const map: Record<string, Rastreo | null> = {};
      for (const { guia, resultado } of res) map[guia] = resultado;
      setResultados(map);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [guias]);

  function actualizarGuias(nuevas: string[]) {
    if (nuevas.length === 0) {
      router.push("/rastreo");
      return;
    }
    router.push(`/rastreo?guias=${encodeURIComponent(nuevas.join(","))}`);
  }

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const agregadas = busqueda
      .split(/[\s,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (agregadas.length === 0) return;
    actualizarGuias([...new Set([...guias, ...agregadas])]);
    setBusqueda("");
  }

  function quitarGuia(guia: string) {
    actualizarGuias(guias.filter((g) => g !== guia));
  }

  return (
    <div className="mx-auto flex max-w-[1201px] flex-col gap-16 px-6 py-12 lg:px-0">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-3xl font-bold text-black">
            Rastree su paquete
          </h1>
          <p className="max-w-xl text-xs text-black">
            ¿Tienes varios paquetes? Ingresa tus guías y mantente al tanto de
            múltiples envíos al mismo tiempo.
          </p>
        </div>

        <form onSubmit={handleBuscar} className="flex w-full max-w-[339px] items-center gap-3">
          <div className="flex h-[43px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar envío"
              className="w-full min-w-0 font-display text-base text-black placeholder:text-secondary-dark outline-none"
            />
            <button type="submit" aria-label="Buscar">
              <Image src="/icons/search2.svg" alt="" width={22} height={22} />
            </button>
          </div>
        </form>

        {!session && (
          <button
            type="button"
            onClick={openLogin}
            className="text-center font-display text-sm"
          >
            <span className="font-bold text-primary underline">Inicia sesión</span>{" "}
            <span className="text-black">
              para guardar tus guías. Accede a tus rastreos en cualquier
              momento sin tener que ingresar tus guías cada vez.
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-8">
        {guias.length === 0 && !cargando && (
          <p className="text-center text-sm text-black/60">
            Ingresa un número de guía arriba para empezar a rastrear tu envío.
          </p>
        )}

        {cargando && guias.length > 0 && (
          <p className="text-center text-sm text-black/60">Buscando tus guías…</p>
        )}

        {!cargando &&
          guias.map((guia) => (
            <RastreoCard
              key={guia}
              guia={guia}
              resultado={resultados[guia] ?? null}
              onQuitar={() => quitarGuia(guia)}
            />
          ))}
      </div>

      <Faq />
    </div>
  );
}
