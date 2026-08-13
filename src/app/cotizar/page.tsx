"use client";

import { useEffect, useState } from "react";
import {
  WizardStepper,
  type CotizarStepKey,
} from "@/components/cotizar/wizard-stepper";
import { StepCotizar, defaultCotizacionInput } from "@/components/cotizar/step-cotizar";
import { StepCosto } from "@/components/cotizar/step-costo";
import { StepConfirmar } from "@/components/cotizar/step-confirmar";
import { StepPago } from "@/components/cotizar/step-pago";
import { readAndClearCotizacionDraft } from "@/lib/cotizacion-draft";
import type {
  ConfirmarInput,
  CostoOpcion,
  CotizacionInput,
} from "@/types/cotizacion";

export default function CotizarPage() {
  const [step, setStep] = useState<CotizarStepKey>("cotizar");
  const [completed, setCompleted] = useState<Set<CotizarStepKey>>(new Set());

  const [cotizacion, setCotizacion] = useState<CotizacionInput>(
    defaultCotizacionInput(),
  );
  const [opcion, setOpcion] = useState<CostoOpcion | null>(null);
  const [confirmar, setConfirmar] = useState<ConfirmarInput | null>(null);

  // Prefill step 1 from the Home hero's quote card, if it sent us here with
  // data already typed (see src/lib/cotizacion-draft.ts). sessionStorage is
  // only available client-side, so this has to run post-mount. `ready`
  // gates StepCotizar's first mount until after this runs — StepCotizar
  // seeds its own local form state from `initial` only once, so mounting it
  // before the draft loads would freeze it on the (still-empty) default.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const draft = readAndClearCotizacionDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (draft) setCotizacion(draft);
    setReady(true);
  }, []);

  function goTo(target: CotizarStepKey) {
    setStep(target);
  }

  function markDone(from: CotizarStepKey, next: CotizarStepKey) {
    setCompleted((prev) => new Set(prev).add(from));
    setStep(next);
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-10 lg:flex-row lg:px-16 lg:py-16">
      <WizardStepper current={step} completed={completed} onNavigate={goTo} />

      <div className="flex w-full flex-1 flex-col">
        {step === "cotizar" && ready && (
          <StepCotizar
            initial={cotizacion}
            onSubmit={(input) => {
              setCotizacion(input);
              markDone("cotizar", "costo");
            }}
          />
        )}

        {step === "costo" && (
          <StepCosto
            cotizacion={cotizacion}
            onEditar={() => goTo("cotizar")}
            onComprar={(chosen) => {
              setOpcion(chosen);
              markDone("costo", "confirmar");
            }}
          />
        )}

        {step === "confirmar" && opcion && (
          <StepConfirmar
            cotizacion={cotizacion}
            opcion={opcion}
            initial={confirmar}
            onEditar={() => goTo("costo")}
            onContinuar={(input) => {
              setConfirmar(input);
              markDone("confirmar", "pago");
            }}
          />
        )}

        {step === "pago" && opcion && confirmar && (
          <StepPago cotizacion={cotizacion} opcion={opcion} confirmar={confirmar} />
        )}
      </div>
    </div>
  );
}
