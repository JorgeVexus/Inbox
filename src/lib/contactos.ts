import { leerContactos } from "./almacen-schemas";
import { MOCK_CONTACTOS } from "./mock/contactos";
import type { ContactoGuardado, GuardarContactoResult } from "@/types/contacto";

const LATENCIA_MOCK_MS = 300;
const esperarMock = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCIA_MOCK_MS));

/** Misma canonicalización de usuario que domicilios.ts / envios.ts. */
function claveContactos(usuario: string): string {
  const canonico = usuario.trim().normalize("NFC").toLocaleUpperCase("es-MX");
  return `inbox:contactos:${encodeURIComponent(canonico)}`;
}

function leerLocal(usuario: string): ContactoGuardado[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(claveContactos(usuario));
    return raw ? leerContactos(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function escribirLocal(usuario: string, lista: ContactoGuardado[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(claveContactos(usuario), JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}

function semilla(usuario: string): ContactoGuardado[] {
  return (MOCK_CONTACTOS[usuario.trim().toUpperCase()] ?? []).map((c) => ({ ...c }));
}

/**
 * Seam de la agenda de contactos. Hoy: semilla mock + copia en localStorage
 * (no hay endpoint, ver types/contacto.ts). Cuando backend responda, este
 * archivo es lo único que cambia; los componentes no.
 */
export async function listarContactos(usuario: string): Promise<ContactoGuardado[]> {
  await esperarMock();
  const local = leerLocal(usuario);
  if (local) return local.map((c) => ({ ...c }));
  const inicial = semilla(usuario);
  escribirLocal(usuario, inicial);
  return inicial;
}

export function validarContacto(
  c: Pick<ContactoGuardado, "nombre" | "telefono" | "email">,
): { ok: true } | { ok: false; mensaje: string } {
  if (c.nombre.trim().length < 3) return { ok: false, mensaje: "El nombre debe tener al menos 3 caracteres." };
  if (c.telefono.replace(/\D/g, "").length < 10) {
    return { ok: false, mensaje: "Ingresa un teléfono de 10 dígitos." };
  }
  if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
    return { ok: false, mensaje: "El correo no es válido." };
  }
  return { ok: true };
}

export async function guardarContacto(
  usuario: string,
  contacto: Omit<ContactoGuardado, "id"> & { id?: string },
): Promise<GuardarContactoResult> {
  const validacion = validarContacto(contacto);
  if (!validacion.ok) return validacion;

  await esperarMock();
  const actual = leerLocal(usuario) ?? semilla(usuario);
  const final: ContactoGuardado = { ...contacto, id: contacto.id ?? crypto.randomUUID() };
  const siguiente = contacto.id
    ? actual.map((c) => (c.id === contacto.id ? final : c))
    : [...actual, final];

  if (!escribirLocal(usuario, siguiente)) {
    return { ok: false, mensaje: "No pudimos guardar el contacto. Intenta de nuevo." };
  }
  return { ok: true, contacto: final };
}

export async function eliminarContacto(
  usuario: string,
  id: string,
): Promise<{ ok: boolean; mensaje?: string }> {
  await esperarMock();
  const actual = leerLocal(usuario) ?? semilla(usuario);
  if (!escribirLocal(usuario, actual.filter((c) => c.id !== id))) {
    return { ok: false, mensaje: "No pudimos eliminar el contacto. Intenta de nuevo." };
  }
  return { ok: true };
}
