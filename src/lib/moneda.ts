const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "$1,234.50" (formato mexicano: coma para miles, punto decimal). Sin el sufijo MXN. */
export function formatMXN(importe: number): string {
  return MXN.format(Number.isFinite(importe) ? importe : 0);
}
