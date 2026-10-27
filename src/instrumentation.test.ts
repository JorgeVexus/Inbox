import dns from "node:dns";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  dns.setDefaultResultOrder("verbatim");
});

describe("register (arranque del servidor)", () => {
  it("prefiere IPv4 al resolver nombres en Node (Cloudflare de SIBOX solo autoriza la IPv4)", async () => {
    dns.setDefaultResultOrder("verbatim");
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    const { register } = await import("./instrumentation");
    await register();
    expect(dns.getDefaultResultOrder()).toBe("ipv4first");
  });

  it("no toca la resolución fuera del runtime de Node", async () => {
    dns.setDefaultResultOrder("verbatim");
    vi.stubEnv("NEXT_RUNTIME", "edge");
    const { register } = await import("./instrumentation");
    await register();
    expect(dns.getDefaultResultOrder()).toBe("verbatim");
  });
});
