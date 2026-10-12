import { describe, expect, it } from "vitest";
import { fechaDemo } from "@/lib/mock/cotizacion";

describe("fechaDemo", () => {
  it("formatea hoy + N días en español, en hora local", () => {
    // lunes 12 de octubre de 2026, 9 pm local (UTC ya sería el 13)
    const base = new Date(2026, 9, 12, 21, 0);
    expect(fechaDemo(0, base)).toBe("Lun, 12 de octubre");
    expect(fechaDemo(2, base)).toBe("Mié, 14 de octubre");
  });

  it("cruza de mes y no muta la fecha base", () => {
    const base = new Date(2026, 9, 31, 10, 0);
    expect(fechaDemo(2, base)).toBe("Lun, 02 de noviembre");
    expect(base.getDate()).toBe(31);
  });
});
