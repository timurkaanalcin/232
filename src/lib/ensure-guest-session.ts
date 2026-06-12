import { getSession, signIn } from "next-auth/react";
import { FINANCE_GUEST } from "@/lib/guest-auth";

interface ServerSession {
  user?: { id?: string; email?: string };
}

async function fetchServerSession(): Promise<ServerSession | null> {
  const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as ServerSession;
}

/**
 * Haber sitesi ziyaretçisi için oturum açar.
 * Admin oturumu açık olsa bile ziyaretçi hesabına geçer.
 */
export async function ensureGuestSession(maxMs = 10_000): Promise<void> {
  const existing = await fetchServerSession();
  if (existing?.user?.email === FINANCE_GUEST.email) return;

  const res = await signIn("credentials", {
    email: FINANCE_GUEST.email,
    password: FINANCE_GUEST.password,
    redirect: false,
  });
  if (res?.error) {
    throw new Error("Ziyaretçi oturumu açılamadı. npm run db:guest:remote çalıştırın.");
  }

  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const server = await fetchServerSession();
    if (server?.user?.email === FINANCE_GUEST.email) return;

    const client = await getSession();
    if (client?.user?.email === FINANCE_GUEST.email) return;

    await new Promise((r) => setTimeout(r, 250));
  }

  throw new Error("Oturum açıldı ama doğrulanamadı. Sayfayı yenileyip tekrar deneyin.");
}
