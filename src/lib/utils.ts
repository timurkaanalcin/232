import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserDateTimePreferences {
  locale: string;
  timeZone: string;
}

const COUNTRY_TIME_ZONE_FALLBACKS: Record<string, string> = {
  TR: "Europe/Istanbul",
  DE: "Europe/Berlin",
  RU: "Europe/Moscow",
  US: "America/New_York",
  GB: "Europe/London",
  FR: "Europe/Paris",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  NL: "Europe/Amsterdam",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  CN: "Asia/Shanghai",
  JP: "Asia/Tokyo",
};

function normalizeLocale(locale: string | undefined): string {
  return locale && locale.trim() ? locale : "en-US";
}

function fallbackTimeZoneForLocale(locale: string): string {
  try {
    const region = new Intl.Locale(locale).region?.toUpperCase();
    if (region && COUNTRY_TIME_ZONE_FALLBACKS[region]) return COUNTRY_TIME_ZONE_FALLBACKS[region];
  } catch {
    // Ignore malformed locale values and fall through to UTC.
  }
  return "UTC";
}

export function getUserDateTimePreferences(): UserDateTimePreferences {
  const locale =
    typeof navigator !== "undefined"
      ? normalizeLocale(navigator.languages?.[0] ?? navigator.language)
      : normalizeLocale(undefined);

  let timeZone = "";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timeZone = "";
  }

  return {
    locale,
    timeZone: timeZone || fallbackTimeZoneForLocale(locale),
  };
}

export function formatDateTime(
  ms: number | null | undefined,
  preferences: Partial<UserDateTimePreferences> = {},
): string {
  if (!ms) return "—";
  const resolved = { ...getUserDateTimePreferences(), ...preferences };
  return new Intl.DateTimeFormat(resolved.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: resolved.timeZone,
  }).format(new Date(ms));
}

export function formatTime(
  ms: number | null | undefined,
  preferences: Partial<UserDateTimePreferences> = {},
): string {
  if (!ms) return "—";
  const resolved = { ...getUserDateTimePreferences(), ...preferences };
  return new Intl.DateTimeFormat(resolved.locale, {
    timeStyle: "medium",
    timeZone: resolved.timeZone,
  }).format(new Date(ms));
}

export function formatRelative(
  ms: number | null | undefined,
  preferences: Partial<UserDateTimePreferences> = {},
): string {
  if (!ms) return "—";
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const resolved = { ...getUserDateTimePreferences(), ...preferences };
  const rtf = new Intl.RelativeTimeFormat(resolved.locale, { numeric: "auto" });
  if (abs < 60_000) return rtf.format(Math.round(diff / 1_000), "second");
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  return rtf.format(Math.round(diff / 86_400_000), "day");
}

export function formatCalendarDate(
  ms: number | null | undefined,
  preferences: Partial<UserDateTimePreferences> = {},
): string {
  if (!ms) return "—";
  const resolved = { ...getUserDateTimePreferences(), ...preferences };
  return new Intl.DateTimeFormat(resolved.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: resolved.timeZone,
  }).format(new Date(ms));
}

export function formatDuration(startMs: number, endMs: number | null): string {
  const total = Math.max(0, (endMs ?? Date.now()) - startMs);
  const s = Math.floor(total / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function formatAccuracy(meters: number | null | undefined): string {
  if (meters == null) return "—";
  return meters >= 1000 ? `±${(meters / 1000).toFixed(1)} km` : `±${Math.round(meters)} m`;
}

export function formatCoord(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toFixed(5);
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}
