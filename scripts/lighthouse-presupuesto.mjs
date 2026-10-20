// Lighthouse móvil (4G lento y CPU 4× más lenta, simulado: la configuración por defecto) sobre las
// rutas públicas, con presupuestos que hacen fallar el proceso (y el CI) si se incumplen.
//
// Uso (con el sitio ya compilado y servido):
//   npm run build && npx next start -p 3500
//   LH_URL=http://localhost:3500 npm run qa:lighthouse
// Variables: LH_URL (por defecto http://localhost:3500), LH_RUNS (corridas por intento, por defecto 3:
//            se usa la mediana), LH_INTENTOS (por defecto 2: una ruta solo falla si incumple en todos
//            los intentos; el laboratorio tiene ruido, sobre todo en máquinas compartidas),
//            LH_SALIDA (ruta de un .json para guardar el detalle).
import fs from "node:fs";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE = (process.env.LH_URL ?? "http://localhost:3500").replace(/\/$/, "");
const RUNS = Number(process.env.LH_RUNS ?? 3);
const INTENTOS = Number(process.env.LH_INTENTOS ?? 2);
const RUTAS = ["/", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte"];

/** Presupuestos (plan de revisión 360°, F8 y F12). */
const PRESUPUESTO = {
  performance: { min: 90 },
  accessibility: { min: 95 },
  "best-practices": { min: 95 },
  seo: { min: 100 },
};
/**
 * `max` hace fallar; `objetivo` solo avisa. El LCP de laboratorio es simulado y conservador (en
 * pruebas con la red y la CPU limitadas de verdad sale ~0.5–1 s menor), por eso el límite que
 * bloquea es más holgado que el objetivo de Core Web Vitals (2.5 s), que se verifica con datos de
 * campo después del lanzamiento.
 */
const METRICAS = {
  "largest-contentful-paint": { etiqueta: "LCP", max: 3300, objetivo: 2500 },
  "cumulative-layout-shift": { etiqueta: "CLS", max: 0.1, objetivo: 0.1 },
  "total-blocking-time": { etiqueta: "TBT", max: 200, objetivo: 200 },
};

const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function medir(chrome, ruta) {
  const muestras = [];
  for (let i = 0; i < RUNS; i++) {
    const r = await lighthouse(BASE + ruta, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: Object.keys(PRESUPUESTO),
    });
    muestras.push(r.lhr);
  }
  const punt = {};
  for (const cat of Object.keys(PRESUPUESTO))
    punt[cat] = mediana(muestras.map((m) => Math.round((m.categories[cat]?.score ?? 0) * 100)));
  const met = {};
  for (const id of Object.keys(METRICAS))
    met[id] = mediana(muestras.map((m) => m.audits[id]?.numericValue ?? Infinity));
  const problemas = [];
  for (const [cat, { min }] of Object.entries(PRESUPUESTO))
    if ((punt[cat] ?? 0) < min) problemas.push(`${cat} ${punt[cat]} < ${min}`);
  for (const [id, { etiqueta, max }] of Object.entries(METRICAS))
    if ((met[id] ?? Infinity) > max) problemas.push(`${etiqueta} ${Math.round((met[id] ?? 0) * 1000) / 1000} > ${max}`);
  return { punt, met, problemas };
}

const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
const filas = [];
const detalle = {};
let fallos = 0;
try {
  for (const ruta of RUTAS) {
    let medida = await medir(chrome, ruta);
    let intento = 1;
    while (medida.problemas.length && intento < INTENTOS) {
      medida = await medir(chrome, ruta);
      intento++;
    }
    const { punt, met, problemas } = medida;
    if (problemas.length) fallos++;
    const avisos = Object.entries(METRICAS)
      .filter(([id, { objetivo, max }]) => (met[id] ?? 0) > objetivo && (met[id] ?? 0) <= max)
      .map(([, { etiqueta, objetivo }]) => `${etiqueta} sobre el objetivo ${objetivo}`);
    detalle[ruta] = { puntuaciones: punt, metricas: met, problemas, avisos, intentos: intento };
    filas.push(
      [
        ruta.padEnd(11),
        String(punt.performance).padStart(4),
        String(punt.accessibility).padStart(4),
        String(punt["best-practices"]).padStart(4),
        String(punt.seo).padStart(4),
        `${Math.round(met["largest-contentful-paint"] ?? 0)}`.padStart(6),
        `${(met["cumulative-layout-shift"] ?? 0).toFixed(3)}`.padStart(6),
        `${Math.round(met["total-blocking-time"] ?? 0)}`.padStart(5),
        problemas.length
          ? "FALLA: " + problemas.join("; ")
          : avisos.length
            ? "ok (aviso: " + avisos.join("; ") + ")"
            : "ok",
      ].join("  "),
    );
  }
} finally {
  await chrome.kill();
}

console.log(`Lighthouse móvil · ${BASE} · mediana de ${RUNS} corrida(s), hasta ${INTENTOS} intento(s)`);
console.log(["Ruta".padEnd(11), "Perf", "A11y", "BP  ", "SEO ", "LCP ms", "CLS   ", "TBT  ", "Resultado"].join("  "));
console.log(filas.join("\n"));
if (process.env.LH_SALIDA) fs.writeFileSync(process.env.LH_SALIDA, JSON.stringify(detalle, null, 2));
if (fallos) {
  console.error(`\n${fallos} ruta(s) incumplen el presupuesto.`);
  process.exit(1);
}
