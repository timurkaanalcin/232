import type { AppSettings, Conversation } from "./types";

const CONV_KEY = "havuz.conversations.v1";
const SETTINGS_KEY = "havuz.settings.v1";
const ACTIVE_KEY = "havuz.active.v1";

export const DEFAULT_SETTINGS: AppSettings = {
  locale: "tr",
  systemPrompt: "",
  temperature: 0.7,
  defaultModelId: "claude-4.5-sonnet",
  apiBase: "",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadConversations(): Conversation[] {
  const rows = readJson<Conversation[]>(CONV_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

export function saveConversations(rows: Conversation[]) {
  localStorage.setItem(CONV_KEY, JSON.stringify(rows));
}

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function titleFromPrompt(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "Sohbet";
}
