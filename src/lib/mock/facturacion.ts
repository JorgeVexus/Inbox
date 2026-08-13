/**
 * SAT's "Régimen fiscal" catalog (c_RegimenFiscal) is public, static
 * government data — not part of the SIBOX API — so it's fine to hardcode
 * here rather than mock it as if it were an endpoint. This is the common
 * subset for personas físicas/morales; trim or extend to match whatever
 * the invoicing backend actually validates against.
 */
export const REGIMENES_FISCALES = [
  { clave: "601", label: "601 - General de Ley Personas Morales" },
  { clave: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { clave: "605", label: "605 - Sueldos y Salarios" },
  { clave: "606", label: "606 - Arrendamiento" },
  { clave: "608", label: "608 - Demás ingresos" },
  { clave: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { clave: "616", label: "616 - Sin obligaciones fiscales" },
  { clave: "621", label: "621 - Incorporación Fiscal" },
  { clave: "625", label: "625 - Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { clave: "626", label: "626 - Régimen Simplificado de Confianza" },
];

/**
 * MOCK — placeholder for whatever the "constancia fiscal" upload actually
 * parses server-side (SAT PDFs have a fixed layout; XMLs are structured).
 * There's no client-side library wired here on purpose: real parsing needs
 * either a backend endpoint or a PDF/XML parsing package, neither of which
 * exists yet. This just fakes "we read your file" after a delay so the
 * upload → autofill UX can be demoed and reviewed before that's built.
 */
export function datosDesdeArchivoMock() {
  return {
    rfc: "VECJ880326XXX",
    regimenFiscal: "612",
    cp: "37545",
  };
}
