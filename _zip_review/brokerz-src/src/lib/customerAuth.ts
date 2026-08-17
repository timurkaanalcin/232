const CUSTOMERS_KEY = "ubs_customers_v2";
const LEGACY_KEY = "ubs_customers_v1";
const SESSION_KEY = "ubs_customer_session_v1";

import {
  getTestAccountCreatedAt,
  loadTestAccountHistory,
  TEST_TARGET_BALANCE,
} from "@/lib/testAccountHistory";

export const TEST_ACCOUNT_EMAIL = "test@test.com";
/** 6-digit mobile banking PIN (based on requested 1925) */
export const TEST_ACCOUNT_PIN = "192500";
export const TEST_ACCOUNT_BALANCE = TEST_TARGET_BALANCE;

export interface Customer {
  id: string;
  email: string;
  name: string;
  /** 6-digit numeric PIN */
  password: string;
  accountNumber: string;
  balance: number;
  createdAt: string;
}

export interface CustomerSession {
  id: string;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
  loggedInAt: string;
}

export type AuthResult =
  | { ok: true; session: CustomerSession }
  | { ok: false; error: string };

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function accountNumber(): string {
  return `5${String(Math.floor(100000000 + Math.random() * 899999999))}`;
}

function migrateCustomer(c: Record<string, unknown>): Customer {
  return {
    id: String(c.id ?? uid()),
    email: String(c.email ?? "").toLowerCase(),
    name: String(c.name ?? ""),
    password: String(c.password ?? ""),
    accountNumber: String(c.accountNumber ?? accountNumber()),
    balance: Number(c.balance ?? 0),
    createdAt: String(c.createdAt ?? new Date().toISOString()),
  };
}

function ensureTestAccount(list: Customer[]): Customer[] {
  // Ensure seeded trade/deposit history exists and drives balance.
  const history = loadTestAccountHistory();
  const existing = list.find((c) => c.email === TEST_ACCOUNT_EMAIL);
  if (existing) {
    return list.map((c) =>
      c.email === TEST_ACCOUNT_EMAIL
        ? {
            ...c,
            password: TEST_ACCOUNT_PIN,
            balance: history.balance,
            name: c.name || "Test Account",
            createdAt: c.createdAt || getTestAccountCreatedAt(),
          }
        : c,
    );
  }
  return [
    {
      id: uid(),
      email: TEST_ACCOUNT_EMAIL,
      name: "Test Account",
      password: TEST_ACCOUNT_PIN,
      accountNumber: "5001925001",
      balance: history.balance,
      createdAt: getTestAccountCreatedAt(),
    },
    ...list,
  ];
}

function loadCustomers(): Customer[] {
  try {
    let raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Record<string, unknown>[];
        const migrated = Array.isArray(parsed)
          ? ensureTestAccount(parsed.map((c) => migrateCustomer(c)))
          : ensureTestAccount([]);
        saveCustomers(migrated);
        localStorage.removeItem(LEGACY_KEY);
        return migrated;
      }
      const seeded = ensureTestAccount([]);
      saveCustomers(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) {
      const seeded = ensureTestAccount([]);
      saveCustomers(seeded);
      return seeded;
    }
    const list = ensureTestAccount(parsed.map((c) => migrateCustomer(c)));
    saveCustomers(list);
    return list;
  } catch {
    const seeded = ensureTestAccount([]);
    saveCustomers(seeded);
    return seeded;
  }
}

function saveCustomers(list: Customer[]): void {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
}

function toSession(c: Customer): CustomerSession {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    accountNumber: c.accountNumber,
    balance: c.balance,
    loggedInAt: new Date().toISOString(),
  };
}

function persistSession(session: CustomerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerSession;
    if (!parsed?.email || !parsed?.id) return null;
    return {
      ...parsed,
      balance: Number(parsed.balance ?? 0),
    };
  } catch {
    return null;
  }
}

export function clearCustomerSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

/** Step 1 of mobile banking login: verify e-mail exists. */
export function lookupCustomerEmail(
  email: string
): { ok: true; email: string; name: string } | { ok: false; error: string } {
  const e = email.trim().toLowerCase();
  if (!e) return { ok: false, error: "Please enter your e-mail." };
  if (!isValidEmail(e)) return { ok: false, error: "Enter a valid e-mail address." };
  loadCustomers(); // ensure test account exists
  const customers = loadCustomers();
  const match = customers.find((c) => c.email === e);
  if (!match) {
    return { ok: false, error: "No account found for this e-mail. Please register first." };
  }
  return { ok: true, email: match.email, name: match.name };
}

/** Register a new customer with a 6-digit PIN. */
export function registerCustomer(input: {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  referralCode?: string;
}): AuthResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Please fill in e-mail and 6-digit PIN." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid e-mail address." };
  }
  if (!isValidPin(password)) {
    return { ok: false, error: "PIN must be exactly 6 digits." };
  }
  if (password !== input.confirmPassword) {
    return { ok: false, error: "PINs do not match." };
  }

  const customers = loadCustomers();
  if (customers.some((c) => c.email === email)) {
    return { ok: false, error: "An account with this e-mail already exists. Please log in." };
  }

  const name =
    (input.name || "").trim() ||
    email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const customer: Customer = {
    id: uid(),
    email,
    name,
    password,
    accountNumber: accountNumber(),
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  customers.push(customer);
  saveCustomers(customers);

  const session = toSession(customer);
  persistSession(session);
  return { ok: true, session };
}

/** Log in with e-mail + 6-digit PIN. */
export function loginCustomer(email: string, password: string): AuthResult {
  const e = email.trim().toLowerCase();
  const p = password;

  if (!e || !p) {
    return { ok: false, error: "Please enter your e-mail and PIN." };
  }
  if (!isValidPin(p)) {
    return { ok: false, error: "PIN must be exactly 6 digits." };
  }

  const customers = loadCustomers();
  const match = customers.find((c) => c.email === e && c.password === p);
  if (!match) {
    return { ok: false, error: "Invalid PIN. Please try again." };
  }

  try {
    const frozen = JSON.parse(localStorage.getItem("ubs_frozen_accounts_v1") || "[]") as string[];
    if (frozen.includes(match.id)) {
      return { ok: false, error: "Account frozen. Contact support." };
    }
  } catch {
    /* ignore */
  }

  const session = toSession(match);
  persistSession(session);
  return { ok: true, session };
}

export function isCustomerLoggedIn(): boolean {
  return getCustomerSession() !== null;
}

export function loginWithCustomerId(customerId: string): AuthResult {
  const customers = loadCustomers();
  const match = customers.find((c) => c.id === customerId);
  if (!match) return { ok: false, error: "Account not found." };
  const session = toSession(match);
  persistSession(session);
  return { ok: true, session };
}

/** Persist updated balance for the logged-in customer. */
export function updateCustomerBalance(customerId: string, balance: number): void {
  const customers = loadCustomers();
  const idx = customers.findIndex((c) => c.id === customerId);
  if (idx < 0) return;
  customers[idx] = { ...customers[idx], balance };
  saveCustomers(customers);
  const session = getCustomerSession();
  if (session && session.id === customerId) {
    persistSession({ ...session, balance });
  }
}
