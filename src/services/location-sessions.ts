import type {
  LocationPointDTO,
  LocationRow,
  LocationSessionDTO,
  LocationSessionRow,
  Paginated,
  SessionEndReason,
} from "@/types";

export function toLocationSessionDTO(
  row: LocationSessionRow & { user_name?: string; user_email?: string },
): LocationSessionDTO {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    label: row.label,
    consentGrantedAt: row.consent_granted_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    endReason: row.end_reason,
    lastLat: row.last_lat,
    lastLng: row.last_lng,
    lastAccuracy: row.last_accuracy,
    lastUpdateAt: row.last_update_at,
    pointsCount: row.points_count,
    userName: row.user_name,
    userEmail: row.user_email,
  };
}

export async function getActiveSessionForUser(
  db: D1Database,
  userId: string,
): Promise<LocationSessionRow | null> {
  return db
    .prepare(`SELECT * FROM location_sessions WHERE user_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1`)
    .bind(userId)
    .first<LocationSessionRow>();
}

export async function getLocationSession(db: D1Database, id: string): Promise<LocationSessionRow | null> {
  return db.prepare(`SELECT * FROM location_sessions WHERE id = ?`).bind(id).first<LocationSessionRow>();
}

export async function startLocationSession(
  db: D1Database,
  input: { userId: string; deviceSessionId: string | null; label: string },
): Promise<LocationSessionRow> {
  const now = Date.now();
  const id = crypto.randomUUID();

  // A user has at most one active session: end any leftovers first.
  await db
    .prepare(
      `UPDATE location_sessions SET status = 'ended', ended_at = ?, end_reason = 'user'
       WHERE user_id = ? AND status = 'active'`,
    )
    .bind(now, input.userId)
    .run();

  await db
    .prepare(
      `INSERT INTO location_sessions (id, user_id, device_session_id, status, label, consent_granted_at, started_at)
       VALUES (?, ?, ?, 'active', ?, ?, ?)`,
    )
    .bind(id, input.userId, input.deviceSessionId, input.label, now, now)
    .run();

  const row = await getLocationSession(db, id);
  if (!row) throw new Error("Failed to create location session");
  return row;
}

export async function endLocationSession(
  db: D1Database,
  id: string,
  reason: SessionEndReason,
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE location_sessions SET status = 'ended', ended_at = ?, end_reason = ? WHERE id = ? AND status = 'active'`,
    )
    .bind(Date.now(), reason, id)
    .run();
  return (result.meta.changes ?? 0) > 0;
}

export async function listSessionsForUser(
  db: D1Database,
  userId: string,
  page: number,
  pageSize: number,
): Promise<Paginated<LocationSessionDTO>> {
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM location_sessions WHERE user_id = ?`)
    .bind(userId)
    .first<{ total: number }>();

  const rows = await db
    .prepare(`SELECT * FROM location_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?`)
    .bind(userId, pageSize, (page - 1) * pageSize)
    .all<LocationSessionRow>();

  return {
    items: rows.results.map(toLocationSessionDTO),
    total: countRow?.total ?? 0,
    page,
    pageSize,
  };
}

/** Active sessions joined with user info - used by the admin live map. */
export async function listActiveSessions(db: D1Database): Promise<LocationSessionDTO[]> {
  const rows = await db
    .prepare(
      `SELECT ls.*, u.name AS user_name, u.email AS user_email
       FROM location_sessions ls
       JOIN users u ON u.id = ls.user_id
       WHERE ls.status = 'active'
       ORDER BY ls.started_at DESC`,
    )
    .all<LocationSessionRow & { user_name: string; user_email: string }>();
  return rows.results.map(toLocationSessionDTO);
}

export async function getSessionPoints(
  db: D1Database,
  sessionId: string,
  limit = 5000,
): Promise<LocationPointDTO[]> {
  const rows = await db
    .prepare(
      `SELECT lat, lng, accuracy, altitude, speed, heading, recorded_at
       FROM locations WHERE session_id = ? ORDER BY recorded_at ASC LIMIT ?`,
    )
    .bind(sessionId, limit)
    .all<Pick<LocationRow, "lat" | "lng" | "accuracy" | "altitude" | "speed" | "heading" | "recorded_at">>();

  return rows.results.map((row) => ({
    lat: row.lat,
    lng: row.lng,
    accuracy: row.accuracy,
    altitude: row.altitude,
    speed: row.speed,
    heading: row.heading,
    recordedAt: row.recorded_at,
  }));
}

export interface PersistPositionInput {
  sessionId: string;
  userId: string;
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recordedAt: number;
}

/** Atomically inserts a location point and refreshes the session summary. */
export async function persistPosition(db: D1Database, input: PersistPositionInput): Promise<void> {
  const now = Date.now();
  await db.batch([
    db
      .prepare(
        `INSERT INTO locations (session_id, user_id, lat, lng, accuracy, altitude, speed, heading, recorded_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.sessionId,
        input.userId,
        input.lat,
        input.lng,
        input.accuracy,
        input.altitude,
        input.speed,
        input.heading,
        input.recordedAt,
        now,
      ),
    db
      .prepare(
        `UPDATE location_sessions
         SET last_lat = ?, last_lng = ?, last_accuracy = ?, last_update_at = ?, points_count = points_count + 1
         WHERE id = ? AND status = 'active'`,
      )
      .bind(input.lat, input.lng, input.accuracy, now, input.sessionId),
  ]);
}
