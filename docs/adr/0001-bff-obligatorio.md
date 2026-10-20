# ADR 0001 — Capa BFF obligatoria entre el navegador y SIBOX

**Estado:** aceptada · **Fecha:** 2026-08-20

## Contexto
La API de SIBOX no envía encabezados CORS (el preflight responde 405), exige una credencial técnica única y está detrás de Cloudflare. El navegador no puede llamarla ni debe conocer la credencial.

## Decisión
Toda llamada a SIBOX sale de Route Handlers de Next.js (`src/app/api/**`) mediante `src/lib/api/sibox-client.ts` y `proxySibox()` (`route-helpers.ts`). El navegador solo habla con este mismo sitio. La cuenta de servicio vive en variables de entorno del servidor.

## Consecuencias
Es un requisito técnico, no una preferencia. Cada ruta nueva debe validar entrada y salida con Zod (estricto), declarar su límite de peticiones y registrar errores con `logError`. Las respuestas con datos personales se reducen en el servidor (esquemas "públicos").

## Alternativas consideradas
Llamar a SIBOX desde el navegador (imposible sin CORS); proxy genérico sin validación (descartado: filtraría datos y errores internos).
