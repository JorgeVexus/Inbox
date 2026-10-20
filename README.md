# Inbox — rediseño web

Sitio de **Inbox** (paquetería y envíos, Grupo Transpaís) en Next.js 16 +
TypeScript + Tailwind v4, construido desde Figma e integrado con la API SIBOX.

**Empieza por [`INDICE_MAESTRO.md`](./INDICE_MAESTRO.md)**: estado actual, bloqueos,
qué sigue, decisiones y cómo retomar el proyecto en otra computadora o sesión.
Ese archivo debe mantenerse al día en cada sesión de trabajo (ver su §0).

## Primeros pasos

```bash
npm install                 # Node 20.9 o superior
npm run dev                 # http://localhost:3000 — funciona sin credenciales (modo demo)
npx tsc --noEmit && npm run lint && npm test
npm run build
```

Para usar la API real de SIBOX: `cp .env.example .env.local` y llena las
credenciales de servicio (se piden por canal seguro; **nunca** van en el repo).
Sin ellas el sitio corre con datos de demostración, marcados como tales en pantalla.

## Documentación

| Archivo | Contenido |
|---|---|
| [`INDICE_MAESTRO.md`](./INDICE_MAESTRO.md) | Mapa y estado vivo del proyecto (**leer primero**) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Cómo trabajar aquí: flujo, reglas, estilo |
| [`CLAUDE.md`](./CLAUDE.md) | Reglas técnicas, seguridad y detalle por feature |
| [`NOTAS_PROYECTO.md`](./NOTAS_PROYECTO.md) | Síntesis autocontenida para onboarding |
| [`docs/adr/`](./docs/adr) | Decisiones de arquitectura y su porqué |
| [`docs/DICCIONARIO_SEAMS.md`](./docs/DICCIONARIO_SEAMS.md) | Qué dato viene de dónde y cómo conectar la API real |
| [`docs/PRUEBAS.md`](./docs/PRUEBAS.md) | Guía de pruebas automáticas |
| [`docs/DESPLIEGUE.md`](./docs/DESPLIEGUE.md) | Ambientes, variables de entorno y checklist de salida a producción |
| [`docs/RUNBOOKS.md`](./docs/RUNBOOKS.md) | Qué hacer cuando algo falla (SIBOX, Cloudflare, rollback, datos) |
| [`docs/legal/`](./docs/legal) | Borradores para Legal: aviso de privacidad, términos, ARCO, retención |
| [`docs/uat/`](./docs/uat) | Kit de pruebas con usuarios reales |
| [`docs/fases/REVISION_360_FASES.md`](./docs/fases/REVISION_360_FASES.md) | Bitácora de la revisión 360° (calidad, seguridad, rendimiento, operación) |
| [`docs/PLAN_REVISION_360.md`](./docs/PLAN_REVISION_360.md) | Plan de esa revisión |
| [`docs/mensajes/`](./docs/mensajes) | Mensajes ya redactados para el cliente |

Las credenciales **nunca** van en el repo: viven solo en `.env.local` (ignorado por git).
