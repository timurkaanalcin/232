import { adminUpdateUser, findUserById, toUserDTO } from "@/services/users";
import type {
  ClientCommentDTO,
  ClientDetailDTO,
  ClientManagerOptionDTO,
  CrmStatus,
  RetentionStatus,
} from "@/types";

interface CommentRow {
  id: string;
  author_id: string | null;
  author_name: string;
  author_email: string;
  body: string;
  created_at: number;
}

function toCommentDTO(row: CommentRow): ClientCommentDTO {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function getClientDetail(db: D1Database, clientId: string): Promise<ClientDetailDTO | null> {
  const row = await db
    .prepare(
      `WITH trade_stats AS (
         SELECT client_id, COUNT(*) AS order_count, COALESCE(SUM(notional), 0) AS total_notional, MAX(created_at) AS last_trade_at
         FROM crm_trade_orders
         GROUP BY client_id
       ),
       open_position_stats AS (
         SELECT client_id, COUNT(*) AS open_positions
         FROM (
           SELECT client_id, symbol, SUM(CASE WHEN side = 'buy' THEN quantity ELSE -quantity END) AS quantity
           FROM crm_trade_orders
           GROUP BY client_id, symbol
           HAVING ABS(quantity) > 0.000001
         )
         GROUP BY client_id
       )
       SELECT u.*, m.name AS manager_name,
              COALESCE(ts.order_count, 0) AS trade_order_count,
              COALESCE(ts.total_notional, 0) AS trade_total_notional,
              COALESCE(ops.open_positions, 0) AS trade_open_positions,
              ts.last_trade_at AS trade_last_at
       FROM users u
       LEFT JOIN users m ON m.id = u.manager_id
       LEFT JOIN trade_stats ts ON ts.client_id = u.id
       LEFT JOIN open_position_stats ops ON ops.client_id = u.id
       WHERE u.id = ? AND u.role_id = 'user'`,
    )
    .bind(clientId)
    .first<Parameters<typeof toUserDTO>[0] & { extra_info?: string }>();

  if (!row) return null;

  const [comments, managers] = await Promise.all([
    db
      .prepare(
        `SELECT id, author_id, author_name, author_email, body, created_at
         FROM crm_client_comments
         WHERE client_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .bind(clientId)
      .all<CommentRow>(),
    db
      .prepare(
        `SELECT id, name, role_id AS role
         FROM users
         WHERE role_id <> 'user' AND status = 'active'
         ORDER BY
           CASE role_id
             WHEN 'super_admin' THEN 1
             WHEN 'shift' THEN 2
             WHEN 'admin' THEN 3
             WHEN 'operator' THEN 4
             WHEN 'viewer' THEN 5
             WHEN 'retention' THEN 6
             WHEN 'sale' THEN 7
             ELSE 8
           END,
           name ASC`,
      )
      .all<ClientManagerOptionDTO>(),
  ]);

  return {
    user: toUserDTO(row),
    extraInfo: row.extra_info ?? "",
    comments: comments.results.map(toCommentDTO),
    managers: managers.results,
  };
}

export async function updateClientDetail(
  db: D1Database,
  clientId: string,
  input: {
    extraInfo?: string;
    managerId?: string | null;
    saleStatus?: CrmStatus;
    saleStatusScheduledAt?: number | null;
    retentionStatus?: RetentionStatus;
    retentionStatusScheduledAt?: number | null;
    adSource?: string;
  },
): Promise<void> {
  if (input.extraInfo !== undefined) {
    await db
      .prepare(`UPDATE users SET extra_info = ?, updated_at = ? WHERE id = ? AND role_id = 'user'`)
      .bind(input.extraInfo, Date.now(), clientId)
      .run();
  }

  await adminUpdateUser(db, clientId, {
    managerId: input.managerId,
    saleStatus: input.saleStatus,
    saleStatusScheduledAt: input.saleStatusScheduledAt,
    retentionStatus: input.retentionStatus,
    retentionStatusScheduledAt: input.retentionStatusScheduledAt,
    adSource: input.adSource,
  });
}

export async function addClientComment(
  db: D1Database,
  input: {
    clientId: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    body: string;
  },
): Promise<ClientCommentDTO> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO crm_client_comments (id, client_id, author_id, author_name, author_email, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.clientId, input.authorId, input.authorName, input.authorEmail, input.body, now)
    .run();

  return {
    id,
    authorId: input.authorId,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    body: input.body,
    createdAt: now,
  };
}

export async function ensureClientExists(db: D1Database, clientId: string): Promise<boolean> {
  const client = await findUserById(db, clientId);
  return client?.role_id === "user";
}
