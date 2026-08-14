"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { listarDomicilios } from "@/lib/domicilios";
import {
  diasDisponibles,
  obtenerHorariosPorCP,
  programarRecoleccion,
  ventanasDisponibles,
} from "@/lib/recoleccion";
import type { Domicilio } from "@/types/domicilio";
import type { HorarioRecoleccion } from "@/types/recoleccion";

const FORMATO_DIA = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

function claveFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function RecoleccionView() {
  const { session, isLoginOpen, openLogin } = useAuth();
  const aperturaSolicitadaRef = useRef(false);

  useEffect(() => {
    if (session) {
      aperturaSolicitadaRef.current = false;
      return;
    }
    if (!aperturaSolicitadaRef.current && !isLoginOpen) {
      aperturaSolicitadaRef.current = true;
      openLogin();
    }
  }, [isLoginOpen, openLogin, session]);

  if (!session) {
    return (
      <main className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
        <section className="w-full max-w-xl rounded-md border border-neutral-line bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
          <p className="font-display text-sm font-bold text-primary">SOLICITA TU RECOLECCIÓN</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
            Inicia sesión para agendar tu recolección
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
            Usamos tu cuenta para asociar la recolección a tus direcciones
            guardadas.
          </p>
          {!isLoginOpen && (
            <Button type="button" onClick={openLogin} className="mt-7">
              Iniciar sesión
            </Button>
          )}
        </section>
      </main>
    );
  }

  return <FormularioRecoleccion usuario={session.usuario} nombre={session.nombre} />;
}

function FormularioRecoleccion({ usuario, nombre }: { usuario: string; nombre: string }) {
  const [domicilios, setDomicilios] = useState<Domicilio[] | null>(null);
  const [domicilioId, setDomicilioId] = useState<string>("");
  const [horarios, setHorarios] = useState<HorarioRecoleccion[] | null>(null);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  const [fecha, setFecha] = useState<string>("");
  const [ventana, setVentana] = useState<string>("");
  const [paquetes, setPaquetes] = useState(1);
  const [contacto, setContacto] = useState(nombre);
  const [observaciones, setObservaciones] = useState("");
  const [guias, setGuias] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folio, setFolio] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarDomicilios(usuario).then((lista) => {
      if (cancelado) return;
      setDomicilios(lista);
      const predeterminado = lista.find((d) => d.predeterminado) ?? lista[0];
      if (predeterminado) setDomicilioId(predeterminado.id);
    });
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  const domicilioSeleccionado = domicilios?.find((d) => d.id === domicilioId) ?? null;

  useEffect(() => {
    if (!domicilioSeleccionado) {
      // Clearing horarios for a dependency change (no domicilio selected),
      // not derived state — the standard pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHorarios(null);
      return;
    }
    let cancelado = false;
    setBuscandoHorarios(true);
    setFecha("");
    setVentana("");
    obtenerHorariosPorCP(domicilioSeleccionado.cp).then((res) => {
      if (cancelado) return;
      setHorarios(res);
      setBuscandoHorarios(false);
    });
    return () => {
      cancelado = true;
    };
  }, [domicilioSeleccionado]);

  const horario = horarios?.[0] ?? null;
  const dias = useMemo(() => (horario ? diasDisponibles(horario) : []), [horario]);
  const ventanas = useMemo(() => (horario ? ventanasDisponibles(horario) : []), [horario]);

  const canSubmit =
    Boolean(domicilioId) && Boolean(fecha) && Boolean(ventana) && contacto.trim().length >= 3 && paquetes >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || enviando) return;
    const [horaInicio, horaFin] = ventana.split("-");
    setEnviando(true);
    setError(null);
    const res = await programarRecoleccion({
      domicilioId,
      fecha,
      horaInicio,
      horaFin,
      paquetes,
      contacto,
      observaciones,
      guiasReferencia: guias.split(",").map((g) => g.trim()).filter(Boolean),
    });
    setEnviando(false);
    if (!res.ok) {
      setError(res.mensaje);
      return;
    }
    setFolio(res.folio);
  }

  if (folio) {
    return (
      <main className="bg-neutral-bg pb-20">
        <div className="mx-auto flex w-full max-w-[700px] flex-col items-center gap-5 px-5 pt-16 text-center sm:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-primary" aria-hidden>
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-black sm:text-4xl">
            ¡Recolección agendada!
          </h1>
          <p className="max-w-md text-sm text-black/70 sm:text-base">
            Folio de recolección{" "}
            <span className="font-display font-bold text-primary">#{folio}</span>.
            Un mensajero pasará por tu paquete en la ventana de horario que
            elegiste.
          </p>
          <div className="flex gap-4">
            <Button href="/" variant="outline">Ir a inicio</Button>
            <Button href="/rastreo">Rastrear un envío</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-neutral-bg pb-20">
      <div className="mx-auto w-full max-w-[860px] px-5 pt-8 sm:px-8">
        <nav aria-label="Migas de pan" className="text-sm text-black/70">
          <Link href="/" className="transition-colors hover:text-primary">Inicio</Link>
          <span aria-hidden="true" className="mx-2">›</span>
          <span aria-current="page" className="font-bold text-black">Solicita tu recolección</span>
        </nav>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-bold text-black sm:text-5xl">
            Solicita tu recolección
          </h1>
          <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">Datos demo</span>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-black/70 sm:text-base">
          Ideal si ya generaste tus guías y solo necesitas que pasemos por
          tus paquetes.
        </p>

        {domicilios !== null && domicilios.length === 0 ? (
          <section className="mt-10 rounded-md bg-white p-10 text-center shadow-card-sm">
            <h2 className="font-display text-2xl font-bold text-black">
              Aún no tienes direcciones guardadas
            </h2>
            <p className="mt-3 text-sm text-black/70">
              Agrega una dirección en tu perfil para poder agendar una recolección.
            </p>
            <Button href="/perfil" className="mt-5">Ir a mi perfil</Button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6 rounded-md bg-white p-6 shadow-card-sm sm:p-8">
            <Campo label="Dirección de recolección">
              <select
                value={domicilioId}
                onChange={(e) => setDomicilioId(e.target.value)}
                className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card-sm outline-none"
              >
                {domicilios === null && <option>Cargando…</option>}
                {domicilios?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.alias} — {d.calle} {d.numero}, {d.ciudad}
                  </option>
                ))}
              </select>
            </Campo>

            {buscandoHorarios && (
              <p className="text-sm text-black/60">Consultando horarios disponibles…</p>
            )}

            {!buscandoHorarios && domicilioSeleccionado && horarios?.length === 0 && (
              <p role="alert" className="text-sm font-medium text-red-600">
                No encontramos cobertura de recolección para el CP{" "}
                {domicilioSeleccionado.cp}.
              </p>
            )}

            {horario && (
              <>
                <p className="text-xs text-black/60">
                  Oficina asignada: {horario.oficina}. Solicitudes el mismo día
                  se aceptan hasta las {horario.horaLimiteCaptura} hrs.
                </p>

                <Campo label="Fecha">
                  <select
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card-sm outline-none"
                  >
                    <option value="">Selecciona un día</option>
                    {dias.map((d) => (
                      <option key={claveFecha(d)} value={claveFecha(d)}>
                        {FORMATO_DIA.format(d)}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Horario">
                  <select
                    value={ventana}
                    onChange={(e) => setVentana(e.target.value)}
                    className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card-sm outline-none"
                  >
                    <option value="">Selecciona un horario</option>
                    {ventanas.map((v) => (
                      <option key={v.inicio} value={`${v.inicio}-${v.fin}`}>
                        {v.inicio} – {v.fin} hrs
                      </option>
                    ))}
                  </select>
                </Campo>
              </>
            )}

            <Campo label="Guías a recolectar (opcional)">
              <input
                type="text"
                value={guias}
                onChange={(e) => setGuias(e.target.value)}
                placeholder="Ej. 4003229791, 4159473741"
                className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
              />
            </Campo>

            <Campo label="Nombre de quien entrega">
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Nombre completo"
                className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
              />
            </Campo>

            <Campo label="Cantidad de paquetes">
              <div className="flex h-[53px] w-[140px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-4 shadow-card-sm">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={() => setPaquetes((p) => Math.max(1, p - 1))}
                  className="text-lg font-bold text-black"
                >
                  −
                </button>
                <span className="text-sm font-medium text-black">{paquetes}</span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={() => setPaquetes((p) => p + 1)}
                  className="text-lg font-bold text-black"
                >
                  +
                </button>
              </div>
            </Campo>

            <Campo label="Observaciones (opcional)">
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas para el mensajero"
                rows={3}
                className="w-full resize-none rounded-md border border-secondary-dark/50 bg-white px-6 py-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
              />
            </Campo>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!canSubmit || enviando}
              className="mx-auto w-full max-w-[280px] disabled:opacity-50"
            >
              {enviando ? "Agendando…" : "Agendar recolección"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-black">{label}</label>
      {children}
    </div>
  );
}
