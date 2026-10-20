import { describe, expect, it } from "vitest";

import { detectarMarca, formatNumeroTarjeta, formatVencimiento, luhnValido, vencimientoValido } from "./tarjeta";

describe("formato", () => {
  it("agrupa el número de 4 en 4 y limita a 16 dígitos", () => {
    expect(formatNumeroTarjeta("4111111111111111999")).toBe("4111 1111 1111 1111");
    expect(formatNumeroTarjeta("4111-abc 11")).toBe("4111 11");
    expect(formatNumeroTarjeta("")).toBe("");
  });

  it("formatea el vencimiento como MM/AA", () => {
    expect(formatVencimiento("0")).toBe("0");
    expect(formatVencimiento("06")).toBe("06");
    expect(formatVencimiento("0628")).toBe("06/28");
    expect(formatVencimiento("06/28999")).toBe("06/28");
  });
});

describe("luhnValido", () => {
  it("acepta números de prueba públicos y rechaza errores de captura", () => {
    expect(luhnValido("4111 1111 1111 1111")).toBe(true);
    expect(luhnValido("5555555555554444")).toBe(true);
    expect(luhnValido("378282246310005")).toBe(true);
    expect(luhnValido("4111 1111 1111 1112")).toBe(false);
  });

  it("rechaza longitudes imposibles", () => {
    expect(luhnValido("")).toBe(false);
    expect(luhnValido("4111")).toBe(false);
    expect(luhnValido("4".repeat(20))).toBe(false);
  });
});

describe("vencimientoValido", () => {
  const hoy = new Date(2026, 9, 20); // 20 oct 2026

  it("vale hasta el fin del mes indicado", () => {
    expect(vencimientoValido("10/26", hoy)).toBe(true);
    expect(vencimientoValido("09/26", hoy)).toBe(false);
    expect(vencimientoValido("01/27", hoy)).toBe(true);
    expect(vencimientoValido("12/25", hoy)).toBe(false);
  });

  it("rechaza meses inexistentes y formatos incorrectos", () => {
    expect(vencimientoValido("00/30", hoy)).toBe(false);
    expect(vencimientoValido("13/30", hoy)).toBe(false);
    expect(vencimientoValido("1/30", hoy)).toBe(false);
    expect(vencimientoValido("1030", hoy)).toBe(false);
    expect(vencimientoValido("", hoy)).toBe(false);
  });
});

describe("detectarMarca", () => {
  it("distingue Visa, Mastercard (51–55 y 2221–2720) y Amex", () => {
    expect(detectarMarca("4111")).toBe("visa");
    expect(detectarMarca("5105")).toBe("mastercard");
    expect(detectarMarca("2221")).toBe("mastercard");
    expect(detectarMarca("2720")).toBe("mastercard");
    expect(detectarMarca("3782")).toBe("amex");
    expect(detectarMarca("3411")).toBe("amex");
  });

  it("devuelve null si no reconoce la marca", () => {
    expect(detectarMarca("")).toBeNull();
    expect(detectarMarca("9999")).toBeNull();
    expect(detectarMarca("2800")).toBeNull();
  });
});
