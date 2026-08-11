/**
 * Best-effort "abierto ahora" indicator derived from the free-text
 * `Observaciones` field that `ListadoOficinas` already returns (e.g.
 * "Lunes - Viernes 09:00 - 18:30 hrs\r\nSábado 09:00 - 15:30 hrs"). The API
 * has no dedicated open/closed flag, so this scans for `HH:MM - HH:MM`
 * ranges and checks the current local time against them.
 *
 * Known limitation: it ignores which day each range applies to (parsing
 * Spanish day names/abbreviations reliably is its own project) — if ANY
 * range in the string matches the current time of day, the branch is
 * treated as open. Good enough for a visual indicator; not a substitute for
 * a real schedule field if SIBOX ever exposes one.
 */
const TIME_RANGE = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;

export function estaAbiertoAhora(observaciones: string | null | undefined): boolean {
  if (!observaciones) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let match: RegExpExecArray | null;
  TIME_RANGE.lastIndex = 0;
  while ((match = TIME_RANGE.exec(observaciones))) {
    const start = Number(match[1]) * 60 + Number(match[2]);
    const end = Number(match[3]) * 60 + Number(match[4]);
    if (nowMinutes >= start && nowMinutes <= end) return true;
  }
  return false;
}
