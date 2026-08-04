import type { DbRow, QueryError, QueryResult, TableName } from "./types";
import type { AdminUser, SiteSetting, Trade, Trader, Transaction } from "./types";

const STORAGE_KEY = "brokerz_local_db_v1";

interface LocalDb {
  traders: Trader[];
  trades: Trade[];
  transactions: Transaction[];
  site_settings: SiteSetting[];
  admin_users: AdminUser[];
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function seed(): LocalDb {
  const traderId = uid();
  return {
    admin_users: [
      {
        id: uid(),
        email: "admin@brokerz.com",
        password_hash: "admin123",
        name: "Super Admin",
        role: "super_admin",
        is_active: true,
        created_at: now(),
      },
    ],
    traders: [
      {
        id: traderId,
        email: "trader@brokerz.com",
        name: "Demo Trader",
        account_number: "5001284563",
        account_type: "raw",
        balance: 10000,
        equity: 10000,
        leverage: 500,
        currency: "USD",
        is_active: true,
        is_demo: true,
        created_at: now(),
        updated_at: now(),
      },
    ],
    trades: [
      {
        id: uid(),
        trader_id: traderId,
        symbol: "EURUSD",
        type: "buy",
        volume: 0.1,
        open_price: 1.08542,
        close_price: null,
        open_time: now(),
        close_time: null,
        sl: null,
        tp: null,
        profit: 0,
        status: "open",
        created_at: now(),
      },
    ],
    transactions: [
      {
        id: uid(),
        trader_id: traderId,
        type: "deposit",
        amount: 10000,
        status: "completed",
        description: "Initial demo deposit",
        created_at: now(),
      },
    ],
    site_settings: [
      { id: uid(), key: "site_name", value: "BROKERZ", description: "Site display name", updated_at: now() },
      { id: uid(), key: "site_tagline", value: "Trade Smart. Trade BROKERZ.", description: "Hero tagline", updated_at: now() },
      { id: uid(), key: "leverage_max", value: "1000", description: "Maximum leverage offered", updated_at: now() },
      { id: uid(), key: "min_deposit", value: "100", description: "Minimum deposit in USD", updated_at: now() },
      { id: uid(), key: "default_balance", value: "10000", description: "Default demo balance for new traders", updated_at: now() },
      { id: uid(), key: "default_leverage", value: "500", description: "Default leverage for new traders", updated_at: now() },
      { id: uid(), key: "default_account_type", value: "raw", description: "Default account type (classic/raw/tvraw)", updated_at: now() },
      { id: uid(), key: "spread_eurusd", value: "12", description: "EURUSD spread in points", updated_at: now() },
      { id: uid(), key: "spread_xauusd", value: "25", description: "XAUUSD spread in points", updated_at: now() },
      { id: uid(), key: "spread_btcusd", value: "50", description: "BTCUSD spread in points", updated_at: now() },
      { id: uid(), key: "execution_speed", value: "0.15", description: "Average execution speed in seconds", updated_at: now() },
      { id: uid(), key: "support_email", value: "support@brokerz.com", description: "Support email address", updated_at: now() },
      { id: uid(), key: "support_phone", value: "+44 20 7190 9935", description: "Support phone number", updated_at: now() },
      { id: uid(), key: "maintenance_mode", value: "false", description: "Site maintenance mode on/off", updated_at: now() },
      { id: uid(), key: "trading_enabled", value: "true", description: "Trading enabled globally", updated_at: now() },
      { id: uid(), key: "max_volume", value: "100", description: "Maximum trade volume in lots", updated_at: now() },
      { id: uid(), key: "min_volume", value: "0.01", description: "Minimum trade volume in lots", updated_at: now() },
      { id: uid(), key: "margin_call_level", value: "100", description: "Margin call level percentage", updated_at: now() },
      { id: uid(), key: "stop_out_level", value: "50", description: "Stop out level percentage", updated_at: now() },
      { id: uid(), key: "commission_raw", value: "3", description: "RAW account commission per lot per side", updated_at: now() },
      { id: uid(), key: "commission_tvraw", value: "3.5", description: "TradingView RAW commission per lot per side", updated_at: now() },
    ],
  };
}

function load(): LocalDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalDb;
      if (parsed?.admin_users?.length) return parsed;
    }
  } catch {
    /* fall through */
  }
  const fresh = seed();
  save(fresh);
  return fresh;
}

function save(db: LocalDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

type Filter = { column: string; value: unknown };

function matchRow(row: Record<string, unknown>, filters: Filter[]) {
  return filters.every((f) => row[f.column] === f.value);
}

/** Thenable filter chain for select / update / delete (Supabase-compatible order). */
class FilterBuilder<T extends DbRow = DbRow> {
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private mode: "select" | "update" | "delete" = "select";
  private patch: Record<string, unknown> | null = null;
  private wantSingle = false;
  private wantMaybeSingle = false;

  constructor(private table: TableName) {}

  select(_cols = "*") {
    this.mode = "select";
    return this;
  }

  update(patch: Record<string, unknown>) {
    this.mode = "update";
    this.patch = patch;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: opts?.ascending ?? true };
    return this;
  }

  single() {
    this.wantSingle = true;
    return this.run() as Promise<QueryResult<T>>;
  }

  maybeSingle() {
    this.wantMaybeSingle = true;
    return this.run() as Promise<QueryResult<T>>;
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.run().then(onfulfilled, onrejected);
  }

  private async run(): Promise<QueryResult<T>> {
    const db = load();
    const rows = db[this.table] as unknown as Record<string, unknown>[];

    if (this.mode === "update" && this.patch) {
      for (let i = 0; i < rows.length; i++) {
        if (matchRow(rows[i], this.filters)) {
          rows[i] = { ...rows[i], ...this.patch };
        }
      }
      save(db);
      return { data: null, error: null };
    }

    if (this.mode === "delete") {
      (db as unknown as Record<string, unknown[]>)[this.table] = rows.filter(
        (r) => !matchRow(r, this.filters),
      );
      save(db);
      return { data: null, error: null };
    }

    let filtered = rows.filter((r) => matchRow(r, this.filters));
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      filtered = [...filtered].sort((a, b) => {
        const av = a[column];
        const bv = b[column];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : 1;
        return ascending ? cmp : -cmp;
      });
    }

    if (this.wantSingle || this.wantMaybeSingle) {
      const row = (filtered[0] as T) ?? null;
      if (this.wantSingle && !row) {
        return { data: null, error: { message: "No rows found" } satisfies QueryError };
      }
      return { data: row, error: null };
    }

    return { data: filtered as T[], error: null };
  }
}

class InsertBuilder<T extends DbRow = DbRow> {
  constructor(
    private table: TableName,
    private payload: Record<string, unknown> | Record<string, unknown>[],
  ) {}

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.run().then(onfulfilled, onrejected);
  }

  private async run(): Promise<QueryResult<T>> {
    const db = load();
    const rows = db[this.table] as unknown as Record<string, unknown>[];
    const items = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted: Record<string, unknown>[] = [];

    for (const item of items) {
      if (this.table === "traders") {
        const email = String(item.email ?? "");
        if (rows.some((r) => r.email === email)) {
          return { data: null, error: { message: "Email already exists" } };
        }
      }

      const full: Record<string, unknown> = {
        id: uid(),
        created_at: now(),
        updated_at: now(),
        ...item,
      };

      if (this.table === "traders") {
        full.equity = full.equity ?? full.balance ?? 0;
        full.currency = full.currency ?? "USD";
        full.is_active = full.is_active ?? true;
      }

      rows.push(full);
      inserted.push(full);
    }

    save(db);
    return {
      data: (Array.isArray(this.payload) ? inserted : inserted[0]) as T,
      error: null,
    };
  }
}

class TableApi {
  constructor(private table: TableName) {}

  select(cols = "*") {
    return new FilterBuilder(this.table).select(cols);
  }

  update(patch: Record<string, unknown>) {
    return new FilterBuilder(this.table).update(patch);
  }

  delete() {
    return new FilterBuilder(this.table).delete();
  }

  insert(row: Record<string, unknown> | Record<string, unknown>[]) {
    return new InsertBuilder(this.table, row);
  }
}

export function createLocalClient() {
  return {
    from(table: TableName) {
      return new TableApi(table);
    },
  };
}

export function resetLocalDb() {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = seed();
  save(fresh);
  return fresh;
}

export type LocalClient = ReturnType<typeof createLocalClient>;
