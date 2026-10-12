import { Suspense } from "react";
import { RastreoView } from "@/components/rastreo/rastreo-view";

export default function RastreoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-[1201px] flex-col items-center gap-2 px-6 py-12 text-center">
          <h1 className="font-display text-3xl font-bold text-black">Rastree su paquete</h1>
          <p className="max-w-xl text-sm text-black">
            Ingresa tu número de guía para conocer el estado de tu envío. Puedes rastrear varios paquetes al mismo tiempo.
          </p>
        </div>
      }
    >
      <RastreoView />
    </Suspense>
  );
}
