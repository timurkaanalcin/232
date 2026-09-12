const TR = "tr-TR";

export function formatPrice(value: number | null | undefined, currency = "USD"): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  try {
    return new Intl.NumberFormat(TR, {
      style: "currency",
      currency,
      maximumFractionDigits,
      minimumFractionDigits: abs >= 1 ? 2 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatCompact(value: number | null | undefined, currency?: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  const formatted = new Intl.NumberFormat(TR, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(TR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPct(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatSigned(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(TR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}`;
}

export function changeTone(value: number | null | undefined): "up" | "down" | "flat" {
  if (value == null || Math.abs(value) < 0.0001) return "flat";
  return value > 0 ? "up" : "down";
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(TR, { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function formatNewsTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "az önce";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} dk önce`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} sa önce`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} gün önce`;
  return new Intl.DateTimeFormat(TR, { dateStyle: "medium" }).format(new Date(ms));
}

export const TYPE_LABELS: Record<string, string> = {
  index: "Endeks",
  stock: "Hisse",
  etf: "ETF",
  crypto: "Kripto",
  fx: "Döviz",
  commodity: "Emtia",
};

export const REGION_LABELS: Record<string, string> = {
  us: "ABD",
  eu: "Avrupa",
  asia: "Asya",
  tr: "Türkiye",
  global: "Küresel",
};

export const CATEGORY_LABELS: Record<string, string> = {
  indexes: "Endeksler",
  stocks: "Hisseler",
  bist: "BIST",
  us: "ABD",
  europe: "Avrupa",
  asia: "Asya",
  currencies: "Döviz",
  crypto: "Kripto",
  commodities: "Emtia",
  etfs: "ETF",
};
