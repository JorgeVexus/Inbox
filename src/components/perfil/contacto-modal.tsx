"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buscarCodigoPostal } from "@/lib/codigo-postal";
import { guardarContacto } from "@/lib/contactos";
import type { ContactoGuardado } from "@/types/contacto";

const VACIO: Omit<ContactoGuardado, "id"> = {
  nombre: "",
  cp: "",
  ciudad: "",
  colonia: "",
  direccion: "",
  numExt: "",
  numInt: "",
  telefono: "",
  email: "",
};

const INPUT =
  "h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none";

export function ContactoModal({
  usuario,
  contacto,
  onClose,
  onSuccess,
}: {
  usuario: string;
  /** Pasa un contacto existente para editarlo; omítelo para crear uno. */
  contacto?: ContactoGuardado;
  onClose: () => void;
  onSuccess: (contacto: ContactoGuardado) => void;
}) {
  const [datos, setDatos] = useState<Omit<ContactoGuardado, "id"> & { id?: string }>(contacto ?? VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ContactoGuardado>(key: K, value: ContactoGuardado[K]) {
    setDatos((d) => ({ ...d, [key]: value }));
  }

  async function handleCpBlur() {
    if (datos.cp.trim().length !== 5) return;
    const res = await buscarCodigoPostal(datos.cp.trim());
    if (res) setDatos((d) => ({ ...d, ciudad: d.ciudad || res.ciudad }));
  }

  async function handleGuardar() {
    setError(null);
    setGuardando(true);
    const res = await guardarContacto(usuario, datos);
    setGuardando(false);
    if (!res.ok) {
      setError(res.mensaje);
      return;
    }
    onSuccess(res.contacto);
  }

  const canSubmit = datos.nombre.trim() !== "" && datos.telefono.trim() !== "";

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={contacto ? "Editar contacto" : "Agregar contacto"}
        className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col gap-6 overflow-y-auto rounded-md bg-neutral-bg px-6 pb-6 pt-10 sm:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-black/5 hover:text-black"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
          </svg>
        </button>

        <p className="text-center font-display text-2xl font-bold text-black">
          {contacto ? "Editar contacto" : "Agregar contacto"}
        </p>

        <div className="flex flex-col gap-3">
          <Row label="Nombre">
            <input type="text" value={datos.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre completo" className={INPUT} />
          </Row>
          <Row label="Teléfono">
            <input type="tel" value={datos.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="10 dígitos" className={INPUT} />
          </Row>
          <Row label="Correo">
            <input type="email" value={datos.email} onChange={(e) => set("email", e.target.value)} placeholder="Opcional" className={INPUT} />
          </Row>
          <Row label="C.P">
            <input type="text" inputMode="numeric" maxLength={5} value={datos.cp} onChange={(e) => set("cp", e.target.value)} onBlur={handleCpBlur} placeholder="Código postal" className={INPUT} />
          </Row>
          <Row label="Ciudad">
            <input type="text" value={datos.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Ciudad" className={INPUT} />
          </Row>
          <Row label="Colonia">
            <input type="text" value={datos.colonia} onChange={(e) => set("colonia", e.target.value)} placeholder="Colonia" className={INPUT} />
          </Row>
          <Row label="Dirección">
            <div className="flex w-full gap-3">
              <input type="text" value={datos.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle" className={`${INPUT} min-w-0 flex-1`} />
              <input type="text" value={datos.numExt} onChange={(e) => set("numExt", e.target.value)} placeholder="Ext." aria-label="Número exterior" className={`${INPUT} w-[78px] shrink-0 px-3`} />
              <input type="text" value={datos.numInt} onChange={(e) => set("numInt", e.target.value)} placeholder="Int." aria-label="Número interior" className={`${INPUT} w-[78px] shrink-0 px-3`} />
            </div>
          </Row>
        </div>

        {error && (
          <p role="alert" className="text-center text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button
          onClick={handleGuardar}
          className={`mx-auto ${!canSubmit || guardando ? "pointer-events-none opacity-50" : ""}`}
        >
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-full shrink-0 text-xs font-medium text-[#707372] sm:w-[90px]">{label}</span>
      {children}
    </div>
  );
}
