"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  "¿Cómo solicito una factura por mi envío?",
  "¿Qué cosas no puedo enviar con inbox®?",
  "¿Qué pasa si envío algo prohibido por error?",
  "¿Qué hago si no encuentro información de mi envío?",
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-6 flex flex-col items-center justify-center gap-14 rounded-xl bg-black/5 px-6 py-12 lg:mx-16 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex w-full flex-col gap-8 lg:max-w-[730px]">
        {QUESTIONS.map((question, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={question} className="w-full rounded-md bg-white shadow-card-sm">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 rounded-md px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-lg font-medium text-black sm:text-xl">
                  {question}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-6 w-6 shrink-0 fill-black transition-transform ${
                    isOpen ? "rotate-90" : "-rotate-90"
                  }`}
                  aria-hidden
                >
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm text-black/70">
                  Escríbenos a soporte@inbox.com.mx o consulta el detalle en la
                  sección de ayuda para más información sobre este tema.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex w-full max-w-[499px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
            Preguntas frecuentes
          </h2>
          <p className="text-base text-black">
            ¿Tienes dudas? Nosotros tenemos las respuestas. Te explicamos lo
            esencial de forma simple y directa.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <h3 className="font-display text-2xl font-bold text-black sm:text-[30px]">
            ¿Aún tienes preguntas?
          </h3>
          <p className="text-base text-black">
            Nuestro equipo está listo para ayudarte. Contáctanos y te damos la
            solución que necesitas, sin vueltas.
          </p>
        </div>
        <Button href="/soporte" className="w-fit">
          Contactar a un asesor
        </Button>
      </div>
    </section>
  );
}
