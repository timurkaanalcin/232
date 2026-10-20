/** Minimal TOTP (RFC 6238) — HMAC-SHA1, 30s, 6 digits */

function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const c of cleaned) {
    const val = alphabet.indexOf(c);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

function base32Encode(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    out += alphabet[parseInt(chunk, 2)];
  }
  return out;
}

export function generateTotpSecret(bytes = 20): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return base32Encode(arr);
}

async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, message.buffer as ArrayBuffer);
  return new Uint8Array(sig);
}

export async function generateTotp(secretBase32: string, step = 30, digits = 6): Promise<string> {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / step);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, counter); // high bits 0 for usual counters
  const hmac = await hmacSha1(key, new Uint8Array(buf));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** digits).padStart(digits, "0");
}

export async function verifyTotp(secretBase32: string, token: string, window = 1): Promise<boolean> {
  const clean = token.replace(/\s/g, "");
  for (let w = -window; w <= window; w++) {
    const step = 30;
    const counter = Math.floor(Date.now() / 1000 / step) + w;
    const key = base32Decode(secretBase32);
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setUint32(4, counter >>> 0);
    // For negative counters rare; ignore
    const hmac = await hmacSha1(key, new Uint8Array(buf));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const otp = String(code % 1_000_000).padStart(6, "0");
    if (otp === clean) return true;
  }
  return false;
}

export function totpOtpauthUrl(secret: string, email: string, issuer = "UBS"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}

const TOTP_KEY = "ubs_totp_v1";

export type TotpPref = { customerId: string; secret: string; enabled: boolean };

export function getTotpPref(customerId: string): TotpPref | null {
  try {
    const map = JSON.parse(localStorage.getItem(TOTP_KEY) || "{}") as Record<string, TotpPref>;
    return map[customerId] || null;
  } catch {
    return null;
  }
}

export function saveTotpPref(pref: TotpPref) {
  const map = JSON.parse(localStorage.getItem(TOTP_KEY) || "{}") as Record<string, TotpPref>;
  map[pref.customerId] = pref;
  localStorage.setItem(TOTP_KEY, JSON.stringify(map));
}
