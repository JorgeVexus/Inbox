"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

const NAV_LINKS = [
  { label: "Envío", href: "/envio", hasChevron: true },
  { label: "Recolección", href: "/recoleccion" },
  { label: "Rastreo", href: "/rastreo" },
  { label: "Somos", href: "/somos" },
  { label: "Soporte", href: "/soporte" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, openLogin, logout } = useAuth();

  // Escape cierra el menú móvil.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-[1100] bg-primary shadow-nav">
      <div className="mx-auto flex h-[91px] max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/" className="relative h-[64px] w-[170px] shrink-0 xl:w-[220px]">
          <Image
            src="/images/logo-blanco-horizontal.png"
            alt="Inbox"
            fill
            sizes="220px"
            className="object-contain object-left"
            preload
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-5 lg:flex xl:gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 font-display text-lg font-bold text-white transition-colors hover:underline hover:underline-offset-4"
            >
              {link.label}
              {link.hasChevron && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 rotate-[-90deg] fill-current" aria-hidden>
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 items-center gap-4 lg:flex xl:gap-8">
          <Link
            href="/rastreo"
            aria-label="Buscar un envío"
            className="group flex h-[43px] w-[42px] items-center justify-center overflow-hidden rounded-md border-2 border-white/80 bg-primary transition-[width] duration-200 hover:w-[169px]"
          >
            <span className="flex h-full w-[42px] shrink-0 items-center justify-center">
              <Image src="/icons/search.svg" alt="" width={22} height={22} />
            </span>
          </Link>
          {session ? (
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/perfil"
                className="max-w-[130px] truncate font-display text-base font-bold text-white underline-offset-4 hover:underline xl:max-w-[260px]"
              >
                Hola, {session.nombre}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex shrink-0 items-center justify-center rounded-md border-2 border-white/60 px-3 py-3 font-display text-sm font-bold text-white transition-colors hover:border-white xl:px-4"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-white px-6 py-3 font-display text-base font-bold text-primary transition-colors hover:bg-white/90"
            >
              Iniciar sesión
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open && (
        <div id="menu-movil" className="border-t border-white/20 bg-primary px-6 pb-6 lg:hidden">
          <nav aria-label="Principal (móvil)" className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-display text-lg font-bold text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <div className="mt-2 flex flex-col items-start gap-3">
                <Link
                  href="/perfil"
                  onClick={() => setOpen(false)}
                  className="font-display text-base font-bold text-white underline-offset-4 hover:underline"
                >
                  Hola, {session.nombre}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="inline-flex items-center justify-center rounded-md border-2 border-white/60 px-4 py-3 font-display text-sm font-bold text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  openLogin();
                  setOpen(false);
                }}
                className="mt-2 inline-flex items-center justify-center rounded-md border-2 border-white bg-white px-6 py-3 font-display text-base font-bold text-primary"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
