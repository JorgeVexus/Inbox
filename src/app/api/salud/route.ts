import { NextResponse } from "next/server";
import { ipDelCliente, limiteDesactivado, LIMITES, revisarLimite } from "@/lib/api/rate-limit";
import { estadoSibox } from "@/lib/api/sibox-client";

/**
 * Comprobación de salud para monitores de disponibilidad (UptimeRobot, Better Stack, Vercel Checks…).
 * Responde 200 si la aplicación está viva; no llama a SIBOX (un monitor cada minuto no debe gastar su
 * cupo ni disparar su Login). El campo `sibox` es el último estado conocido, no una prueba en vivo.
 * Sin datos internos: la ruta es pública.
 */
export async function GET(request: Request) {
  if (!limiteDesactivado()) {
    const r = await revisarLimite(LIMITES.salud, ipDelCliente(request));
    if (!r.permitido) {
      return NextResponse.json(
        { estado: "limitado" },
        { status: 429, headers: { "Retry-After": String(r.reintentarEnSeg) } },
      );
    }
  }
  return NextResponse.json({
    estado: "ok",
    sibox: estadoSibox(),
    version: (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7),
    hora: new Date().toISOString(),
  });
}
