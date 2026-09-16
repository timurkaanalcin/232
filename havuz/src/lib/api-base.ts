import { PRODUCTION_ORIGIN } from "./site";
import { loadSettings } from "./storage";

function isPackagedClient(): boolean {
  if (typeof window === "undefined") return false;
  const proto = window.location.protocol;
  return proto === "file:" || proto === "capacitor:" || proto === "app:";
}

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const injected = (window as Window & { __HAVUZ_API_BASE__?: string }).__HAVUZ_API_BASE__;
    if (injected?.trim()) return injected.trim().replace(/\/$/, "");
  }
  try {
    const fromSettings = loadSettings().apiBase?.trim();
    if (fromSettings) return fromSettings.replace(/\/$/, "");
  } catch {
    /* localStorage may be unavailable */
  }
  const fromEnv = import.meta.env.VITE_HAVUZ_API_BASE;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, "");
  if (isPackagedClient()) return PRODUCTION_ORIGIN;
  return "";
}

export function apiUrl(path: string): string {
  return `${getApiBase()}${path}`;
}
