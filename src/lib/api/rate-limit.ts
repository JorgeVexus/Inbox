/**
 * Límite de peticiones del BFF (regla de seguridad 5 de CLAUDE.md).
 *
 * Ventana fija por clave (normalmente "ruta + IP del visitante"). El almacén está
 * detrás de una interfaz porque el de esta versión vive en la memoria de cada
 * instancia: en Vercel (serverless) cada instancia/arranque en frío tiene su propio
 * contador, así que el límite es una **primera barrera** y no una garantía exacta.
 * Antes de producción hay que cambiar `AlmacenLimite` por uno compartido (p. ej.
 * Upstash Redis) sin tocar a quien lo usa. Ver el informe de la Fase 2.
 */

export type ResultadoLimite = {
  permitido: boolean;
  /** Peticiones que quedan en la ventana actual. */
  restantes: number;
  /** Segundos hasta que se reinicie la ventana (para `Retry-After`). */
  reintentarEnSeg: number;
};

export interface AlmacenLimite {
  /** Cuenta una petición para `clave` y devuelve cuántas van en la ventana vigente. */
  incrementar(clave: string, ventanaMs: number, ahora: number): Promise<{ cuenta: number; reinicioEn: number }>;
}

/** Tope de claves en memoria: evita que un atacante con muchas IPs agote la RAM. */
const MAX_CLAVES = 10_000;

export class AlmacenMemoria implements AlmacenLimite {
  private readonly ventanas = new Map<string, { cuenta: number; reinicioEn: number }>();

  async incrementar(clave: string, ventanaMs: number, ahora: number) {
    const actual = this.ventanas.get(clave);
    if (actual && actual.reinicioEn > ahora) {
      actual.cuenta += 1;
      return { ...actual };
    }
    if (this.ventanas.size >= MAX_CLAVES) this.limpiar(ahora);
    const nueva = { cuenta: 1, reinicioEn: ahora + ventanaMs };
    this.ventanas.set(clave, nueva);
    return { ...nueva };
  }

  /** Quita ventanas vencidas; si aun así está lleno, descarta las más antiguas. */
  private limpiar(ahora: number) {
    for (const [k, v] of this.ventanas) if (v.reinicioEn <= ahora) this.ventanas.delete(k);
    if (this.ventanas.size < MAX_CLAVES) return;
    const porAntiguedad = [...this.ventanas.entries()].sort((a, b) => a[1].reinicioEn - b[1].reinicioEn);
    for (const [k] of porAntiguedad.slice(0, Math.ceil(MAX_CLAVES / 10))) this.ventanas.delete(k);
  }
}

export type ConfigLimite = { nombre: string; max: number; ventanaMs: number };

export function crearLimitador(almacen: AlmacenLimite = new AlmacenMemoria(), reloj: () => number = Date.now) {
  return async function revisar(config: ConfigLimite, clave: string): Promise<ResultadoLimite> {
    const ahora = reloj();
    const { cuenta, reinicioEn } = await almacen.incrementar(`${config.nombre}:${clave}`, config.ventanaMs, ahora);
    return {
      permitido: cuenta <= config.max,
      restantes: Math.max(0, config.max - cuenta),
      reintentarEnSeg: Math.max(1, Math.ceil((reinicioEn - ahora) / 1000)),
    };
  };
}

/**
 * IP del visitante. En Vercel `x-real-ip` / `x-forwarded-for` los pone la plataforma
 * (el valor que manda el cliente se sobrescribe). Fuera de una plataforma así, un
 * cliente podría falsificarlos: por eso este valor solo sirve para limitar abuso,
 * nunca para autorizar nada.
 */
export function ipDelCliente(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const reenviada = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (reenviada || "desconocida").slice(0, 64);
}

/** Valores del plan (CLAUDE.md §5 / plan de desarrollo §6.2). */
export const LIMITES = {
  rastreo: { nombre: "rastreo", max: 30, ventanaMs: 60_000 },
  rastreoDetalle: { nombre: "rastreo-detalle", max: 30, ventanaMs: 60_000 },
} as const satisfies Record<string, ConfigLimite>;

/** Limitador compartido por todos los Route Handlers de esta instancia. */
export const revisarLimite = crearLimitador();

/** `RATE_LIMIT_DISABLED=1` solo para la suite E2E, que repite muchas peticiones desde una misma IP. */
export function limiteDesactivado(): boolean {
  return process.env.RATE_LIMIT_DISABLED === "1";
}
