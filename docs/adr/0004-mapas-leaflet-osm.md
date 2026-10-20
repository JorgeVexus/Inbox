# ADR 0004 — Mapas con Leaflet y teselas de OpenStreetMap

**Estado:** aceptada · **Fecha:** 2026-08-11

## Contexto
Google Maps y Mapbox exigen cuenta y facturación que el proyecto no tenía decidida.

## Decisión
`leaflet` + `react-leaflet` cargados solo en el navegador (`next/dynamic`, `ssr:false`) y de forma diferida (`LazyMount`). Cambiar de proveedor está acotado a `cobertura-map.tsx` y a `img-src` de la CSP.

## Consecuencias
Sin costo ni llave. La política de OpenStreetMap no permite tráfico comercial intenso y expone la IP del visitante a un tercero: **hay que decidir proveedor antes de producción** (B11).

## Alternativas consideradas
Google Maps / Mapbox (cuenta y costo); imagen estática (sin interacción).
