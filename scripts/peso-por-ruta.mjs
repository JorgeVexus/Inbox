// Mide cuánto JavaScript/CSS/imágenes/fuentes descarga cada ruta (bytes transferidos, comprimidos).
// Requiere un servidor de producción: npx next start -p 3700
// Uso: node scripts/peso-por-ruta.mjs [urlBase]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3700";
const rutas = ["/", "/cotizar", "/rastreo", "/cobertura", "/somos", "/soporte", "/envio", "/perfil", "/recoleccion"];
const navegador = await chromium.launch({ channel: "chrome" });
const filas = [];

for (const ruta of rutas) {
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const pagina = await contexto.newPage();
  const bytes = { js: 0, css: 0, img: 0, font: 0, otro: 0, total: 0 };
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send("Network.enable");
  const tipos = new Map();
  cdp.on("Network.responseReceived", (e) => tipos.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => {
    const t = tipos.get(e.requestId) ?? "Other";
    const n = e.encodedDataLength;
    const k =
      t === "Script" ? "js" : t === "Stylesheet" ? "css" : t === "Image" ? "img" : t === "Font" ? "font" : "otro";
    bytes[k] += n;
    bytes.total += n;
  });
  await pagina.goto(base + ruta);
  await pagina.waitForLoadState("networkidle");
  await pagina.waitForTimeout(1500);
  filas.push({ ruta, ...bytes });
  await contexto.close();
}
await navegador.close();

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + " KB";
console.log(
  "Ruta".padEnd(14),
  "JS".padStart(9),
  "CSS".padStart(9),
  "Imágenes".padStart(11),
  "Fuentes".padStart(10),
  "Total".padStart(10),
);
for (const f of filas)
  console.log(
    f.ruta.padEnd(14),
    kb(f.js),
    kb(f.css),
    kb(f.img).padStart(11),
    kb(f.font).padStart(10),
    kb(f.total).padStart(10),
  );
