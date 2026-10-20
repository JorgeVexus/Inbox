// Lista los clones de código detectados por jscpd.
// Uso: node scripts/resumen-duplicacion.mjs [ruta/jscpd-report.json]
import fs from "node:fs";

const ruta = process.argv[2] ?? "docs/qa-baseline/jscpd/jscpd-report.json";
const informe = JSON.parse(fs.readFileSync(ruta, "utf8"));
const corto = (n) => n.split("\\").join("/").replace(/^.*\/src\//, "");
for (const d of informe.duplicates.sort((a, b) => b.lines - a.lines)) {
  console.log(`${String(d.lines).padStart(3)} líneas  ${corto(d.firstFile.name)}:${d.firstFile.start}  ~  ${corto(d.secondFile.name)}:${d.secondFile.start}`);
}
