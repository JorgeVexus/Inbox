"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DomicilioModal } from "@/components/perfil/domicilio-modal";
import { eliminarDomicilio, listarDomicilios } from "@/lib/domicilios";
import type { Domicilio } from "@/types/domicilio";

export function DireccionesGuardadas({ usuario }: { usuario: string }) {
  const [domicilios, setDomicilios] = useState<Domicilio[] | null>(null);
  const [modal, setModal] = useState<"nuevo" | Domicilio | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarDomicilios(usuario).then((lista) => {
      if (!cancelado) setDomicilios(lista);
    });
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  function upsertLocal(domicilio: Domicilio) {
    setDomicilios((actual) => {
      const lista = actual ?? [];
      const existe = lista.some((d) => d.id === domicilio.id);
      const siguiente = existe
        ? lista.map((d) => (d.id === domicilio.id ? domicilio : d))
        : [...lista, domicilio];
      return domicilio.predeterminado
        ? siguiente.map((d) => (d.id === domicilio.id ? d : { ...d, predeterminado: false }))
        : siguiente;
    });
    setModal(null);
  }

  async function handleEliminar(id: string) {
    setEliminando(id);
    const res = await eliminarDomicilio(usuario, id);
    setEliminando(null);
    if (res.ok) {
      setDomicilios((actual) => (actual ?? []).filter((d) => d.id !== id));
    }
  }

  return (
    <section className="rounded-md bg-white p-6 shadow-card-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">
            Direcciones guardadas
          </h2>
          <p className="mt-1 text-sm text-black/70">
            Úsalas para agilizar tus recolecciones a domicilio.
          </p>
        </div>
        <Button type="button" onClick={() => setModal("nuevo")} variant="outline">
          Agregar dirección
        </Button>
      </div>

      {domicilios === null ? (
        <p className="mt-6 text-sm text-black/60">Cargando direcciones…</p>
      ) : domicilios.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">
          Aún no tienes direcciones guardadas.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {domicilios.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-2 rounded-md border border-secondary-dark/30 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-bold text-black">{d.alias}</p>
                {d.predeterminado && (
                  <span className="shrink-0 rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">
                    Predeterminada
                  </span>
                )}
              </div>
              <p className="text-sm text-black/80">
                {d.calle} {d.numero}, {d.colonia}
                <br />
                {d.ciudad}, {d.estado} — CP {d.cp}
              </p>
              {d.contacto && <p className="text-sm text-black/70">Contacto: {d.contacto}</p>}
              {d.telefono && <p className="text-sm text-black/70">Tel. {d.telefono}</p>}
              {d.referencias && (
                <p className="text-xs text-black/50">{d.referencias}</p>
              )}
              <div className="mt-2 flex gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setModal(d)}
                  className="text-primary underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(d.id)}
                  disabled={eliminando === d.id}
                  className="text-black/60 underline disabled:opacity-50"
                >
                  {eliminando === d.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <DomicilioModal
          usuario={usuario}
          domicilio={modal === "nuevo" ? undefined : modal}
          onClose={() => setModal(null)}
          onSuccess={upsertLocal}
        />
      )}
    </section>
  );
}
