# ADR 0006 — Política de seguridad de contenido estática (sin nonce)

**Estado:** aceptada · **Fecha:** 2026-10-20

## Contexto
El HTML de Next.js incluye scripts en línea distintos en cada página; prohibir `unsafe-inline` exige nonce (todas las páginas dinámicas, sin CDN) o hashes (no cubren scripts en línea).

## Decisión
CSP estática en `next.config.ts` con `script-src 'self' 'unsafe-inline'`, `connect-src 'self'`, sin `eval`, `object-src 'none'`, `frame-ancestors 'none'`. Las páginas siguen siendo estáticas.

## Consecuencias
Se bloquea scripts de otros orígenes, conexiones externas y el marco en otros sitios; no se bloquea un script en línea inyectado (hoy no existe forma de inyectar HTML). Revaluar con nonce si el hosting y el presupuesto lo permiten.

## Alternativas consideradas
Nonce con proxy (páginas dinámicas); `experimental.sri` (no cubre scripts en línea).
