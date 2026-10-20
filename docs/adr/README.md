# Registro de decisiones de arquitectura (ADR)

Una decisión importante = un archivo corto: contexto, decisión, consecuencias y alternativas. Sirven para que, meses después, alguien nuevo entienda **por qué** el sistema es como es y no deshaga algo sin saber el motivo.

| # | Decisión | Fecha |
|---|---|---|
| 0001 | Capa BFF obligatoria entre el navegador y SIBOX | 2026-08-20 |
| 0002 | Patrón "seam": tipo → mock → función asíncrona | 2026-08-11 |
| 0003 | Rastreo con interruptor demo/real | 2026-10-12 |
| 0004 | Mapas con Leaflet y teselas de OpenStreetMap | 2026-08-11 |
| 0005 | Datos de cuenta de demostración en el navegador | 2026-08-13 |
| 0006 | Política de seguridad de contenido estática (sin nonce) | 2026-10-20 |
| 0007 | Límite de peticiones en memoria detrás de una interfaz | 2026-10-20 |
| 0008 | Hosting en Vercel y salida con IP fija mediante proxy | 2026-09-23 |
| 0009 | Calidad automatizada: estricto, pruebas por capas y presupuestos | 2026-10-20 |

**Cómo agregar una:** copia cualquier archivo, usa el siguiente número, y agrega la fila aquí. Si una decisión se reemplaza, no se borra: se cambia su estado a "reemplazada por ADR NNNN". Las decisiones de menor tamaño siguen yendo a la tabla de `INDICE_MAESTRO.md` §7.
