import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const BASE_URL = "https://apitest.example.mx";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const login = () =>
  json({ resp: { result: 0, data: [{ K_Cliente: 1, D_Cliente: "X", K_Usuario: 2 }], token: "t" } });

async function llamar(respuestaSibox: Response) {
  vi.resetModules();
  vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValueOnce(login()).mockResolvedValueOnce(respuestaSibox));
  const { proxySibox } = await import("@/lib/api/route-helpers");
  const request = new Request("http://localhost/api/x", { method: "POST", body: JSON.stringify({ Guia: "1" }) });
  return proxySibox(request, {
    endpoint: "/wsX",
    requestSchema: z.object({ Guia: z.string() }),
    responseSchema: z.array(z.object({ Guia: z.string() })),
    notFoundMessage: "No encontramos eso.",
    genericErrorMessage: "Error genérico.",
  });
}

describe("proxySibox", () => {
  beforeEach(() => {
    process.env.SIBOX_API_BASE_URL = BASE_URL;
    process.env.SIBOX_SERVICE_USER = "u";
    process.env.SIBOX_SERVICE_PASSWORD = "p";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("devuelve los datos validados cuando SIBOX responde bien", async () => {
    const res = await llamar(json({ resp: { result: 0, data: [{ Guia: "1" }] } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ Guia: "1" }] });
  });

  it("traduce el mensaje vacío de SIBOX a 404", async () => {
    const res = await llamar(json({ resp: { result: 1, data: "" } }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "No encontramos eso." });
  });

  it("NO filtra al navegador el error interno de base de datos de SIBOX", async () => {
    const res = await llamar(
      json({ resp: { result: 1, data: "Error interno: Could not find stored procedure 'GP_Valida_OrigenCotizacion'." } }),
    );
    expect(res.status).toBe(502);
    const texto = JSON.stringify(await res.json());
    expect(texto).not.toContain("stored procedure");
    expect(texto).not.toContain("GP_Valida");
    expect(texto).toContain("Error genérico.");
  });

  it("responde 504 si SIBOX no contesta a tiempo", async () => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValueOnce(login()).mockRejectedValueOnce(new DOMException("timeout", "TimeoutError")),
    );
    const { proxySibox } = await import("@/lib/api/route-helpers");
    const request = new Request("http://localhost/api/x", { method: "POST", body: JSON.stringify({ Guia: "1" }) });
    const res = await proxySibox(request, {
      endpoint: "/wsX",
      requestSchema: z.object({ Guia: z.string() }),
      responseSchema: z.array(z.object({ Guia: z.string() })),
      notFoundMessage: "x",
      genericErrorMessage: "x",
    });
    expect(res.status).toBe(504);
  });

  it("responde 503 genérico si Cloudflare reta la petición", async () => {
    const reto = new Response("<html>Just a moment</html>", {
      status: 403,
      headers: { "Content-Type": "text/html", "cf-mitigated": "challenge" },
    });
    const res = await llamar(reto);
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain("Cloudflare");
  });
});

describe("proxySibox: límites de entrada", () => {
  it("rechaza con 413 un body mayor a 10 KB sin llamar a SIBOX", async () => {
    vi.resetModules();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { proxySibox } = await import("@/lib/api/route-helpers");
    const grande = JSON.stringify({ Guia: "1", relleno: "a".repeat(20_000) });
    const res = await proxySibox(new Request("http://localhost/api/x", { method: "POST", body: grande }), {
      endpoint: "/wsX",
      requestSchema: z.object({ Guia: z.string() }),
      responseSchema: z.array(z.object({ Guia: z.string() })),
      notFoundMessage: "x",
      genericErrorMessage: "x",
    });
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
