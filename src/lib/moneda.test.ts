import { describe, expect, it } from "vitest";
import { formatMXN } from "./moneda";

describe("formatMXN", () => {
  it("usa coma para miles y punto decimal", () => {
    expect(formatMXN(9238.5)).toBe("$9,238.50");
    expect(formatMXN(239.19)).toBe("$239.19");
    expect(formatMXN(1234567.891)).toBe("$1,234,567.89");
    expect(formatMXN(0)).toBe("$0.00");
  });
  it("no rompe con valores no numéricos", () => {
    expect(formatMXN(NaN)).toBe("$0.00");
    expect(formatMXN(Infinity)).toBe("$0.00");
  });
});
