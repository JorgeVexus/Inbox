import { afterEach, describe, expect, it, vi } from "vitest";
import { rastrearGuia, rastrearGuias, rastrearGuiaDetalle, RastreoError } from "./rastreo";

function respuesta(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => vi.unstubAllGlobals());

describe("rastrearGuia", () => {
  it("regresa el primer registro del BFF", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ data: [{ Guia: "1", Estatus: "ENTREGADA" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(rastrearGuia(" 1 ")).resolves.toMatchObject({ Guia: "1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/rastreo");
    expect(JSON.parse(init.body)).toEqual({ Guia: "1" });
  });

  it("regresa null (no error) cuando la guía no existe (404)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "No encontramos esa guía." }, 404)));
    await expect(rastrearGuia("999")).resolves.toBeNull();
  });

  it("lanza RastreoError si el servidor falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "x" }, 502)));
    await expect(rastrearGuia("1")).rejects.toBeInstanceOf(RastreoError);
  });

  it("lanza RastreoError si no hay red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(rastrearGuia("1")).rejects.toBeInstanceOf(RastreoError);
  });

  it("no llama al BFF con una guía vacía", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(rastrearGuia("   ")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("rastrearGuias", () => {
  it("una guía que falla no tumba a las demás y conserva el orden", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (_url: string, init: { body: string }) => {
        const { Guia } = JSON.parse(init.body);
        if (Guia === "mala") return respuesta({ error: "x" }, 500);
        if (Guia === "nada") return respuesta({ error: "x" }, 404);
        return respuesta({ data: [{ Guia, Estatus: "EN RUTA" }] });
      }),
    );

    const res = await rastrearGuias(["ok", "mala", "nada"]);
    expect(res.map((r) => r.guia)).toEqual(["ok", "mala", "nada"]);
    expect(res[0].resultado?.Guia).toBe("ok");
    expect(res[1].resultado).toBeNull();
    expect(res[1].error).toBeTruthy();
    expect(res[2]).toEqual({ guia: "nada", resultado: null });
  });
});

describe("rastrearGuiaDetalle", () => {
  it("consulta /api/rastreo/detalle", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ data: [{ Estatus: "ENTREGADA" }] }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(rastrearGuiaDetalle("1")).resolves.toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/rastreo/detalle");
  });
});
