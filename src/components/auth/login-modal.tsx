"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ModalShell } from "@/components/ui/modal-shell";
import { useModalA11y } from "@/components/ui/use-modal-a11y";

type Status = "idle" | "submitting" | "error";

export function LoginModal() {
  const { isLoginOpen } = useAuth();
  // Mounted only while open, so form/error state always starts fresh —
  // no reset-on-close effect needed.
  if (!isLoginOpen) return null;
  return <LoginModalForm />;
}

function LoginModalForm() {
  const { closeLogin, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  useModalA11y(panelRef, closeLogin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setStatus("error");
      setErrorMsg("Debe indicar el usuario/contraseña.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const result = await login(email, password);
      if (!result.ok) {
        setStatus("error");
        setErrorMsg(result.mensaje ?? "Usuario o contraseña incorrectos.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Ocurrió un error al iniciar sesión. Intenta de nuevo.");
    }
  }

  return (
    <ModalShell
      onClose={closeLogin}
      panelRef={panelRef}
      label="Iniciar sesión"
      className="relative flex w-full max-w-[460px] flex-col items-center gap-6 rounded-md bg-neutral-bg p-8 shadow-card sm:p-10"
    >
      <p className="font-display text-2xl font-bold text-black">Iniciar sesión</p>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="text-sm font-medium text-black">
            Ingrese su correo electrónico
          </label>
          <input
            id="login-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            autoComplete="username"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card placeholder:text-secondary-dark outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="text-sm font-medium text-black">
            Ingrese su contraseña
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black shadow-card placeholder:text-secondary-dark outline-none"
          />
        </div>

        {status === "error" && errorMsg && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMsg}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setRecordar((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-black"
          >
            <span
              className={`flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 bg-white ${
                recordar ? "border-primary" : "border-secondary"
              }`}
            >
              {recordar && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </span>
            Recordar usuario
          </button>
          <Link
            href="/cuenta/recuperar"
            onClick={closeLogin}
            className="inline-block py-2 font-display text-sm text-black hover:text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="mt-4 flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex h-[43px] items-center justify-center rounded-md border-2 border-white bg-white px-6 font-display text-base font-bold text-primary shadow-card disabled:opacity-60"
          >
            {status === "submitting" ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-4 font-display text-base">
        <span className="text-black">
          ¿No tienes una cuenta?{" "}
          <Link href="/cuenta/crear" onClick={closeLogin} className="inline-block py-2 text-primary hover:underline">
            Crear cuenta
          </Link>
        </span>
      </div>
    </ModalShell>
  );
}
