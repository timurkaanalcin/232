import { updateCustomerBalance, getCustomerSession, type CustomerSession } from "@/lib/customerAuth";
import { pushNotification } from "@/lib/notifications";

const KEY = "ubs_fund_ops_v1";

export type FundOpType = "deposit" | "withdraw";
export type FundOpStatus = "pending" | "completed" | "rejected";

export interface FundOperation {
  id: string;
  customerId: string;
  type: FundOpType;
  amount: number;
  method: string;
  note?: string;
  status: FundOpStatus;
  createdAt: string;
}

function uid() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadAll(): FundOperation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FundOperation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list: FundOperation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listFundOps(customerId: string): FundOperation[] {
  return loadAll()
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createDeposit(input: {
  customerId: string;
  amount: number;
  method: string;
}): { ok: true; balance: number; op: FundOperation } | { ok: false; error: string } {
  const amount = Math.round(Number(input.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 10) return { ok: false, error: "Minimum deposit is $10." };
  const session = getCustomerSession();
  if (!session || session.id !== input.customerId) return { ok: false, error: "Session expired." };
  const nextBal = Math.round((session.balance + amount) * 100) / 100;
  updateCustomerBalance(input.customerId, nextBal);
  const op: FundOperation = {
    id: uid(),
    customerId: input.customerId,
    type: "deposit",
    amount,
    method: input.method,
    status: "completed",
    createdAt: new Date().toISOString(),
  };
  saveAll([op, ...loadAll()]);
  pushNotification({
    customerId: input.customerId,
    title: "Deposit successful",
    body: `$${amount.toFixed(2)} added via ${input.method}.`,
    kind: "funds",
  });
  return { ok: true, balance: nextBal, op };
}

export function createWithdraw(input: {
  customerId: string;
  amount: number;
  method: string;
  iban?: string;
}): { ok: true; balance: number; op: FundOperation } | { ok: false; error: string } {
  const amount = Math.round(Number(input.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 20) return { ok: false, error: "Minimum withdrawal is $20." };
  const session = getCustomerSession();
  if (!session || session.id !== input.customerId) return { ok: false, error: "Session expired." };
  if (amount > session.balance) return { ok: false, error: "Insufficient balance." };
  const nextBal = Math.round((session.balance - amount) * 100) / 100;
  updateCustomerBalance(input.customerId, nextBal);
  const op: FundOperation = {
    id: uid(),
    customerId: input.customerId,
    type: "withdraw",
    amount,
    method: input.method,
    note: input.iban ? `IBAN …${input.iban.slice(-4)}` : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  saveAll([op, ...loadAll()]);
  pushNotification({
    customerId: input.customerId,
    title: "Withdrawal requested",
    body: `$${amount.toFixed(2)} pending review.`,
    kind: "funds",
  });
  return { ok: true, balance: nextBal, op };
}

export function refreshSessionBalance(session: CustomerSession): CustomerSession {
  const raw = getCustomerSession();
  if (!raw || raw.id !== session.id) return session;
  return { ...session, balance: raw.balance };
}
