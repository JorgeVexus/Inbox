# ADR 0002 — Patrón "seam": tipo → mock → función asíncrona

**Estado:** aceptada · **Fecha:** 2026-08-11

## Contexto
El backend no estaba listo (pagos, registro, historial) y había que demostrar avances cada semana sin rehacer pantallas después.

## Decisión
Cada dato pasa por una función en `src/lib/*.ts` (el "seam") que hoy lee de `src/lib/mock/*` y mañana llama al BFF. Los componentes nunca importan mocks. Los mocks tienen la forma exacta de la API real.

## Consecuencias
Conectar un endpoint es cambiar un archivo. Riesgo: que un mock llegue a producción creyéndose real; por eso lo simulado se marca "Datos de demostración" en la interfaz (B9). El inventario de seams está en `docs/DICCIONARIO_SEAMS.md`.

## Alternativas consideradas
Llamar a un API simulada con MSW (más pesado); datos fijos dentro de los componentes (imposible de conectar después).
