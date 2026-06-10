import type { NotificationDTO, Paginated } from "@/types";

interface NotificationRow {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string;
  metadata: string;
  read_at: number | null;
  created_at: number;
}

function toDTO(row: NotificationRow): NotificationDTO {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(row.metadata) as Record<string, unknown>;
  } catch {
    // keep empty
  }
  return {
    id: row.id,
    type: row.type as NotificationDTO["type"],
    title: row.title,
    body: row.body,
    metadata,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function createNotification(
  db: D1Database,
  input: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO notifications (user_id, type, title, body, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.userId,
        input.type,
        input.title,
        input.body ?? "",
        JSON.stringify(input.metadata ?? {}),
        Date.now(),
      )
      .run();
  } catch (error) {
    console.error(JSON.stringify({ msg: "notification_create_failed", error: String(error) }));
  }
}

export async function listNotifications(
  db: D1Database,
  userId: string,
  page: number,
  pageSize: number,
): Promise<Paginated<NotificationDTO>> {
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`)
    .bind(userId)
    .first<{ total: number }>();

  const rows = await db
    .prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(userId, pageSize, (page - 1) * pageSize)
    .all<NotificationRow>();

  return {
    items: rows.results.map(toDTO),
    total: countRow?.total ?? 0,
    page,
    pageSize,
  };
}

export async function countUnread(db: D1Database, userId: string): Promise<number> {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL`)
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function markNotificationRead(db: D1Database, userId: string, id: number): Promise<boolean> {
  const result = await db
    .prepare(`UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ? AND read_at IS NULL`)
    .bind(Date.now(), id, userId)
    .run();
  return (result.meta.changes ?? 0) > 0;
}

export async function markAllNotificationsRead(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare(`UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL`)
    .bind(Date.now(), userId)
    .run();
}
