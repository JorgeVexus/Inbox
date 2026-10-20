# ADR 0003 — Rastreo con interruptor demo/real

**Estado:** aceptada · **Fecha:** 2026-10-12

## Contexto
Cloudflare bloquea al servidor (B1) y el sitio debía poder verse en previews aunque SIBOX no fuera alcanzable.

## Decisión
`NEXT_PUBLIC_SIBOX_REAL=1` activa el rastreo real; sin ella el rastreo usa datos simulados y avisa en pantalla. Es una bandera de comportamiento, no un secreto, por eso puede ser `NEXT_PUBLIC_*`.

## Consecuencias
El sitio nunca queda roto por una dependencia externa en desarrollo/preview. En producción debe estar activa y **no** se usa el modo demo para tapar una caída (`docs/RUNBOOKS.md` R1).

## Alternativas consideradas
Fallar con error mientras B1 siga abierto (impide demostrar); simular silenciosamente (engaña).
