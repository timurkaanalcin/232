import { deviceNameFromUserAgent } from "@/lib/device";
import { SECURITY } from "@/lib/constants";
import type { DeviceSessionDTO, DeviceSessionRow } from "@/types";

export async function createDeviceSession(
  db: D1Database,
  input: { userId: string; userAgent: string; ip: string },
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, user_agent, ip, device_name, created_at, last_seen_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId,
      input.userAgent.slice(0, 400),
      input.ip,
      deviceNameFromUserAgent(input.userAgent),
      now,
      now,
      now + SECURITY.SESSION_MAX_AGE_S * 1000,
    )
    .run();
  return id;
}

export async function listDeviceSessions(
  db: D1Database,
  userId: string,
  currentSessionId: string,
): Promise<DeviceSessionDTO[]> {
  const rows = await db
    .prepare(
      `SELECT * FROM sessions
       WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?
       ORDER BY last_seen_at DESC`,
    )
    .bind(userId, Date.now())
    .all<DeviceSessionRow>();

  return rows.results.map((row) => ({
    id: row.id,
    deviceName: row.device_name,
    userAgent: row.user_agent,
    ip: row.ip,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    current: row.id === currentSessionId,
  }));
}

export async function revokeDeviceSession(db: D1Database, userId: string, sessionId: string): Promise<boolean> {
  const result = await db
    .prepare(`UPDATE sessions SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL`)
    .bind(Date.now(), sessionId, userId)
    .run();
  return (result.meta.changes ?? 0) > 0;
}

export async function revokeAllDeviceSessions(
  db: D1Database,
  userId: string,
  exceptSessionId?: string,
): Promise<void> {
  if (exceptSessionId) {
    await db
      .prepare(`UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND id != ? AND revoked_at IS NULL`)
      .bind(Date.now(), userId, exceptSessionId)
      .run();
  } else {
    await db
      .prepare(`UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`)
      .bind(Date.now(), userId)
      .run();
  }
}
