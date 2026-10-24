/**
 * Serverless (Vercel / Node.js) runtime environment: provides the Cloudflare
 * bindings the route code expects (D1, LocationHub, RateLimiter) on top of
 * PostgreSQL. Everything is stateless per request, so any number of
 * function instances can run concurrently:
 *  - LocationHub: persists positions with DB-based throttling and sweeps
 *    stale sessions lazily (plus a daily Vercel cron, see /api/cron/sweep).
 *  - RateLimiter: fixed-window counters in the `rate_limits` table.
 *  - Realtime WebSocket push is not available; clients use the REST fallback
 *    and the admin map polls its snapshot.
 */
import { REALTIME, AUDIT_ACTIONS } from "@/lib/constants";
import { logAudit } from "@/lib/audit";
import { positionSchema } from "@/lib/validators";
import { persistPosition } from "@/services/location-sessions";
import type { LocationSessionDTO, SessionEndReason } from "@/types";
import { getPgD1 } from "./pg-d1";

type Position = { lat: number; lng: number; acc: number; alt?: number | null; spd?: number | null; hdg?: number | null; ts: number };

/** Minimum interval between lazy stale-session sweeps per instance. */
const LAZY_SWEEP_INTERVAL_MS = REALTIME.SWEEP_INTERVAL_MS;
let lastSweepAt = 0;

/** Ends active sessions that have not reported a position for STALE_SESSION_TIMEOUT_MS. */
export async function sweepStaleSessions(now = Date.now()): Promise<number> {
  const pg = getPgD1();
  const db = pg as unknown as D1Database;
  const cutoff = now - REALTIME.STALE_SESSION_TIMEOUT_MS;
  const { rows } = await pg.query(
    `UPDATE location_sessions
       SET status = 'ended', ended_at = $1, end_reason = 'timeout'
     WHERE status = 'active' AND COALESCE(last_update_at, started_at) < $2
     RETURNING id, user_id`,
    [now, cutoff],
  );
  for (const row of rows as { id: string; user_id: string }[]) {
    await logAudit(db, {
      actorId: null,
      actorEmail: "system",
      action: AUDIT_ACTIONS.LOCATION_SESSION_STOPPED,
      targetType: "location_session",
      targetId: row.id,
      metadata: { reason: "timeout", userId: row.user_id },
    }).catch(() => undefined);
  }
  return rows.length;
}

async function maybeSweep(): Promise<void> {
  const now = Date.now();
  if (now - lastSweepAt < LAZY_SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  try {
    await sweepStaleSessions(now);
  } catch (error) {
    console.error(JSON.stringify({ msg: "sweep_failed", error: String(error) }));
  }
}

class ServerlessLocationHub {
  async sessionStarted(_session: LocationSessionDTO): Promise<void> {
    await maybeSweep();
  }

  async sessionEnded(_lsid: string, _reason: SessionEndReason): Promise<void> {}

  async publishPosition(lsid: string, userId: string, position: Position): Promise<void> {
    const valid = positionSchema.safeParse(position);
    if (!valid.success) return;
    const p = valid.data;
    const now = Date.now();
    const pg = getPgD1();
    try {
      // DB-based persistence throttle: at most one stored point per PERSIST_INTERVAL_MS.
      const { rows } = await pg.query(
        `SELECT MAX(created_at) AS last FROM locations WHERE session_id = $1`,
        [lsid],
      );
      const last = Number((rows[0] as { last: number | null } | undefined)?.last ?? 0);
      if (now - last >= REALTIME.PERSIST_INTERVAL_MS) {
        await persistPosition(pg as unknown as D1Database, {
          sessionId: lsid,
          userId,
          lat: p.lat,
          lng: p.lng,
          accuracy: p.acc,
          altitude: p.alt ?? null,
          speed: p.spd ?? null,
          heading: p.hdg ?? null,
          recordedAt: Math.min(p.ts, now + 60_000),
        });
      }
    } catch (error) {
      console.error(JSON.stringify({ msg: "position_persist_failed", lsid, error: String(error) }));
    }
    await maybeSweep();
  }

  async connectionCounts(): Promise<{ viewers: number; publishers: number }> {
    await maybeSweep();
    const { rows } = await getPgD1().query(`SELECT COUNT(*) AS n FROM location_sessions WHERE status = 'active'`);
    return { viewers: 0, publishers: Number((rows[0] as { n: number } | undefined)?.n ?? 0) };
  }
}

class PgRateLimiter {
  getByName(key: string) {
    return {
      consume: async (limit: number, windowMs: number) => {
        const now = Date.now();
        const { rows } = await getPgD1().query(
          `INSERT INTO rate_limits (key, count, reset_at) VALUES ($1, 1, $2)
           ON CONFLICT (key) DO UPDATE SET
             count    = CASE WHEN rate_limits.reset_at <= $3 THEN 1 ELSE rate_limits.count + 1 END,
             reset_at = CASE WHEN rate_limits.reset_at <= $3 THEN $2 ELSE rate_limits.reset_at END
           RETURNING count, reset_at`,
          [key, now + windowMs, now],
        );
        const row = rows[0] as { count: number; reset_at: number };
        if (Math.random() < 0.01) {
          void getPgD1()
            .query(`DELETE FROM rate_limits WHERE reset_at < $1`, [now])
            .catch(() => undefined);
        }
        const allowed = row.count <= limit;
        return {
          allowed,
          remaining: Math.max(0, limit - row.count),
          retryAfterMs: allowed ? 0 : Math.max(0, row.reset_at - now),
        };
      },
    };
  }
}

const hub = new ServerlessLocationHub();
const rl = new PgRateLimiter();

export function getNodeEnv(): CloudflareEnv {
  return {
    ...(process.env as Record<string, string>),
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "true",
    AUTH_SECRET: process.env.AUTH_SECRET ?? "",
    DB: getPgD1() as unknown as D1Database,
    LOCATION_HUB: { getByName: () => hub } as unknown as CloudflareEnv["LOCATION_HUB"],
    RATE_LIMITER: rl as unknown as CloudflareEnv["RATE_LIMITER"],
    ASSETS: undefined as unknown as Fetcher,
  } as CloudflareEnv;
}
