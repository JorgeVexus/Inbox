import { MOCK_SUCURSALES } from "@/lib/mock/sucursales";
import type { Sucursal } from "@/types/sucursal";

/**
 * Single seam between the UI and branch data. Today it resolves the mock
 * list synchronously; once the BFF exists this becomes:
 *
 *   export async function getSucursales(filters?: { estado?: string; ciudad?: string }) {
 *     const res = await fetch("/api/sucursales", { method: "POST", body: JSON.stringify(filters) });
 *     return (await res.json()) as Sucursal[];
 *   }
 *
 * which maps to the `ListadoOficinas` endpoint server-side. No component
 * that calls `getSucursales()` should need to change when that happens.
 */
export function getSucursales(): Sucursal[] {
  return MOCK_SUCURSALES;
}

export function getEstados(sucursales: Sucursal[]) {
  const map = new Map<number, { K_Estado: number; D_Estado: string }>();
  for (const s of sucursales) {
    if (!map.has(s.K_Estado)) {
      map.set(s.K_Estado, { K_Estado: s.K_Estado, D_Estado: s.D_Estado });
    }
  }
  return [...map.values()].sort((a, b) => a.D_Estado.localeCompare(b.D_Estado));
}

export function getCiudades(sucursales: Sucursal[], kEstado?: number) {
  const map = new Map<number, { K_Ciudad: number; D_Ciudad: string }>();
  for (const s of sucursales) {
    if (kEstado != null && s.K_Estado !== kEstado) continue;
    if (!map.has(s.K_Ciudad)) {
      map.set(s.K_Ciudad, { K_Ciudad: s.K_Ciudad, D_Ciudad: s.D_Ciudad });
    }
  }
  return [...map.values()].sort((a, b) => a.D_Ciudad.localeCompare(b.D_Ciudad));
}
