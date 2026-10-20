// Agrupa la salida de ESLint (formato json) por regla y archivo.
// Uso: npx eslint -f json > lint.json; node scripts/resumen-lint.mjs lint.json [regla]
import fs from "node:fs";

const [, , ruta, filtro] = process.argv;
const resultados = JSON.parse(fs.readFileSync(ruta, "utf8"));
for (const r of resultados) {
  const archivo = r.filePath.split("\\").join("/").split("/repo/")[1] ?? r.filePath;
  for (const m of r.messages) {
    if (filtro && !String(m.ruleId).includes(filtro)) continue;
    console.log(
      `${m.severity === 2 ? "ERR " : "warn"} ${String(m.ruleId).padEnd(42)} ${archivo}:${m.line}  ${m.message.slice(0, 70)}`,
    );
  }
}
