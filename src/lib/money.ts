export function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number): string {
  return `${new Intl.NumberFormat("tr-TR").format(value)} km`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
