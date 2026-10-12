import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rastrearGuia, rastrearGuias, rastrearGuiaDetalle, rastreoEsDemo, RastreoError } from "./rastreo";

function respuesta(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// Estos tests cubren el modo REAL (BFF); el modo demo tiene sus propios tests abajo.
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SIBOX_REAL", "1"));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

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

describe("modo demo (por defecto)", () => {
  beforeEach(() => vi.unstubAllEnvs());

  it("es demo salvo que NEXT_PUBLIC_SIBOX_REAL sea 1", () => {
    expect(rastreoEsDemo()).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_SIBOX_REAL", "1");
    expect(rastreoEsDemo()).toBe(false);
  });

  it("resuelve contra el mock y NO llama a la red", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(rastrearGuia("4003229791")).resolves.toMatchObject({ Estatus: "ENTREGADA" });
    await expect(rastrearGuia("0001")).resolves.toBeNull();
    await expect(rastrearGuiaDetalle("4003229791")).resolves.not.toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("formato de guía inválido (400 del BFF)", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SIBOX_REAL", "1"));
  it("se trata como 'no encontrada', no como error del servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta({ error: "Request invalido." }, 400)));
    await expect(rastrearGuia("<script>")).resolves.toBeNull();
  });
});

describe("formatFechaCorta (fechas de SIBOX)", () => {
  it("convierte meses en español e inglés", async () => {
    const { formatFechaCorta } = await import("./fecha");
    expect(formatFechaCorta("21-MAY-2026 13:09")).toBe("21/05/2026");
    expect(formatFechaCorta("05-ENE-2026")).toBe("05/01/2026");
    expect(formatFechaCorta("05-JAN-2026")).toBe("05/01/2026");
    expect(formatFechaCorta("12-DEC-2026")).toBe("12/12/2026");
    expect(formatFechaCorta("texto raro")).toBe("texto raro");
  });
});
