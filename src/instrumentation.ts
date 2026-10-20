import type { Instrumentation } from "next";
import { logError } from "@/lib/api/log";

/**
 * Errores no controlados del servidor (render de páginas, rutas, acciones) en una línea JSON con los
 * datos personales enmascarados. Es el punto único donde se enchufaría Sentry u otro servicio
 * (ver docs/RUNBOOKS.md, "Observabilidad"): bastaría con enviar aquí `err.digest` y la ruta.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const error = err as Error & { digest?: string };
  logError(
    `error no controlado en ${context.routeType} ${request.path.split("?")[0] ?? ""}`,
    `${error.name}: ${error.message}`,
    error.digest,
  );
};
