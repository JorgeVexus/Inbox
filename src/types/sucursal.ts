/**
 * Shape mirrors the `ListadoOficinas` response from the SIBOX API
 * (see ../../CLAUDE.md and Documentacion/Documentacion Api Pagina WEB ver
 * Jun26.pdf, endpoint `ListadoOficinas`). Field names are kept identical to
 * the API (PascalCase / snake-ish) on purpose so the future Route Handler
 * can pass the response straight through without a mapping layer — only
 * `Latitud`/`Longitud` are narrowed from `string | null` to `number | null`
 * once parsed.
 *
 * `tipo` is NOT part of the real API response — ListadoOficinas has no
 * field that distinguishes a walk-in branch from a distribution center.
 * It's added here so the UI (map pins + legend toggle) has something to
 * key off of. TODO: ask backend whether this distinction exists in SIBOX
 * (see CLAUDE.md "Solicitudes prioritarias al backend") — until then this
 * is inferred client-side from `B_Ocurre`.
 */
export type Sucursal = {
  K_Oficina: number;
  D_Oficina: string;
  C_Oficina: string;
  K_Estado: number;
  C_Estado: string;
  D_Estado: string;
  K_Ciudad: number;
  D_Ciudad: string;
  Calle: string;
  Codigo_Postal: string;
  Telefono: string | null;
  B_Ocurre: boolean;
  B_Frontera: boolean;
  Latitud: number | null;
  Longitud: number | null;
  Observaciones: string | null;
  tipo: "sucursal" | "distribucion";
};
