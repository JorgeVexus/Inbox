"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FacturacionModal } from "@/components/facturacion/facturacion-modal";
import { obtenerDatosFacturacionGuardados } from "@/lib/facturacion";
import { REGIMENES_FISCALES } from "@/lib/mock/facturacion";
import type { DatosFacturacion } from "@/types/facturacion";

export function FacturacionGuardada({ usuario }: { usuario: string }) {
  const [datos, setDatos] = useState<DatosFacturacion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    // One-time client-only localStorage read triggered by a dependency
    // change (usuario) — the standard pattern, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDatos(obtenerDatosFacturacionGuardados(usuario));
  }, [usuario]);

  return (
    <section className="rounded-md bg-white p-6 shadow-card-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">
            Datos de facturación
          </h2>
          <p className="mt-1 text-sm text-black/70">
            Se usan para prellenar tu factura en cada envío.
          </p>
        </div>
        <Button type="button" onClick={() => setModalAbierto(true)} variant="outline">
          {datos ? "Editar" : "Agregar"}
        </Button>
      </div>

      {datos ? (
        <div className="mt-6 flex flex-col gap-1 rounded-md border border-secondary-dark/30 p-5 text-sm text-black/80">
          <p className="font-display text-lg font-bold text-black">{datos.rfc}</p>
          <p>
            {REGIMENES_FISCALES.find((r) => r.clave === datos.regimenFiscal)?.label ??
              datos.regimenFiscal}
          </p>
          <p>
            {datos.direccion}, {datos.colonia || datos.coloniaEspecificada}
            <br />
            {datos.ciudad}, {datos.estado} — CP {datos.cp}
          </p>
          {datos.correo && <p>{datos.correo}</p>}
          {datos.telefono && <p>Tel. {datos.telefono}</p>}
        </div>
      ) : (
        <p className="mt-6 text-sm text-black/60">
          Aún no tienes datos de facturación guardados.
        </p>
      )}

      {modalAbierto && (
        <FacturacionModal
          usuario={usuario}
          datosIniciales={datos ?? undefined}
          onClose={() => setModalAbierto(false)}
          onSuccess={(nuevosDatos) => {
            setDatos(nuevosDatos);
            setModalAbierto(false);
          }}
        />
      )}
    </section>
  );
}
