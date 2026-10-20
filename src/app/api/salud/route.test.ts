import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function pedir(ip = "1.1.1.1") {
  const { GET } = await import("./route");
  return GET(new Request("http://localhost/api/salud", { headers: { "x-real-ip": ip } }));
}

describe("GET /api/salud", () => {
  it("responde 200 con estado, sibox, versión y hora, sin datos internos", async () => {
    vi.resetModules();
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "0123456789abcdef");
    const res = await pedir();
    expect(res.status).toBe(200);
    const cuerpo = (await res.json()) as Record<string, string>;
    expect(cuerpo).toMatchObject({ estado: "ok", sibox: "desconocido", version: "0123456" });
    expect(new Date(cuerpo.hora ?? "").toString()).not.toBe("Invalid Date");
    expect(Object.keys(cuerpo).sort()).toEqual(["estado", "hora", "sibox", "version"]);
  });

  it("usa 'local' si no hay versión y limita a 60 por minuto por IP", async () => {
    vi.resetModules();
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    expect(((await (await pedir("2.2.2.2")).json()) as { version: string }).version).toBe("local");
    for (let i = 0; i < 59; i++) await pedir("2.2.2.2");
    const bloqueada = await pedir("2.2.2.2");
    expect(bloqueada.status).toBe(429);
    expect(Number(bloqueada.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
    expect((await pedir("3.3.3.3")).status).toBe(200);
  });
});
