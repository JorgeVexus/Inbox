"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

const NAV_LINKS = [
  { label: "Envío", href: "/envio", hasChevron: true },
  { label: "Rastreo", href: "/rastreo" },
  { label: "Somos", href: "/somos" },
  { label: "Soporte", href: "/soporte" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, openLogin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-[1100] bg-primary shadow-nav">
      <div className="mx-auto flex h-[91px] max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/" className="relative h-[64px] w-[220px] shrink-0">
          <Image
            src="/images/logo-blanco-horizontal.png"
            alt="Inbox"
            fill
            sizes="220px"
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 font-display text-lg font-bold text-white/80 transition-colors hover:text-white"
            >
              {link.label}
              {link.hasChevron && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 rotate-[-90deg] fill-current"
                  aria-hidden
                >
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-8 lg:flex">
          <button
            type="button"
            aria-label="Buscar"
            className="group flex h-[43px] w-[42px] items-center justify-center overflow-hidden rounded-md border-2 border-white/80 bg-primary transition-[width] duration-200 hover:w-[169px]"
          >
            <span className="flex h-full w-[42px] shrink-0 items-center justify-center">
              <Image src="/icons/search.svg" alt="" width={22} height={22} />
            </span>
          </button>
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/perfil"
                className="font-display text-base font-bold text-white underline-offset-4 hover:underline"
              >
                Hola, {session.nombre}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-md border-2 border-white/60 px-4 py-3 font-display text-sm font-bold text-white transition-colors hover:border-white"
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
          aria-label="Abrir menú"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/20 bg-primary px-6 pb-6 lg:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-display text-lg font-bold text-white/90"
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
