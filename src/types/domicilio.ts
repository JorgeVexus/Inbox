/**
 * Shape for a saved pickup/delivery address. Loosely mirrors what
 * `DomiciliosRecoleccionesCliente` should return (see ../../CLAUDE.md
 * sección 4) and what `wsGeneracionRecoleccion` needs as input, but the
 * exact field names of `DomiciliosRecoleccionesCliente`'s response aren't
 * in the API summary this project has access to — only the endpoint name
 * and its purpose ("domicilios pre-registrados del cliente"). Field names
 * here follow this app's own convention (camelCase, not the API's PascalCase)
 * on purpose: whoever wires the real endpoint should map the real response
 * onto this shape in the BFF route, the same way `sucursales.ts` maps
 * `ListadoOficinas`.
 *
 * `alias` and `predeterminado` are UI-only conveniences with no guarantee
 * they exist in the real response — kept local (see src/lib/domicilios.ts)
 * until confirmed either way with backend.
 */
export type Domicilio = {
  id: string;
  alias: string;
  contacto: string;
  telefono: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  ciudad: string;
  estado: string;
  referencias: string;
  predeterminado: boolean;
};

export function domicilioVacio(): Omit<Domicilio, "id"> {
  return {
    alias: "",
    contacto: "",
    telefono: "",
    calle: "",
    numero: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
    referencias: "",
    predeterminado: false,
  };
}

export type GuardarDomicilioResult =
  | { ok: true; domicilio: Domicilio }
  | { ok: false; mensaje: string };
