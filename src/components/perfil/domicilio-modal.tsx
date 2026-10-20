"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AvisoPrivacidadCorto } from "@/components/ui/aviso-privacidad-corto";
import { ModalShell } from "@/components/ui/modal-shell";
import { useModalA11y } from "@/components/ui/use-modal-a11y";
import { buscarCodigoPostal } from "@/lib/codigo-postal";
import { guardarDomicilio } from "@/lib/domicilios";
import { domicilioVacio } from "@/types/domicilio";
import type { Domicilio } from "@/types/domicilio";

export function DomicilioModal({
  usuario,
  domicilio,
  onClose,
  onSuccess,
}: {
  usuario: string;
  /** Pass an existing domicilio to edit it; omit to create a new one. */
  domicilio?: Domicilio | undefined;
  onClose: () => void;
  onSuccess: (domicilio: Domicilio) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalA11y(panelRef, onClose);

  const [datos, setDatos] = useState<Omit<Domicilio, "id"> & { id?: string }>(domicilio ?? domicilioVacio());
  const [buscandoCP, setBuscandoCP] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Domicilio>(key: K, value: Domicilio[K]) {
    setDatos((d) => ({ ...d, [key]: value }));
  }

  async function handleCpBlur() {
    if (datos.cp.trim().length !== 5) return;
    setBuscandoCP(true);
    const resultado = await buscarCodigoPostal(datos.cp.trim())
      .catch(() => null)
      .finally(() => setBuscandoCP(false));
    if (!resultado) {
      setDatos((d) => ({ ...d, estado: "", ciudad: "" }));
      return;
    }
    setDatos((d) => ({ ...d, estado: resultado.estado, ciudad: resultado.ciudad }));
  }

  async function handleGuardar() {
    if (!canSubmit || guardando) return;
    setError(null);
    setGuardando(true);
    try {
      const res = await guardarDomicilio(usuario, datos);
      if (!res.ok) {
        setError(res.mensaje);
        return;
      }
      onSuccess(res.domicilio);
    } catch {
      setError("No se pudo guardar la dirección. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const canSubmit =
    datos.alias.trim() !== "" &&
    datos.calle.trim() !== "" &&
    datos.cp.trim().length === 5 &&
    datos.telefono.replace(/\D/g, "").length >= 10;

  return (
    <ModalShell
      onClose={onClose}
      panelRef={panelRef}
      label={domicilio ? "Editar dirección" : "Agregar dirección"}
      className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col gap-6 overflow-y-auto rounded-md bg-neutral-bg px-6 pb-6 pt-10 sm:px-10"
      backdropClassName="px-4 py-8"
    >
      <p className="text-center font-display text-2xl font-bold text-black">
        {domicilio ? "Editar dirección" : "Agregar dirección"}
      </p>

      <div className="flex flex-col gap-3">
        <Row label="Nombre">
          <input
            autoComplete="off"
            type="text"
            value={datos.alias}
            onChange={(e) => set("alias", e.target.value)}
            aria-label="Alias de la dirección"
            placeholder="Ej. Casa, Oficina"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <Row label="Contacto">
          <input
            autoComplete="off"
            type="text"
            value={datos.contacto}
            onChange={(e) => set("contacto", e.target.value)}
            aria-label="Nombre de quien recibe"
            placeholder="Nombre de quien recibe"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <Row label="Teléfono">
          <input
            autoComplete="tel"
            type="tel"
            value={datos.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            aria-label="Teléfono de contacto"
            placeholder="Ingrese número celular"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <Row label="C.P">
          <input
            autoComplete="postal-code"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={datos.cp}
            onChange={(e) => set("cp", e.target.value.replace(/\D/g, "").slice(0, 5))}
            onBlur={handleCpBlur}
            aria-label="Código postal"
            placeholder="Ingrese código postal"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <Row label="Estado">
          <div className="flex h-[53px] w-full items-center rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card">
            {buscandoCP ? "Buscando…" : datos.estado || "Se completa con el C.P"}
          </div>
        </Row>

        <Row label="Ciudad">
          <div className="flex h-[53px] w-full items-center rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card">
            {buscandoCP ? "Buscando…" : datos.ciudad || "Se completa con el C.P"}
          </div>
        </Row>

        <Row label="Colonia">
          <input
            type="text"
            value={datos.colonia}
            onChange={(e) => set("colonia", e.target.value)}
            aria-label="Colonia"
            placeholder="Colonia"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <Row label="Calle y número">
          <div className="flex w-full gap-3">
            <input
              autoComplete="address-line1"
              type="text"
              value={datos.calle}
              onChange={(e) => set("calle", e.target.value)}
              aria-label="Calle"
              placeholder="Calle"
              className="h-[53px] w-full min-w-0 flex-1 rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
            <input
              type="text"
              value={datos.numero}
              onChange={(e) => set("numero", e.target.value)}
              aria-label="Número exterior"
              placeholder="Núm."
              className="h-[53px] w-[100px] shrink-0 rounded-md border border-secondary-dark/50 bg-white px-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </div>
        </Row>

        <Row label="Referencias">
          <textarea
            value={datos.referencias}
            onChange={(e) => set("referencias", e.target.value)}
            aria-label="Referencias"
            placeholder="Color de casa, entre calles, punto de referencia…"
            rows={2}
            className="w-full resize-none rounded-md border border-secondary-dark/50 bg-white px-6 py-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
          />
        </Row>

        <label className="flex items-center gap-3 text-xs font-medium text-black">
          <input
            type="checkbox"
            checked={datos.predeterminado}
            onChange={(e) => set("predeterminado", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Usar como dirección predeterminada
        </label>
      </div>

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <AvisoPrivacidadCorto finalidad="programar tus recolecciones" />
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
      <span className="w-full shrink-0 text-xs font-medium text-[#707372] sm:w-[110px]">{label}</span>
      {children}
    </div>
  );
}
