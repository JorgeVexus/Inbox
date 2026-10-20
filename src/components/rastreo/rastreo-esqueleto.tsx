import { Faq } from "@/components/home/faq";
import { rastreoEsDemo } from "@/lib/rastreo";

/**
 * Lo que se ve de /rastreo mientras carga el JavaScript (Suspense de `useSearchParams`). Debe medir
 * LO MISMO que `RastreoView` sin guías: antes era solo el título y el contenido real aparecía
 * después empujando el pie de página (CLS de 0.65 en Lighthouse). Si cambias la estructura de
 * `RastreoView`, cambia esta también.
 */
export function RastreoEsqueleto() {
  return (
    <div className="mx-auto flex max-w-[1201px] flex-col gap-16 px-6 py-12 lg:px-0">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-3xl font-bold text-black">Rastree su paquete</h1>
          {rastreoEsDemo() && (
            <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">
              Datos de demostración — prueba con la guía 4003229791
            </span>
          )}
          <p className="max-w-xl text-xs text-black">
            ¿Tienes varios paquetes? Ingresa tus guías y mantente al tanto de múltiples envíos al mismo tiempo.
          </p>
        </div>

        <div className="flex w-full max-w-[339px] items-center gap-3">
          <div className="flex h-[43px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card">
            <span className="font-display text-base text-secondary-dark">Buscar envío</span>
          </div>
        </div>

        <p className="text-center font-display text-sm">
          <span className="font-bold text-primary underline">Inicia sesión</span>{" "}
          <span className="text-black">
            para guardar tus guías. Accede a tus rastreos en cualquier momento sin tener que ingresar tus guías cada
            vez.
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <p className="text-center text-sm text-black/60">
          Ingresa un número de guía arriba para empezar a rastrear tu envío.
        </p>
      </div>

      <Faq />
    </div>
  );
}
