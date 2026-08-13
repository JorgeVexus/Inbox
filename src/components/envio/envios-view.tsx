"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { EnvioHistorial } from "@/components/envio/envio-historial";
import { EnvioResumen } from "@/components/envio/envio-resumen";
import { EnviosLista } from "@/components/envio/envios-lista";
import { NombreEnvioModal } from "@/components/envio/nombre-envio-modal";
import { Button } from "@/components/ui/button";
import {
  asignarNombreEnvio,
  filtrarEnvios,
  listarEnvios,
  obtenerDetalleEnvio,
} from "@/lib/envios";
import type { EnvioDetalle, EnvioPerfil } from "@/types/envio";

type ListaState = {
  usuario: string;
  envios: EnvioPerfil[];
  cargando: boolean;
  error: string | null;
};

type DetalleState = {
  detalle: EnvioDetalle | null;
  cargando: boolean;
  error: string | null;
};

const LISTA_INICIAL: ListaState = {
  usuario: "",
  envios: [],
  cargando: false,
  error: null,
};

export function EnviosView() {
  const { session, isLoginOpen, openLogin } = useAuth();
  const aperturaSolicitadaRef = useRef(false);
  const listaRequestRef = useRef(0);
  const detalleRequestRef = useRef<Record<string, number>>({});
  const guardadoRequestRef = useRef(0);
  const usuarioActivoRef = useRef<string | null>(null);
  const [lista, setLista] = useState<ListaState>(LISTA_INICIAL);
  const [reintentoLista, setReintentoLista] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<Record<string, DetalleState>>({});
  const [aliasAbierto, setAliasAbierto] = useState(false);
  const [guardandoAlias, setGuardandoAlias] = useState(false);
  const [errorAlias, setErrorAlias] = useState<string | null>(null);

  const usuario = session?.usuario ?? null;

  useEffect(() => {
    usuarioActivoRef.current = usuario;
    return () => {
      usuarioActivoRef.current = null;
    };
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      aperturaSolicitadaRef.current = false;
      return;
    }

    if (!aperturaSolicitadaRef.current && !isLoginOpen) {
      aperturaSolicitadaRef.current = true;
      openLogin();
    }
  }, [isLoginOpen, openLogin, usuario]);

  useEffect(() => {
    if (!usuario) {
      listaRequestRef.current += 1;
      detalleRequestRef.current = {};
      guardadoRequestRef.current += 1;
      return;
    }

    const requestId = ++listaRequestRef.current;
    // The request boundary owns this loading state; clearing the previous
    // user's list here prevents it from being reused by a new session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLista({ usuario, envios: [], cargando: true, error: null });
    setDetalles({});
    setDetalleAbierto(null);
    setAliasAbierto(false);
    setGuardandoAlias(false);
    setErrorAlias(null);

    listarEnvios(usuario)
      .then((envios) => {
        if (listaRequestRef.current !== requestId) return;
        setLista({ usuario, envios, cargando: false, error: null });
        setSeleccionado((actual) =>
          actual && envios.some((envio) => envio.guia === actual)
            ? actual
            : (envios[0]?.guia ?? null),
        );
      })
      .catch(() => {
        if (listaRequestRef.current !== requestId) return;
        setLista({
          usuario,
          envios: [],
          cargando: false,
          error: "No pudimos cargar tus envÃ­os. Intenta de nuevo.",
        });
      });
  }, [reintentoLista, usuario]);

  const listaVisible = lista.usuario === usuario ? lista : LISTA_INICIAL;
  const enviosFiltrados = useMemo(
    () => filtrarEnvios(listaVisible.envios, busqueda),
    [busqueda, listaVisible.envios],
  );
  const guiaVisible =
    seleccionado && enviosFiltrados.some((envio) => envio.guia === seleccionado)
      ? seleccionado
      : (enviosFiltrados[0]?.guia ?? null);
  const envioSeleccionado =
    listaVisible.envios.find((envio) => envio.guia === guiaVisible) ?? null;
  const detalleActual = guiaVisible ? detalles[guiaVisible] : undefined;

  function cargarDetalle(guia: string) {
    if (!usuario) return;
    const usuarioSolicitud = usuario;
    const requestId = (detalleRequestRef.current[guia] ?? 0) + 1;
    detalleRequestRef.current[guia] = requestId;
    setDetalles((actual) => ({
      ...actual,
      [guia]: { detalle: actual[guia]?.detalle ?? null, cargando: true, error: null },
    }));

    obtenerDetalleEnvio(guia)
      .then((detalle) => {
        if (
          detalleRequestRef.current[guia] !== requestId ||
          usuarioSolicitud !== usuarioActivoRef.current
        ) return;
        setDetalles((actual) => ({
          ...actual,
          [guia]: detalle
            ? { detalle, cargando: false, error: null }
            : {
                detalle: null,
                cargando: false,
                error: "No encontramos el historial de este envÃ­o.",
              },
        }));
      })
      .catch(() => {
        if (
          detalleRequestRef.current[guia] !== requestId ||
          usuarioSolicitud !== usuarioActivoRef.current
        ) return;
        setDetalles((actual) => ({
          ...actual,
          [guia]: {
            detalle: null,
            cargando: false,
            error: "No pudimos cargar el historial. Intenta de nuevo.",
          },
        }));
      });
  }

  function toggleDetalle() {
    if (!guiaVisible) return;
    if (detalleAbierto === guiaVisible) {
      setDetalleAbierto(null);
      return;
    }

    setDetalleAbierto(guiaVisible);
    if (!detalles[guiaVisible]) cargarDetalle(guiaVisible);
  }

  async function guardarAlias(nombre: string) {
    if (!usuario || !envioSeleccionado || guardandoAlias) return;
    const usuarioSolicitud = usuario;
    const guia = envioSeleccionado.guia;
    const requestId = ++guardadoRequestRef.current;
    setGuardandoAlias(true);
    setErrorAlias(null);

    let resultado;
    try {
      resultado = await asignarNombreEnvio(usuario, guia, nombre);
    } catch {
      if (
        guardadoRequestRef.current === requestId &&
        usuarioSolicitud === usuarioActivoRef.current
      ) {
        setGuardandoAlias(false);
        setErrorAlias("No pudimos guardar el nombre del envÃ­o. Intenta de nuevo.");
      }
      return;
    }
    if (
      guardadoRequestRef.current !== requestId ||
      usuarioSolicitud !== usuarioActivoRef.current
    ) return;

    setGuardandoAlias(false);
    if (!resultado.ok) {
      setErrorAlias(resultado.mensaje);
      return;
    }

    setLista((actual) => ({
      ...actual,
      envios: actual.envios.map((envio) =>
        envio.guia === guia ? { ...envio, nombre: resultado.nombre } : envio,
      ),
    }));
    setAliasAbierto(false);
  }

  if (!session) {
    return (
      <main className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
        <section className="w-full max-w-xl rounded-md border border-neutral-line bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
          <p className="font-display text-sm font-bold text-primary">MIS ENVÃOS</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
            Inicia sesiÃ³n para consultar tus envÃ­os
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
            Tu historial, datos de guÃ­a y movimientos estÃ¡n protegidos y solo se muestran dentro de tu cuenta.
          </p>
          {!isLoginOpen && (
            <Button type="button" onClick={openLogin} className="mt-7">
              Iniciar sesiÃ³n
            </Button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="bg-neutral-bg pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-8 sm:px-8 lg:px-10">
        <nav aria-label="Migas de pan" className="text-sm text-black/70">
          <Link href="/" className="transition-colors hover:text-primary">Inicio</Link>
          <span aria-hidden="true" className="mx-2">›</span>
          <span aria-current="page" className="font-bold text-black">Mis envÃ­os</span>
        </nav>

        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-bold text-black sm:text-5xl">Mis envÃ­os</h1>
              <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">Datos demo</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/70 sm:text-base">
              Consulta el estado, los movimientos y el nombre de cada envÃ­o asociado a tu cuenta.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/cotizar" variant="outline" className="w-full sm:w-auto">Cotizar nuevo envÃ­o</Button>
            <Button href="/cotizar" className="w-full sm:w-auto">Hacer un nuevo envÃ­o</Button>
          </div>
        </div>

        {listaVisible.cargando ? (
          <section aria-live="polite" aria-busy="true" className="mt-10 rounded-md bg-white p-10 text-center shadow-card-sm">
            <p className="text-sm text-black/70">Cargando tus envÃ­osâ€¦</p>
          </section>
        ) : listaVisible.error ? (
          <section className="mt-10 rounded-md bg-white p-10 text-center shadow-card-sm">
            <p role="alert" className="text-sm text-black">{listaVisible.error}</p>
            <Button type="button" onClick={() => setReintentoLista((valor) => valor + 1)} className="mt-5">Reintentar</Button>
          </section>
        ) : listaVisible.envios.length === 0 ? (
          <section className="mt-10 rounded-md bg-white p-10 text-center shadow-card-sm">
            <h2 className="font-display text-2xl font-bold text-black">AÃºn no tienes envÃ­os</h2>
            <p className="mt-3 text-sm text-black/70">Cotiza tu primer envÃ­o para comenzar.</p>
            <Button href="/cotizar" className="mt-5">Cotizar nuevo envÃ­o</Button>
          </section>
        ) : (
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
            <EnviosLista
              envios={enviosFiltrados}
              seleccionado={guiaVisible}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              onSeleccionar={(guia) => {
                setSeleccionado(guia);
                setDetalleAbierto(null);
              }}
            />

            <div className="min-w-0 space-y-6">
              {envioSeleccionado ? (
                <>
                  <EnvioResumen
                    envio={envioSeleccionado}
                    detalleAbierto={detalleAbierto === envioSeleccionado.guia}
                    onToggleDetalle={toggleDetalle}
                    onEditarNombre={() => {
                      setErrorAlias(null);
                      setAliasAbierto(true);
                    }}
                  />
                  {detalleAbierto === envioSeleccionado.guia && (
                    <EnvioHistorial
                      eventos={detalleActual?.detalle?.eventos ?? []}
                      cargando={detalleActual?.cargando ?? true}
                      error={detalleActual?.error ?? null}
                      onReintentar={() => cargarDetalle(envioSeleccionado.guia)}
                    />
                  )}
                </>
              ) : (
                <section className="rounded-md bg-white p-10 text-center shadow-card-sm">
                  <p className="text-sm text-black/70">No hay envÃ­os que coincidan con tu bÃºsqueda.</p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>

      <NombreEnvioModal
        abierto={aliasAbierto && Boolean(envioSeleccionado)}
        nombreInicial={envioSeleccionado?.nombre ?? ""}
        guardando={guardandoAlias}
        error={errorAlias}
        onCerrar={() => {
          if (!guardandoAlias) setAliasAbierto(false);
        }}
        onGuardar={guardarAlias}
      />
    </main>
  );
}
