"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buscarCodigoPostal } from "@/lib/codigo-postal";
import { extraerDatosConstanciaFiscal, guardarDatosFacturacion } from "@/lib/facturacion";
import { REGIMENES_FISCALES } from "@/lib/mock/facturacion";
import { datosFacturacionVacios } from "@/types/facturacion";
import type { DatosFacturacion } from "@/types/facturacion";

export function FacturacionModal({
  onClose,
  onSuccess,
  usuario,
  datosIniciales,
}: {
  onClose: () => void;
  onSuccess: (datos: DatosFacturacion) => void;
  /** When passed, a successful save is also cached locally for this user
   * (see obtenerDatosFacturacionGuardados in lib/facturacion.ts) so /perfil
   * can display it later. Omitted by the checkout flow (step-pago.tsx),
   * which has no saved-data display to keep in sync. */
  usuario?: string;
  datosIniciales?: DatosFacturacion;
}) {
  const [datos, setDatos] = useState<DatosFacturacion>(
    datosIniciales ?? datosFacturacionVacios(),
  );
  const [colonias, setColonias] = useState<string[]>([]);
  const [buscandoCP, setBuscandoCP] = useState(false);

  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [extrayendo, setExtrayendo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  function set<K extends keyof DatosFacturacion>(key: K, value: DatosFacturacion[K]) {
    setDatos((d) => ({ ...d, [key]: value }));
  }

  async function handleArchivo(file: File) {
    setErrorArchivo(null);
    setExtrayendo(true);
    try {
      const extraidos = await extraerDatosConstanciaFiscal(file);
      setArchivoNombre(file.name);
      setDatos((d) => ({ ...d, ...extraidos }));
      if (extraidos.cp) {
        const resultado = await buscarCodigoPostal(extraidos.cp);
        if (resultado) {
          setColonias(resultado.colonias);
          setDatos((d) => ({ ...d, estado: resultado.estado, ciudad: resultado.ciudad }));
        }
      }
    } catch (err) {
      setErrorArchivo(err instanceof Error ? err.message : "No se pudo leer el archivo.");
    } finally {
      setExtrayendo(false);
    }
  }

  async function handleCpBlur() {
    if (!datos.cp.trim()) return;
    setBuscandoCP(true);
    const resultado = await buscarCodigoPostal(datos.cp.trim());
    setBuscandoCP(false);
    if (!resultado) {
      setColonias([]);
      setDatos((d) => ({ ...d, estado: "", ciudad: "", colonia: "" }));
      return;
    }
    setColonias(resultado.colonias);
    setDatos((d) => ({ ...d, estado: resultado.estado, ciudad: resultado.ciudad }));
  }

  const canSubmit =
    datos.rfc.trim() !== "" &&
    datos.regimenFiscal !== "" &&
    datos.cp.trim() !== "" &&
    (datos.colonia !== "" || datos.coloniaEspecificada.trim() !== "");

  async function handleAceptar() {
    setErrorGuardar(null);
    setGuardando(true);
    const res = await guardarDatosFacturacion(datos, usuario);
    setGuardando(false);
    if (!res.ok) {
      setErrorGuardar(res.mensaje ?? "No se pudieron guardar los datos.");
      return;
    }
    onSuccess(datos);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[612px] flex-col gap-6 overflow-y-auto rounded-md bg-neutral-bg px-6 pb-5 pt-10 sm:px-10"
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
          Datos de facturación
        </p>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-black">Constancia fiscal</p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleArchivo(file);
            }}
            className={`flex flex-col items-center gap-2.5 rounded-md border-2 border-dashed bg-white px-8 py-3 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-primary"
            }`}
          >
            <Image src="/icons/add-photo-alternate.svg" alt="" width={62} height={62} />
            {extrayendo ? (
              <p className="text-sm font-medium text-black">Leyendo tu archivo…</p>
            ) : archivoNombre ? (
              <p className="text-sm font-medium text-black">
                {archivoNombre} —{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline"
                >
                  cambiar archivo
                </button>
              </p>
            ) : (
              <p className="max-w-xs text-sm font-medium text-black">
                Arrastra aquí tu imagen o{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline"
                >
                  explora archivos
                </button>{" "}
                para rellenar información
              </p>
            )}
            <p className="text-xs text-secondary-dark">Archivos aceptados: PDF y XML</p>
            {errorArchivo && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errorArchivo}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleArchivo(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Row label="RFC">
            <input
              type="text"
              value={datos.rfc}
              onChange={(e) => set("rfc", e.target.value.toUpperCase())}
              placeholder="Ejem: VECJ880326XXX"
              maxLength={13}
              className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Row>

          <Row label="Régimen fiscal">
            <select
              value={datos.regimenFiscal}
              onChange={(e) => set("regimenFiscal", e.target.value)}
              className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none"
            >
              <option value="">Seleccione una opción</option>
              {REGIMENES_FISCALES.map((r) => (
                <option key={r.clave} value={r.clave}>
                  {r.label}
                </option>
              ))}
            </select>
          </Row>

          <Row label="C.P">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={datos.cp}
              onChange={(e) => set("cp", e.target.value)}
              onBlur={handleCpBlur}
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

          <div className="flex flex-col gap-2">
            <Row label="Colonia">
              <select
                value={datos.colonia}
                onChange={(e) => set("colonia", e.target.value)}
                disabled={colonias.length === 0}
                className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card outline-none disabled:opacity-50"
              >
                <option value="">
                  {colonias.length === 0 ? "Ingrese un C.P primero" : "Seleccione una opción"}
                </option>
                {colonias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Row>
            <div className="flex items-center gap-2 pl-[137px]">
              <span className="shrink-0 text-xs font-medium text-[#707372]">
                Especificar colonia
              </span>
              <input
                type="text"
                value={datos.coloniaEspecificada}
                onChange={(e) => set("coloniaEspecificada", e.target.value)}
                placeholder="Colonia"
                className="h-[34px] w-[144px] rounded-md border border-secondary-dark/50 bg-white px-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
              />
            </div>
          </div>

          <Row label="Dirección">
            <input
              type="text"
              value={datos.direccion}
              onChange={(e) => set("direccion", e.target.value)}
              placeholder="Calle y número"
              className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Row>

          <Row label="Teléfono">
            <input
              type="tel"
              value={datos.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="Ingrese número celular"
              className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Row>

          <Row label="Correo">
            <input
              type="email"
              value={datos.correo}
              onChange={(e) => set("correo", e.target.value)}
              placeholder="Ingrese correo electrónico"
              className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
          </Row>
        </div>

        {errorGuardar && (
          <p role="alert" className="text-center text-sm font-medium text-red-600">
            {errorGuardar}
          </p>
        )}

        <Button
          onClick={handleAceptar}
          className={`mx-auto ${!canSubmit || guardando ? "pointer-events-none opacity-50" : ""}`}
        >
          {guardando ? "Guardando…" : "Aceptar"}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <p className="w-full shrink-0 text-sm font-medium text-black sm:w-[110px]">{label}</p>
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
