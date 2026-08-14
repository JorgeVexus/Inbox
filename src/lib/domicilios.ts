import { MOCK_DOMICILIOS } from "./mock/domicilios";
import type { Domicilio, GuardarDomicilioResult } from "@/types/domicilio";

const LATENCIA_MOCK_MS = 350;

function esperarMock(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MOCK_MS));
}

/**
 * Same canonicalization as `claveAliasEnvio()` in lib/envios.ts, kept
 * consistent so both seams key storage the same way per usuario.
 */
function claveDomicilios(usuario: string): string {
  const usuarioCanonico = usuario.trim().normalize("NFC").toLocaleUpperCase("es-MX");
  return `inbox:domicilios:${encodeURIComponent(usuarioCanonico)}`;
}

function leerListaLocal(usuario: string): Domicilio[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(claveDomicilios(usuario));
    return raw ? (JSON.parse(raw) as Domicilio[]) : null;
  } catch {
    return null;
  }
}

function escribirListaLocal(usuario: string, lista: Domicilio[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(claveDomicilios(usuario), JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}

/**
 * Seam for `DomiciliosRecoleccionesCliente`. Today it seeds from
 * MOCK_DOMICILIOS the first time it's called for a usuario, then reads/
 * writes a local copy in `localStorage` so agregar/editar/eliminar have
 * something to persist against in the demo — **only the read direction is
 * a documented SIBOX endpoint**; there's no confirmed endpoint for
 * creating/editing/deleting a domicilio in the API summary this project has,
 * so `guardarDomicilio`/`eliminarDomicilio` below are UI-only until backend
 * confirms the real mutation endpoints (see comment on `Domicilio` in
 * ../types/domicilio.ts).
 *
 *   export async function listarDomicilios(usuario: string) {
 *     const res = await fetch("/api/domicilios");
 *     const json = await res.json();
 *     if (json.resp.result !== 0) return [];
 *     return json.resp.data.map(mapDomicilioApiAUi);
 *   }
 */
export async function listarDomicilios(usuario: string): Promise<Domicilio[]> {
  await esperarMock();
  const local = leerListaLocal(usuario);
  if (local) return local.map((d) => ({ ...d }));

  const semilla = (MOCK_DOMICILIOS[usuario.trim().toUpperCase()] ?? []).map((d) => ({ ...d }));
  escribirListaLocal(usuario, semilla);
  return semilla;
}

export function validarDomicilio(
  datos: Omit<Domicilio, "id" | "predeterminado">,
): { ok: true } | { ok: false; mensaje: string } {
  if (!datos.alias.trim()) return { ok: false, mensaje: "Ponle un nombre a esta dirección (ej. Casa, Oficina)." };
  if (!datos.calle.trim()) return { ok: false, mensaje: "La calle es obligatoria." };
  if (!datos.cp.trim() || datos.cp.trim().length !== 5) return { ok: false, mensaje: "Ingresa un código postal válido de 5 dígitos." };
  if (!datos.ciudad.trim() || !datos.estado.trim()) return { ok: false, mensaje: "Falta estado o ciudad — verifica el código postal." };
  if (!datos.telefono.trim()) return { ok: false, mensaje: "El teléfono de contacto es obligatorio." };
  return { ok: true };
}

export async function guardarDomicilio(
  usuario: string,
  domicilio: Omit<Domicilio, "id"> & { id?: string },
): Promise<GuardarDomicilioResult> {
  const validacion = validarDomicilio(domicilio);
  if (!validacion.ok) return validacion;

  await esperarMock();

  const listaActual = leerListaLocal(usuario) ?? (MOCK_DOMICILIOS[usuario.trim().toUpperCase()] ?? []);
  const final: Domicilio = { ...domicilio, id: domicilio.id ?? crypto.randomUUID() };

  let siguienteLista = domicilio.id
    ? listaActual.map((d) => (d.id === domicilio.id ? final : d))
    : [...listaActual, final];

  if (final.predeterminado) {
    siguienteLista = siguienteLista.map((d) => (d.id === final.id ? d : { ...d, predeterminado: false }));
  }

  const guardado = escribirListaLocal(usuario, siguienteLista);
  if (!guardado) {
    return { ok: false, mensaje: "No pudimos guardar la dirección. Intenta de nuevo." };
  }
  return { ok: true, domicilio: final };
}

export async function eliminarDomicilio(
  usuario: string,
  id: string,
): Promise<{ ok: boolean; mensaje?: string }> {
  await esperarMock();
  const listaActual = leerListaLocal(usuario) ?? (MOCK_DOMICILIOS[usuario.trim().toUpperCase()] ?? []);
  const guardado = escribirListaLocal(usuario, listaActual.filter((d) => d.id !== id));
  if (!guardado) {
    return { ok: false, mensaje: "No pudimos eliminar la dirección. Intenta de nuevo." };
  }
  return { ok: true };
}
