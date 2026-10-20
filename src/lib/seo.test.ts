import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function cargarSeo() {
  vi.resetModules();
  return import("./seo");
}

describe("SITE_URL", () => {
  function limpiarEntorno() {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");
  }

  it("prefiere SITE_URL y quita la diagonal final", async () => {
    limpiarEntorno();
    vi.stubEnv("SITE_URL", "https://inbox.com.mx/");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect((await cargarSeo()).SITE_URL).toBe("https://inbox.com.mx");
  });

  it("sin SITE_URL usa el dominio de producción de Vercel y luego el del despliegue", async () => {
    limpiarEntorno();
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "inbox.vercel.app");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect((await cargarSeo()).SITE_URL).toBe("https://inbox.vercel.app");

    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect((await cargarSeo()).SITE_URL).toBe("https://preview.vercel.app");
  });

  it("sin ninguna variable cae a localhost", async () => {
    limpiarEntorno();
    expect((await cargarSeo()).SITE_URL).toBe("http://localhost:3000");
  });
});

describe("paginaMeta", () => {
  it("declara título, canonical y Open Graph propios", async () => {
    const { paginaMeta, DESCRIPCION_BASE } = await cargarSeo();
    const meta = paginaMeta({ titulo: "Cotizar", ruta: "/cotizar" });
    expect(meta.title).toBe("Cotizar");
    expect(meta.description).toBe(DESCRIPCION_BASE);
    expect(meta.alternates?.canonical).toBe("/cotizar");
    expect(meta.openGraph).toMatchObject({ title: "Cotizar | Inbox", url: "/cotizar", locale: "es_MX" });
    expect(meta.robots).toBeUndefined();
  });

  it("usa la descripción propia y marca noindex cuando se pide", async () => {
    const { paginaMeta } = await cargarSeo();
    const meta = paginaMeta({ titulo: "Perfil", descripcion: "Tu cuenta", ruta: "/perfil", indexar: false });
    expect(meta.description).toBe("Tu cuenta");
    expect(meta.robots).toEqual({ index: false });
  });
});
