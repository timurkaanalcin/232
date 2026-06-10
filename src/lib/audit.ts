import type { AuditAction } from "@/lib/constants";

export interface AuditEntry {
  actorId?: string | null;
  actorEmail?: string;
  action: AuditAction | string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Append an entry to the audit log. Audit logging must never break the main
 * request flow, so failures are logged and swallowed.
 */
export async function logAudit(db: D1Database, entry: AuditEntry): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, ip, user_agent, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        entry.actorId ?? null,
        entry.actorEmail ?? "",
        entry.action,
        entry.targetType ?? "",
        entry.targetId ?? "",
        entry.ip ?? "",
        (entry.userAgent ?? "").slice(0, 400),
        JSON.stringify(entry.metadata ?? {}),
        Date.now(),
      )
      .run();
  } catch (error) {
    console.error(JSON.stringify({ msg: "audit_log_write_failed", action: entry.action, error: String(error) }));
  }
}
