import type {
  Paginated,
  RiskEventDTO,
  RiskEventRow,
  RiskEventSeverity,
  RiskEventStatus,
} from "@/types";

function parseMetadata(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function toRiskEventDTO(row: RiskEventRow): RiskEventDTO {
  return {
    id: row.id,
    source: row.source,
    eventType: row.event_type,
    severity: row.severity,
    status: row.status,
    riskScore: row.risk_score,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description,
    metadata: parseMetadata(row.metadata),
    operatorNote: row.operator_note,
    acknowledgedBy: row.acknowledged_by,
    acknowledgedAt: row.acknowledged_at,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface RiskEventFilter {
  status?: RiskEventStatus;
  severity?: RiskEventSeverity;
  source?: string;
  eventType?: string;
  subject?: string;
  page: number;
  pageSize: number;
}

export async function listRiskEvents(
  db: D1Database,
  filter: RiskEventFilter,
): Promise<Paginated<RiskEventDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (filter.status) {
    where.push("status = ?");
    binds.push(filter.status);
  }
  if (filter.severity) {
    where.push("severity = ?");
    binds.push(filter.severity);
  }
  if (filter.source) {
    where.push("source = ?");
    binds.push(filter.source);
  }
  if (filter.eventType) {
    where.push("event_type = ?");
    binds.push(filter.eventType);
  }
  if (filter.subject) {
    where.push("(subject_type LIKE ? OR subject_id LIKE ? OR title LIKE ?)");
    const subject = `%${filter.subject}%`;
    binds.push(subject, subject, subject);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (filter.page - 1) * filter.pageSize;

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM risk_events ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await db
    .prepare(`SELECT * FROM risk_events ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, filter.pageSize, offset)
    .all<RiskEventRow>();

  return {
    items: rows.results.map(toRiskEventDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

export async function findRiskEventById(db: D1Database, id: number): Promise<RiskEventDTO | null> {
  const row = await db.prepare(`SELECT * FROM risk_events WHERE id = ?`).bind(id).first<RiskEventRow>();
  return row ? toRiskEventDTO(row) : null;
}

export async function createRiskEvent(
  db: D1Database,
  input: {
    source: string;
    eventType: string;
    severity: RiskEventSeverity;
    riskScore?: number;
    subjectType?: string;
    subjectId?: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<RiskEventDTO> {
  const now = Date.now();
  const result = await db
    .prepare(
      `INSERT INTO risk_events (
        source, event_type, severity, status, risk_score, subject_type, subject_id,
        title, description, metadata, created_at, updated_at
      )
      VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.source,
      input.eventType,
      input.severity,
      input.riskScore ?? 0,
      input.subjectType ?? "",
      input.subjectId ?? "",
      input.title,
      input.description ?? "",
      JSON.stringify(input.metadata ?? {}),
      now,
      now,
    )
    .run();

  const id = result.meta.last_row_id;
  const created = await findRiskEventById(db, id);
  if (!created) throw new Error("Risk event was not created");
  return created;
}

export async function acknowledgeRiskEvent(
  db: D1Database,
  id: number,
  input: { actorId: string; note?: string },
): Promise<{ event: RiskEventDTO | null; changed: boolean }> {
  const current = await findRiskEventById(db, id);
  if (!current) return { event: null, changed: false };
  if (current.status !== "open") return { event: current, changed: false };

  const now = Date.now();
  await db
    .prepare(
      `UPDATE risk_events
       SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = ?, operator_note = ?, updated_at = ?
       WHERE id = ? AND status = 'open'`,
    )
    .bind(input.actorId, now, input.note ?? "", now, id)
    .run();

  return { event: await findRiskEventById(db, id), changed: true };
}

export async function resolveRiskEvent(
  db: D1Database,
  id: number,
  input: { actorId: string; note?: string },
): Promise<{ event: RiskEventDTO | null; changed: boolean }> {
  const current = await findRiskEventById(db, id);
  if (!current) return { event: null, changed: false };
  if (current.status === "resolved") return { event: current, changed: false };

  const now = Date.now();
  const note = input.note ?? current.operatorNote;
  await db
    .prepare(
      `UPDATE risk_events
       SET status = 'resolved', resolved_by = ?, resolved_at = ?, operator_note = ?, updated_at = ?
       WHERE id = ? AND status != 'resolved'`,
    )
    .bind(input.actorId, now, note, now, id)
    .run();

  return { event: await findRiskEventById(db, id), changed: true };
}

export async function getRiskEventStats(db: D1Database) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = dayStart.getTime();

  const [open, acknowledged, criticalOpen, warningOpen, resolvedToday, highScoreOpen] = await db.batch<{ n: number }>([
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status = 'open'`),
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status = 'acknowledged'`),
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status = 'open' AND severity = 'critical'`),
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status = 'open' AND severity = 'warning'`),
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status = 'resolved' AND resolved_at >= ?`).bind(today),
    db.prepare(`SELECT COUNT(*) AS n FROM risk_events WHERE status != 'resolved' AND risk_score >= 80`),
  ]);

  const count = (result: D1Result<{ n: number }> | undefined) => result?.results[0]?.n ?? 0;
  return {
    open: count(open),
    acknowledged: count(acknowledged),
    criticalOpen: count(criticalOpen),
    warningsOpen: count(warningOpen),
    resolvedToday: count(resolvedToday),
    highScoreOpen: count(highScoreOpen),
  };
}
