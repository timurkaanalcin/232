import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppTheme = "light" | "dark";

type Ctx = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const KEY = "ubs_theme_v1";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(KEY) as AppTheme | null;
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  useEffect(() => {
    localStorage.setItem(KEY, theme);
    document.documentElement.setAttribute("data-ubs-theme", theme);
  }, [theme]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme within ThemeProvider");
  return ctx;
}
