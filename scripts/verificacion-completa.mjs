// Re-ejecución completa de las verificaciones de la revisión 360° (Fase 7): un solo comando que corre
// cada comprobación automática y imprime un tablero verde/rojo, para repetir el Go / No-Go cuando haga falta.
//
//   npm run qa:todo                       # comprobaciones rápidas (≈ 3 min): tipos, lint, formato, pruebas, código muerto…
//   npm run qa:todo -- --e2e              # + E2E completa en los 4 navegadores sin reintentos (≈ 13 min)
//   npm run qa:todo -- --lighthouse       # + Lighthouse con presupuestos (levanta el sitio en el puerto 3500)
//   npm run qa:todo -- --e2e --lighthouse --simulacro   # todo
// Sale con código 1 si algo falla. No cubre lo que requiere personas (UAT, Legal, lector de pantalla, Figma).
import { spawn, spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const filas = [];

function paso(nombre, comando, { extraer, falloSiSalida = true } = {}) {
  const t0 = Date.now();
  const r = spawnSync(comando, { shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const salida = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const ok = falloSiSalida ? r.status === 0 : true;
  const dato = extraer ? (extraer(salida) ?? "") : "";
  const seg = Math.round((Date.now() - t0) / 1000);
  filas.push({ nombre, ok, dato, seg });
  console.log(`${ok ? "✅" : "❌"} ${nombre.padEnd(34)} ${String(seg).padStart(4)} s  ${dato}`);
  if (!ok) console.log(salida.split("\n").slice(-15).join("\n"));
}

const buscar = (re) => (s) => re.exec(s)?.[0]?.replace(/\s+/g, " ").trim();

console.log("Verificación completa — revisión 360°\n");
paso("Tipos (tsc, banderas estrictas)", "npx tsc --noEmit");
paso("ESLint (0 errores)", "npx eslint", { extraer: buscar(/\d+ problems? \(\d+ errors?, \d+ warnings?\)/) });
paso("Formato (Prettier)", "npx prettier --check .");
paso("Pruebas unitarias + umbrales", "npm run test:cobertura", {
  extraer: (s) =>
    `${/Tests\s+(\d+) passed/.exec(s)?.[1] ?? "?"} pruebas · ${buscar(/Statements\s*:\s*[\d.]+%/)(s) ?? ""}`,
});
paso("Código muerto (knip)", "npm run qa:muerto");
paso("Ciclos de dependencias (madge)", "npm run qa:ciclos", { extraer: buscar(/No circular dependency found/) });
paso("Duplicación (jscpd, ≤ 3 %)", "npm run qa:duplicacion", {
  extraer: (s) => {
    const m = /\(([\d.]+)%\) duplicated/.exec(s);
    return m ? `${m[1]} %` : buscar(/Found \d+ exact clones[^\n]*/)(s);
  },
});
paso("Dependencias de producción (audit)", "npm audit --omit=dev --audit-level=moderate", {
  extraer: buscar(/found \d+ vulnerabilities/),
});
paso("Construcción (next build)", "npm run build", { extraer: buscar(/Compiled successfully in [\d.]+m?s/) });

if (args.has("--simulacro"))
  paso("Simulacro de incidentes (BFF)", "node scripts/simulacro-incidentes.mjs", {
    extraer: buscar(/\d+\/\d+ escenarios correctos/),
  });

if (args.has("--lighthouse")) {
  const servidor = spawn("npx", ["next", "start", "-p", "3500"], {
    shell: true,
    stdio: "ignore",
    env: { ...process.env, RATE_LIMIT_DISABLED: "1" },
  });
  await new Promise((r) => setTimeout(r, 6000));
  paso("Lighthouse móvil (presupuestos)", "npm run qa:lighthouse", {
    extraer: (s) => (s.includes("incumplen") ? "incumple" : "6 rutas dentro de presupuesto"),
  });
  if (process.platform === "win32") spawnSync(`taskkill /pid ${servidor.pid} /T /F`, { shell: true });
  else servidor.kill();
}

if (args.has("--e2e")) {
  paso("E2E completa, 4 navegadores, 0 reintentos", "npx playwright test --workers=2 --retries=0", {
    extraer: (s) =>
      `${/(\d+) passed/.exec(s)?.[1] ?? 0} pasan · ${/(\d+) failed/.exec(s)?.[1] ?? 0} fallan · ${/(\d+) skipped/.exec(s)?.[1] ?? 0} omitidas`,
  });
}

const fallos = filas.filter((f) => !f.ok).length;
console.log(`\n${filas.length - fallos}/${filas.length} comprobaciones correctas.`);
process.exit(fallos ? 1 : 0);
