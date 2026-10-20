# ADR 0008 — Hosting en Vercel y salida con IP fija mediante proxy

**Estado:** aceptada · **Fecha:** 2026-09-23

## Contexto
SIBOX autoriza por IP y las funciones de Vercel no tienen IP de salida fija. Vercel Static IPs cuesta ~$100 USD/mes por proyecto.

## Decisión
Vercel (región `dfw1`) para el sitio y el BFF. Para la IP fija: proxy de salida propio en un VPS barato (decisión pendiente del jefe, B5). Mantener una salida a Docker/VPS por si hay que dejar Vercel.

## Consecuencias
Costo bajo y despliegue simple, con la complejidad extra del proxy. **Resolver B1 (Cloudflare) es independiente y sigue siendo necesario** aunque haya IP fija.

## Alternativas consideradas
Vercel Static IPs (costo); Secure Compute (Enterprise); Cloudflare Pages (no soporta el BFF dinámico).
