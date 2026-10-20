"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

/**
 * Gate de las páginas privadas (demo): si no hay sesión, abre el modal de inicio de
 * sesión una sola vez. Si se cierra, la pantalla `PantallaSinSesion` ofrece reabrirlo.
 *
 * Es solo experiencia de usuario: la autorización real vive en el servidor (BFF).
 */
export function useAbrirLoginSinSesion(haySesion: boolean): void {
  const { isLoginOpen, openLogin } = useAuth();
  const aperturaSolicitadaRef = useRef(false);

  useEffect(() => {
    if (haySesion) {
      aperturaSolicitadaRef.current = false;
      return;
    }
    if (!aperturaSolicitadaRef.current && !isLoginOpen) {
      aperturaSolicitadaRef.current = true;
      openLogin();
    }
  }, [haySesion, isLoginOpen, openLogin]);
}

export function PantallaSinSesion({
  etiqueta,
  titulo,
  descripcion,
}: {
  etiqueta: string;
  titulo: string;
  descripcion: string;
}) {
  const { isLoginOpen, openLogin } = useAuth();
  return (
    <div className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
      <section className="w-full max-w-xl rounded-md border border-neutral-line bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
        <p className="font-display text-sm font-bold text-primary">{etiqueta}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">{titulo}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">{descripcion}</p>
        {!isLoginOpen && (
          <Button type="button" onClick={openLogin} className="mt-7">
            Iniciar sesión
          </Button>
        )}
      </section>
    </div>
  );
}
