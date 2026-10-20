// Simulacro local de incidentes del BFF (revisión 360°, Fase 6, F15): levanta el sitio ya compilado
// con distintos fallos de SIBOX y comprueba que el visitante ve un mensaje genérico, que los
// registros llevan la línea JSON con el requestId, y que /api/salud refleja el estado.
//
// Uso: npm run build && node scripts/simulacro-incidentes.mjs
// El escenario "cloudflare" usa la API REAL de pruebas con .env.local (hoy Cloudflare bloquea a Node,
// B1: es un incidente verdadero); se omite si no hay credenciales.
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";

const PUERTO = 3600;
const BASE = `http://localhost:${PUERTO}`;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const hayCredenciales =
  fs.existsSync(".env.local") && /SIBOX_SERVICE_PASSWORD=.+/.test(fs.readFileSync(".env.local", "utf8"));

async function levantar(env) {
  const proc = spawn("npx", ["next", "start", "-p", String(PUERTO)], {
    env: { ...process.env, ...env },
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const registros = [];
  const capturar = (d) => {
    for (const l of String(d).split("\n")) if (l.includes('"nivel"')) registros.push(l.trim());
  };
  proc.stdout.on("data", capturar);
  proc.stderr.on("data", capturar);
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/api/salud`)).ok) return { proc, registros };
    } catch {}
    await esperar(500);
  }
  proc.kill();
  throw new Error("el servidor no arrancó");
}

async function detener({ proc }) {
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { shell: true });
  else proc.kill();
  await esperar(1500);
}

const rastrear = (guia = "4003229791") =>
  fetch(`${BASE}/api/rastreo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ Guia: guia }),
  });

const resultados = [];
function registrar(escenario, ok, detalle) {
  resultados.push({ escenario, ok });
  console.log(`${ok ? "✅" : "❌"} ${escenario}\n   ${detalle.replaceAll("\n", "\n   ")}\n`);
}

const BASE_ENV = { RATE_LIMIT_DISABLED: "1", SIBOX_SERVICE_USER: "simulacro", SIBOX_SERVICE_PASSWORD: "simulacro" };

// 1. SIBOX apagado (conexión rechazada)
{
  const s = await levantar({ ...BASE_ENV, SIBOX_API_BASE_URL: "http://localhost:9" });
  const r = await rastrear();
  const cuerpo = await r.text();
  const salud = await (await fetch(`${BASE}/api/salud`)).json();
  const limpio = !/localhost:9|ECONNREFUSED|fetch failed|stack/i.test(cuerpo);
  registrar(
    "R1a. SIBOX apagado (conexión rechazada)",
    r.status === 503 && limpio && r.headers.get("x-request-id") !== null,
    `HTTP ${r.status} · cuerpo: ${cuerpo} · sin detalles internos: ${limpio} · X-Request-Id: ${r.headers.get("x-request-id")}\n/api/salud → ${JSON.stringify(salud)}\nregistro: ${s.registros[0] ?? "(ninguno)"}`,
  );
  await detener(s);
}

// 2. SIBOX no contesta (se cuelga) → tiempo agotado (20 s)
{
  const colgado = http.createServer(() => {}); // acepta y nunca responde
  await new Promise((r) => colgado.listen(4999, r));
  const s = await levantar({ ...BASE_ENV, SIBOX_API_BASE_URL: "http://localhost:4999" });
  const t0 = Date.now();
  const r = await rastrear();
  const seg = Math.round((Date.now() - t0) / 1000);
  registrar(
    "R1b. SIBOX no contesta (tiempo agotado)",
    r.status === 504 && seg >= 19 && seg <= 30,
    `HTTP ${r.status} tras ${seg} s (tope del BFF: 20 s) · cuerpo: ${await r.text()}\nregistro: ${s.registros[0] ?? "(ninguno)"}`,
  );
  await detener(s);
  colgado.close();
}

// 3. Cloudflare bloquea (incidente REAL con la API de pruebas) + enfriamiento del Login
if (hayCredenciales) {
  const s = await levantar({ RATE_LIMIT_DISABLED: "1" }); // credenciales y URL salen de .env.local
  const t0 = Date.now();
  const r1 = await rastrear();
  const c1 = await r1.text();
  const salud = await (await fetch(`${BASE}/api/salud`)).json();
  const t1 = Date.now();
  const r2 = await rastrear(); // dentro del enfriamiento: no debe volver a golpear a SIBOX
  const ms2 = Date.now() - t1;
  const lineasLogin = s.registros.filter((l) => /Cloudflare|SIBOX/.test(l)).length;
  const bloqueado = r1.status === 503;
  registrar(
    "R2/R7. Cloudflare bloquea al servidor + enfriamiento del Login (API real de pruebas)",
    bloqueado ? r2.status === 503 && ms2 < 1000 : r1.status === 200,
    bloqueado
      ? `1.ª petición: HTTP ${r1.status} en ${t1 - t0} ms · cuerpo: ${c1}\n/api/salud → ${JSON.stringify(salud)} (esperado: sibox "degradado")\n2.ª petición (en enfriamiento): HTTP ${r2.status} en ${ms2} ms (debe ser inmediata, sin llamar a SIBOX)\nlíneas de registro: ${lineasLogin} · ejemplo: ${s.registros[0] ?? "(ninguna)"}`
      : `Cloudflare YA NO bloquea: HTTP ${r1.status} (B1 resuelto). Escenario no aplicable.`,
  );
  await detener(s);
} else {
  console.log("⏭️  R2/R7 omitido: no hay .env.local con credenciales.\n");
}

const fallos = resultados.filter((x) => !x.ok).length;
console.log(`${resultados.length - fallos}/${resultados.length} escenarios correctos.`);
process.exit(fallos ? 1 : 0);
