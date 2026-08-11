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
