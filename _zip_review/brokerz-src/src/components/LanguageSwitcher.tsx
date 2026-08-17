import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALE_META, LOCALES, useLocale, type Locale } from "@/lib/i18n/LocaleContext";

type Tone = "light" | "dark" | "brand";

interface Props {
  tone?: Tone;
  compact?: boolean;
}

const toneClass: Record<Tone, { btn: string; menu: string; item: string; active: string }> = {
  light: {
    btn: "border-black/10 bg-white text-black hover:bg-black/[0.04]",
    menu: "border-black/10 bg-white text-black shadow-xl",
    item: "hover:bg-black/[0.04]",
    active: "bg-[#E60000]/8 text-[#E60000]",
  },
  dark: {
    btn: "border-white/15 bg-white/5 text-white hover:bg-white/10",
    menu: "border-white/15 bg-[#140106] text-white shadow-xl",
    item: "hover:bg-white/8",
    active: "bg-[#E60000]/25 text-white",
  },
  brand: {
    btn: "border-black/10 bg-transparent text-black/70 hover:text-black hover:bg-black/[0.04]",
    menu: "border-black/10 bg-white text-black shadow-xl",
    item: "hover:bg-black/[0.04]",
    active: "bg-[#E60000]/8 text-[#E60000]",
  },
};

export default function LanguageSwitcher({ tone = "brand", compact }: Props) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const styles = toneClass[tone];
  const meta = LOCALE_META[locale];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t.header.language}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition ${styles.btn}`}
      >
        <Globe className="h-3.5 w-3.5 opacity-70" />
        <span className="leading-none">{meta.flag}</span>
        {!compact && <span className="uppercase tracking-wide">{locale}</span>}
        <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute end-0 top-[calc(100%+6px)] z-[90] max-h-[70vh] w-[220px] overflow-y-auto rounded-2xl border py-1.5 ${styles.menu}`}
          role="listbox"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-45">
            {t.header.language}
          </div>
          {LOCALES.map((code) => {
            const m = LOCALE_META[code];
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] ${styles.item} ${
                  active ? styles.active : ""
                }`}
              >
                <span className="text-base leading-none">{m.flag}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{m.native}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
