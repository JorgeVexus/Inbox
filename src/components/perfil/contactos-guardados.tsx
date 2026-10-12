"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactoModal } from "@/components/perfil/contacto-modal";
import { eliminarContacto, listarContactos } from "@/lib/contactos";
import type { ContactoGuardado } from "@/types/contacto";

export function ContactosGuardados({ usuario }: { usuario: string }) {
  const [contactos, setContactos] = useState<ContactoGuardado[] | null>(null);
  const [modal, setModal] = useState<"nuevo" | ContactoGuardado | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarContactos(usuario).then((lista) => {
      if (!cancelado) setContactos(lista);
    });
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  function upsertLocal(c: ContactoGuardado) {
    setContactos((actual) => {
      const lista = actual ?? [];
      return lista.some((x) => x.id === c.id) ? lista.map((x) => (x.id === c.id ? c : x)) : [...lista, c];
    });
    setModal(null);
  }

  async function handleEliminar(id: string) {
    setEliminando(id);
    const res = await eliminarContacto(usuario, id);
    setEliminando(null);
    if (res.ok) setContactos((actual) => (actual ?? []).filter((c) => c.id !== id));
  }

  return (
    <section className="rounded-md bg-white p-6 shadow-card-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">Mis contactos</h2>
          <p className="mt-1 text-sm text-black/70">
            Remitentes y destinatarios frecuentes: los eliges al documentar un envío y el formulario se llena solo.
          </p>
        </div>
        <Button type="button" onClick={() => setModal("nuevo")} variant="outline">
          Agregar contacto
        </Button>
      </div>

      {contactos === null ? (
        <p className="mt-6 text-sm text-black/60">Cargando contactos…</p>
      ) : contactos.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">Aún no tienes contactos guardados.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {contactos.map((c) => (
            <div key={c.id} className="flex flex-col gap-1.5 rounded-md border border-secondary-dark/30 p-5">
              <p className="font-display text-lg font-bold text-black">{c.nombre}</p>
              <p className="text-sm text-black/80">
                {c.direccion} {c.numExt}
                {c.numInt ? ` int. ${c.numInt}` : ""}
                {c.colonia ? `, ${c.colonia}` : ""}
                <br />
                {c.ciudad}
                {c.cp ? ` — CP ${c.cp}` : ""}
              </p>
              <p className="text-sm text-black/70">Tel. {c.telefono}</p>
              {c.email && <p className="text-sm text-black/70">{c.email}</p>}
              <div className="mt-2 flex gap-4 text-xs font-bold">
                <button type="button" onClick={() => setModal(c)} className="px-2 py-2 text-primary underline">
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(c.id)}
                  disabled={eliminando === c.id}
                  className="px-2 py-2 text-black/60 underline disabled:opacity-50"
                >
                  {eliminando === c.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ContactoModal
          usuario={usuario}
          contacto={modal === "nuevo" ? undefined : modal}
          onClose={() => setModal(null)}
          onSuccess={upsertLocal}
        />
      )}
    </section>
  );
}
