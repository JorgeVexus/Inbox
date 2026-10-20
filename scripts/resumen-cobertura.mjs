// Resumen de cobertura por capa a partir de coverage-summary.json (Vitest + v8).
// Uso: node scripts/resumen-cobertura.mjs [ruta/coverage-summary.json]
import fs from "node:fs";

const ruta = process.argv[2] ?? "docs/qa-baseline/coverage/coverage-summary.json";
const resumen = JSON.parse(fs.readFileSync(ruta, "utf8"));
const grupos = {};

for (const [archivo, v] of Object.entries(resumen)) {
  if (archivo === "total") continue;
  const rel = archivo.split("\\").join("/").split("/src/")[1];
  const partes = rel.split("/");
  const clave = rel.startsWith("lib/api")
    ? partes.slice(0, 3).join("/")
    : rel.startsWith("lib")
      ? "lib"
      : partes.slice(0, 2).join("/");
  const g = (grupos[clave] ??= { cubiertas: 0, total: 0, archivos: [] });
  g.cubiertas += v.statements.covered;
  g.total += v.statements.total;
  g.archivos.push([rel, v.statements.pct]);
}

console.log("Cobertura de sentencias por capa (menor primero):");
for (const [k, g] of Object.entries(grupos).sort(
  (a, b) => a[1].cubiertas / (a[1].total || 1) - b[1].cubiertas / (b[1].total || 1),
)) {
  const pct = g.total ? ((100 * g.cubiertas) / g.total).toFixed(0) : "-";
  console.log(`${String(pct).padStart(4)}%  ${String(g.total).padStart(5)} sentencias  ${k}`);
}
console.log("\nArchivos de lib/ por debajo del 60 %:");
for (const [k, g] of Object.entries(grupos)) {
  if (!k.startsWith("lib")) continue;
  for (const [f, p] of g.archivos) if (p < 60) console.log(`  ${p.toFixed(0).padStart(3)}%  ${f}`);
}
