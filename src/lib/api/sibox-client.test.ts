import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const BASE_URL = "https://apitest.example.mx";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// El cliente cachea el token en una variable de modulo -- cada test necesita
// su propia instancia del modulo (via resetModules + import dinamico) para
// no arrastrar el token de un test al siguiente.
// Forma real de Login (probada contra apitest): token en resp.token, data = arreglo de cuenta.
function loginOk(token: string) {
  return jsonResponse({
    resp: {
      result: 0,
      data: [{ K_Cliente: 63105, D_Cliente: "PAGINA WEB", K_Usuario: 2782 }],
      token,
    },
  });
}

async function importFreshClient() {
  return import("@/lib/api/sibox-client");
}

describe("siboxPost", () => {
  beforeEach(() => {
    process.env.SIBOX_API_BASE_URL = BASE_URL;
    process.env.SIBOX_SERVICE_USER = "servicio";
    process.env.SIBOX_SERVICE_PASSWORD = "clave";
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SIBOX_API_BASE_URL;
    delete process.env.SIBOX_SERVICE_USER;
    delete process.env.SIBOX_SERVICE_PASSWORD;
  });

  it("hace login una vez y reusa el token en la llamada siguiente", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(loginOk("abc123"))
      .mockResolvedValueOnce(jsonResponse({ resp: { result: 0, data: [{ Guia: "1" }] } }));
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });

    expect(result).toEqual([{ Guia: "1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE_URL}/Login`);
    const secondCallHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(secondCallHeaders.Authorization).toBe("Bearer abc123");
  });

  it("reintenta login si el token cacheado da 401", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(loginOk("viejo"))
      .mockResolvedValueOnce(jsonResponse({ resp: { result: 1, data: "El formato del token es incorrecto." } }, 401))
      .mockResolvedValueOnce(loginOk("nuevo"))
      .mockResolvedValueOnce(jsonResponse({ resp: { result: 0, data: [{ Guia: "1" }] } }));
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });

    expect(result).toEqual([{ Guia: "1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const lastCallHeaders = fetchMock.mock.calls[3]?.[1]?.headers as Record<string, string>;
    expect(lastCallHeaders.Authorization).toBe("Bearer nuevo");
  });

  it("lanza SiboxApiError con el mensaje de la API cuando result no es 0", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(loginOk("abc123"))
      .mockResolvedValueOnce(jsonResponse({ resp: { result: 1, data: "No se encontro la guia." } }));
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost, SiboxApiError } = await importFreshClient();
    const failure = siboxPost("/wsRastreo", { Guia: "no-existe" });
    await expect(failure).rejects.toBeInstanceOf(SiboxApiError);
    await expect(failure).rejects.toThrow("No se encontro la guia.");
  });

  it("tolera el sobre alterno {success,mensaje,data}", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(loginOk("abc123"))
      .mockResolvedValueOnce(jsonResponse({ success: true, mensaje: "ok", data: [{ Guia: "1" }] }));
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });
    expect(result).toEqual([{ Guia: "1" }]);
  });
  it("expone K_Cliente de la cuenta de servicio que regresa Login", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(loginOk("abc123"));
    vi.stubGlobal("fetch", fetchMock);

    const { getSiboxCliente } = await importFreshClient();
    await expect(getSiboxCliente()).resolves.toEqual({
      kCliente: 63105,
      nombre: "PAGINA WEB",
      kUsuario: 2782,
    });
  });

  it("falla con SiboxApiError si Login rechaza las credenciales", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ resp: { result: 1, data: "USUARIO/CONTRASEÑA INVALIDOS.", token: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost, SiboxApiError } = await importFreshClient();
    const failure = siboxPost("/wsRastreo", { Guia: "1" });
    await expect(failure).rejects.toBeInstanceOf(SiboxApiError);
    await expect(failure).rejects.toThrow("USUARIO/CONTRASEÑA INVALIDOS.");
  });
});

describe("reto anti-bot de Cloudflare", () => {
  beforeEach(() => {
    process.env.SIBOX_API_BASE_URL = BASE_URL;
    process.env.SIBOX_SERVICE_USER = "servicio";
    process.env.SIBOX_SERVICE_PASSWORD = "clave";
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SIBOX_API_BASE_URL;
    delete process.env.SIBOX_SERVICE_USER;
    delete process.env.SIBOX_SERVICE_PASSWORD;
  });

  it("lanza SiboxBlockedError (no un JSON.parse críptico) si llega el HTML del reto", async () => {
    const reto = new Response("<!DOCTYPE html><title>Just a moment...</title>", {
      status: 403,
      headers: { "Content-Type": "text/html; charset=UTF-8", "cf-mitigated": "challenge" },
    });
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(reto));

    const { siboxPost, SiboxBlockedError } = await importFreshClient();
    await expect(siboxPost("/wsRastreo", { Guia: "1" })).rejects.toBeInstanceOf(SiboxBlockedError);
  });
});

describe("protecciones del Login (anti-martilleo hacia SIBOX)", () => {
  beforeEach(() => {
    process.env.SIBOX_API_BASE_URL = BASE_URL;
    process.env.SIBOX_SERVICE_USER = "servicio";
    process.env.SIBOX_SERVICE_PASSWORD = "clave";
    vi.resetModules();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.SIBOX_API_BASE_URL;
    delete process.env.SIBOX_SERVICE_USER;
    delete process.env.SIBOX_SERVICE_PASSWORD;
  });

  it("peticiones simultáneas comparten UN solo Login", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (String(url).endsWith("/Login")) {
        await new Promise((r) => setTimeout(r, 20));
        return loginOk("tok");
      }
      return jsonResponse({ resp: { result: 0, data: [{ Guia: "1" }] } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    await Promise.all(Array.from({ length: 10 }, () => siboxPost("/wsRastreo", { Guia: "1" })));

    const logins = fetchMock.mock.calls.filter(([u]) => String(u).endsWith("/Login"));
    expect(logins).toHaveLength(1);
  });

  it("tras un Login fallido NO reintenta durante el enfriamiento, y sí después", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({ resp: { result: 1, data: "USUARIO/CONTRASEÑA INVALIDOS.", token: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    for (let i = 0; i < 25; i++) {
      await expect(siboxPost("/wsRastreo", { Guia: "1" })).rejects.toThrow("USUARIO/CONTRASEÑA INVALIDOS.");
    }
    expect(fetchMock).toHaveBeenCalledTimes(1); // 25 peticiones, 1 solo intento de Login

    vi.advanceTimersByTime(31_000);
    await expect(siboxPost("/wsRastreo", { Guia: "1" })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2); // pasado el enfriamiento, reintenta
  });

  it("un error de configuración (sin variables) NO activa el enfriamiento", async () => {
    delete process.env.SIBOX_SERVICE_PASSWORD;
    const { siboxPost } = await importFreshClient();
    await expect(siboxPost("/wsRastreo", { Guia: "1" })).rejects.toThrow("SIBOX_SERVICE_PASSWORD");
    process.env.SIBOX_SERVICE_PASSWORD = "ya-configurada";
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(loginOk("tok"))
        .mockResolvedValueOnce(jsonResponse({ resp: { result: 0, data: [] } })),
    );
    await expect(siboxPost("/wsRastreo", { Guia: "1" })).resolves.toEqual([]);
  });
});
