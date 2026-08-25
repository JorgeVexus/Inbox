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
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: { token: "abc123" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: [{ Guia: "1" }] } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });

    expect(result).toEqual([{ Guia: "1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/Login`);
    const secondCallHeaders = fetchMock.mock.calls[1][1]?.headers as Record<string, string>;
    expect(secondCallHeaders.Authorization).toBe("Bearer abc123");
  });

  it("reintenta login si el token cacheado da 401", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: { token: "viejo" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { resp: { result: 1, data: "El formato del token es incorrecto." } },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: { token: "nuevo" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: [{ Guia: "1" }] } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });

    expect(result).toEqual([{ Guia: "1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const lastCallHeaders = fetchMock.mock.calls[3][1]?.headers as Record<string, string>;
    expect(lastCallHeaders.Authorization).toBe("Bearer nuevo");
  });

  it("lanza SiboxApiError con el mensaje de la API cuando result no es 0", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: { token: "abc123" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 1, data: "No se encontro la guia." } }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost, SiboxApiError } = await importFreshClient();
    const failure = siboxPost("/wsRastreo", { Guia: "no-existe" });
    await expect(failure).rejects.toBeInstanceOf(SiboxApiError);
    await expect(failure).rejects.toThrow("No se encontro la guia.");
  });

  it("tolera el sobre alterno {success,mensaje,data}", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ resp: { result: 0, data: { token: "abc123" } } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, mensaje: "ok", data: [{ Guia: "1" }] }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { siboxPost } = await importFreshClient();
    const result = await siboxPost("/wsRastreo", { Guia: "1" });
    expect(result).toEqual([{ Guia: "1" }]);
  });
});
