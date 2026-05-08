export function formatNok(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "NOK"
  })
    .format(Number.isFinite(amount) ? amount : 0)
    .replace("NOK", "kr");
}

export function calculateMvaFromGross(value: string | number, vatRate = 25): number {
  const gross = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(gross) || gross <= 0) {
    return 0;
  }

  return gross - gross / (1 + vatRate / 100);
}

export function formatMvaIncluded(value: string | number, vatRate = 25): string {
  return `Herav MVA ${formatNok(calculateMvaFromGross(value, vatRate))}`;
}
