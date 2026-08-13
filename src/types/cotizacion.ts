/**
 * Shared shapes for the /cotizar wizard. Field names lean on the SIBOX API
 * spec (BusquedaCP, ObtieneDetalleCostos, wsGeneracionGuiaCliente — see
 * CLAUDE.md sección 4) so wiring the real endpoints later is a rename at
 * most, not a redesign.
 */

export type EntregaTipo = "sucursal" | "domicilio";
export type EnvioTipo = "paquete" | "sobre";

export type Paquete = {
  id: string;
  cantidad: number;
  peso: string;
  alto: string;
  largo: string;
  ancho: string;
};

export type Direccion = {
  cp: string;
  ciudad: string;
  colonia: string;
};

/** Step 1 — mirrors the params BusquedaCP/ObtieneDetalleCostos need. */
export type CotizacionInput = {
  entrega: EntregaTipo;
  envio: EnvioTipo;
  origen: Direccion;
  destino: Direccion;
  paquetes: Paquete[];
};

/** Step 2 — one row of ObtieneDetalleCostos-shaped output. */
export type CostoDetalleLinea = { label: string; precio: number };

export type CostoOpcion = {
  id: string;
  titulo: string;
  entregaEstimada: string;
  reservaAntes: string;
  precio: number;
  detalle: CostoDetalleLinea[];
};

/** Step 3 — mirrors Remitente/Destinatario fields in wsGeneracionGuiaCliente. */
export type ContactoEnvio = {
  nombre: string;
  cp: string;
  ciudad: string;
  colonia: string;
  direccion: string;
  numExt: string;
  numInt: string;
  telefono: string;
  email: string;
};

export type ConfirmarInput = {
  remitente: ContactoEnvio;
  destinatario: ContactoEnvio;
  contenido: string;
  tipoContenido: string;
  seguro: boolean;
};

/** Step 4 — payment sub-flow. Endpoints are marked "pendiente" in the API
 * spec (Documentacion Api Pagina WEB ver Jun26.pdf, sección Pago) — this is
 * UI scaffolding only, see src/lib/cotizacion.ts for what's actually mocked. */
export type MetodoPago = "tarjeta" | "paypal" | "efectivo" | "destinatario";

export type TarjetaInput = {
  numero: string;
  nombreTitular: string;
  vencimiento: string;
  cvv: string;
};

export type GuiaGenerada = {
  folio: string;
  fechaEnvioEstimada: string;
  fechaLlegadaEstimada: string;
};
