"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loginRequest } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mock/auth";

type Session = { usuario: string; nombre: string } | null;

type AuthContextValue = {
  session: Session;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (usuario: string, password: string) => Promise<{ ok: boolean; mensaje?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-only demo session — NOT a real auth mechanism. There is no
 * persistence (reload clears it) and no cookie. A real session must be set
 * server-side by the future BFF route as a Secure/HttpOnly cookie (see
 * CLAUDE.md sección 5, regla 6); this only exists so the Navbar/modal have
 * something to demo against before that route exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const logout = useCallback(() => setSession(null), []);

  const login = useCallback(async (usuario: string, password: string) => {
    const res = await loginRequest(usuario, password);
    if (!res.success) {
      return { ok: false, mensaje: res.mensaje };
    }
    const nombre = MOCK_USERS[usuario.trim().toUpperCase()]?.nombre ?? usuario;
    setSession({ usuario: usuario.trim(), nombre });
    setLoginOpen(false);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({ session, isLoginOpen, openLogin, closeLogin, login, logout }),
    [session, isLoginOpen, openLogin, closeLogin, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
