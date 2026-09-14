type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_CHAT = 24;
const MAX_MODELS = 60;

function take(key: string, max: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }
  if (current.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function limitChat(ip: string) {
  return take(`chat:${ip}`, MAX_CHAT);
}

export function limitModels(ip: string) {
  return take(`models:${ip}`, MAX_MODELS);
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}
