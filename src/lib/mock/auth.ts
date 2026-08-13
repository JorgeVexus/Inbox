/**
 * MOCK credentials — placeholder for the `Login` endpoint. The pair below
 * is the exact sample from the API spec (Documentacion Api Pagina WEB ver
 * Jun26.pdf, p.3: Usuario "INBOX", Password "Prueba") so the demo lines up
 * with the docs. Delete once `loginRequest()` in `../auth.ts` calls the
 * real BFF route.
 */
export const MOCK_USERS: Record<string, { password: string; nombre: string }> = {
  INBOX: { password: "Prueba", nombre: "Cliente Inbox" },
};
