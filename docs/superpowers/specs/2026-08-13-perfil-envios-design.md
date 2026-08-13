# Perfil de envíos — Diseño funcional y técnico

## Objetivo

Implementar la página protegida `/envio` a partir de los nodos de Figma
`388:39626`, `713:27881` y `399:19075`. La página permitirá consultar los
envíos de la cuenta, buscar y seleccionar una guía, desplegar su historial y
asignarle un nombre reconocible. La primera entrega usará datos demo detrás de
una interfaz preparada para sustituirse por el BFF cuando existan los endpoints
de cuenta e historial.

## Alcance visual

La página conservará el `Navbar`, `Footer` y `ChatWidget` globales existentes.
El contenido incluirá:

- Breadcrumb `Inicio > Mis envíos` y título `Mis envíos`.
- Acciones `Hacer un nuevo envío` y `Cotizar nuevo envío`.
- Panel lateral con buscador y lista de guías nombradas.
- Panel principal con número de guía, código de rastreo, fecha programada,
  progreso de cuatro etapas y acción para asignar o editar el nombre.
- Detalle desplegable en formato tabular con fecha, hora, ubicación y estado.
- Modal `Asigna un nombre a tu envío`, con validación y confirmación.
- Estados responsive, vacío, carga y error coherentes con el sistema visual del
  proyecto.

Los iconos y recursos ya existentes se reutilizarán cuando coincidan con
Figma. Cualquier recurso nuevo se descargará desde Figma y se guardará con un
nombre descriptivo en `public/images` o `public/icons`.

## Acceso protegido

`/envio` consultará el `AuthProvider` existente. Mientras no haya sesión no se
renderizarán datos ni detalles de envíos y se abrirá automáticamente el modal
global de inicio de sesión. Si el usuario cierra el modal sin autenticarse, se
mostrará un estado protegido con una acción para abrirlo otra vez. Tras un login
correcto, la página se habilitará sin navegación ni recarga.

Esta protección es demostrativa porque la sesión actual vive únicamente en
estado React. La integración definitiva deberá validar la sesión en el servidor
mediante cookie `Secure`, `HttpOnly` y `SameSite`, y autorizar cada guía contra
el cliente autenticado antes de devolverla. El frontend no asumirá que conocer
un número de guía concede acceso.

## Arquitectura y componentes

Se seguirá la separación existente por responsabilidad:

- `src/app/envio/page.tsx`: entrada de la ruta.
- `src/components/envio/envios-view.tsx`: puerta de sesión y coordinación de
  selección, búsqueda, carga y modal.
- Componentes enfocados dentro de `src/components/envio/` para la lista, el
  resumen/progreso, el historial y el modal de nombre.
- `src/types/envio.ts`: modelo de UI y contratos de consulta/actualización.
- `src/lib/envios.ts`: seam único usado por los componentes.
- `src/lib/mock/envios.ts`: datos demo explícitos y aislados.

Los componentes no importarán mocks directamente. `src/lib/envios.ts` expondrá
operaciones equivalentes a listar envíos, obtener detalles y asignar nombre.
Cuando el backend libere endpoints, esas funciones se sustituirán por llamadas
a Route Handlers de Next.js sin cambiar la UI.

El progreso reutilizará `pasoDesdeEstatus()` y los recursos visuales de rastreo.
El historial reutilizará el significado de `RastreoEvento`, pero su presentación
será la tabla vertical de Figma. La fecha prometida y el código alterno seguirán
identificados como aproximaciones hasta que backend confirme su fuente.

## Flujo de datos e interacción

1. La ruta comprueba la sesión cliente.
2. Sin sesión, abre el login y bloquea el contenido sensible.
3. Con sesión, solicita la lista mediante `listarEnvios()`.
4. Selecciona el primer envío disponible; el usuario puede buscar o cambiar la
   selección.
5. `Ver detalles` carga el historial solo la primera vez y permite contraerlo.
6. La acción `+` abre el modal con el nombre actual. Al aceptar un valor válido,
   `asignarNombreEnvio()` actualiza el seam y la lista refleja el resultado.

Para que la demo sobreviva a cambios de selección y recargas, el alias se
persistirá en `localStorage` con una clave limitada al usuario demo y a
la guía. No se persistirá PII ni información completa del envío. Esta solución
se reemplazará por persistencia server-side cuando exista un endpoint
autenticado.

Ambos botones superiores navegarán a `/cotizar`, que es el flujo funcional
existente para crear o cotizar un envío.

## Estados y errores

- Carga: placeholders o mensaje discreto sin mostrar información de otra
  sesión.
- Lista vacía: explicación y acciones para cotizar o crear un envío.
- Error de listado o detalle: mensaje recuperable y botón para reintentar.
- Búsqueda sin coincidencias: mensaje local sin alterar la selección original.
- Nombre vacío o demasiado largo: validación antes de llamar al seam; máximo
  explícito de 60 caracteres.
- Fallo al guardar nombre: el modal permanece abierto y muestra el error; no se
  aplica una actualización optimista falsa.

Los datos simulados llevarán una indicación visible de `Datos demo`, conforme a
las reglas del proyecto.

## Preparación del BFF y seguridad

La futura implementación server-side deberá:

- Obtener el cliente desde la sesión, nunca desde un identificador enviado por
  el navegador.
- Autorizar cada guía y su historial por objeto.
- Validar payloads y respuestas con Zod, rechazando campos extra.
- Aplicar CSRF a la mutación de nombre y rate limiting a las consultas.
- Evitar tokens, credenciales, URLs sensibles y PII completa en cliente o logs.
- Mantener el formato de error normalizado para que `src/lib/envios.ts` no
  exponga particularidades de SIBOX a los componentes.

## Pruebas y aceptación

Se incorporará infraestructura de pruebas únicamente si encaja con las reglas y
dependencias actuales. Como mínimo se cubrirán las funciones puras y los flujos
críticos posibles: filtrado, selección, validación del nombre, mapeo de estados y
aislamiento del alias por usuario/guía. El desarrollo seguirá ciclos de prueba
fallida, implementación mínima y verificación.

Antes de terminar se comprobará:

- Usuario sin sesión: apertura automática del login y ausencia de datos.
- Login correcto: acceso inmediato a la página.
- Búsqueda y selección de envíos.
- Apertura/cierre y carga del detalle.
- Asignación y edición de nombre, incluidos errores de validación.
- Navegación de ambas acciones a `/cotizar`.
- Vista de escritorio y móvil, consola del navegador sin errores.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` limpios.
- Actualización de `CLAUDE.md` y `NOTAS_PROYECTO.md` con decisiones y
  limitaciones reales.

## Fuera de alcance

- Implementar autenticación persistente o cookies reales sin el BFF.
- Inventar endpoints de historial de cuenta o asociación de guías.
- Integrar pagos, facturación o un gateway.
- Exponer datos de envíos únicamente porque el navegador conoce la guía.
