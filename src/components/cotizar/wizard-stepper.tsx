"use client";

export type CotizarStepKey = "cotizar" | "costo" | "confirmar" | "pago";

const STEPS: { key: CotizarStepKey; numero: number; label: string }[] = [
  { key: "cotizar", numero: 1, label: "Cotizar" },
  { key: "costo", numero: 2, label: "Costo" },
  { key: "confirmar", numero: 3, label: "Confirmar" },
  { key: "pago", numero: 4, label: "Pago" },
];

export function WizardStepper({
  current,
  completed,
  onNavigate,
}: {
  current: CotizarStepKey;
  completed: Set<CotizarStepKey>;
  onNavigate: (step: CotizarStepKey) => void;
}) {
  return (
    <nav className="flex w-full max-w-[296px] shrink-0 flex-col gap-6 pt-2 lg:pt-8" aria-label="Progreso de cotización">
      {STEPS.map((step) => {
        const isCompleted = completed.has(step.key);
        const isCurrent = step.key === current;
        const clickable = isCompleted && !isCurrent;

        return (
          <button
            key={step.key}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onNavigate(step.key)}
            className={`flex items-center gap-1 rounded-md py-2.5 pl-4 pr-4 text-left transition-colors ${
              isCompleted
                ? "border-2 border-primary bg-white text-primary"
                : isCurrent
                  ? "bg-black/[0.04] text-black"
                  : "text-secondary-dark"
            } ${clickable ? "cursor-pointer" : "cursor-default"}`}
          >
            {isCompleted ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-primary" aria-hidden>
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <span
                className={`w-8 shrink-0 font-sans text-2xl font-extrabold ${
                  isCurrent ? "text-black/30" : "text-black/10"
                }`}
              >
                {step.numero}
              </span>
            )}
            <span className="font-display text-2xl font-bold">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
