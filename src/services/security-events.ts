import type { Paginated, SecurityEventDTO, SecuritySeverity } from "@/types";

interface SecurityEventRow {
  id: number;
  event_type: string;
  severity: SecuritySeverity;
  actor_id: string | null;
  actor_email: string;
  ip: string;
  user_agent: string;
  metadata: string;
  created_at: number;
}

function toDTO(row: SecurityEventRow): SecurityEventDTO {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    // keep empty
  }
  return {
    id: row.id,
    eventType: row.event_type,
    severity: row.severity,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    ip: row.ip,
    metadata,
    createdAt: row.created_at,
  };
}

export async function logSecurityEvent(
  db: D1Database,
  input: {
    eventType: string;
    severity?: SecuritySeverity;
    actorId?: string | null;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO security_events (event_type, severity, actor_id, actor_email, ip, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.eventType,
        input.severity ?? "info",
        input.actorId ?? null,
        input.actorEmail ?? "",
        input.ip ?? "",
        (input.userAgent ?? "").slice(0, 400),
        JSON.stringify(input.metadata ?? {}),
        Date.now(),
      )
      .run();
  } catch (error) {
    console.error(JSON.stringify({ msg: "security_event_write_failed", error: String(error) }));
  }
}

export interface SecurityEventFilter {
  eventType?: string;
  severity?: SecuritySeverity;
  page: number;
  pageSize: number;
}

export async function listSecurityEvents(
  db: D1Database,
  filter: SecurityEventFilter,
): Promise<Paginated<SecurityEventDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter.eventType) {
    where.push("event_type = ?");
    binds.push(filter.eventType);
  }
  if (filter.severity) {
    where.push("severity = ?");
    binds.push(filter.severity);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM security_events ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await db
    .prepare(`SELECT * FROM security_events ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, filter.pageSize, (filter.page - 1) * filter.pageSize)
    .all<SecurityEventRow>();

  return {
    items: rows.results.map(toDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

export async function getSecurityStats(db: D1Database) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = dayStart.getTime();

  const [failedLogins, rateLimited, critical, warnings] = await db.batch<{ n: number }>([
    db
      .prepare(`SELECT COUNT(*) AS n FROM security_events WHERE event_type = 'auth.login_failed' AND created_at >= ?`)
      .bind(today),
    db
      .prepare(`SELECT COUNT(*) AS n FROM security_events WHERE event_type = 'rate_limit.exceeded' AND created_at >= ?`)
      .bind(today),
    db.prepare(`SELECT COUNT(*) AS n FROM security_events WHERE severity = 'critical' AND created_at >= ?`).bind(today),
    db.prepare(`SELECT COUNT(*) AS n FROM security_events WHERE severity = 'warning' AND created_at >= ?`).bind(today),
  ]);

  const count = (r: D1Result<{ n: number }>) => r.results[0]?.n ?? 0;
  return {
    failedLoginsToday: count(failedLogins!),
    rateLimitedToday: count(rateLimited!),
    criticalToday: count(critical!),
    warningsToday: count(warnings!),
  };
}
