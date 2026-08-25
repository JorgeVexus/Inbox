/**
 * Cliente interno server-only para hablar con la API de SIBOX. Solo debe
 * importarse desde Route Handlers (`src/app/api/**\/route.ts`) -- nunca
 * desde un componente cliente ni desde un seam de `src/lib/*.ts` que corra
 * en el navegador.
 *
 * Confirmado con pruebas reales (ver NOTAS_PROYECTO.md / CLAUDE.md):
 * - El sobre de respuesta es universal: {"resp":{"result":0|1,"data":...}}.
 *   El PDF documenta excepciones ({"success","mensaje","data"}) para Login y
 *   Cobertura, pero no se observaron en la practica -- se tolera ese formato
 *   por seguridad, no porque se haya confirmado que hace falta.
 * - Login es una cuenta de servicio unica para todo el sitio (confirmado
 *   por el cliente 2026-08-25), no una cuenta por cliente final.
 * - apitest.inbox.com.mx no soporta CORS y esta detras de Cloudflare
 *   (managed challenge sin headers de navegador) -- de ahi los headers
 *   User-Agent/Origin/Referer abajo. Pendiente confirmar con el cliente si
 *   produccion tiene la misma proteccion y si hace falta whitelistear la IP
 *   del servidor o algo equivalente.
 */

type SiboxEnvelopeOk<T> = { resp: { result: 0; data: T } };
type SiboxEnvelopeErr = { resp: { result: number; data: string } };
type SiboxLegacyEnvelope<T> = { success: boolean; mensaje: string; data: T };

export class SiboxApiError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = "SiboxApiError";
  }
}

class SiboxConfigError extends Error {
  constructor(missingVar: string) {
    super(
      `Falta configurar ${missingVar} -- ver .env.example. El BFF no puede autenticar contra SIBOX sin esto.`,
    );
    this.name = "SiboxConfigError";
  }
}

function getBaseUrl(): string {
  const url = process.env.SIBOX_API_BASE_URL;
  if (!url) throw new SiboxConfigError("SIBOX_API_BASE_URL");
  return url;
}

function getServiceCredentials(): { usuario: string; password: string } {
  const usuario = process.env.SIBOX_SERVICE_USER;
  const password = process.env.SIBOX_SERVICE_PASSWORD;
  if (!usuario) throw new SiboxConfigError("SIBOX_SERVICE_USER");
  if (!password) throw new SiboxConfigError("SIBOX_SERVICE_PASSWORD");
  return { usuario, password };
}

/** User-Agent que hizo pasar el reto de Cloudflare en las pruebas manuales. */
const BROWSER_LIKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function buildHeaders(baseUrl: string, token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": BROWSER_LIKE_USER_AGENT,
    Origin: baseUrl,
    Referer: `${baseUrl}/`,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function parseEnvelope<T>(json: unknown, endpoint: string): T {
  if (json && typeof json === "object" && "resp" in json) {
    const envelope = json as SiboxEnvelopeOk<T> | SiboxEnvelopeErr;
    if (envelope.resp.result === 0) return envelope.resp.data as T;
    throw new SiboxApiError(String(envelope.resp.data), endpoint);
  }
  if (json && typeof json === "object" && "success" in json) {
    const envelope = json as SiboxLegacyEnvelope<T>;
    if (envelope.success) return envelope.data;
    throw new SiboxApiError(envelope.mensaje, endpoint);
  }
  throw new SiboxApiError(
    `Respuesta con forma desconocida (ni {resp} ni {success}): ${JSON.stringify(json)}`,
    endpoint,
  );
}

// Cache de token en memoria del proceso. Vale para el ciclo de vida de una
// instancia del servidor -- en un entorno serverless (Vercel) cada
// invocacion fria vuelve a hacer Login, lo cual esta bien: es una sola
// cuenta de servicio, no hay limite de sesiones conocido documentado.
let cachedToken: string | null = null;

async function login(): Promise<string> {
  const baseUrl = getBaseUrl();
  const { usuario, password } = getServiceCredentials();

  const res = await fetch(`${baseUrl}/Login`, {
    method: "POST",
    headers: buildHeaders(baseUrl),
    body: JSON.stringify({ Usuario: usuario, Password: password }),
  });

  const json = await res.json();
  const data = parseEnvelope<{ token: string }>(json, "/Login");
  if (!data.token) {
    throw new SiboxApiError("Login no regreso token en la respuesta.", "/Login");
  }
  return data.token;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (cachedToken && !forceRefresh) return cachedToken;
  cachedToken = await login();
  return cachedToken;
}

/**
 * POST autenticado contra un endpoint de SIBOX. Reintenta una vez con un
 * token nuevo si la primera llamada regresa "token expirado"/formato
 * incorrecto -- confirmado que ambos casos dan result:1 con HTTP 401, no
 * hay forma de distinguir "expirado" de "invalido" solo por status code.
 */
export async function siboxPost<T>(endpoint: string, body: unknown): Promise<T> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  const attempt = async (authToken: string) =>
    fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(baseUrl, authToken),
      body: JSON.stringify(body),
    });

  let res = await attempt(token);

  if (res.status === 401) {
    const freshToken = await getToken(true);
    res = await attempt(freshToken);
  }

  const json = await res.json();
  return parseEnvelope<T>(json, endpoint);
}
