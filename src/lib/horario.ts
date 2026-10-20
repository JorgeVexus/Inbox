/**
 * Indicador "abierto ahora" derivado del texto libre `Observaciones` de
 * `ListadoOficinas` (la API no trae un horario estructurado). Verificado
 * contra las 71 oficinas reales (QA 2026-10-12): los textos son muy
 * variados -- "Lunes a Sábado 12:00  a 17:00 hrs", "Lun-Vie 09:00 - 17:00
 * hrs.\r\nSabado de 09:00 - 15:00", "de 8:30 am a 9:30 am y de 11:00 am a 4:30
 * pm", "... CERRADO LOS DIAS JUEVES" -- y 28 oficinas no traen horario.
 *
 * Si no se puede interpretar el texto, el estado es "desconocido": NUNCA se
 * afirma "cerrado" sin saberlo. Se evalua con la hora de la Ciudad de México
 * (hay visitantes de otras zonas); las ciudades fronterizas con horario de
 * verano pueden diferir 1 h -- limitacion conocida.
 */
export type EstadoHorario = "abierto" | "cerrado" | "desconocido";

type Rango = [number, number]; // minutos desde medianoche

const DIAS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
/** Orden de la semana para expandir rangos "lunes a sabado" (domingo al final). */
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bhrs?\b\.?|\bhoras?\b/g, " ")
    .replace(/\r/g, "\n");
}

type Token = { t: "dia"; dia: number } | { t: "hora"; min: number } | { t: "sep"; rango: boolean } | { t: "cerrado" };

function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  // El sufijo am/pm exige que NO le siga una letra: "13:00 a martes" no es "a.m.".
  const re = /(\d{1,2}):(\d{2})\s*((?:a\.?\s?m\.?|p\.?\s?m\.?)(?![a-z]))?|([a-z]+)|(-)|(,)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m[1] !== undefined) {
      let h = Number(m[1]);
      const min = Number(m[2]);
      const sufijo = m[3]?.replace(/[\s.]/g, "");
      if (sufijo === "pm" && h < 12) h += 12;
      if (sufijo === "am" && h === 12) h = 0;
      if (h > 24 || min > 59) continue;
      tokens.push({ t: "hora", min: h * 60 + min });
    } else if (m[4]) {
      const w = m[4];
      const dia = w.length >= 3 ? DIAS.findIndex((d) => w.startsWith(d)) : -1;
      if (dia >= 0) tokens.push({ t: "dia", dia });
      else if (w === "a") tokens.push({ t: "sep", rango: true });
      else if (w === "y") tokens.push({ t: "sep", rango: false });
      else if (w === "cerrado" || w === "cerrada") tokens.push({ t: "cerrado" });
    } else if (m[5]) {
      // "-" entre dos días = rango ("lun-vie"); entre dos horas lo ignora el emparejado.
      tokens.push({ t: "sep", rango: true });
    } else if (m[6]) {
      tokens.push({ t: "sep", rango: false });
    }
  }
  return tokens;
}

function expandirDias(grupo: { dia: number; rango: boolean }[]): Set<number> {
  const dias = new Set<number>();
  grupo.forEach((d, i) => {
    dias.add(d.dia);
    const previo = grupo[i - 1];
    if (d.rango && previo) {
      const a = ORDEN_SEMANA.indexOf(previo.dia);
      const b = ORDEN_SEMANA.indexOf(d.dia);
      if (a >= 0 && b >= a) for (let k = a; k <= b; k++) dias.add(ORDEN_SEMANA[k]);
    }
  });
  return dias;
}

/** Interpreta el texto -> rangos por día de la semana (0=domingo) y días cerrados. */
export function interpretarHorario(
  observaciones: string | null | undefined,
): { porDia: Map<number, Rango[]>; cerrados: Set<number> } | null {
  if (!observaciones || !observaciones.trim()) return null;
  const tokens = tokenizar(normalizar(observaciones));

  const porDia = new Map<number, Rango[]>();
  const cerrados = new Set<number>();
  let grupo: { dia: number; rango: boolean }[] = [];
  let horas: number[] = [];
  let modoCerrado = false;
  let ultimoSep: boolean | null = null; // el ultimo separador visto era "rango"?
  let huboHorarios = false;

  const cerrarGrupo = () => {
    if (horas.length >= 2) {
      const dias = grupo.length ? expandirDias(grupo) : new Set([0, 1, 2, 3, 4, 5, 6]);
      for (let i = 0; i + 1 < horas.length; i += 2) {
        const rango: Rango = [horas[i], horas[i + 1]];
        for (const d of dias) porDia.set(d, [...(porDia.get(d) ?? []), rango]);
        huboHorarios = true;
      }
      grupo = [];
    }
    horas = [];
  };

  for (const tk of tokens) {
    if (tk.t === "cerrado") {
      cerrarGrupo();
      modoCerrado = true;
      grupo = [];
    } else if (tk.t === "dia") {
      if (horas.length) cerrarGrupo(); // ya habia horas: empieza un grupo nuevo de dias
      if (modoCerrado) cerrados.add(tk.dia);
      else grupo.push({ dia: tk.dia, rango: ultimoSep === true });
      ultimoSep = null;
    } else if (tk.t === "hora") {
      if (!modoCerrado) horas.push(tk.min);
      ultimoSep = null;
    } else {
      ultimoSep = tk.rango;
    }
  }
  cerrarGrupo();

  if (!huboHorarios && cerrados.size === 0) return null;
  return { porDia, cerrados };
}

function ahoraEnMexico(ahora: Date): { dia: number; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);
  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dia, minutos: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function estadoHorario(observaciones: string | null | undefined, ahora: Date = new Date()): EstadoHorario {
  const h = interpretarHorario(observaciones);
  if (!h) return "desconocido";
  const { dia, minutos } = ahoraEnMexico(ahora);
  if (h.cerrados.has(dia)) return "cerrado";
  const rangos = h.porDia.get(dia) ?? [];
  const abierto = rangos.some(([ini, fin]) =>
    fin >= ini ? minutos >= ini && minutos <= fin : minutos >= ini || minutos <= fin,
  );
  return abierto ? "abierto" : "cerrado";
}

/** Compatibilidad: `true` solo cuando se sabe que esta abierto. */
export function estaAbiertoAhora(observaciones: string | null | undefined): boolean {
  return estadoHorario(observaciones) === "abierto";
}
