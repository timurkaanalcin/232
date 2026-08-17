import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resolveLocale, setManualLocale } from "./detect";
import { interpolate, MESSAGES, type Messages } from "./messages";
import { LOCALE_META, type Locale } from "./types";

type LocaleContextValue = {
  locale: Locale;
  ready: boolean;
  country?: string;
  source: "manual" | "auto" | "pending";
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);
  const [country, setCountry] = useState<string | undefined>();
  const [source, setSource] = useState<"manual" | "auto" | "pending">("pending");

  useEffect(() => {
    let cancelled = false;
    resolveLocale().then((res) => {
      if (cancelled) return;
      setLocaleState(res.locale);
      setCountry(res.country);
      setSource(res.source);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const meta = LOCALE_META[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setManualLocale(next);
    setLocaleState(next);
    setSource("manual");
  }, []);

  const messages = MESSAGES[locale] ?? MESSAGES.en;

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      ready,
      country,
      source,
      messages,
      setLocale,
      t: messages,
    }),
    [locale, ready, country, source, messages, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useMessages() {
  return useLocale().t;
}

export function fill(template: string, vars: Record<string, string>) {
  return interpolate(template, vars);
}

export { LOCALE_META, LOCALES } from "./types";
export type { Locale } from "./types";
