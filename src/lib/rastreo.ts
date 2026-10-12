import { MOCK_RASTREOS, MOCK_RASTREO_DETALLE } from "@/lib/mock/rastreo";
import type { Rastreo, RastreoEvento } from "@/types/rastreo";

/**
 * Modo de datos del rastreo. Por defecto es **demo** (datos simulados con la
 * forma real de la API): así el sitio y las previews funcionan aunque SIBOX no
 * sea alcanzable (hoy Cloudflare bloquea al servidor, ver INDICE_MAESTRO.md
 * B1). Con `NEXT_PUBLIC_SIBOX_REAL=1` se usa el BFF real (`/api/rastreo`).
 * Es un interruptor de comportamiento, NO un secreto: por eso puede ser
 * `NEXT_PUBLIC_*` (las credenciales de SIBOX jamás lo son). Se lee en cada
 * llamada (y no al cargar el módulo) para poder probarlo.
 */
export function rastreoEsDemo(): boolean {
  return process.env.NEXT_PUBLIC_SIBOX_REAL !== "1";
}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // 404 = no existe; 400 = el formato no es el de una guia (el BFF lo valida).
  // Para el visitante ambos son "no encontramos esa guia".
  if (res.status === 404 || res.status === 400) return null;
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
  if (rastreoEsDemo()) {
    await esperar(400);
    return MOCK_RASTREOS[clean] ?? null;
  }
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
  if (rastreoEsDemo()) {
    await esperar(350);
    return MOCK_RASTREO_DETALLE[clean] ?? null;
  }
  return postBff<RastreoEvento[]>("/api/rastreo/detalle", clean);
}
