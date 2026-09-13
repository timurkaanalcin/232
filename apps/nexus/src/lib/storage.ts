import type { Locale } from "./i18n";
import type { Conversation as ChatConversation } from "./types";

const CHATS_KEY = "nexus.chats.v1";
const LOCALE_KEY = "nexus.locale";
const SYSTEM_KEY = "nexus.system";
const LAST_MODEL_KEY = "nexus.lastModel";

export function loadChats(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: ChatConversation[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats.slice(0, 80)));
}

export function loadLocale(): Locale {
  const value = localStorage.getItem(LOCALE_KEY);
  return value === "en" ? "en" : "tr";
}

export function saveLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

export function loadSystem(): string {
  return localStorage.getItem(SYSTEM_KEY) ?? "";
}

export function saveSystem(value: string) {
  localStorage.setItem(SYSTEM_KEY, value);
}

export function loadLastModel(): string | null {
  return localStorage.getItem(LAST_MODEL_KEY);
}

export function saveLastModel(id: string) {
  localStorage.setItem(LAST_MODEL_KEY, id);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
