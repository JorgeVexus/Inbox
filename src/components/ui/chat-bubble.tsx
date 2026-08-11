"use client";

import Image from "next/image";
import { useState } from "react";

export function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-64 rounded-md bg-white p-4 text-sm text-black shadow-card">
          ¿Tienes dudas sobre tu envío? Escríbenos y con gusto te ayudamos.
        </div>
      )}
      <button
        type="button"
        aria-label="Abrir chat de soporte"
        onClick={() => setOpen((v) => !v)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-card"
      >
        <Image src="/icons/forum.svg" alt="" width={28} height={28} />
      </button>
    </div>
  );
}
