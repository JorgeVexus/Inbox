# Cómo contribuir

Guía corta para quien se une al proyecto. Lo esencial está aquí; el detalle técnico en [`CLAUDE.md`](./CLAUDE.md) y el estado del proyecto en [`INDICE_MAESTRO.md`](./INDICE_MAESTRO.md).

## 1. Empezar (≈ 15 minutos)

```bash
git clone https://github.com/JorgeVexus/Inbox.git && cd Inbox   # el código está en la raíz del repositorio
npm install                  # Node 20.9 o superior (se usa 22)
npm run dev                  # http://localhost:3000 — funciona sin credenciales (modo demo)
npx tsc --noEmit && npm run lint && npm test    # todo debe salir en verde
```
Para hablar con SIBOX de verdad hace falta `.env.local` (copia `.env.example`); la contraseña **no** está en el repositorio: pídela a quien la custodie por el gestor de contraseñas.

## 2. Cómo trabajamos

1. **Una rama por cambio** (`fix/…`, `feat/…`) y un *pull request* a `main`. No se sube directo a `main`.
2. **El CI debe pasar** (tipos, lint, formato, pruebas con cobertura, código muerto, build, E2E, seguridad).
3. **Mensajes de commit** en español, en presente, que digan el *porqué* ("Corrige la fecha de recolección después de las 6 pm"), no solo el *qué*.
4. **Antes de pedir revisión:** `npx tsc --noEmit && npm run lint && npm test`, y si tocaste pantallas o rutas, `npm run build && npm run test:e2e:chrome` (ver [`docs/PRUEBAS.md`](./docs/PRUEBAS.md)).
5. **Al cerrar una sesión de trabajo:** actualiza `INDICE_MAESTRO.md` (fecha, estado, bloqueos, qué sigue, bitácora). Si el código y el índice se contradicen, gana el código.

## 3. Reglas que no se negocian

Resumen de `CLAUDE.md` §5 y `INDICE_MAESTRO.md` §8:

- **Ninguna credencial** en el repositorio, en documentos, en commits o en chats; solo en `.env.local` y en Vercel.
- **Todo lo de SIBOX pasa por el BFF** (`src/app/api/**` con `proxySibox()`); el navegador jamás ve la credencial ni la URL de la API. Nada sensible en variables `NEXT_PUBLIC_*`.
- **Rutas nuevas del BFF:** esquemas Zod estrictos, `limite` de peticiones, `maxDuration`, y errores con `logError` (que enmascara datos personales).
- **Nunca registres** (log) contraseñas, tokens, correos, teléfonos, RFC ni direcciones.
- **Todo dato pasa por un *seam*** (`src/lib/*.ts`); los componentes no importan de `src/lib/mock/`. Lo simulado se ve como simulado ("Datos de demostración"). Ver [`docs/DICCIONARIO_SEAMS.md`](./docs/DICCIONARIO_SEAMS.md).
- **Comprar una guía nunca exige registro.**
- `procesarPago()` **no** se conecta a una pasarela sin una decisión explícita.
- Todo texto de la interfaz en **español**; colores solo con los tokens de `globals.css`; reutiliza antes de crear (`components/ui`, `components/layout`).
- Los formularios que piden datos personales llevan el aviso de privacidad corto (`AvisoPrivacidadCorto`).

## 4. Estilo

- Componentes en PascalCase, archivos en kebab-case; `"use client"` solo si hay estado o interacción.
- Prettier decide el formato (`npm run qa:formato`); ESLint decide el resto. Los avisos de complejidad/tamaño son deuda visible: **cada vez que toques una función marcada, pártela**.
- Rendimiento: no importes `zod` en código que cargue Home o el layout; las fotos del banner van por `components/ui/fotos-hero.tsx`; un marcador de `Suspense` debe medir lo mismo que el contenido real; `preload` (no `priority`) en el `Image` del LCP.
- Seguridad de la interfaz: nada de `dangerouslySetInnerHTML` con texto de la persona; cada `eslint-disable` lleva una línea que explica por qué.

## 5. Decisiones

Las decisiones de arquitectura viven en [`docs/adr/`](./docs/adr); las de proyecto, en `INDICE_MAESTRO.md` §7. Una decisión nueva importante = un ADR.

## 6. Despliegue y operación

[`docs/DESPLIEGUE.md`](./docs/DESPLIEGUE.md) (ambientes, variables, checklist de corte) y [`docs/RUNBOOKS.md`](./docs/RUNBOOKS.md) (qué hacer cuando algo falla). Antes de producción lee [`docs/legal/`](./docs/legal) y `INDICE_MAESTRO.md` §5.
