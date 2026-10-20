import { describe, expect, it } from "vitest";
import { leerBorradorCotizacion, leerContactos, leerDatosFacturacion, leerDomicilios } from "./almacen-schemas";

const contacto = {
  id: "1",
  nombre: "Ana",
  cp: "64060",
  ciudad: "MTY",
  colonia: "C",
  direccion: "Calle",
  numExt: "1",
  numInt: "",
  telefono: "8112345678",
  email: "",
};

describe("lecturas tolerantes del almacenamiento local", () => {
  it("lo que no es una lista se descarta (null) en lugar de romper", () => {
    for (const malo of [{ a: 1 }, "x", 5, null, undefined, true]) {
      expect(leerContactos(malo)).toBeNull();
      expect(leerDomicilios(malo)).toBeNull();
    }
  });

  it("omite elementos inválidos y conserva los buenos", () => {
    const r = leerContactos([contacto, 1, null, {}, { ...contacto, nombre: { x: 1 } }, { ...contacto, id: "2" }]);
    expect(r?.map((c) => c.id)).toEqual(["1", "2"]);
  });

  it("rechaza cadenas desmesuradas", () => {
    expect(leerContactos([{ ...contacto, nombre: "x".repeat(5000) }])).toEqual([]);
  });

  it("facturación: objeto completo sí, forma equivocada no", () => {
    expect(leerDatosFacturacion({ rfc: "A" })).toBeNull();
    expect(leerDatosFacturacion([])).toBeNull();
    expect(
      leerDatosFacturacion({
        rfc: "A",
        regimenFiscal: "601",
        cp: "1",
        estado: "",
        ciudad: "",
        colonia: "",
        coloniaEspecificada: "",
        direccion: "",
        telefono: "",
        correo: "",
      }),
    ).not.toBeNull();
  });

  it("borrador de cotización: valida forma y rangos", () => {
    const ok = {
      entrega: "domicilio",
      envio: "paquete",
      origen: { cp: "64060", ciudad: "M", colonia: "" },
      destino: { cp: "01000", ciudad: "C", colonia: "" },
      paquetes: [{ id: "a", cantidad: 1, peso: "5", alto: "1", largo: "1", ancho: "1" }],
    };
    expect(leerBorradorCotizacion(ok)).not.toBeNull();
    for (const malo of [
      null,
      [],
      "x",
      {},
      { ...ok, entrega: "otro" },
      { ...ok, paquetes: [] },
      { ...ok, paquetes: "x" },
      { ...ok, paquetes: [{ ...ok.paquetes[0], cantidad: 9999 }] },
    ]) {
      expect(leerBorradorCotizacion(malo)).toBeNull();
    }
  });
});
