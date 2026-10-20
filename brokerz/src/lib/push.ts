/** Web Push helpers — uses Notification API + SW; full VAPID when configured */

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function subscribePush(): Promise<{ ok: boolean; error?: string }> {
  try {
    const perm = await ensureNotificationPermission();
    if (perm !== "granted") return { ok: false, error: "Permission denied" };
    if (!("serviceWorker" in navigator)) return { ok: false, error: "No SW" };
    const reg = await navigator.serviceWorker.ready;
    if (VAPID_PUBLIC && "PushManager" in window) {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      localStorage.setItem("ubs_push_sub_v1", JSON.stringify(sub.toJSON()));
    }
    localStorage.setItem("ubs_push_enabled_v1", "1");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fail" };
  }
}

export function isPushEnabled() {
  return localStorage.getItem("ubs_push_enabled_v1") === "1";
}

export function showLocalPush(title: string, body: string) {
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
  } catch {
    /* ignore */
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
