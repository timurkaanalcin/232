const KEY = "ubs_referrals_v1";

export function makeReferralCode(nameOrEmail: string): string {
  const base = (nameOrEmail || "UBS").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "UBS";
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${rnd}`;
}

export function saveReferral(customerId: string, code: string, invitedBy?: string) {
  const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
    string,
    { code: string; invitedBy?: string; uses: number }
  >;
  map[customerId] = { code, invitedBy, uses: map[customerId]?.uses ?? 0 };
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getReferral(customerId: string) {
  const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
    string,
    { code: string; invitedBy?: string; uses: number }
  >;
  return map[customerId] || null;
}

export function findInviterByCode(code: string): string | null {
  const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
    string,
    { code: string; invitedBy?: string; uses: number }
  >;
  const entry = Object.entries(map).find(([, v]) => v.code.toUpperCase() === code.trim().toUpperCase());
  return entry ? entry[0] : null;
}

export function bumpReferralUse(customerId: string) {
  const map = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
    string,
    { code: string; invitedBy?: string; uses: number }
  >;
  if (!map[customerId]) return;
  map[customerId].uses = (map[customerId].uses || 0) + 1;
  localStorage.setItem(KEY, JSON.stringify(map));
}
