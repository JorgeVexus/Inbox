# Perfil de envíos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/envio` como perfil protegido de envíos, fiel a Figma, funcional con datos demo y desacoplado para conectar posteriormente el BFF.

**Architecture:** La ruta delega en una vista cliente que aplica la puerta de sesión y coordina componentes enfocados. Toda lectura y mutación pasa por `src/lib/envios.ts`; los mocks y la persistencia demo quedan aislados, de modo que el reemplazo por Route Handlers no cambie la UI.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest para lógica pura.

---

## Estructura de archivos

- Crear `src/app/envio/page.tsx`: entrada Server Component de `/envio`.
- Crear `src/types/envio.ts`: modelo del perfil y resultados normalizados.
- Crear `src/lib/mock/envios.ts`: inventario demo asociado a la cuenta.
- Crear `src/lib/envios.ts`: seam de listado, detalle y alias.
- Crear `src/lib/envios.test.ts`: pruebas de filtrado, validación y aislamiento de alias.
- Crear `src/components/envio/envios-view.tsx`: sesión, carga y estado coordinador.
- Crear `src/components/envio/envios-lista.tsx`: buscador y selección.
- Crear `src/components/envio/envio-resumen.tsx`: datos y progreso.
- Crear `src/components/envio/envio-historial.tsx`: tabla expandible.
- Crear `src/components/envio/nombre-envio-modal.tsx`: edición validada del alias.
- Modificar `package.json` y `package-lock.json`: comando y dependencia de Vitest.
- Modificar `CLAUDE.md` y `NOTAS_PROYECTO.md`: registrar implementación y límites.

### Task 1: Infraestructura mínima de pruebas

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Instalar Vitest y agregar el script**

Run: `npm install --save-dev vitest`

Agregar a `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Verificar el runner vacío**

Run: `npm test -- --passWithNoTests`

Expected: exit code `0`, sin suites fallidas.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "test: agregar vitest al proyecto"
```

### Task 2: Contrato y funciones puras de envíos

**Files:**
- Create: `src/types/envio.ts`
- Create: `src/lib/envios.test.ts`
- Create: `src/lib/envios.ts`

- [ ] **Step 1: Definir el modelo de dominio de UI**

Crear `src/types/envio.ts`:

```ts
import type { Rastreo, RastreoEvento } from "@/types/rastreo";

export type EnvioPerfil = {
  guia: string;
  nombre: string;
  rastreo: Rastreo;
  fechaProgramada: string;
};

export type EnvioDetalle = {
  guia: string;
  eventos: RastreoEvento[];
};

export type GuardarNombreResult =
  | { ok: true; nombre: string }
  | { ok: false; mensaje: string };
```

- [ ] **Step 2: Escribir pruebas fallidas para nombre y filtro**

Crear `src/lib/envios.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { filtrarEnvios, validarNombreEnvio } from "@/lib/envios";
import type { EnvioPerfil } from "@/types/envio";

const envios = [
  { guia: "4003229791", nombre: "Paquete ropa" },
  { guia: "4159473741", nombre: "Documentos" },
] as EnvioPerfil[];

describe("validarNombreEnvio", () => {
  it("rechaza nombres vacíos", () => {
    expect(validarNombreEnvio("   ")).toEqual({ ok: false, mensaje: "Escribe un nombre para tu envío." });
  });

  it("rechaza nombres mayores a 60 caracteres", () => {
    expect(validarNombreEnvio("a".repeat(61)).ok).toBe(false);
  });

  it("normaliza espacios de un nombre válido", () => {
    expect(validarNombreEnvio("  Paquete   para mamá ")).toEqual({ ok: true, nombre: "Paquete para mamá" });
  });
});

describe("filtrarEnvios", () => {
  it("busca por alias sin distinguir mayúsculas", () => {
    expect(filtrarEnvios(envios, "ROPA")).toHaveLength(1);
  });

  it("busca por número de guía", () => {
    expect(filtrarEnvios(envios, "415947")[0]?.nombre).toBe("Documentos");
  });
});
```

- [ ] **Step 3: Ejecutar y comprobar RED**

Run: `npm test -- src/lib/envios.test.ts`

Expected: FAIL porque `@/lib/envios` todavía no existe.

- [ ] **Step 4: Implementar las funciones mínimas**

Crear inicialmente `src/lib/envios.ts`:

```ts
import type { EnvioPerfil, GuardarNombreResult } from "@/types/envio";

export function validarNombreEnvio(valor: string): GuardarNombreResult {
  const nombre = valor.trim().replace(/\s+/g, " ");
  if (!nombre) return { ok: false, mensaje: "Escribe un nombre para tu envío." };
  if (nombre.length > 60) return { ok: false, mensaje: "El nombre puede tener hasta 60 caracteres." };
  return { ok: true, nombre };
}

export function filtrarEnvios(envios: EnvioPerfil[], consulta: string): EnvioPerfil[] {
  const termino = consulta.trim().toLocaleLowerCase("es-MX");
  if (!termino) return envios;
  return envios.filter((envio) =>
    `${envio.nombre} ${envio.guia}`.toLocaleLowerCase("es-MX").includes(termino),
  );
}
```

- [ ] **Step 5: Ejecutar y comprobar GREEN**

Run: `npm test -- src/lib/envios.test.ts`

Expected: todas las pruebas PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/envio.ts src/lib/envios.ts src/lib/envios.test.ts
git commit -m "feat: definir contrato del perfil de envios"
```

### Task 3: Seam demo con persistencia aislada

**Files:**
- Create: `src/lib/mock/envios.ts`
- Modify: `src/lib/envios.test.ts`
- Modify: `src/lib/envios.ts`

- [ ] **Step 1: Añadir una prueba fallida para la clave de alias**

Agregar a `src/lib/envios.test.ts`:

```ts
import { claveAliasEnvio } from "@/lib/envios";

it("aísla el alias por usuario y guía", () => {
  expect(claveAliasEnvio("INBOX", "4003229791")).toBe("inbox:envio-alias:INBOX:4003229791");
  expect(claveAliasEnvio("OTRO", "4003229791")).not.toBe(claveAliasEnvio("INBOX", "4003229791"));
});
```

- [ ] **Step 2: Ejecutar y comprobar RED**

Run: `npm test -- src/lib/envios.test.ts`

Expected: FAIL porque `claveAliasEnvio` no está exportada.

- [ ] **Step 3: Crear inventario demo y completar el seam**

`src/lib/mock/envios.ts` debe combinar las guías existentes `4003229791`,
`4159473741` y `4157067169` de `MOCK_RASTREOS`, con alias iniciales y una
fecha programada claramente marcada como aproximación. `src/lib/envios.ts`
debe exportar exactamente:

```ts
export function claveAliasEnvio(usuario: string, guia: string): string;
export async function listarEnvios(usuario: string): Promise<EnvioPerfil[]>;
export async function obtenerDetalleEnvio(guia: string): Promise<EnvioDetalle | null>;
export async function asignarNombreEnvio(usuario: string, guia: string, valor: string): Promise<GuardarNombreResult>;
```

`listarEnvios()` leerá el alias desde `localStorage` solo si `window` existe;
`asignarNombreEnvio()` validará antes de persistir. Ningún componente importará
`src/lib/mock/envios.ts`.

- [ ] **Step 4: Ejecutar pruebas y comprobación de tipos**

Run: `npm test -- src/lib/envios.test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock/envios.ts src/lib/envios.ts src/lib/envios.test.ts
git commit -m "feat: agregar seam demo de envios"
```

### Task 4: Lista, progreso e historial

**Files:**
- Create: `src/components/envio/envios-lista.tsx`
- Create: `src/components/envio/envio-resumen.tsx`
- Create: `src/components/envio/envio-historial.tsx`

- [ ] **Step 1: Construir `EnviosLista`**

Implementar un componente controlado con props:

```ts
type EnviosListaProps = {
  envios: EnvioPerfil[];
  seleccionado: string | null;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  onSeleccionar: (guia: string) => void;
};
```

Debe usar `next/image`, `/icons/search2.svg` y los iconos de estado existentes;
mostrar `Guías`, input accesible, resultado vacío y selección naranja tal como
Figma. No debe tener conocimiento de autenticación ni mocks.

- [ ] **Step 2: Construir `EnvioResumen`**

Implementar con props:

```ts
type EnvioResumenProps = {
  envio: EnvioPerfil;
  detalleAbierto: boolean;
  onToggleDetalle: () => void;
  onEditarNombre: () => void;
};
```

Reutilizar `pasoDesdeEstatus`, los cuatro iconos de rastreo y las clases/tokens
existentes. El botón `+` tendrá etiqueta accesible; `Ver detalles` reflejará el
estado expandido.

- [ ] **Step 3: Construir `EnvioHistorial`**

Implementar con props:

```ts
type EnvioHistorialProps = {
  eventos: RastreoEvento[];
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
};
```

Agrupar visualmente eventos por fecha, separar fecha y hora de `F_Estatus`, y
presentar columnas `Fecha`, `Hora`, `Ubicación`, `Estado`. En móvil, convertir
cada fila a una cuadrícula legible sin desplazamiento horizontal obligatorio.

- [ ] **Step 4: Verificar compilación y lint**

Run: `npx tsc --noEmit`

Run: `npm run lint`

Expected: ambos exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/envio/envios-lista.tsx src/components/envio/envio-resumen.tsx src/components/envio/envio-historial.tsx
git commit -m "feat: construir paneles del perfil de envios"
```

### Task 5: Modal para asignar nombre

**Files:**
- Create: `src/components/envio/nombre-envio-modal.tsx`

- [ ] **Step 1: Construir modal desmontable**

Usar el mismo patrón de `login-modal.tsx`: el wrapper retorna `null` cuando
está cerrado y monta un formulario fresco al abrir. Contrato:

```ts
type NombreEnvioModalProps = {
  abierto: boolean;
  nombreInicial: string;
  guardando: boolean;
  error: string | null;
  onCerrar: () => void;
  onGuardar: (nombre: string) => void;
};
```

Debe reproducir Figma `399:19075`, cerrar con Escape/backdrop, enlazar `label`
e `input`, usar `maxLength={60}`, mostrar contador y error con `role="alert"`,
y bloquear `Aceptar` durante guardado.

- [ ] **Step 2: Verificar tipos y lint**

Run: `npx tsc --noEmit`

Run: `npm run lint`

Expected: ambos exit code `0`.

- [ ] **Step 3: Commit**

```bash
git add src/components/envio/nombre-envio-modal.tsx
git commit -m "feat: agregar modal de nombre de envio"
```

### Task 6: Puerta de sesión y página integrada

**Files:**
- Create: `src/components/envio/envios-view.tsx`
- Create: `src/app/envio/page.tsx`

- [ ] **Step 1: Crear la entrada de ruta**

`src/app/envio/page.tsx`:

```tsx
import { EnviosView } from "@/components/envio/envios-view";

export default function EnvioPage() {
  return <EnviosView />;
}
```

- [ ] **Step 2: Implementar la coordinación protegida**

`EnviosView` debe:

- llamar `openLogin()` una sola vez al montar sin sesión;
- no invocar `listarEnvios()` ni renderizar información sensible sin sesión;
- mostrar un estado bloqueado con botón `Iniciar sesión` si el popup se cierra;
- cargar la lista al autenticarse y seleccionar el primer envío;
- derivar el filtro con `filtrarEnvios()`;
- cargar detalles bajo demanda, cacheados por guía;
- abrir el modal, guardar mediante `asignarNombreEnvio()` y actualizar el estado
  solo después de éxito;
- mostrar la insignia `Datos demo`;
- usar `Button` con `href="/cotizar"` para ambas acciones;
- incluir breadcrumb, título, composición responsive y la imagen decorativa ya
  existente que mejor coincida, sin duplicar Navbar/Footer/ChatWidget.

Para la apertura automática, usar un `useRef` como guard para evitar aperturas
repetidas; el efecto depende de `session` y `openLogin`.

- [ ] **Step 3: Verificar tipos y lint**

Run: `npx tsc --noEmit`

Run: `npm run lint`

Expected: ambos exit code `0`.

- [ ] **Step 4: Commit**

```bash
git add src/app/envio/page.tsx src/components/envio/envios-view.tsx
git commit -m "feat: agregar pagina protegida de envios"
```

### Task 7: Verificación visual e interacción

**Files:**
- Modify as required: `src/components/envio/*.tsx`

- [ ] **Step 1: Levantar el servidor y abrir `/envio`**

Run: `npm run dev`

Expected: servidor disponible en `http://localhost:3000`.

- [ ] **Step 2: Probar protección y login**

Abrir `/envio` sin sesión: el modal aparece y no se ven guías. Cerrar el modal:
se ve el estado protegido. Abrirlo otra vez e iniciar con `INBOX` / `Prueba`:
el contenido aparece sin recarga.

- [ ] **Step 3: Probar interacción principal**

Buscar por alias y guía, seleccionar los tres estados, abrir/cerrar detalle,
asignar un alias, recargar y confirmar persistencia. Verificar nombre vacío y
mayor a 60 caracteres. Comprobar ambos botones hacia `/cotizar`.

- [ ] **Step 4: Comparar con Figma en escritorio y móvil**

Tomar capturas de toda la página a 1440px y 390px; revisar consola; ajustar
espaciado, tamaños, sombras, jerarquía y wrapping usando exclusivamente tokens
existentes. Confirmar que el historial coincide con `713:27881` y el modal con
`399:19075`.

- [ ] **Step 5: Commit de ajustes visuales**

```bash
git add src/components/envio
git commit -m "style: ajustar perfil de envios a figma"
```

### Task 8: Documentación y verificación final

**Files:**
- Modify: `CLAUDE.md`
- Modify: `NOTAS_PROYECTO.md`

- [ ] **Step 1: Documentar estado real**

Registrar `/envio`, sus nodos Figma, protección demo, credenciales demo,
persistencia local del alias, seams disponibles y la obligación de autorización
por objeto al conectar el BFF. No presentar la sesión cliente como seguridad
real.

- [ ] **Step 2: Ejecutar la suite completa**

Run: `npm test`

Run: `npx tsc --noEmit`

Run: `npm run lint`

Run: `npm run build`

Expected: todos exit code `0`, sin errores ni warnings nuevos.

- [ ] **Step 3: Revisar cambios y commit final**

Run: `git diff --check`

Run: `git status --short`

```bash
git add CLAUDE.md NOTAS_PROYECTO.md
git commit -m "docs: registrar perfil de envios"
```

- [ ] **Step 4: Publicar siguiendo el flujo del proyecto**

Run: `git push origin main`

Expected: `main` actualizado en `origin`.

