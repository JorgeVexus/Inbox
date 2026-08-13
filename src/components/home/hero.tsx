"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveCotizacionDraft } from "@/lib/cotizacion-draft";

const SLIDES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

export function Hero() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [guia, setGuia] = useState("");

  function handleRastrear(e: React.FormEvent) {
    e.preventDefault();
    if (!guia.trim()) return;
    router.push(`/rastreo?guias=${encodeURIComponent(guia.trim())}`);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative">
      {/* Banner: sliding photos + dark overlay + rastreo search. Clipped to a
          fixed height — the quote card below is a separate sibling that
          overlaps it via negative margin, matching the Figma layout where
          the quote card straddles the banner and the white section below. */}
      <div className="relative h-[577px] w-full overflow-hidden">
        {SLIDES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1.5px]" />

        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center gap-5 px-6 pt-16 sm:pt-20">
          <h1 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">
            Rastree su envío
          </h1>
          <form onSubmit={handleRastrear} className="flex w-full max-w-[406px] items-center gap-4">
            <input
              type="text"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              placeholder="Ingrese el número de rastreo"
              className="h-[53px] flex-1 rounded-md border border-secondary-dark/50 bg-white px-6 text-xs font-medium text-black placeholder:text-secondary-dark shadow-card outline-none"
            />
            <Button type="submit">Rastrear</Button>
          </form>
        </div>
      </div>

      {/* Quote card — overlaps the bottom of the banner and spills into the
          white section below (see Figma node 672:18562 / 672:19951). */}
      <div className="relative z-10 mx-auto -mt-[210px] flex w-full max-w-[574px] flex-col items-center gap-4 px-6 sm:-mt-[240px]">
        <h2 className="text-center font-sans text-2xl font-extrabold text-white sm:text-3xl">
          Obtenga una cotización
        </h2>
        <QuoteCard />
      </div>
    </section>
  );
}

type EntregaTipo = "sucursal" | "domicilio";
type EnvioTipo = "sobre" | "sobrepaq" | "paquete";
type Step = "form" | "tipo";

type FormState = {
  origenCP: string;
  origenCiudad: string;
  destinoCP: string;
  destinoCiudad: string;
  entrega: EntregaTipo;
};

const ENTREGA_LABEL: Record<EntregaTipo, string> = {
  sucursal: "Entrega en sucursal",
  domicilio: "Entrega a domicilio",
};

function QuoteCard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormState>({
    origenCP: "",
    origenCiudad: "",
    destinoCP: "",
    destinoCiudad: "",
    entrega: "sucursal",
  });
  const [envio, setEnvio] = useState<EnvioTipo>("sobre");
  const [paquete, setPaquete] = useState({
    peso: "",
    alto: "",
    largo: "",
    ancho: "",
    cantidad: 1,
    pais: "MX" as "US" | "MX",
  });

  function handleConfirmar() {
    saveCotizacionDraft({
      entrega: form.entrega,
      envio: envio === "sobre" ? "sobre" : "paquete",
      origen: { cp: form.origenCP, ciudad: form.origenCiudad, colonia: "" },
      destino: { cp: form.destinoCP, ciudad: form.destinoCiudad, colonia: "" },
      paquetes: [
        {
          id: crypto.randomUUID(),
          cantidad: paquete.cantidad,
          peso: paquete.peso,
          alto: paquete.alto,
          largo: paquete.largo,
          ancho: paquete.ancho,
        },
      ],
    });
    router.push("/cotizar");
  }

  const canContinue =
    form.origenCP.trim() !== "" &&
    form.origenCiudad.trim() !== "" &&
    form.destinoCP.trim() !== "" &&
    form.destinoCiudad.trim() !== "";

  function swapOrigenDestino() {
    setForm((f) => ({
      ...f,
      origenCP: f.destinoCP,
      origenCiudad: f.destinoCiudad,
      destinoCP: f.origenCP,
      destinoCiudad: f.origenCiudad,
    }));
  }

  if (step === "tipo") {
    return (
      <div className="flex w-full flex-col items-center gap-6 rounded-md bg-white px-5 py-7 shadow-card">
        <div className="flex w-full flex-col gap-2.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-7 text-sm text-[#707372]">
              <div>
                <p className="font-bold text-[#707372]">Origen</p>
                <p className="font-medium">
                  {form.origenCP} {form.origenCiudad}
                </p>
              </div>
              <div>
                <p className="font-bold text-[#707372]">Destino</p>
                <p className="font-medium">
                  {form.destinoCP} {form.destinoCiudad}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="shrink-0 rounded-md border border-primary px-2 py-1 text-xs font-medium text-primary"
            >
              Editar
            </button>
          </div>
          <p className="text-sm text-[#707372]">{ENTREGA_LABEL[form.entrega]}</p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <p className="text-xl font-medium text-black">
            Selecciona el tipo de entrega
          </p>
          <div className="flex flex-wrap items-center gap-8 sm:gap-15">
            <EnvioOption
              label="Sobre"
              checked={envio === "sobre"}
              onClick={() => setEnvio("sobre")}
            />
            <EnvioOption
              label="SobrePaq"
              checked={envio === "sobrepaq"}
              onClick={() => setEnvio("sobrepaq")}
            />
            <EnvioOption
              label="Paquete"
              checked={envio === "paquete"}
              onClick={() => setEnvio("paquete")}
            />
          </div>
        </div>

        {envio === "paquete" && (
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex gap-6 sm:gap-12">
                <div className="flex flex-col gap-3">
                  <p className="text-xl font-medium text-black">Peso</p>
                  <MedidaInput
                    unit="Kg"
                    value={paquete.peso}
                    onChange={(v) => setPaquete((p) => ({ ...p, peso: v }))}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xl font-medium text-black">Medidas</p>
                  <div className="flex items-center gap-4">
                    <MedidaInput
                      unit="Cm"
                      value={paquete.alto}
                      onChange={(v) => setPaquete((p) => ({ ...p, alto: v }))}
                    />
                    <MedidaInput
                      unit="Cm"
                      value={paquete.largo}
                      onChange={(v) => setPaquete((p) => ({ ...p, largo: v }))}
                    />
                    <MedidaInput
                      unit="Cm"
                      value={paquete.ancho}
                      onChange={(v) => setPaquete((p) => ({ ...p, ancho: v }))}
                    />
                  </div>
                  <div className="flex justify-end gap-4 pr-3 text-xs text-secondary-dark">
                    <span className="w-[82px] text-right">Alto</span>
                    <span className="w-[82px] text-right">Largo</span>
                    <span className="w-[82px] text-right">Ancho</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <p className="text-xl font-medium text-black">Cantidad</p>
                <div className="flex h-[53px] w-[86px] items-center justify-between rounded-md border border-[#707372]/70 bg-white px-3 shadow-card">
                  <span className="text-sm font-medium text-black">
                    {paquete.cantidad}
                  </span>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() =>
                        setPaquete((p) => ({ ...p, cantidad: p.cantidad + 1 }))
                      }
                      className="rotate-180"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      onClick={() =>
                        setPaquete((p) => ({
                          ...p,
                          cantidad: Math.max(1, p.cantidad - 1),
                        }))
                      }
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs font-medium text-secondary-dark">
                  Peso total {(Number(paquete.peso) || 0) * paquete.cantidad} kg
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setPaquete((p) => ({ ...p, pais: p.pais === "MX" ? "US" : "MX" }))
              }
              className="flex items-center gap-2"
            >
              <span
                className={`text-xs font-medium ${
                  paquete.pais === "US" ? "text-primary" : "text-secondary-dark"
                }`}
              >
                US
              </span>
              <Image src="/icons/us-mx-switch.svg" alt="" width={44} height={20} />
              <span
                className={`text-xs font-medium ${
                  paquete.pais === "MX" ? "text-primary" : "text-secondary-dark"
                }`}
              >
                MX
              </span>
            </button>
          </div>
        )}

        <Button
          type="button"
          onClick={handleConfirmar}
          className="w-full max-w-[300px] sm:w-auto"
        >
          Confirmar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-md bg-white px-5 py-8 shadow-card">
      <div className="flex flex-col gap-5">
        <p className="text-xl font-medium text-black">
          Seleccione el tipo de entrega
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <EnvioOption
            label="Entrega en sucursal"
            checked={form.entrega === "sucursal"}
            onClick={() => setForm((f) => ({ ...f, entrega: "sucursal" }))}
          />
          <EnvioOption
            label="Entrega a domicilio"
            checked={form.entrega === "domicilio"}
            onClick={() => setForm((f) => ({ ...f, entrega: "domicilio" }))}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
        <OriginDestinationField
          label="Origen"
          placeholder="Ingrese el C.P de origen"
          cp={form.origenCP}
          ciudad={form.origenCiudad}
          onCpChange={(v) => setForm((f) => ({ ...f, origenCP: v }))}
          onCiudadChange={(v) => setForm((f) => ({ ...f, origenCiudad: v }))}
        />

        <button
          type="button"
          aria-label="Intercambiar origen y destino"
          onClick={swapOrigenDestino}
          className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-md bg-primary p-1.5"
        >
          <Image src="/icons/swap-calls.svg" alt="" width={26} height={26} className="rotate-90" />
        </button>

        <OriginDestinationField
          label="Destino"
          placeholder="Ingrese el C.P del destino"
          cp={form.destinoCP}
          ciudad={form.destinoCiudad}
          onCpChange={(v) => setForm((f) => ({ ...f, destinoCP: v }))}
          onCiudadChange={(v) => setForm((f) => ({ ...f, destinoCiudad: v }))}
        />
      </div>

      {canContinue && (
        <Button
          type="button"
          onClick={() => setStep("tipo")}
          className="mx-auto w-full max-w-[300px]"
        >
          Continuar
        </Button>
      )}
    </div>
  );
}

function EnvioOption({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-medium text-black"
    >
      <span
        className={`flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 bg-white ${
          checked ? "border-primary" : "border-secondary"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function MedidaInput({
  unit,
  value,
  onChange,
}: {
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-[53px] w-[82px] items-center justify-end gap-1 rounded-md border border-[#707372]/70 bg-white px-3 shadow-card">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full min-w-0 text-right text-xs font-medium text-black outline-none"
      />
      <span className="shrink-0 text-xs font-medium text-black">{unit}</span>
    </div>
  );
}

function OriginDestinationField({
  label,
  placeholder,
  cp,
  ciudad,
  onCpChange,
  onCiudadChange,
}: {
  label: string;
  placeholder: string;
  cp: string;
  ciudad: string;
  onCpChange: (v: string) => void;
  onCiudadChange: (v: string) => void;
}) {
  return (
    <div className="flex w-full max-w-[209px] flex-col items-center gap-3">
      <p className="text-2xl font-bold text-black">{label}</p>
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-secondary-dark">{placeholder}</p>
          <div className="flex items-start gap-2.5">
            <div className="flex h-[53px] flex-1 items-center rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card-sm">
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={cp}
                onChange={(e) => onCpChange(e.target.value)}
                placeholder="Código postal"
                className="w-full min-w-0 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Buscar sucursal"
              className="flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-md border-2 border-primary bg-white p-1"
            >
              <Image src="/icons/map-search.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </div>
        <div className="flex h-[50px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white pl-4 pr-3.5 shadow-card">
          <input
            type="text"
            value={ciudad}
            onChange={(e) => onCiudadChange(e.target.value)}
            placeholder="Ciudad"
            className="w-full min-w-0 text-xs font-medium text-black placeholder:text-secondary-dark outline-none"
          />
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rotate-90 fill-secondary-dark" aria-hidden>
            <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
