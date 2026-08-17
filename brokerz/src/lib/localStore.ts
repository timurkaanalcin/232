import type {
  AdminUser,
  CrmLead,
  DbRow,
  QueryError,
  QueryResult,
  SiteSetting,
  TableName,
  Team,
  Trade,
  Trader,
  Transaction,
} from "./types";

const STORAGE_KEY = "brokerz_local_db_v2";
const LEGACY_KEY = "brokerz_local_db_v1";

interface LocalDb {
  traders: Trader[];
  trades: Trade[];
  transactions: Transaction[];
  site_settings: SiteSetting[];
  admin_users: AdminUser[];
  teams: Team[];
  crm_leads: CrmLead[];
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
  const salesTeamId = uid();
  const retTeamId = uid();
  const superId = uid();
  const headSalesId = uid();
  const headRetId = uid();
  const tlSalesId = uid();
  const tlRetId = uid();
  const salesAgentId = uid();
  const retAgentId = uid();
  const traderId = uid();
  const leadSalesId = uid();
  const leadRetId = uid();
  const t = now();

  return {
    teams: [
      { id: salesTeamId, name: "Sales Team Alpha", department: "sales", leader_id: tlSalesId, created_at: t },
      { id: retTeamId, name: "Retention Team Alpha", department: "retention", leader_id: tlRetId, created_at: t },
    ],
    admin_users: [
      {
        id: superId,
        email: "admin@brokerz.com",
        password_hash: "admin123",
        name: "Super Admin",
        role: "super_admin",
        department: "all",
        team_id: null,
        manager_id: null,
        is_active: true,
        created_at: t,
      },
      {
        id: headSalesId,
        email: "head.sales@brokerz.com",
        password_hash: "head123",
        name: "Head of Sales",
        role: "head_sales",
        department: "sales",
        team_id: null,
        manager_id: superId,
        is_active: true,
        created_at: t,
      },
      {
        id: headRetId,
        email: "head.ret@brokerz.com",
        password_hash: "head123",
        name: "Head of Retention",
        role: "head_retention",
        department: "retention",
        team_id: null,
        manager_id: superId,
        is_active: true,
        created_at: t,
      },
      {
        id: tlSalesId,
        email: "tl.sales@brokerz.com",
        password_hash: "tl123",
        name: "Sales Team Leader",
        role: "team_leader_sales",
        department: "sales",
        team_id: salesTeamId,
        manager_id: headSalesId,
        is_active: true,
        created_at: t,
      },
      {
        id: tlRetId,
        email: "tl.ret@brokerz.com",
        password_hash: "tl123",
        name: "Retention Team Leader",
        role: "team_leader_retention",
        department: "retention",
        team_id: retTeamId,
        manager_id: headRetId,
        is_active: true,
        created_at: t,
      },
      {
        id: salesAgentId,
        email: "sales@brokerz.com",
        password_hash: "sales123",
        name: "Sales Agent",
        role: "sales_agent",
        department: "sales",
        team_id: salesTeamId,
        manager_id: tlSalesId,
        is_active: true,
        created_at: t,
      },
      {
        id: retAgentId,
        email: "ret@brokerz.com",
        password_hash: "ret123",
        name: "Retention Agent",
        role: "retention_agent",
        department: "retention",
        team_id: retTeamId,
        manager_id: tlRetId,
        is_active: true,
        created_at: t,
      },
    ],
    traders: [
      {
        id: traderId,
        email: "trader@brokerz.com",
        name: "Live Trader",
        account_number: "5001284563",
        account_type: "raw",
        balance: 10000,
        equity: 10000,
        leverage: 500,
        currency: "USD",
        is_active: true,
        is_demo: false,
        assigned_to: retAgentId,
        department: "retention",
        lead_id: leadRetId,
        team_id: retTeamId,
        created_at: t,
        updated_at: t,
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
        open_time: t,
        close_time: null,
        sl: null,
        tp: null,
        profit: 0,
        status: "open",
        created_at: t,
      },
    ],
    transactions: [
      {
        id: uid(),
        trader_id: traderId,
        type: "deposit",
        amount: 10000,
        status: "completed",
        description: "Initial deposit (FTD)",
        created_at: t,
      },
    ],
    crm_leads: [
      {
        id: leadSalesId,
        name: "New Prospect",
        email: "prospect@example.com",
        phone: "+44 7700 900123",
        status: "new",
        department: "sales",
        assigned_to: salesAgentId,
        team_id: salesTeamId,
        trader_id: null,
        ftd_amount: 0,
        notes: "Inbound web lead — follow up today.",
        created_at: t,
        updated_at: t,
      },
      {
        id: leadRetId,
        name: "Live Trader",
        email: "trader@brokerz.com",
        phone: "+44 7700 900456",
        status: "retention",
        department: "retention",
        assigned_to: retAgentId,
        team_id: retTeamId,
        trader_id: traderId,
        ftd_amount: 10000,
        notes: "FTD completed. Retention care sequence active.",
        created_at: t,
        updated_at: t,
      },
      {
        id: uid(),
        name: "Contacted Lead",
        email: "contact@example.com",
        phone: "+41 79 123 45 67",
        status: "contacted",
        department: "sales",
        assigned_to: salesAgentId,
        team_id: salesTeamId,
        trader_id: null,
        ftd_amount: 0,
        notes: "Interested in RAW account.",
        created_at: t,
        updated_at: t,
      },
    ],
    site_settings: [
      { id: uid(), key: "site_name", value: "BROKERZ", description: "Site display name", updated_at: t },
      { id: uid(), key: "site_tagline", value: "Trade Smart. Trade BROKERZ.", description: "Hero tagline", updated_at: t },
      { id: uid(), key: "leverage_max", value: "1000", description: "Maximum leverage offered", updated_at: t },
      { id: uid(), key: "min_deposit", value: "100", description: "Minimum deposit in USD", updated_at: t },
      { id: uid(), key: "default_balance", value: "10000", description: "Default balance for new live traders", updated_at: t },
      { id: uid(), key: "default_leverage", value: "500", description: "Default leverage for new traders", updated_at: t },
      { id: uid(), key: "default_account_type", value: "raw", description: "Default account type (classic/raw/tvraw)", updated_at: t },
      { id: uid(), key: "spread_eurusd", value: "12", description: "EURUSD spread in points", updated_at: t },
      { id: uid(), key: "spread_xauusd", value: "25", description: "XAUUSD spread in points", updated_at: t },
      { id: uid(), key: "spread_btcusd", value: "50", description: "BTCUSD spread in points", updated_at: t },
      { id: uid(), key: "execution_speed", value: "0.15", description: "Average execution speed in seconds", updated_at: t },
      { id: uid(), key: "support_email", value: "support@brokerz.com", description: "Support email address", updated_at: t },
      { id: uid(), key: "support_phone", value: "+44 20 7190 9935", description: "Support phone number", updated_at: t },
      { id: uid(), key: "maintenance_mode", value: "false", description: "Site maintenance mode on/off", updated_at: t },
      { id: uid(), key: "trading_enabled", value: "true", description: "Trading enabled globally", updated_at: t },
      { id: uid(), key: "max_volume", value: "100", description: "Maximum trade volume in lots", updated_at: t },
      { id: uid(), key: "min_volume", value: "0.01", description: "Minimum trade volume in lots", updated_at: t },
      { id: uid(), key: "margin_call_level", value: "100", description: "Margin call level percentage", updated_at: t },
      { id: uid(), key: "stop_out_level", value: "50", description: "Stop out level percentage", updated_at: t },
      { id: uid(), key: "commission_raw", value: "3", description: "RAW account commission per lot per side", updated_at: t },
      { id: uid(), key: "commission_tvraw", value: "3.5", description: "TradingView RAW commission per lot per side", updated_at: t },
    ],
  };
}

function migrateTrader(t: Record<string, unknown>): Trader {
  return {
    id: String(t.id),
    email: String(t.email ?? ""),
    name: String(t.name ?? ""),
    account_number: String(t.account_number ?? ""),
    account_type: String(t.account_type ?? "raw"),
    balance: Number(t.balance ?? 0),
    equity: Number(t.equity ?? t.balance ?? 0),
    leverage: Number(t.leverage ?? 500),
    currency: String(t.currency ?? "USD"),
    is_active: Boolean(t.is_active ?? true),
    is_demo: false,
    assigned_to: (t.assigned_to as string) ?? null,
    department: (t.department as Trader["department"]) ?? "sales",
    lead_id: (t.lead_id as string) ?? null,
    team_id: (t.team_id as string) ?? null,
    created_at: String(t.created_at ?? now()),
    updated_at: String(t.updated_at ?? now()),
  };
}

function migrateAdmin(a: Record<string, unknown>): AdminUser {
  const role = String(a.role ?? "sales_agent");
  let department: AdminUser["department"] = "sales";
  if (role === "super_admin") department = "all";
  else if (role.includes("retention") || role === "head_retention") department = "retention";
  else if (a.department === "retention" || a.department === "sales" || a.department === "all") {
    department = a.department;
  }
  return {
    id: String(a.id),
    email: String(a.email ?? ""),
    password_hash: String(a.password_hash ?? ""),
    name: String(a.name ?? ""),
    role,
    department,
    team_id: (a.team_id as string) ?? null,
    manager_id: (a.manager_id as string) ?? null,
    is_active: Boolean(a.is_active ?? true),
    created_at: String(a.created_at ?? now()),
  };
}

function load(): LocalDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalDb>;
      if (parsed?.admin_users?.length) {
        return {
          traders: (parsed.traders ?? []).map((t) => migrateTrader(t as unknown as Record<string, unknown>)),
          trades: parsed.trades ?? [],
          transactions: parsed.transactions ?? [],
          site_settings: parsed.site_settings ?? [],
          admin_users: (parsed.admin_users ?? []).map((a) => migrateAdmin(a as unknown as Record<string, unknown>)),
          teams: parsed.teams ?? [],
          crm_leads: parsed.crm_leads ?? [],
        };
      }
    }
  } catch {
    /* fall through */
  }

  // One-shot migrate from v1 if present
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy) as Partial<LocalDb>;
      if (old?.admin_users?.length) {
        const fresh = seed();
        const merged: LocalDb = {
          ...fresh,
          traders: (old.traders ?? []).map((t) => migrateTrader(t as unknown as Record<string, unknown>)),
          trades: old.trades ?? fresh.trades,
          transactions: old.transactions ?? fresh.transactions,
          site_settings: old.site_settings ?? fresh.site_settings,
          admin_users: fresh.admin_users,
          teams: fresh.teams,
          crm_leads: fresh.crm_leads,
        };
        save(merged);
        localStorage.removeItem(LEGACY_KEY);
        return merged;
      }
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
      if (this.table === "traders" || this.table === "admin_users") {
        const email = String(item.email ?? "");
        if (email && rows.some((r) => r.email === email)) {
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
        full.is_demo = false;
        full.assigned_to = full.assigned_to ?? null;
        full.department = full.department ?? "sales";
        full.lead_id = full.lead_id ?? null;
        full.team_id = full.team_id ?? null;
      }

      if (this.table === "crm_leads") {
        full.status = full.status ?? "new";
        full.department = full.department ?? "sales";
        full.assigned_to = full.assigned_to ?? null;
        full.team_id = full.team_id ?? null;
        full.trader_id = full.trader_id ?? null;
        full.ftd_amount = full.ftd_amount ?? 0;
        full.notes = full.notes ?? "";
        full.phone = full.phone ?? "";
      }

      if (this.table === "admin_users") {
        full.department = full.department ?? "sales";
        full.team_id = full.team_id ?? null;
        full.manager_id = full.manager_id ?? null;
        full.is_active = full.is_active ?? true;
      }

      if (this.table === "teams") {
        full.leader_id = full.leader_id ?? null;
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
  localStorage.removeItem(LEGACY_KEY);
  const fresh = seed();
  save(fresh);
  return fresh;
}

export type LocalClient = ReturnType<typeof createLocalClient>;
