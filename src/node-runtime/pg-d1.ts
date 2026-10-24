/**
 * PostgreSQL runtime: a minimal D1-compatible wrapper around `pg` so the
 * service layer (written against Cloudflare D1 / SQLite) runs unchanged on
 * Vercel serverless functions or any Node.js host.
 *
 * Dialect bridging done here:
 *  - `?` placeholders            -> `$1, $2, ...`
 *  - `LIKE`                      -> `ILIKE` (SQLite LIKE is case-insensitive)
 *  - `ROUND(x, n)`               -> `ROUND((x)::numeric, n)`
 *  - BIGINT / NUMERIC results    -> JS numbers (all timestamps are epoch ms)
 *  - `batch()`                   -> a single transaction
 */
import { Pool, types, type PoolClient, type QueryResult } from "pg";
import { PG_MIGRATIONS, PG_SEED_SQL } from "./pg-schema.generated";

types.setTypeParser(20, (v) => Number(v)); // int8
types.setTypeParser(1700, (v) => Number(v)); // numeric

type Row = Record<string, unknown>;
type Queryable = { query: (text: string, values?: unknown[]) => Promise<QueryResult> };

const sqlCache = new Map<string, string>();

/** Translates the SQLite flavoured SQL used by the services into PostgreSQL. */
export function translateSql(sql: string): string {
  const cached = sqlCache.get(sql);
  if (cached) return cached;
  let out = "";
  let n = 0;
  let inString = false;
  for (const ch of sql) {
    if (ch === "'") inString = !inString;
    if (ch === "?" && !inString) {
      n += 1;
      out += `$${n}`;
    } else {
      out += ch;
    }
  }
  out = out
    .replace(/(?<![A-Za-z_])LIKE(?![A-Za-z_])/g, (m, offset: number, s: string) =>
      s.slice(Math.max(0, offset - 1), offset).toUpperCase() === "I" ? m : "ILIKE",
    )
    .replace(/ROUND\(([^,()]+),\s*(\d+)\)/gi, "ROUND(($1)::numeric, $2)");
  sqlCache.set(sql, out);
  return out;
}

function normalize(value: unknown): unknown {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function toD1Result<T>(res: QueryResult, started: number): D1Result<T> {
  return {
    success: true,
    results: (res.rows ?? []) as T[],
    meta: {
      changes: res.rowCount ?? 0,
      duration: Date.now() - started,
      last_row_id: 0,
      changed_db: (res.rowCount ?? 0) > 0,
      size_after: 0,
      rows_read: res.rows?.length ?? 0,
      rows_written: res.command === "SELECT" ? 0 : (res.rowCount ?? 0),
    },
  } as unknown as D1Result<T>;
}

class PgStatement {
  constructor(
    private readonly owner: PgD1,
    readonly sql: string,
    readonly params: unknown[] = [],
  ) {}

  bind(...values: unknown[]): PgStatement {
    return new PgStatement(this.owner, this.sql, values.map(normalize));
  }

  async execOn<T>(q: Queryable): Promise<D1Result<T>> {
    const started = Date.now();
    const res = await q.query(translateSql(this.sql), this.params);
    return toD1Result<T>(res, started);
  }

  async all<T = Row>(): Promise<D1Result<T>> {
    return this.owner.withReady((q) => this.execOn<T>(q));
  }

  async run<T = Row>(): Promise<D1Result<T>> {
    return this.all<T>();
  }

  async first<T = Row>(column?: string): Promise<T | null> {
    const { results } = await this.all<Row>();
    const row = results[0];
    if (!row) return null;
    if (column) return (row[column] ?? null) as T;
    return row as T;
  }

  async raw<T = unknown[]>(): Promise<T[]> {
    const { results } = await this.all<Row>();
    return results.map((r) => Object.values(r)) as T[];
  }
}

export class PgD1 {
  private ready: Promise<void> | null = null;
  private poolInstance: Pool | null = null;

  constructor(private readonly createPool: () => Pool) {}

  /** Created lazily so pages that never touch the DB work without DATABASE_URL. */
  private get pool(): Pool {
    if (!this.poolInstance) this.poolInstance = this.createPool();
    return this.poolInstance;
  }

  prepare(sql: string): PgStatement {
    return new PgStatement(this, sql);
  }

  async withReady<R>(fn: (q: Queryable) => Promise<R>): Promise<R> {
    await this.ensureSchema();
    return fn(this.pool);
  }

  async batch<T = Row>(statements: PgStatement[]): Promise<D1Result<T>[]> {
    await this.ensureSchema();
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const out: D1Result<T>[] = [];
      for (const st of statements) out.push(await st.execOn<T>(client));
      await client.query("COMMIT");
      return out;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async exec(sql: string): Promise<{ count: number; duration: number }> {
    const started = Date.now();
    await this.withReady((q) => q.query(sql));
    return { count: 1, duration: Date.now() - started };
  }

  /** Raw access for runtime helpers (rate limiting, sweeps). */
  async query(text: string, values: unknown[] = []): Promise<QueryResult> {
    await this.ensureSchema();
    return this.pool.query(text, values);
  }

  /** Applies the idempotent schema + seed once per process (advisory-locked). */
  ensureSchema(): Promise<void> {
    if (!this.ready) {
      this.ready = this.migrate().catch((error) => {
        this.ready = null;
        throw error;
      });
    }
    return this.ready;
  }

  private async migrate(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `CREATE TABLE IF NOT EXISTS _livetrack_migrations (name TEXT PRIMARY KEY, applied_at BIGINT NOT NULL)`,
      );
      const { rows } = await client.query<{ name: string }>(`SELECT name FROM _livetrack_migrations`);
      const applied = new Set(rows.map((r) => r.name));
      const pending = PG_MIGRATIONS.filter((m) => !applied.has(m.name));
      if (pending.length > 0 || !applied.has("seed")) {
        await client.query("BEGIN");
        try {
          await client.query("SELECT pg_advisory_xact_lock(727274)");
          const again = await client.query<{ name: string }>(`SELECT name FROM _livetrack_migrations`);
          const done = new Set(again.rows.map((r) => r.name));
          for (const m of PG_MIGRATIONS) {
            if (done.has(m.name)) continue;
            await client.query(m.sql);
            await client.query(`INSERT INTO _livetrack_migrations (name, applied_at) VALUES ($1, $2)`, [m.name, Date.now()]);
          }
          await client.query(PG_SEED_SQL);
          await client.query(
            `INSERT INTO _livetrack_migrations (name, applied_at) VALUES ('seed', $1) ON CONFLICT (name) DO UPDATE SET applied_at = EXCLUDED.applied_at`,
            [Date.now()],
          );
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK").catch(() => undefined);
          throw error;
        }
      }
      const admins = (process.env.LIVETRACK_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      if (admins.length > 0) {
        await client.query(`UPDATE users SET role_id = 'super_admin' WHERE lower(email) = ANY($1::text[])`, [admins]);
      }
    } finally {
      client.release();
    }
  }
}

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    undefined
  );
}

const key = Symbol.for("livetrack.pg.d1");
type G = typeof globalThis & { [key]?: PgD1 };

export function getPgD1(): PgD1 {
  const g = globalThis as G;
  if (!g[key]) g[key] = new PgD1(createPool);
  return g[key]!;
}

function createPool(): Pool {
  {
    const connectionString = getDatabaseUrl();
    if (!connectionString) throw new Error("DATABASE_URL is not configured");
    const local = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString);
    const pool = new Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX ?? 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      // sslmode in the URL wins; otherwise require TLS for any non-local host.
      ssl: local || /sslmode=/.test(connectionString) ? undefined : true,
    });
    pool.on("error", (error) => console.error(JSON.stringify({ msg: "pg_pool_error", error: String(error) })));
    return pool;
  }
}
