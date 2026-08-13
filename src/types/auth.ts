/**
 * Mirrors the `Login` endpoint response shape (see ../../CLAUDE.md and
 * Documentacion Api Pagina WEB ver Jun26.pdf, endpoint `Login`). Unlike
 * most other SIBOX endpoints (`{ resp: { result, data } }`), `Login` uses
 * `{ success, mensaje, data }` — keep that asymmetry when wiring the real
 * BFF route, don't "normalize" it away.
 */
export type LoginResponse =
  | { success: true; mensaje: string; data: { token: string } }
  | { success: false; mensaje: string; data: Record<string, never> };
