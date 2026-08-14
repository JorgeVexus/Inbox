/**
 * The Figma flow (node 117:8023, "chat" variant) asks for the visitor's
 * email but doesn't specify what happens after — there's no live-chat or
 * ticketing endpoint in the SIBOX API spec. Until product/backend decide
 * whether this becomes a real chat (Zendesk/Intercom-style widget) or a
 * simple "leave your email, an advisor will contact you" lead form, this
 * simulates the latter: it "submits" the email and always succeeds.
 *
 * Swap the body for a real `fetch("/api/soporte/contacto", ...)` once
 * there's a Route Handler + destination (CRM, email, Slack webhook,
 * whatever backend decides) to send it to. The chat UI only depends on the
 * resolved `{ ok }` shape, so nothing else needs to change.
 */
export async function enviarContactoChat(email: string): Promise<{ ok: boolean }> {
  void email; // not sent anywhere yet — see doc comment above
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}

/**
 * Same situation as `enviarContactoChat()` above, but for the full
 * "¿Necesitas que te contactemos?" form on `/soporte` (Figma node
 * `349:27815`): nombre + correo + mensaje instead of just an email. Kept as
 * a separate function rather than generalizing `enviarContactoChat()`
 * because the two forms are unrelated in the Figma (different flows, one
 * inside the chat widget, one a standalone page section) and may end up
 * hitting different destinations once backend decides where leads go.
 */
export async function enviarContactoSoporte(datos: {
  nombre: string;
  correo: string;
  mensaje: string;
}): Promise<{ ok: boolean }> {
  void datos; // not sent anywhere yet — see doc comment above
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}
