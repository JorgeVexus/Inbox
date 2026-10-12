# Inbox — rediseño web

Sitio de **Inbox** (paquetería y envíos, Grupo Transpaís) en Next.js 16 +
TypeScript + Tailwind v4, construido desde Figma e integrado con la API SIBOX.

**Empieza por [`INDICE_MAESTRO.md`](./INDICE_MAESTRO.md)**: estado actual, bloqueos,
qué sigue, decisiones y cómo retomar el proyecto en otra computadora o sesión.
Ese archivo debe mantenerse al día en cada sesión de trabajo (ver su §0).

## Comandos

```bash
npm install                 # Node >= 20.9
cp .env.example .env.local  # y llenar las credenciales de servicio de SIBOX
npm run dev                 # http://localhost:3000
npx tsc --noEmit && npm run lint && npm test
npm run build
```

## Documentación

| Archivo | Contenido |
|---|---|
| [`INDICE_MAESTRO.md`](./INDICE_MAESTRO.md) | Mapa y estado vivo del proyecto |
| [`CLAUDE.md`](./CLAUDE.md) | Reglas técnicas, seguridad y detalle por feature |
| [`NOTAS_PROYECTO.md`](./NOTAS_PROYECTO.md) | Síntesis autocontenida para onboarding |
| [`docs/mensajes/`](./docs/mensajes) | Mensajes ya redactados para el cliente |

Las credenciales **nunca** van en el repo: viven solo en `.env.local` (ignorado por git).
