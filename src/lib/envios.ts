import type { EnvioPerfil, GuardarNombreResult } from "@/types/envio";

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
