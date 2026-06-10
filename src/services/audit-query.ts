import type { AuditLogDTO, AuditLogRow, Paginated } from "@/types";

function toAuditDTO(row: AuditLogRow): AuditLogDTO {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    // keep empty metadata for malformed rows
  }
  return {
    id: row.id,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    ip: row.ip,
    metadata,
    createdAt: row.created_at,
  };
}

export interface AuditFilter {
  action?: string;
  actor?: string;
  page: number;
  pageSize: number;
}

export async function listAuditLogs(db: D1Database, filter: AuditFilter): Promise<Paginated<AuditLogDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter.action) {
    where.push("action = ?");
    binds.push(filter.action);
  }
  if (filter.actor) {
    where.push("actor_email LIKE ?");
    binds.push(`%${filter.actor.replaceAll("%", "\\%")}%`);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await db
    .prepare(`SELECT * FROM audit_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, filter.pageSize, (filter.page - 1) * filter.pageSize)
    .all<AuditLogRow>();

  return {
    items: rows.results.map(toAuditDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

export async function listRecentActivity(db: D1Database, limit = 10): Promise<AuditLogDTO[]> {
  const rows = await db
    .prepare(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all<AuditLogRow>();
  return rows.results.map(toAuditDTO);
}
