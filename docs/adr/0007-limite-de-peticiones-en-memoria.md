# ADR 0007 — Límite de peticiones en memoria detrás de una interfaz

**Estado:** aceptada · **Fecha:** 2026-10-20

## Contexto
El BFF no tenía límite de abuso; un almacén compartido (Redis) añade costo y cuenta de terceros que aún no se decide.

## Decisión
`src/lib/api/rate-limit.ts` implementa ventana fija por ruta e IP con `AlmacenMemoria`, detrás de `AlmacenLimite`. Responde 429 con `Retry-After`. Se ignora `RATE_LIMIT_DISABLED` en Vercel.

## Consecuencias
Barrera inicial útil pero **no exacta en serverless** (cada instancia cuenta aparte). Antes de producción se sustituye por un almacén compartido sin tocar las rutas (B12).

## Alternativas consideradas
No limitar (inaceptable); Redis desde el inicio (costo y cuenta pendientes).
