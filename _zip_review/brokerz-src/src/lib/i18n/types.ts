export const LOCALES = ["en", "tr", "de", "fr", "es", "ar", "ru", "pt", "it", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { label: string; native: string; flag: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  tr: { label: "Turkish", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  fr: { label: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  es: { label: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr" },
  ar: { label: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  ru: { label: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  pt: { label: "Portuguese", native: "Português", flag: "🇧🇷", dir: "ltr" },
  it: { label: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  zh: { label: "Chinese", native: "中文", flag: "🇨🇳", dir: "ltr" },
};

/** ISO country → default site language */
export const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  TR: "tr",
  CY: "tr",
  DE: "de",
  AT: "de",
  LI: "de",
  CH: "de",
  FR: "fr",
  BE: "fr",
  LU: "fr",
  MC: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  UY: "es",
  PY: "es",
  BO: "es",
  CR: "es",
  PA: "es",
  GT: "es",
  HN: "es",
  NI: "es",
  SV: "es",
  DO: "es",
  CU: "es",
  SA: "ar",
  AE: "ar",
  EG: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  LB: "ar",
  IQ: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LY: "ar",
  YE: "ar",
  SY: "ar",
  PS: "ar",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  KG: "ru",
  UZ: "ru",
  UA: "ru",
  BR: "pt",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  IT: "it",
  SM: "it",
  VA: "it",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  SG: "zh",
  US: "en",
  GB: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  CA: "en",
  ZA: "en",
  IN: "en",
  PH: "en",
  NG: "en",
  KE: "en",
  GH: "en",
  MY: "en",
  NL: "en",
  SE: "en",
  NO: "en",
  DK: "en",
  FI: "en",
  PL: "en",
  CZ: "en",
  RO: "en",
  GR: "en",
  JP: "en",
  KR: "en",
};

export function browserToLocale(tag?: string): Locale | null {
  if (!tag) return null;
  const low = tag.toLowerCase();
  const primary = low.split("-")[0];
  if ((LOCALES as readonly string[]).includes(primary)) return primary as Locale;
  if (low.startsWith("zh")) return "zh";
  if (low.startsWith("pt")) return "pt";
  return null;
}

export function countryToLocale(countryCode?: string | null): Locale | null {
  if (!countryCode) return null;
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? null;
}
