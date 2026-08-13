import { MOCK_ENVIOS } from "./mock/envios";
import { MOCK_RASTREO_DETALLE } from "./mock/rastreo";
import type {
  EnvioDetalle,
  EnvioPerfil,
  GuardarNombreResult,
} from "@/types/envio";

const LATENCIA_MOCK_MS = 350;

function esperarMock(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MOCK_MS));
}

export function claveAliasEnvio(usuario: string, guia: string): string {
  const usuarioCanonico = usuario.trim().toLocaleUpperCase("es-MX");
  return `inbox:envio-alias:${encodeURIComponent(usuarioCanonico)}:${encodeURIComponent(guia.trim())}`;
}

export async function listarEnvios(usuario: string): Promise<EnvioPerfil[]> {
  await esperarMock();

  return MOCK_ENVIOS.map((envio) => {
    let nombre = envio.nombre;

    if (typeof window !== "undefined") {
      try {
        nombre = window.localStorage.getItem(claveAliasEnvio(usuario, envio.guia)) ?? nombre;
      } catch {
        // Storage can be unavailable in privacy mode; defaults remain usable.
      }
    }

    return { ...envio, nombre, rastreo: { ...envio.rastreo } };
  });
}

export async function obtenerDetalleEnvio(
  guia: string,
): Promise<EnvioDetalle | null> {
  await esperarMock();
  const guiaLimpia = guia.trim();
  const eventos = MOCK_RASTREO_DETALLE[guiaLimpia];

  return eventos
    ? { guia: guiaLimpia, eventos: eventos.map((evento) => ({ ...evento })) }
    : null;
}

export async function asignarNombreEnvio(
  usuario: string,
  guia: string,
  valor: string,
): Promise<GuardarNombreResult> {
  const validacion = validarNombreEnvio(valor);
  if (!validacion.ok) return validacion;

  await esperarMock();

  try {
    if (typeof window === "undefined") throw new Error("Storage no disponible");
    window.localStorage.setItem(
      claveAliasEnvio(usuario, guia),
      validacion.nombre,
    );
    return validacion;
  } catch {
    return {
      ok: false,
      mensaje: "No pudimos guardar el nombre del envío. Intenta de nuevo.",
    };
  }
}

export function validarNombreEnvio(nombre: string): GuardarNombreResult {
  const nombreNormalizado = nombre.trim().replace(/\s+/g, " ");

  if (!nombreNormalizado) {
    return { ok: false, mensaje: "Escribe un nombre para tu envío." };
  }

  if (nombreNormalizado.length > 60) {
    return {
      ok: false,
      mensaje: "El nombre no puede tener más de 60 caracteres.",
    };
  }

  return { ok: true, nombre: nombreNormalizado };
}

export function filtrarEnvios(
  envios: EnvioPerfil[],
  consulta: string,
): EnvioPerfil[] {
  const consultaNormalizada = consulta
    .trim()
    .normalize("NFC")
    .toLocaleLowerCase("es-MX");

  if (!consultaNormalizada) return envios;

  return envios.filter((envio) =>
    `${envio.nombre} ${envio.guia}`
      .normalize("NFC")
      .toLocaleLowerCase("es-MX")
      .includes(consultaNormalizada),
  );
}
