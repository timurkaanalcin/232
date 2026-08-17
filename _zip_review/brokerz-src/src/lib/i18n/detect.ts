import { browserToLocale, countryToLocale, type Locale } from "./types";

const PREF_KEY = "ubs_lang_pref_v1";

export type LangPref = {
  locale: Locale;
  /** manual = user chose; auto = geo/browser — both are remembered, never re-prompt */
  source: "manual" | "auto";
  country?: string;
  updatedAt: string;
};

export function loadLangPref(): LangPref | null {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LangPref;
    if (!parsed?.locale) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLangPref(pref: LangPref) {
  localStorage.setItem(PREF_KEY, JSON.stringify(pref));
}

export function setManualLocale(locale: Locale) {
  saveLangPref({
    locale,
    source: "manual",
    country: loadLangPref()?.country,
    updatedAt: new Date().toISOString(),
  });
}

async function detectCountryCode(): Promise<string | null> {
  const withTimeout = async (url: string, parse: (j: Record<string, unknown>) => string | null) => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 4500);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error("http");
      const j = (await r.json()) as Record<string, unknown>;
      return parse(j);
    } finally {
      window.clearTimeout(timer);
    }
  };

  try {
    const code = await withTimeout("https://ipapi.co/json/", (j) =>
      typeof j.country_code === "string" ? j.country_code : null
    );
    if (code) return code;
  } catch {
    /* next */
  }
  try {
    const code = await withTimeout("https://ipwho.is/", (j) => {
      if (j.success === false) return null;
      return typeof j.country_code === "string" ? j.country_code : null;
    });
    if (code) return code;
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Resolve locale once:
 * - remembered preference → use immediately
 * - else geo country → language
 * - else browser language
 * - else en
 * Saves result so next visits skip detection.
 */
export async function resolveLocale(): Promise<{ locale: Locale; country?: string; source: "manual" | "auto" }> {
  const existing = loadLangPref();
  if (existing?.locale) {
    return { locale: existing.locale, country: existing.country, source: existing.source };
  }

  let country: string | undefined;
  try {
    country = (await detectCountryCode()) || undefined;
  } catch {
    country = undefined;
  }

  const fromGeo = countryToLocale(country);
  const fromBrowser = browserToLocale(navigator.language || navigator.languages?.[0]);
  const locale: Locale = fromGeo || fromBrowser || "en";

  saveLangPref({
    locale,
    source: "auto",
    country,
    updatedAt: new Date().toISOString(),
  });

  return { locale, country, source: "auto" };
}
