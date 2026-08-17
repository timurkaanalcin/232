import type { ClosedTrade, Direction } from "@/types";

const HISTORY_KEY = "ubs_test_account_history_v1";
const HISTORY_VERSION = 2;
const TEST_EMAIL = "test@test.com";

/** Opening balance when the account was created. */
export const TEST_START_BALANCE = 250;
/** Investor self-funding across the 7-month period. */
export const TEST_INVESTOR_DEPOSITS = 15000;
/** Target live balance. */
export const TEST_TARGET_BALANCE = 53340.5;

export interface DepositRecord {
  id: string;
  amount: number;
  method: string;
  note: string;
  createdAt: number;
  status: "completed";
}

export interface TestAccountHistory {
  version: number;
  email: string;
  deposits: DepositRecord[];
  closedTrades: ClosedTrade[];
  balance: number;
}

const SYMBOLS: { symbol: string; price: number; digits: number }[] = [
  { symbol: "EURUSD", price: 1.0852, digits: 5 },
  { symbol: "GBPUSD", price: 1.2641, digits: 5 },
  { symbol: "USDJPY", price: 149.82, digits: 3 },
  { symbol: "XAUUSD", price: 2345.6, digits: 2 },
  { symbol: "BTCUSD", price: 64250, digits: 2 },
  { symbol: "US500", price: 5280, digits: 2 },
  { symbol: "NAS100", price: 18540, digits: 2 },
  { symbol: "ETHUSD", price: 3420, digits: 2 },
  { symbol: "AUDUSD", price: 0.6612, digits: 5 },
  { symbol: "USDCHF", price: 0.8845, digits: 5 },
];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildDeposits(rng: () => number, startMs: number, endMs: number): DepositRecord[] {
  const deposits: DepositRecord[] = [
    {
      id: "dep_start",
      amount: TEST_START_BALANCE,
      method: "Card",
      note: "Initial account funding",
      createdAt: startMs + 2 * 60 * 60 * 1000,
      status: "completed",
    },
  ];

  // Split $15,000 into 8 deposits across the 7 months
  const chunks = [2000, 1500, 2500, 1800, 2200, 1200, 2800, 1000];
  const span = endMs - startMs;
  chunks.forEach((amount, i) => {
    const t = startMs + Math.floor(((i + 0.35) / chunks.length) * span);
    const jitter = Math.floor(rng() * 4 * 24 * 60 * 60 * 1000);
    deposits.push({
      id: `dep_${i + 1}`,
      amount,
      method: i % 3 === 0 ? "Bank Transfer" : i % 3 === 1 ? "Crypto" : "Card",
      note: "Investor deposit",
      createdAt: Math.min(t + jitter, endMs - 24 * 60 * 60 * 1000),
      status: "completed",
    });
  });

  deposits.sort((a, b) => a.createdAt - b.createdAt);
  return deposits;
}

function buildTrades(
  rng: () => number,
  startMs: number,
  endMs: number,
  targetNetProfit: number,
): ClosedTrade[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const trades: ClosedTrade[] = [];
  let day = 0;

  for (let t = startMs; t <= endMs; t += dayMs) {
    const d = new Date(t);
    // Skip most Sundays for realism
    if (d.getDay() === 0 && rng() < 0.7) {
      day += 1;
      continue;
    }
    const count = rng() < 0.5 ? 3 : 4;
    for (let i = 0; i < count; i++) {
      const hour = 8 + Math.floor(rng() * 12);
      const minute = Math.floor(rng() * 60);
      const openTime = t + hour * 3600000 + minute * 60000 + Math.floor(rng() * 40000);
      const holdMin = 8 + Math.floor(rng() * 180);
      const closeTime = openTime + holdMin * 60000;
      if (closeTime > endMs) continue;

      const inst = SYMBOLS[Math.floor(rng() * SYMBOLS.length)];
      const type: Direction = rng() < 0.52 ? "buy" : "sell";
      const volume = round2(0.05 + rng() * 1.45);
      const openPrice = inst.price * (1 + (rng() - 0.5) * 0.02);
      // Rough P&L magnitude; sign decided later when we normalize to target
      const magnitude = round2(12 + rng() * 220 + volume * (40 + rng() * 180));
      const win = rng() < 0.58;
      const profit = win ? magnitude : -round2(magnitude * (0.45 + rng() * 0.7));
      const closeMove = (profit >= 0 ? 1 : -1) * (0.0004 + rng() * 0.004) * (type === "buy" ? 1 : -1);
      const closePrice = openPrice * (1 + closeMove);

      trades.push({
        id: `cls_seed_${day}_${i}_${Math.floor(openTime / 1000)}`,
        symbol: inst.symbol,
        type,
        volume,
        openPrice: Number(openPrice.toFixed(inst.digits)),
        closePrice: Number(closePrice.toFixed(inst.digits)),
        openTime,
        closeTime,
        profit: round2(profit),
        swap: 0,
        commission: 0,
      });
    }
    day += 1;
  }

  // Scale & adjust so total profit equals targetNetProfit exactly
  const raw = trades.reduce((s, tr) => s + tr.profit, 0);
  if (Math.abs(raw) > 0.01) {
    const scale = targetNetProfit / raw;
    let running = 0;
    for (let i = 0; i < trades.length; i++) {
      if (i === trades.length - 1) {
        trades[i].profit = round2(targetNetProfit - running);
      } else {
        trades[i].profit = round2(trades[i].profit * scale);
        running += trades[i].profit;
      }
    }
  }

  trades.sort((a, b) => b.closeTime - a.closeTime);
  return trades;
}

export function generateTestAccountHistory(now = Date.now()): TestAccountHistory {
  const end = new Date(now);
  end.setHours(18, 30, 0, 0);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 7);
  start.setHours(9, 0, 0, 0);

  const rng = mulberry32(20260806);
  const deposits = buildDeposits(rng, start.getTime(), end.getTime());
  const funded = deposits.reduce((s, d) => s + d.amount, 0);
  const targetNet = round2(TEST_TARGET_BALANCE - funded);
  const closedTrades = buildTrades(rng, start.getTime(), end.getTime(), targetNet);

  return {
    version: HISTORY_VERSION,
    email: TEST_EMAIL,
    deposits,
    closedTrades,
    balance: TEST_TARGET_BALANCE,
  };
}

export function loadTestAccountHistory(): TestAccountHistory {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TestAccountHistory;
      if (
        parsed?.version === HISTORY_VERSION &&
        parsed.email === TEST_EMAIL &&
        Array.isArray(parsed.closedTrades) &&
        Array.isArray(parsed.deposits) &&
        Math.abs(Number(parsed.balance) - TEST_TARGET_BALANCE) < 0.01
      ) {
        return parsed;
      }
    }
  } catch {
    /* regenerate */
  }
  const fresh = generateTestAccountHistory();
  saveTestAccountHistory(fresh);
  return fresh;
}

export function saveTestAccountHistory(history: TestAccountHistory): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/** Append a newly closed trade and sync balance for the test account. */
export function appendTestClosedTrade(trade: ClosedTrade, balance: number): void {
  const history = loadTestAccountHistory();
  history.closedTrades = [trade, ...history.closedTrades];
  history.balance = round2(balance);
  saveTestAccountHistory(history);
}

export function getTestAccountCreatedAt(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 7);
  d.setHours(9, 15, 0, 0);
  return d.toISOString();
}
