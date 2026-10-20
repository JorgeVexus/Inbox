import type { ContactoEnvio } from "@/types/cotizacion";

/**
 * Contacto guardado de un cliente (remitente/destinatario frecuente), pedido
 * por el cliente el 2026-10-07: "registrar sus contactos para hacer ágil el
 * proceso de documentación de su envío".
 *
 * Reutiliza `ContactoEnvio` (los campos de Remitente/Destinatario de
 * `wsGeneracionGuiaCliente`) a propósito: elegir un contacto en el paso
 * *Confirmar* de /cotizar es volcarlo tal cual al formulario.
 *
 * NO hay endpoint documentado para esto. Se preguntó a backend si es el mismo
 * catálogo que la libreta de `DomiciliosRecoleccionesCliente` o uno distinto
 * (docs/mensajes/2026-10-12-cliente.md, punto 5). Mientras tanto vive en
 * `localStorage` por usuario (ver src/lib/contactos.ts).
 */
export type ContactoGuardado = ContactoEnvio & { id: string };

export type GuardarContactoResult = { ok: true; contacto: ContactoGuardado } | { ok: false; mensaje: string };
