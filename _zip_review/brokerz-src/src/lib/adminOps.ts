import { getKyc, saveKyc, type KycRecord, type KycStatus } from "@/lib/kyc";
import { listFundOps, type FundOperation } from "@/lib/funds";
import { pushNotification } from "@/lib/notifications";
import { updateCustomerBalance, getCustomerSession } from "@/lib/customerAuth";

const CUSTOMERS_KEY = "ubs_customers_v2";
const TICKETS_KEY = "ubs_support_tickets_v1";
const FREEZE_KEY = "ubs_frozen_accounts_v1";
const FUNDS_KEY = "ubs_fund_ops_v1";
const KYC_KEY = "ubs_kyc_v1";

export type SupportTicket = {
  id: string;
  customerId?: string;
  email?: string;
  name?: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "closed";
  messages: { role: "user" | "agent" | "bot"; text: string; at: string }[];
  createdAt: string;
  updatedAt: string;
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listAllCustomers(): { id: string; email: string; name: string; balance: number; accountNumber: string; frozen?: boolean }[] {
  const list = loadJson<Record<string, unknown>[]>(CUSTOMERS_KEY, []);
  const frozen = new Set(loadJson<string[]>(FREEZE_KEY, []));
  return list.map((c) => ({
    id: String(c.id),
    email: String(c.email),
    name: String(c.name ?? ""),
    balance: Number(c.balance ?? 0),
    accountNumber: String(c.accountNumber ?? ""),
    frozen: frozen.has(String(c.id)),
  }));
}

export function listAllKyc(): (KycRecord & { email?: string; name?: string })[] {
  const map = loadJson<Record<string, KycRecord>>(KYC_KEY, {});
  const customers = listAllCustomers();
  return Object.values(map).map((k) => {
    const c = customers.find((x) => x.id === k.customerId);
    return { ...k, email: c?.email, name: c?.name || k.fullName };
  });
}

export function adminSetKycStatus(customerId: string, status: Extract<KycStatus, "approved" | "rejected" | "pending">, note?: string) {
  const current = getKyc(customerId);
  const next = saveKyc({
    ...current,
    status,
    reviewedAt: new Date().toISOString(),
    note: note || (status === "approved" ? "Kimlik doğrulandı." : "Belgeler reddedildi. Lütfen yeniden yükleyin."),
  });
  pushNotification({
    customerId,
    title: status === "approved" ? "KYC onaylandı" : status === "rejected" ? "KYC reddedildi" : "KYC güncellendi",
    body: next.note || "",
    kind: "security",
  });
  return next;
}

export function listPendingWithdrawals(): FundOperation[] {
  return listFundOpsAll().filter((o) => o.type === "withdraw" && o.status === "pending");
}

function listFundOpsAll(): FundOperation[] {
  return loadJson<FundOperation[]>(FUNDS_KEY, []);
}

function saveFundOps(list: FundOperation[]) {
  saveJson(FUNDS_KEY, list);
}

export function adminResolveWithdraw(opId: string, decision: "completed" | "rejected") {
  const all = listFundOpsAll();
  const idx = all.findIndex((o) => o.id === opId);
  if (idx < 0) return { ok: false as const, error: "Not found" };
  const op = all[idx];
  if (op.status !== "pending") return { ok: false as const, error: "Already resolved" };

  if (decision === "rejected") {
    // refund
    const customers = loadJson<Record<string, unknown>[]>(CUSTOMERS_KEY, []);
    const ci = customers.findIndex((c) => String(c.id) === op.customerId);
    if (ci >= 0) {
      const bal = Number(customers[ci].balance ?? 0) + op.amount;
      customers[ci] = { ...customers[ci], balance: Math.round(bal * 100) / 100 };
      saveJson(CUSTOMERS_KEY, customers);
      updateCustomerBalance(op.customerId, Math.round(bal * 100) / 100);
    }
  }

  all[idx] = { ...op, status: decision };
  saveFundOps(all);
  pushNotification({
    customerId: op.customerId,
    title: decision === "completed" ? "Çekim onaylandı" : "Çekim reddedildi",
    body:
      decision === "completed"
        ? `$${op.amount.toFixed(2)} hesabınıza aktarılıyor.`
        : `$${op.amount.toFixed(2)} bakiyenize iade edildi.`,
    kind: "funds",
  });
  return { ok: true as const, op: all[idx] };
}

export function createSupportTicket(input: {
  customerId?: string;
  email?: string;
  name?: string;
  subject: string;
  message: string;
}): SupportTicket {
  const now = new Date().toISOString();
  const t: SupportTicket = {
    id: `t_${Date.now()}`,
    customerId: input.customerId,
    email: input.email,
    name: input.name,
    subject: input.subject,
    message: input.message,
    status: "open",
    messages: [
      { role: "user", text: input.message, at: now },
      { role: "bot", text: "Talebiniz oluşturuldu. Bir temsilci en kısa sürede yanıtlayacak.", at: now },
    ],
    createdAt: now,
    updatedAt: now,
  };
  const all = [t, ...loadJson<SupportTicket[]>(TICKETS_KEY, [])];
  saveJson(TICKETS_KEY, all.slice(0, 200));
  if (input.customerId) {
    pushNotification({
      customerId: input.customerId,
      title: "Destek talebi açıldı",
      body: input.subject,
      kind: "support",
    });
  }
  return t;
}

export function listSupportTickets(): SupportTicket[] {
  return loadJson<SupportTicket[]>(TICKETS_KEY, []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function replySupportTicket(id: string, text: string, role: "agent" | "user" = "agent") {
  const all = listSupportTickets();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  all[idx] = {
    ...all[idx],
    status: role === "agent" ? "pending" : "open",
    updatedAt: now,
    messages: [...all[idx].messages, { role, text, at: now }],
  };
  saveJson(TICKETS_KEY, all);
  if (role === "agent" && all[idx].customerId) {
    pushNotification({
      customerId: all[idx].customerId!,
      title: "Destek yanıtı",
      body: text.slice(0, 120),
      kind: "support",
    });
  }
  return all[idx];
}

export function closeSupportTicket(id: string) {
  const all = listSupportTickets();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], status: "closed", updatedAt: new Date().toISOString() };
  saveJson(TICKETS_KEY, all);
}

export function isAccountFrozen(customerId: string): boolean {
  return loadJson<string[]>(FREEZE_KEY, []).includes(customerId);
}

export function setAccountFrozen(customerId: string, frozen: boolean) {
  const set = new Set(loadJson<string[]>(FREEZE_KEY, []));
  if (frozen) set.add(customerId);
  else set.delete(customerId);
  saveJson(FREEZE_KEY, [...set]);
  pushNotification({
    customerId,
    title: frozen ? "Hesap donduruldu" : "Hesap açıldı",
    body: frozen ? "Giriş ve işlemler geçici olarak kısıtlandı." : "Hesabınız tekrar aktif.",
    kind: "security",
  });
}

export function resetCustomerPin(customerId: string, newPin: string): { ok: true } | { ok: false; error: string } {
  if (!/^\d{6}$/.test(newPin)) return { ok: false, error: "PIN must be 6 digits" };
  const customers = loadJson<Record<string, unknown>[]>(CUSTOMERS_KEY, []);
  const idx = customers.findIndex((c) => String(c.id) === customerId);
  if (idx < 0) return { ok: false, error: "Not found" };
  customers[idx] = { ...customers[idx], password: newPin };
  saveJson(CUSTOMERS_KEY, customers);
  pushNotification({
    customerId,
    title: "PIN güncellendi",
    body: "Yeni güvenlik PIN’iniz kaydedildi.",
    kind: "security",
  });
  return { ok: true };
}

export function findCustomerByEmail(email: string) {
  return listAllCustomers().find((c) => c.email === email.trim().toLowerCase()) || null;
}

// silence unused
void getCustomerSession;
