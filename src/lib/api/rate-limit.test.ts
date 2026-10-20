import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AlmacenMemoria, crearLimitador, ipDelCliente, limiteDesactivado } from "./rate-limit";

const CONFIG = { nombre: "prueba", max: 3, ventanaMs: 60_000 };

describe("crearLimitador", () => {
  it("permite hasta el máximo y bloquea después, con segundos de espera", async () => {
    let ahora = 1_000_000;
    const revisar = crearLimitador(new AlmacenMemoria(), () => ahora);

    for (let i = 1; i <= 3; i++) {
      const r = await revisar(CONFIG, "1.1.1.1");
      expect(r.permitido).toBe(true);
      expect(r.restantes).toBe(3 - i);
    }
    ahora += 10_000;
    const bloqueada = await revisar(CONFIG, "1.1.1.1");
    expect(bloqueada).toMatchObject({ permitido: false, restantes: 0, reintentarEnSeg: 50 });
  });

  it("separa por IP y por nombre de límite", async () => {
    const revisar = crearLimitador(new AlmacenMemoria(), () => 0);
    for (let i = 0; i < 4; i++) await revisar(CONFIG, "1.1.1.1");
    expect((await revisar(CONFIG, "2.2.2.2")).permitido).toBe(true);
    expect((await revisar({ ...CONFIG, nombre: "otro" }, "1.1.1.1")).permitido).toBe(true);
  });

  it("reinicia la cuenta cuando termina la ventana", async () => {
    let ahora = 0;
    const revisar = crearLimitador(new AlmacenMemoria(), () => ahora);
    for (let i = 0; i < 4; i++) await revisar(CONFIG, "x");
    expect((await revisar(CONFIG, "x")).permitido).toBe(false);
    ahora = 60_001;
    expect((await revisar(CONFIG, "x")).permitido).toBe(true);
  });

  it("no crece sin tope: con muchas claves descarta las vencidas", async () => {
    const almacen = new AlmacenMemoria();
    for (let i = 0; i < 10_050; i++) await almacen.incrementar(`k${i}`, 1_000, 0);
    // Todas vencieron: la siguiente inserción limpia y sigue funcionando.
    const r = await almacen.incrementar("nueva", 1_000, 5_000);
    expect(r.cuenta).toBe(1);
  });
});

describe("ipDelCliente", () => {
  const req = (h: Record<string, string>) => new Request("http://x/api", { headers: h });

  it("prefiere x-real-ip, luego el primer x-forwarded-for, luego un valor fijo", () => {
    expect(ipDelCliente(req({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
    expect(ipDelCliente(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(ipDelCliente(req({}))).toBe("desconocida");
  });

  it("acota la longitud para no llenar la memoria con claves enormes", () => {
    expect(ipDelCliente(req({ "x-real-ip": "a".repeat(500) })).length).toBe(64);
  });
});

describe("proxySibox con límite", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function llamar(ip: string) {
    const { proxySibox } = await import("./route-helpers");
    return proxySibox(
      new Request("http://localhost/api/x", {
        method: "POST",
        headers: { "x-real-ip": ip, "content-type": "application/json" },
        body: JSON.stringify({ Guia: "1" }),
      }),
      {
        endpoint: "/wsX",
        requestSchema: z.object({ Guia: z.string() }),
        responseSchema: z.unknown(),
        notFoundMessage: "n",
        genericErrorMessage: "g",
        limite: { nombre: "t-proxy", max: 2, ventanaMs: 60_000 },
      },
    );
  }

  it("responde 429 con Retry-After al pasar el máximo, sin llegar a SIBOX", async () => {
    vi.resetModules();
    vi.stubEnv("SIBOX_API_BASE_URL", "https://apitest.example.mx");
    vi.stubEnv("SIBOX_SERVICE_USER", "u");
    vi.stubEnv("SIBOX_SERVICE_PASSWORD", "p");
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("sin red"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await llamar("7.7.7.7")).status).not.toBe(429);
    expect((await llamar("7.7.7.7")).status).not.toBe(429);
    const llamadasAntes = fetchMock.mock.calls.length;

    const bloqueada = await llamar("7.7.7.7");
    expect(bloqueada.status).toBe(429);
    expect(Number(bloqueada.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
    expect(fetchMock.mock.calls.length).toBe(llamadasAntes);
    // Otra IP no se ve afectada.
    expect((await llamar("8.8.8.8")).status).not.toBe(429);
  });

  it("RATE_LIMIT_DISABLED=1 apaga el límite (solo para la suite E2E)", async () => {
    vi.resetModules();
    vi.stubEnv("RATE_LIMIT_DISABLED", "1");
    expect(limiteDesactivado()).toBe(true);
    vi.stubEnv("RATE_LIMIT_DISABLED", "");
    expect(limiteDesactivado()).toBe(false);
  });
});
