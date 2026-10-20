# ADR 0009 — Calidad automatizada: estricto, pruebas por capas y presupuestos

**Estado:** aceptada · **Fecha:** 2026-10-20

## Contexto
La revisión 360° midió el estado del código y necesitaba que no se degradara.

## Decisión
TypeScript con banderas estrictas; ESLint con accesibilidad, seguridad y calidad; Prettier; Vitest con piso de cobertura en `src/lib` (≥ 88 %); Playwright en 4 navegadores (E2E, accesibilidad con axe, seguridad, SEO); Lighthouse con presupuestos; `knip`, `madge`, `jscpd`; CI en GitHub Actions (calidad, E2E, seguridad, rendimiento, nocturno).

## Consecuencias
Más tiempo de CI (~10 min) a cambio de detectar regresiones. Las cifras base están en `docs/fases/REVISION_360_FASES.md`; los componentes se prueban con E2E, no con pruebas unitarias.

## Alternativas consideradas
Solo lint y pruebas manuales (lo que había antes).
