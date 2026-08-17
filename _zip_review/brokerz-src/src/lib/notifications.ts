export type NotifKind = "system" | "funds" | "trade" | "security" | "support";

export interface AppNotification {
  id: string;
  customerId: string;
  title: string;
  body: string;
  kind: NotifKind;
  read: boolean;
  createdAt: string;
}

const KEY = "ubs_notifications_v1";

function uid() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadAll(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
}

export function listNotifications(customerId: string): AppNotification[] {
  return loadAll()
    .filter((n) => n.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(customerId: string): number {
  return listNotifications(customerId).filter((n) => !n.read).length;
}

import { showLocalPush, isPushEnabled } from "@/lib/push";

export function pushNotification(input: Omit<AppNotification, "id" | "read" | "createdAt"> & { read?: boolean }) {
  const n: AppNotification = {
    id: uid(),
    customerId: input.customerId,
    title: input.title,
    body: input.body,
    kind: input.kind,
    read: input.read ?? false,
    createdAt: new Date().toISOString(),
  };
  saveAll([n, ...loadAll()]);
  window.dispatchEvent(new CustomEvent("ubs-notify", { detail: n }));
  if (isPushEnabled()) showLocalPush(n.title, n.body);
  return n;
}

export function markAllRead(customerId: string) {
  const next = loadAll().map((n) => (n.customerId === customerId ? { ...n, read: true } : n));
  saveAll(next);
}

export function markRead(id: string) {
  saveAll(loadAll().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function ensureWelcomeNotif(customerId: string) {
  const existing = listNotifications(customerId);
  if (existing.some((n) => n.kind === "system" && n.title.includes("UBS"))) return;
  pushNotification({
    customerId,
    title: "UBS hesabınız hazır",
    body: "Para yatırma, işlem ve KYC özelliklerini kullanabilirsiniz.",
    kind: "system",
  });
}
