import { MOCK_USERS } from "@/lib/mock/auth";
import type { LoginResponse } from "@/types/auth";

/**
 * Single seam between the UI and `Login`. Today it resolves against
 * MOCK_USERS; once the BFF exists this becomes:
 *
 *   export async function loginRequest(usuario: string, password: string) {
 *     const res = await fetch("/api/auth/login", {
 *       method: "POST",
 *       body: JSON.stringify({ p_usuario: usuario, p_password: password }),
 *     });
 *     return (await res.json()) as LoginResponse;
 *   }
 *
 * The BFF route is where the real token gets stored in a Secure/HttpOnly
 * cookie (see CLAUDE.md sección 5, regla 6) — it must never reach client
 * JS. `LoginModal` only ever sees `{ success, mensaje }`, never a token,
 * even in this mock, so swapping this function is the only change needed.
 *
 * Try the seeded demo user: usuario "INBOX", contraseña "Prueba".
 */
export async function loginRequest(
  usuario: string,
  password: string,
): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = MOCK_USERS[usuario.trim().toUpperCase()];
  if (!user || user.password !== password) {
    return {
      success: false,
      mensaje: "Usuario o contraseña incorrectos.",
      data: {},
    };
  }

  return {
    success: true,
    mensaje: "Token generado correctamente.",
    data: { token: "mock-token" },
  };
}
