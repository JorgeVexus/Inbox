import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginRequest } from "./auth";
import { buscarCodigoPostal } from "./codigo-postal";
import { generarGuia, obtenerCotizacion, procesarPago } from "./cotizacion";
import { readAndClearCotizacionDraft, saveCotizacionDraft } from "./cotizacion-draft";
import { extraerDatosConstanciaFiscal, guardarDatosFacturacion, obtenerDatosFacturacionGuardados } from "./facturacion";
import { enviarContactoChat, enviarContactoSoporte } from "./soporte";
import { getCiudades, getEstados, getSucursales } from "./sucursales";
import { datosFacturacionVacios } from "../types/facturacion";
import type { CotizacionInput } from "../types/cotizacion";

/** Almacenamiento en memoria que imita a Storage del navegador. */
function almacenFalso() {
  const datos = new Map<string, string>();
  return {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
  };
}

const COTIZACION: CotizacionInput = {
  entrega: "domicilio",
  envio: "paquete",
  origen: { cp: "64000", ciudad: "Monterrey", colonia: "Centro" },
  destino: { cp: "37545", ciudad: "León", colonia: "Centro" },
  paquetes: [{ id: "p1", cantidad: 2, peso: "5", alto: "10", largo: "20", ancho: "30" }],
};

/** Corre una promesa con temporizadores simulados para no esperar los retardos de los mocks. */
async function conRelojFalso<T>(fn: () => Promise<T>): Promise<T> {
  const promesa = fn();
  await vi.runAllTimersAsync();
  return promesa;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("loginRequest (mock)", () => {
  it("acepta el usuario de demo sin distinguir mayúsculas ni espacios", async () => {
    const res = await conRelojFalso(() => loginRequest("  inbox ", "Prueba"));
    expect(res.success).toBe(true);
  });

  it("rechaza contraseña incorrecta y usuario inexistente con el mismo mensaje", async () => {
    const mal = await conRelojFalso(() => loginRequest("INBOX", "otra"));
    const noExiste = await conRelojFalso(() => loginRequest("NADIE", "Prueba"));
    expect(mal.success).toBe(false);
    expect(mal.mensaje).toBe(noExiste.mensaje);
  });
});

describe("buscarCodigoPostal (mock)", () => {
  it("encuentra un C.P. conocido y recorta espacios", async () => {
    const res = await conRelojFalso(() => buscarCodigoPostal(" 37545 "));
    expect(res?.estado).toBe("GUANAJUATO");
  });

  it("devuelve null para un C.P. desconocido", async () => {
    expect(await conRelojFalso(() => buscarCodigoPostal("00000"))).toBeNull();
  });
});

describe("cotización (mock)", () => {
  it("devuelve opciones con precio positivo y desglose", async () => {
    const opciones = await conRelojFalso(() => obtenerCotizacion(COTIZACION));
    expect(opciones.length).toBeGreaterThan(0);
    for (const o of opciones) {
      expect(o.precio).toBeGreaterThan(0);
      expect(o.detalle.length).toBeGreaterThan(0);
    }
  });

  it("genera una guía de 10 dígitos y procesa el pago simulado", async () => {
    const [opcion] = await conRelojFalso(() => obtenerCotizacion(COTIZACION));
    if (!opcion) throw new Error("sin opciones");
    const guia = await conRelojFalso(() => generarGuia(COTIZACION, {} as never, opcion));
    expect(guia.folio).toMatch(/^\d{10}$/);
    expect(await conRelojFalso(() => procesarPago("tarjeta"))).toEqual({ ok: true });
  });
});

describe("borrador de cotización (sessionStorage)", () => {
  it("guarda, lee y borra al leer", () => {
    vi.stubGlobal("window", { sessionStorage: almacenFalso() });
    saveCotizacionDraft(COTIZACION);
    expect(readAndClearCotizacionDraft()).toEqual(COTIZACION);
    expect(readAndClearCotizacionDraft()).toBeNull();
  });

  it("ignora JSON corrupto o con forma inválida", () => {
    const almacen = almacenFalso();
    vi.stubGlobal("window", { sessionStorage: almacen });
    almacen.setItem("inbox:cotizacion-draft", "{no es json");
    expect(readAndClearCotizacionDraft()).toBeNull();
    almacen.setItem("inbox:cotizacion-draft", JSON.stringify({ entrega: "teletransporte" }));
    expect(readAndClearCotizacionDraft()).toBeNull();
  });

  it("no revienta si el almacenamiento está bloqueado o no hay window", () => {
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: () => {
          throw new Error("bloqueado");
        },
        setItem: () => {
          throw new Error("bloqueado");
        },
        removeItem: () => {},
      },
    });
    expect(() => saveCotizacionDraft(COTIZACION)).not.toThrow();
    expect(readAndClearCotizacionDraft()).toBeNull();
    vi.unstubAllGlobals();
    expect(() => saveCotizacionDraft(COTIZACION)).not.toThrow();
    expect(readAndClearCotizacionDraft()).toBeNull();
  });
});

describe("facturación (mock)", () => {
  it("exige RFC y guarda en caché local solo si hay usuario", async () => {
    vi.stubGlobal("window", { localStorage: almacenFalso() });
    const vacio = datosFacturacionVacios();
    expect((await conRelojFalso(() => guardarDatosFacturacion(vacio, "INBOX"))).ok).toBe(false);
    expect(obtenerDatosFacturacionGuardados("INBOX")).toBeNull();

    const datos = { ...vacio, rfc: "XAXX010101000" };
    expect((await conRelojFalso(() => guardarDatosFacturacion(datos, "INBOX"))).ok).toBe(true);
    expect(obtenerDatosFacturacionGuardados(" inbox ")?.rfc).toBe("XAXX010101000");
    expect(obtenerDatosFacturacionGuardados("OTRO")).toBeNull();
  });

  it("valida extensión y tamaño de la constancia", async () => {
    const pdf = new File(["x"], "constancia.pdf");
    expect(await conRelojFalso(() => extraerDatosConstanciaFiscal(pdf))).toHaveProperty("rfc");
    await expect(extraerDatosConstanciaFiscal(new File(["x"], "virus.exe"))).rejects.toThrow("PDF o XML");
    const grande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "grande.pdf");
    await expect(extraerDatosConstanciaFiscal(grande)).rejects.toThrow("5 MB");
  });
});

describe("soporte (stub)", () => {
  it("responde ok sin enviar nada", async () => {
    expect(await conRelojFalso(() => enviarContactoChat("a@b.com"))).toEqual({ ok: true });
    expect(
      await conRelojFalso(() => enviarContactoSoporte({ nombre: "A", correo: "a@b.com", mensaje: "Hola" })),
    ).toEqual({ ok: true });
  });
});

describe("sucursales", () => {
  it("lista estados únicos y ordenados, y ciudades filtradas por estado", () => {
    const sucursales = getSucursales();
    const estados = getEstados(sucursales);
    expect(new Set(estados.map((e) => e.K_Estado)).size).toBe(estados.length);
    expect(estados.map((e) => e.D_Estado)).toEqual(
      [...estados.map((e) => e.D_Estado)].sort((a, b) => a.localeCompare(b)),
    );

    const primero = estados[0];
    if (!primero) throw new Error("sin estados");
    const ciudades = getCiudades(sucursales, primero.K_Estado);
    const esperadas = new Set(sucursales.filter((s) => s.K_Estado === primero.K_Estado).map((s) => s.K_Ciudad));
    expect(ciudades.length).toBe(esperadas.size);
    expect(getCiudades(sucursales).length).toBeGreaterThanOrEqual(ciudades.length);
  });
});
