// Diagnóstico de UNA ruta: elemento LCP, desplazamientos de diseño y recursos que más pesan.
// Uso: LH_URL=http://localhost:3500 node scripts/lighthouse-diagnostico.mjs rastreo
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE = (process.env.LH_URL ?? "http://localhost:3500").replace(/\/$/, "");
// Sin diagonal inicial en la línea de comandos (Git Bash la convierte en una ruta de Windows).
const ruta = "/" + (process.argv[2] ?? "").replace(/^\//, "");
const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
try {
  const { lhr } = await lighthouse(BASE + ruta, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance"],
  });
  const a = lhr.audits;
  console.log(
    "Perf",
    Math.round((lhr.categories.performance?.score ?? 0) * 100),
    "· LCP",
    Math.round(a["largest-contentful-paint"]?.numericValue ?? 0),
    "· FCP",
    Math.round(a["first-contentful-paint"]?.numericValue ?? 0),
    "· CLS",
    a["cumulative-layout-shift"]?.numericValue,
    "· TBT",
    Math.round(a["total-blocking-time"]?.numericValue ?? 0),
  );
  const lcp = a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
  console.log("\nElemento LCP:", lcp?.snippet ?? lcp?.selector ?? "(ninguno)");
  const fases = a["largest-contentful-paint-element"]?.details?.items?.[1]?.items ?? [];
  for (const f of fases) console.log("  fase", f.phase, Math.round(f.timing), "ms");
  console.log("\nDesplazamientos de diseño:");
  for (const it of a["layout-shifts"]?.details?.items ?? [])
    console.log("  ", it.score?.toFixed(3), it.node?.snippet?.slice(0, 120) ?? it.node?.selector);
  console.log("\nCulpables de CLS:");
  for (const it of a["layout-shift-elements"]?.details?.items ?? [])
    console.log("  ", it.score?.toFixed(3), it.node?.snippet?.slice(0, 120));
  console.log("\nRecursos más pesados:");
  for (const it of (a["network-requests"]?.details?.items ?? [])
    .sort((x, y) => y.transferSize - x.transferSize)
    .slice(0, 8))
    console.log("  ", Math.round(it.transferSize / 1024) + " KB", it.url.replace(BASE, ""));
  console.log("\nOportunidades:");
  for (const [id, au] of Object.entries(a)) {
    if (au.details?.type === "opportunity" && (au.numericValue ?? 0) > 100)
      console.log("  ", id, Math.round(au.numericValue) + " ms", au.displayValue ?? "");
  }
  console.log("\nHilo principal:");
  for (const it of (a["mainthread-work-breakdown"]?.details?.items ?? []).slice(0, 5))
    console.log("  ", it.groupLabel, Math.round(it.duration) + " ms");
} finally {
  await chrome.kill();
}
