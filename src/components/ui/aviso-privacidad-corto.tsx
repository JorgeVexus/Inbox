import Link from "next/link";

/**
 * Aviso de privacidad simplificado: se muestra junto a cualquier formulario que pide datos
 * personales (LFPDPPP: el responsable debe informar la finalidad al momento de recabarlos).
 * El texto integral vive en `/privacidad` (pendiente de redacción legal, ver docs/legal/).
 * Se abre en otra pestaña para no perder lo que la persona ya escribió.
 */
export function AvisoPrivacidadCorto({ finalidad, className = "" }: { finalidad: string; className?: string }) {
  return (
    <p className={`text-center text-xs leading-5 text-black/60 ${className}`}>
      Usaremos tus datos únicamente para {finalidad}. Conoce cómo los protegemos en el{" "}
      <Link
        href="/privacidad"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2"
      >
        Aviso de privacidad
      </Link>
      .
    </p>
  );
}
