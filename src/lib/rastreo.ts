import type { Rastreo, RastreoEvento } from "@/types/rastreo";

/**
 * Error de red/servidor al consultar rastreo (distinto de "la guía no
 * existe", que se representa con `null`).
 */
export class RastreoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RastreoError";
  }
}

/**
 * POST a un Route Handler del BFF (que a su vez habla con SIBOX). Regresa
 * `null` si la guia no existe (404); lanza `RastreoError` en cualquier otro
 * fallo para que la UI pueda distinguir "no existe" de "no pudimos consultar".
 */
async function postBff<T>(url: string, guia: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Guia: guia }),
    });
  } catch {
    throw new RastreoError("No pudimos conectar. Revisa tu conexión e intenta de nuevo.");
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new RastreoError("No pudimos consultar tu envío en este momento. Intenta de nuevo.");
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

/** Seam de `wsRastreo`, conectado al BFF (`/api/rastreo`). */
export async function rastrearGuia(guia: string): Promise<Rastreo | null> {
  const clean = guia.trim();
  if (!clean) return null;
  const registros = await postBff<Rastreo[]>("/api/rastreo", clean);
  return registros?.[0] ?? null;
}

export type ResultadoRastreo = {
  guia: string;
  resultado: Rastreo | null;
  /** Presente solo si la consulta fallo (no confundir con "guia no encontrada"). */
  error?: string;
};

/**
 * `/rastreo` soporta varias guías a la vez. Se hace una consulta por guía y
 * se conserva el orden pedido; una guía que falla no tumba a las demás.
 */
export async function rastrearGuias(guias: string[]): Promise<ResultadoRastreo[]> {
  return Promise.all(
    guias.map(async (guia): Promise<ResultadoRastreo> => {
      try {
        return { guia, resultado: await rastrearGuia(guia) };
      } catch (err) {
        return {
          guia,
          resultado: null,
          error: err instanceof Error ? err.message : "Error al consultar.",
        };
      }
    }),
  );
}

/** Seam de `RastreoDetalle` (historial de "Ver detalles"), vía `/api/rastreo/detalle`. */
export async function rastrearGuiaDetalle(guia: string): Promise<RastreoEvento[] | null> {
  const clean = guia.trim();
  if (!clean) return null;
  return postBff<RastreoEvento[]>("/api/rastreo/detalle", clean);
}
