# ADR 0005 — Datos de cuenta de demostración en el navegador

**Estado:** aceptada · **Fecha:** 2026-08-13

## Contexto
No existen endpoints de registro, login de usuario final, contactos ni domicilios editables (B2).

## Decisión
La sesión vive solo en memoria de React y los contactos, direcciones, facturación y alias se guardan en `localStorage` por usuario, validados con Zod al leerlos (`almacen-schemas.ts`). Todo marcado como demo.

## Consecuencias
Sirve para demostrar y probar los flujos; **no es seguridad ni persistencia real**. Al llegar el backend se cambia cada seam y se retira el almacenamiento local. Hay pruebas que garantizan que datos corruptos o un almacenamiento bloqueado no rompen el sitio.

## Alternativas consideradas
Esperar al backend (bloquea el avance); cookies de sesión simuladas (falsa sensación de seguridad).
