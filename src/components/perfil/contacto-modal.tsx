"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { useModalA11y } from "@/components/ui/use-modal-a11y";
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
  contacto?: ContactoGuardado | undefined;
  onClose: () => void;
  onSuccess: (contacto: ContactoGuardado) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalA11y(panelRef, onClose);

  const [datos, setDatos] = useState<Omit<ContactoGuardado, "id"> & { id?: string }>(contacto ?? VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ContactoGuardado>(key: K, value: ContactoGuardado[K]) {
    setDatos((d) => ({ ...d, [key]: value }));
  }

  async function handleCpBlur() {
    if (datos.cp.trim().length !== 5) return;
    const res = await buscarCodigoPostal(datos.cp.trim()).catch(() => null);
    if (res) setDatos((d) => ({ ...d, ciudad: d.ciudad || res.ciudad }));
  }

  async function handleGuardar() {
    if (!canSubmit || guardando) return;
    setError(null);
    setGuardando(true);
    try {
      const res = await guardarContacto(usuario, datos);
      if (!res.ok) {
        setError(res.mensaje);
        return;
      }
      onSuccess(res.contacto);
    } catch {
      setError("No se pudo guardar el contacto. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const canSubmit = datos.nombre.trim() !== "" && datos.telefono.replace(/\D/g, "").length >= 10;

  return (
    <ModalShell
      onClose={onClose}
      panelRef={panelRef}
      label={contacto ? "Editar contacto" : "Agregar contacto"}
      className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col gap-6 overflow-y-auto rounded-md bg-neutral-bg px-6 pb-6 pt-10 sm:px-10"
      backdropClassName="px-4 py-8"
    >
      <p className="text-center font-display text-2xl font-bold text-black">
        {contacto ? "Editar contacto" : "Agregar contacto"}
      </p>

      <div className="flex flex-col gap-3">
        <Row label="Nombre">
          <input
            autoComplete="off"
            type="text"
            value={datos.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            aria-label="Nombre completo"
            placeholder="Nombre completo"
            className={INPUT}
          />
        </Row>
        <Row label="Teléfono">
          <input
            autoComplete="off"
            type="tel"
            value={datos.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            aria-label="Teléfono"
            placeholder="10 dígitos"
            className={INPUT}
          />
        </Row>
        <Row label="Correo">
          <input
            autoComplete="off"
            type="email"
            value={datos.email}
            onChange={(e) => set("email", e.target.value)}
            aria-label="Correo electrónico"
            placeholder="Opcional"
            className={INPUT}
          />
        </Row>
        <Row label="C.P">
          <input
            autoComplete="off"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={datos.cp}
            onChange={(e) => set("cp", e.target.value.replace(/\D/g, "").slice(0, 5))}
            onBlur={handleCpBlur}
            aria-label="Código postal"
            placeholder="Código postal"
            className={INPUT}
          />
        </Row>
        <Row label="Ciudad">
          <input
            autoComplete="off"
            type="text"
            value={datos.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
            aria-label="Ciudad"
            placeholder="Ciudad"
            className={INPUT}
          />
        </Row>
        <Row label="Colonia">
          <input
            autoComplete="off"
            type="text"
            value={datos.colonia}
            onChange={(e) => set("colonia", e.target.value)}
            aria-label="Colonia"
            placeholder="Colonia"
            className={INPUT}
          />
        </Row>
        <Row label="Dirección">
          <div className="flex w-full gap-3">
            <input
              autoComplete="off"
              type="text"
              value={datos.direccion}
              onChange={(e) => set("direccion", e.target.value)}
              aria-label="Calle"
              placeholder="Calle"
              className={`${INPUT} min-w-0 flex-1`}
            />
            <input
              autoComplete="off"
              type="text"
              value={datos.numExt}
              onChange={(e) => set("numExt", e.target.value)}
              placeholder="Ext."
              aria-label="Número exterior"
              className={`${INPUT} w-[78px] shrink-0 px-3`}
            />
            <input
              autoComplete="off"
              type="text"
              value={datos.numInt}
              onChange={(e) => set("numInt", e.target.value)}
              placeholder="Int."
              aria-label="Número interior"
              className={`${INPUT} w-[78px] shrink-0 px-3`}
            />
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
        disabled={!canSubmit || guardando}
        className="mx-auto disabled:cursor-not-allowed disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar"}
      </Button>
    </ModalShell>
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
