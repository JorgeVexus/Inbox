"use client";

import Image from "next/image";
import { useState } from "react";
import { rastrearGuia } from "@/lib/rastreo";
import { enviarContactoChat } from "@/lib/soporte";
import type { Rastreo } from "@/types/rastreo";

type Tab = "home" | "chat" | "help";

type FaqTopic = {
  title: string;
  preguntas: { pregunta: string; respuesta: string }[];
};

/** Placeholder categories/answers — swap for real content editorial gives us. */
const FAQ_TOPICS: FaqTopic[] = [
  {
    title: "Horarios y atención",
    preguntas: [
      {
        pregunta: "¿Cuál es el horario de atención de las sucursales?",
        respuesta:
          "La mayoría abre de lunes a sábado, de 9:00 a.m. a 7:00 p.m. Verifica el horario exacto de tu sucursal en la sección de Cobertura.",
      },
      {
        pregunta: "¿Atienden domingos?",
        respuesta:
          "Algunas sucursales de alto tráfico abren en domingo con horario reducido. Consulta la ficha de tu sucursal más cercana.",
      },
    ],
  },
  {
    title: "Sucursales y cobertura",
    preguntas: [
      {
        pregunta: "¿Cómo encuentro la sucursal más cercana?",
        respuesta:
          "Usa el mapa de cobertura en la página de inicio: filtra por estado y ciudad, o busca directamente por nombre.",
      },
    ],
  },
  {
    title: "Recolección y cotización",
    preguntas: [
      {
        pregunta: "¿Cómo solicito una recolección a domicilio?",
        respuesta:
          "Desde la sección Enviar, elige \"Entrega a domicilio\" y programa horario y dirección de recolección.",
      },
    ],
  },
  {
    title: "Rastreo y seguimiento",
    preguntas: [
      {
        pregunta: "¿Dónde ingreso mi número de guía?",
        respuesta:
          "En la pestaña de inicio de este chat, o en la barra de rastreo del sitio, en la parte superior de la página.",
      },
    ],
  },
  {
    title: "Costos, pagos y facturación",
    preguntas: [
      {
        pregunta: "¿Qué formas de pago aceptan?",
        respuesta:
          "Efectivo y tarjeta en sucursal. El pago en línea y la facturación electrónica estarán disponibles próximamente.",
      },
    ],
  },
  {
    title: "Problemas con entregas",
    preguntas: [
      {
        pregunta: "Mi paquete no ha llegado, ¿qué hago?",
        respuesta:
          "Rastrea tu guía primero; si el estatus no cambió en más de 48 horas, contáctanos desde la pestaña de chat con tu número de guía a la mano.",
      },
    ],
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[550px] w-[calc(100vw-2rem)] max-w-[369px] flex-col overflow-hidden rounded-md bg-neutral-bg shadow-card">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar chat"
            className="ml-auto mr-3 mt-2 flex h-6 w-6 items-center justify-center rounded-full text-black/50 hover:bg-black/5 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto px-5">
            {tab === "home" && <HomeTab onNavigate={setTab} />}
            {tab === "chat" && <ChatTab />}
            {tab === "help" && <HelpTab />}
          </div>

          <BottomNav tab={tab} onChange={setTab} />
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Cerrar chat de soporte" : "Abrir chat de soporte"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-card"
      >
        <Image src="/icons/forum.svg" alt="" width={28} height={28} />
      </button>
    </div>
  );
}

function BottomNav({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const items: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: "home",
      label: "Inicio",
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path
            d="M12 3 3 10.2V21h6v-6h6v6h6V10.2z"
            className={active ? "fill-primary" : "fill-none stroke-secondary-dark stroke-2"}
          />
        </svg>
      ),
    },
    {
      id: "chat",
      label: "Chat",
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path
            d="M4 4h16v12H7l-3 3z"
            className={active ? "fill-primary" : "fill-none stroke-secondary-dark stroke-2"}
          />
        </svg>
      ),
    },
    {
      id: "help",
      label: "Ayuda",
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="9"
            className={active ? "fill-primary" : "fill-none stroke-secondary-dark stroke-2"}
          />
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fontSize="12"
            className={active ? "fill-white" : "fill-secondary-dark"}
          >
            ?
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-16 items-center justify-between border-t border-black/5 bg-white px-8 shadow-[0px_-2px_4px_rgba(0,0,0,0.08)]">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          aria-current={tab === item.id}
          onClick={() => onChange(item.id)}
          className="flex items-center justify-center"
        >
          {item.icon(tab === item.id)}
        </button>
      ))}
    </div>
  );
}

function HomeTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [guia, setGuia] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<Rastreo | null | "not-found">(null);

  async function handleRastrear() {
    if (!guia.trim()) return;
    setBuscando(true);
    setResultado(null);
    const data = await rastrearGuia(guia);
    setResultado(data ?? "not-found");
    setBuscando(false);
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      <p className="font-display text-3xl text-black">¡Hola!</p>

      <button
        type="button"
        onClick={() => onNavigate("chat")}
        className="flex h-[43px] items-center justify-between rounded-md bg-white px-5 shadow-card-sm"
      >
        <span className="font-display text-base text-secondary-dark">
          Envíanos un mensaje
        </span>
        <Image src="/icons/forum.svg" alt="" width={18} height={18} />
      </button>

      <div className="flex flex-col gap-4 rounded-md bg-white px-5 py-4 shadow-card-sm">
        <p className="font-display text-base text-black">
          Da seguimiento a tu pedido
        </p>
        <input
          type="text"
          value={guia}
          onChange={(e) => setGuia(e.target.value)}
          placeholder="Ingrese el número de rastreo"
          className="h-[43px] w-full rounded-md border border-secondary-dark/50 px-4 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
        />
        <button
          type="button"
          onClick={handleRastrear}
          disabled={buscando || !guia.trim()}
          className="flex h-[43px] items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white shadow-card disabled:opacity-60"
        >
          {buscando ? "Buscando…" : "Rastrear"}
        </button>

        {resultado === "not-found" && (
          <p className="text-xs text-black/60">
            No encontramos esa guía. Verifica el número e intenta de nuevo.
          </p>
        )}
        {resultado && resultado !== "not-found" && (
          <div className="flex flex-col gap-1 rounded-md bg-neutral-bg px-3 py-2 text-xs text-black">
            <p className="font-bold">{resultado.Estatus}</p>
            <p>{resultado.OficinaEstatus} — {resultado.F_Estatus}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onNavigate("help")}
        className="flex h-[43px] items-center justify-between rounded-md bg-white px-5 shadow-card-sm"
      >
        <span className="font-display text-base text-secondary-dark">Buscar</span>
        <Image src="/icons/search.svg" alt="" width={18} height={18} />
      </button>
    </div>
  );
}

function ChatTab() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleEnviar() {
    if (!emailValido) return;
    setEnviando(true);
    await enviarContactoChat(email.trim());
    setEnviando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <p className="text-base text-black">
          Hola 👋 Soy el asistente de inbox®, encantado de ayudarte.
        </p>
        <div className="flex flex-col gap-2 rounded-md bg-white px-4 py-3 text-sm text-black shadow-card-sm">
          <p>
            ¡Gracias! Recibimos tu correo <strong>{email.trim()}</strong>. Uno de
            nuestros asesores te contactará en breve.
          </p>
          <p className="text-black/60">
            Mientras tanto, puedes revisar nuestras preguntas frecuentes en la
            pestaña de Ayuda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-11 py-6">
      <p className="text-base text-black">
        Hola 👋 Soy el asistente de inbox®, encantado de ayudarte. Para
        comenzar, por favor comparte tu correo electrónico.
      </p>
      <div className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingrese un correo electrónico"
          className="h-[43px] w-full rounded-md border border-secondary-dark/50 bg-white px-4 text-xs font-medium text-black shadow-card-sm placeholder:text-secondary-dark outline-none"
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={!emailValido || enviando}
          className="flex h-[43px] items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white shadow-card disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}

function HelpTab() {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  const topics = FAQ_TOPICS.filter((t) =>
    t.title.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5 py-6">
      <div className="flex h-[43px] items-center justify-between rounded-md bg-white px-5 shadow-card-sm">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar"
          className="w-full min-w-0 font-display text-base text-black placeholder:text-secondary-dark outline-none"
        />
        <Image src="/icons/search.svg" alt="" width={18} height={18} />
      </div>

      <div className="flex flex-col gap-3">
        {topics.map((topic) => {
          const isOpen = abierto === topic.title;
          return (
            <div key={topic.title} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAbierto(isOpen ? null : topic.title)}
                className="flex items-center justify-between rounded-md bg-white px-5 py-3 text-left shadow-card-sm"
              >
                <span className="font-display text-base font-bold text-black">
                  {topic.title}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-3 w-3 shrink-0 fill-black transition-transform ${
                    isOpen ? "rotate-90" : "-rotate-90"
                  }`}
                  aria-hidden
                >
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-3 border-l-2 border-primary pl-3">
                  {topic.preguntas.map((qa) => (
                    <div key={qa.pregunta} className="flex flex-col gap-1">
                      <p className="text-sm font-bold text-black">{qa.pregunta}</p>
                      <p className="text-xs text-black/70">{qa.respuesta}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {topics.length === 0 && (
          <p className="px-1 text-sm text-black/60">
            No encontramos temas que coincidan con “{busqueda}”.
          </p>
        )}
      </div>
    </div>
  );
}
