"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { DireccionesGuardadas } from "@/components/perfil/direcciones-guardadas";
import { FacturacionGuardada } from "@/components/perfil/facturacion-guardada";
import { Button } from "@/components/ui/button";

export function PerfilView() {
  const { session, isLoginOpen, openLogin, logout } = useAuth();
  const aperturaSolicitadaRef = useRef(false);

  useEffect(() => {
    if (session) {
      aperturaSolicitadaRef.current = false;
      return;
    }
    if (!aperturaSolicitadaRef.current && !isLoginOpen) {
      aperturaSolicitadaRef.current = true;
      openLogin();
    }
  }, [isLoginOpen, openLogin, session]);

  if (!session) {
    return (
      <main className="flex min-h-[62vh] items-center justify-center bg-neutral-bg px-5 py-20">
        <section className="w-full max-w-xl rounded-md border border-neutral-line bg-white px-6 py-12 text-center shadow-card-sm sm:px-12">
          <p className="font-display text-sm font-bold text-primary">MI PERFIL</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-black sm:text-4xl">
            Inicia sesión para ver tu perfil
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/70 sm:text-base">
            Tus direcciones guardadas y datos de facturación están
            protegidos y solo se muestran dentro de tu cuenta.
          </p>
          {!isLoginOpen && (
            <Button type="button" onClick={openLogin} className="mt-7">
              Iniciar sesión
            </Button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="bg-neutral-bg pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-8 sm:px-8 lg:px-10">
        <nav aria-label="Migas de pan" className="text-sm text-black/70">
          <Link href="/" className="transition-colors hover:text-primary">Inicio</Link>
          <span aria-hidden="true" className="mx-2">›</span>
          <span aria-current="page" className="font-bold text-black">Mi perfil</span>
        </nav>

        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-bold text-black sm:text-5xl">Mi perfil</h1>
              <span className="rounded-full bg-secondary/25 px-3 py-1 text-xs font-bold text-primary">Datos demo</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/70 sm:text-base">
              Consulta y edita la información asociada a tu cuenta.
            </p>
          </div>
          <Button type="button" onClick={logout} variant="outline" className="w-full sm:w-auto">
            Cerrar sesión
          </Button>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-card-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-black">Datos de mi cuenta</h2>
              <dl className="mt-4 flex flex-col gap-2 text-sm text-black/80">
                <div className="flex gap-2">
                  <dt className="font-medium text-black">Nombre:</dt>
                  <dd>{session.nombre}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-black">Usuario:</dt>
                  <dd>{session.usuario}</dd>
                </div>
              </dl>
              <p className="mt-4 max-w-md text-xs text-black/50">
                Editar correo, teléfono o contraseña requiere un endpoint de
                perfil que la API de SIBOX aún no documenta — por ahora esta
                sección solo muestra lo que ya devuelve el inicio de sesión.
              </p>
            </div>
          </section>

          <FacturacionGuardada usuario={session.usuario} />
          <DireccionesGuardadas usuario={session.usuario} />

          <section className="flex flex-col items-start gap-3 rounded-md bg-white p-6 shadow-card-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-black">Mis envíos</h2>
              <p className="mt-1 text-sm text-black/70">
                Consulta el estado y el historial de tus guías.
              </p>
            </div>
            <Button href="/envio" variant="outline" className="w-full sm:w-auto">
              Ver mis envíos
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
