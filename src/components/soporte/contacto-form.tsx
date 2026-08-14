"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { enviarContactoSoporte } from "@/lib/soporte";

export function ContactoForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const puedeEnviar =
    nombre.trim() !== "" && correo.trim() !== "" && mensaje.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || enviando) return;
    setEnviando(true);
    const { ok } = await enviarContactoSoporte({ nombre, correo, mensaje });
    setEnviando(false);
    if (ok) {
      setEnviado(true);
      setNombre("");
      setCorreo("");
      setMensaje("");
    }
  }

  return (
    <section className="flex flex-col items-center gap-10 bg-neutral-bg px-6 py-16 lg:flex-row lg:items-start lg:justify-center lg:px-16">
      <div className="flex w-full max-w-[425px] flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-display text-2xl font-bold text-black">
            ¿Necesitas que te contactemos?
          </h2>
          <p className="text-xs text-black">
            Llena este formulario y nos pondremos en contacto contigo lo antes
            posible. Queremos ayudarte con lo que necesites.
          </p>
        </div>
        <div className="relative h-[300px] w-full overflow-hidden rounded-md sm:h-[429px]">
          <Image
            src="/images/soporte-foto-service.png"
            alt="Asesora de servicio al cliente de Inbox"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[503px] flex-col gap-6 rounded-md bg-white px-6 py-7 shadow-card sm:px-10"
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-black" htmlFor="soporte-nombre">
            Nombre
          </label>
          <input
            id="soporte-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre personal o de empresa"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-black" htmlFor="soporte-correo">
            Correo electrónico
          </label>
          <input
            id="soporte-correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Ingrese su email"
            className="h-[53px] w-full rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-black" htmlFor="soporte-mensaje">
            Mensaje
          </label>
          <textarea
            id="soporte-mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="¿En qué podemos ayudarle?"
            rows={4}
            className="w-full resize-none rounded-md border border-secondary-dark/50 bg-white px-6 py-4 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card-sm outline-none"
          />
        </div>

        {enviado ? (
          <p className="text-center text-sm font-medium text-primary">
            ¡Gracias! Recibimos tu mensaje y te contactaremos pronto.
          </p>
        ) : (
          <Button type="submit" disabled={!puedeEnviar || enviando} className="mx-auto w-full max-w-[200px] disabled:opacity-50">
            {enviando ? "Enviando…" : "Enviar"}
          </Button>
        )}
      </form>
    </section>
  );
}
