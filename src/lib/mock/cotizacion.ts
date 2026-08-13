import type {
  CostoOpcion,
  CotizacionInput,
  Paquete,
} from "@/types/cotizacion";

/**
 * MOCK pricing — placeholder for `ObtieneDetalleCostos`. The formula below
 * is not SIBOX's real rate table, just something weight/size-sensitive
 * enough to feel real in a demo. Delete once `obtenerCotizacion()` in
 * `../cotizacion.ts` calls the BFF instead.
 */
export function calcularCostoMock(input: CotizacionInput): CostoOpcion[] {
  const pesoTotal = input.paquetes.reduce(
    (sum, p) => sum + (Number(p.peso) || 0) * p.cantidad,
    0,
  );
  const volumenTotal = input.paquetes.reduce((sum, p) => {
    const alto = Number(p.alto) || 0;
    const largo = Number(p.largo) || 0;
    const ancho = Number(p.ancho) || 0;
    return sum + ((alto * largo * ancho) / 5000) * p.cantidad;
  }, 0);

  const base = 120;
  const flete = base + Math.max(pesoTotal, volumenTotal) * 8.5;
  const servicios = 4.31;
  const subtotal = flete + servicios;
  const iva = subtotal * 0.16;
  const total = Math.round((subtotal + iva) * 100) / 100;

  const entregaEstimada = "Sáb, 02 de agosto";
  const reservaAntes =
    "Reserve antes de la(s) 03:00 PM para su recolección hoy mismo";

  const detalle = (label: string): CostoOpcion["detalle"] => [
    { label: "Flete", precio: Math.round(flete * 100) / 100 },
    { label: "Servicios", precio: servicios },
    { label: "IVA (16%)", precio: Math.round(iva * 100) / 100 },
    { label, precio: total },
  ];

  return [
    {
      id: "domicilio",
      titulo: "Recolección de paquete a domicilio",
      entregaEstimada,
      reservaAntes,
      precio: total + 45.69,
      detalle: detalle("Total con recolección"),
    },
    {
      id: "sucursal",
      titulo: "Entregar paquete en sucursal",
      entregaEstimada,
      reservaAntes,
      precio: total,
      detalle: detalle("Total"),
    },
  ];
}

export function pesoTotalPaquetes(paquetes: Paquete[]): number {
  return paquetes.reduce((sum, p) => sum + (Number(p.peso) || 0) * p.cantidad, 0);
}
