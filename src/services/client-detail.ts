import { adminUpdateUser, findUserById, toUserDTO } from "@/services/users";
import type {
  ClientCommentDTO,
  ClientDetailDTO,
  ClientDocumentDTO,
  ClientMoneyTransactionDTO,
  ClientManagerOptionDTO,
  ClientSupportMessageDTO,
  ClientTradeAccountDTO,
  CrmStatus,
  RetentionStatus,
  RoleId,
} from "@/types";

interface CommentRow {
  id: string;
  author_id: string | null;
  author_name: string;
  author_email: string;
  body: string;
  created_at: number;
}

interface TradeAccountRow {
  id: string;
  account_no: string;
  name: string;
  account_type: "live" | "demo";
  currency: string;
  balance: number;
  credit: number;
  status: "active" | "disabled";
  created_at: number;
}

interface MoneyTransactionRow {
  id: string;
  tx_type: ClientMoneyTransactionDTO["txType"];
  amount: number;
  currency: string;
  method: string;
  tx_status: ClientMoneyTransactionDTO["txStatus"];
  reference_no: string;
  note: string;
  created_at: number;
}

interface DocumentRow {
  id: string;
  title: string;
  document_type: ClientDocumentDTO["documentType"];
  file_url: string;
  doc_status: ClientDocumentDTO["docStatus"];
  created_at: number;
}

interface SupportMessageRow {
  id: string;
  sender_id: string | null;
  sender_name: string;
  sender_email: string;
  sender_role: RoleId | string;
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

function toTradeAccountDTO(row: TradeAccountRow): ClientTradeAccountDTO {
  return {
    id: row.id,
    accountNo: row.account_no,
    name: row.name,
    accountType: row.account_type,
    currency: row.currency,
    balance: row.balance,
    credit: row.credit,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toMoneyTransactionDTO(row: MoneyTransactionRow): ClientMoneyTransactionDTO {
  return {
    id: row.id,
    txType: row.tx_type,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    txStatus: row.tx_status,
    referenceNo: row.reference_no,
    note: row.note,
    createdAt: row.created_at,
  };
}

function toDocumentDTO(row: DocumentRow): ClientDocumentDTO {
  return {
    id: row.id,
    title: row.title,
    documentType: row.document_type,
    fileUrl: row.file_url,
    docStatus: row.doc_status,
    createdAt: row.created_at,
  };
}

function toSupportMessageDTO(row: SupportMessageRow, actorId?: string): ClientSupportMessageDTO {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    senderRole: row.sender_role,
    body: row.body,
    createdAt: row.created_at,
    mine: actorId ? row.sender_id === actorId : false,
  };
}

export async function canAccessClientSupport(
  db: D1Database,
  clientId: string,
  actor: { id: string; role: RoleId },
): Promise<boolean> {
  if (actor.role === "super_admin" || actor.role === "shift" || actor.role === "admin") return true;
  if (actor.id === clientId) return true;

  const client = await db
    .prepare(
      `SELECT c.manager_id, m.role_id AS manager_role, m.manager_id AS team_leader_id
       FROM users c
       LEFT JOIN users m ON m.id = c.manager_id
       WHERE c.id = ? AND c.role_id = 'user'`,
    )
    .bind(clientId)
    .first<{ manager_id: string | null; manager_role: RoleId | null; team_leader_id: string | null }>();

  if (!client) return false;
  if (client.manager_id === actor.id) return true;
  if (client.team_leader_id === actor.id) return true;
  if (client.manager_role === "sale" && actor.role === "viewer") return true;
  if (client.manager_role === "retention" && actor.role === "operator") return true;
  return false;
}

export async function getClientDetail(
  db: D1Database,
  clientId: string,
  actor?: { id: string; role: RoleId },
): Promise<ClientDetailDTO | null> {
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

  const supportAllowed = actor ? await canAccessClientSupport(db, clientId, actor) : true;
  const managerScopeSql =
    actor && actor.role !== "super_admin"
      ? `AND (u.id = ? OR u.manager_id = ? OR m1.manager_id = ? OR m2.manager_id = ?)`
      : "";
  const managerScopeBinds = managerScopeSql && actor ? [actor.id, actor.id, actor.id, actor.id] : [];

  const [comments, managers, tradeAccounts, moneyTransactions, documents, supportMessages] = await Promise.all([
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
        `SELECT u.id, u.name, u.role_id AS role
         FROM users u
         LEFT JOIN users m1 ON m1.id = u.manager_id
         LEFT JOIN users m2 ON m2.id = m1.manager_id
         WHERE u.role_id <> 'user' AND u.status = 'active'
         ${managerScopeSql}
         ORDER BY
           CASE u.role_id
             WHEN 'super_admin' THEN 1
             WHEN 'shift' THEN 2
             WHEN 'admin' THEN 3
             WHEN 'operator' THEN 4
             WHEN 'viewer' THEN 5
             WHEN 'retention' THEN 6
             WHEN 'sale' THEN 7
             ELSE 8
           END,
           u.name ASC`,
      )
      .bind(...managerScopeBinds)
      .all<ClientManagerOptionDTO>(),
    db
      .prepare(
        `SELECT id, account_no, name, account_type, currency, balance, credit, status, created_at
         FROM crm_trade_accounts
         WHERE client_id = ?
         ORDER BY created_at DESC`,
      )
      .bind(clientId)
      .all<TradeAccountRow>(),
    db
      .prepare(
        `SELECT id, tx_type, amount, currency, method, tx_status, reference_no, note, created_at
         FROM crm_money_transactions
         WHERE client_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .bind(clientId)
      .all<MoneyTransactionRow>(),
    db
      .prepare(
        `SELECT id, title, document_type, file_url, doc_status, created_at
         FROM crm_documents
         WHERE client_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .bind(clientId)
      .all<DocumentRow>(),
    supportAllowed
      ? db
          .prepare(
            `SELECT id, sender_id, sender_name, sender_email, sender_role, body, created_at
             FROM crm_support_messages
             WHERE client_id = ?
             ORDER BY created_at DESC
             LIMIT 100`,
          )
          .bind(clientId)
          .all<SupportMessageRow>()
      : Promise.resolve({ results: [] as SupportMessageRow[] }),
  ]);

  return {
    user: toUserDTO(row),
    extraInfo: row.extra_info ?? "",
    comments: comments.results.map(toCommentDTO),
    tradeAccounts: tradeAccounts.results.map(toTradeAccountDTO),
    moneyTransactions: moneyTransactions.results.map(toMoneyTransactionDTO),
    documents: documents.results.map(toDocumentDTO),
    supportMessages: supportMessages.results.map((message) => toSupportMessageDTO(message, actor?.id)),
    managers: managers.results,
  };
}

export async function updateClientDetail(
  db: D1Database,
  clientId: string,
  input: {
    name?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
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
    name: input.name,
    phone: input.phone,
    address: input.address,
    dateOfBirth: input.dateOfBirth,
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

export async function addTradeAccount(
  db: D1Database,
  clientId: string,
  input: { accountNo: string; name: string; accountType: "live" | "demo"; currency: string },
): Promise<ClientTradeAccountDTO> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO crm_trade_accounts (id, client_id, account_no, name, account_type, currency, balance, credit, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'active', ?)`,
    )
    .bind(id, clientId, input.accountNo, input.name, input.accountType, input.currency, now)
    .run();
  return {
    id,
    accountNo: input.accountNo,
    name: input.name,
    accountType: input.accountType,
    currency: input.currency,
    balance: 0,
    credit: 0,
    status: "active",
    createdAt: now,
  };
}

export async function addMoneyTransaction(
  db: D1Database,
  clientId: string,
  input: {
    txType: ClientMoneyTransactionDTO["txType"];
    amount: number;
    currency: string;
    method: string;
    txStatus: ClientMoneyTransactionDTO["txStatus"];
    referenceNo: string;
    note: string;
  },
): Promise<ClientMoneyTransactionDTO> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO crm_money_transactions (id, client_id, tx_type, amount, currency, method, tx_status, reference_no, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, clientId, input.txType, input.amount, input.currency, input.method, input.txStatus, input.referenceNo, input.note, now)
    .run();
  return { id, ...input, createdAt: now };
}

export async function addDocument(
  db: D1Database,
  clientId: string,
  input: { title: string; documentType: ClientDocumentDTO["documentType"]; fileUrl: string },
): Promise<ClientDocumentDTO> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO crm_documents (id, client_id, title, document_type, file_url, doc_status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .bind(id, clientId, input.title, input.documentType, input.fileUrl, now)
    .run();
  return { id, title: input.title, documentType: input.documentType, fileUrl: input.fileUrl, docStatus: "pending", createdAt: now };
}

export async function addSupportMessage(
  db: D1Database,
  input: {
    clientId: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    senderRole: RoleId;
    body: string;
  },
): Promise<ClientSupportMessageDTO> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO crm_support_messages (id, client_id, sender_id, sender_name, sender_email, sender_role, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.clientId, input.senderId, input.senderName, input.senderEmail, input.senderRole, input.body, now)
    .run();
  return {
    id,
    senderId: input.senderId,
    senderName: input.senderName,
    senderEmail: input.senderEmail,
    senderRole: input.senderRole,
    body: input.body,
    createdAt: now,
    mine: true,
  };
}

export async function ensureClientExists(db: D1Database, clientId: string): Promise<boolean> {
  const client = await findUserById(db, clientId);
  return client?.role_id === "user";
}
