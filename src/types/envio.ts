import type { Rastreo, RastreoEvento } from "@/types/rastreo";

export type EnvioPerfil = {
  guia: string;
  nombre: string;
  rastreo: Rastreo;
  fechaProgramada: string;
};

export type EnvioDetalle = {
  guia: string;
  eventos: RastreoEvento[];
};

export type GuardarNombreResult =
  | { ok: true; nombre: string }
  | { ok: false; mensaje: string };
