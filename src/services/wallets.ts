import type {
  Paginated,
  WalletDTO,
  WalletRow,
  WalletStatus,
  WalletTransactionDTO,
  WalletTransactionRow,
  WalletTransferDTO,
  WalletTransferRow,
  WalletType,
} from "@/types";

function parseMetadata(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function toWalletDTO(row: WalletRow): WalletDTO {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email ?? "",
    userName: row.user_name ?? "",
    walletType: row.wallet_type,
    currency: row.currency,
    status: row.status,
    balanceMinor: row.balance_minor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toWalletTransferDTO(row: WalletTransferRow): WalletTransferDTO {
  return {
    id: row.id,
    fromWalletId: row.from_wallet_id,
    toWalletId: row.to_wallet_id,
    amountMinor: row.amount_minor,
    currency: row.currency,
    status: row.status,
    memo: row.memo,
    createdBy: row.created_by,
    reversedBy: row.reversed_by,
    reversedAt: row.reversed_at,
    createdAt: row.created_at,
  };
}

export function toWalletTransactionDTO(row: WalletTransactionRow): WalletTransactionDTO {
  return {
    id: row.id,
    walletId: row.wallet_id,
    userId: row.user_id,
    transferId: row.transfer_id,
    transactionType: row.transaction_type,
    direction: row.direction,
    amountMinor: row.amount_minor,
    currency: row.currency,
    balanceAfterMinor: row.balance_after_minor,
    relatedWalletId: row.related_wallet_id,
    actorId: row.actor_id,
    memo: row.memo,
    metadata: parseMetadata(row.metadata),
    createdAt: row.created_at,
  };
}

export interface WalletFilter {
  q?: string;
  userId?: string;
  type?: WalletType;
  status?: WalletStatus;
  currency?: string;
  page: number;
  pageSize: number;
}

const WALLET_SELECT = `
  SELECT wallets.*, users.email AS user_email, users.name AS user_name
  FROM wallets
  JOIN users ON users.id = wallets.user_id
`;

export async function listWallets(db: D1Database, filter: WalletFilter): Promise<Paginated<WalletDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (filter.q) {
    where.push("(wallets.id LIKE ? OR users.email LIKE ? OR users.name LIKE ?)");
    const q = `%${filter.q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    binds.push(q, q, q);
  }
  if (filter.userId) {
    where.push("wallets.user_id = ?");
    binds.push(filter.userId);
  }
  if (filter.type) {
    where.push("wallets.wallet_type = ?");
    binds.push(filter.type);
  }
  if (filter.status) {
    where.push("wallets.status = ?");
    binds.push(filter.status);
  }
  if (filter.currency) {
    where.push("wallets.currency = ?");
    binds.push(filter.currency);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM wallets JOIN users ON users.id = wallets.user_id ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();
  const rows = await db
    .prepare(`${WALLET_SELECT} ${whereSql} ORDER BY wallets.created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, filter.pageSize, (filter.page - 1) * filter.pageSize)
    .all<WalletRow>();

  return {
    items: rows.results.map(toWalletDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

export async function findWalletById(db: D1Database, id: string): Promise<WalletDTO | null> {
  const row = await db.prepare(`${WALLET_SELECT} WHERE wallets.id = ?`).bind(id).first<WalletRow>();
  return row ? toWalletDTO(row) : null;
}

async function findWalletRowById(db: D1Database, id: string): Promise<WalletRow | null> {
  return db.prepare(`SELECT * FROM wallets WHERE id = ?`).bind(id).first<WalletRow>();
}

export async function createWallet(
  db: D1Database,
  input: { userId: string; walletType: WalletType; currency: string; actorId: string },
): Promise<WalletDTO> {
  const now = Date.now();
  const id = crypto.randomUUID();
  const transactionId = crypto.randomUUID();
  const currency = input.currency.toUpperCase();

  await db.batch([
    db
      .prepare(
        `INSERT INTO wallets (id, user_id, wallet_type, currency, status, balance_minor, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', 0, ?, ?)`,
      )
      .bind(id, input.userId, input.walletType, currency, now, now),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, NULL, 'wallet.created', 'neutral', 0, ?, 0, NULL, ?, 'Wallet created', '{}', ?)`,
      )
      .bind(transactionId, id, input.userId, currency, input.actorId, now),
  ]);

  const wallet = await findWalletById(db, id);
  if (!wallet) throw new Error("Wallet was not created");
  return wallet;
}

export async function updateWalletStatus(
  db: D1Database,
  id: string,
  input: { status: WalletStatus; actorId: string; memo?: string },
): Promise<WalletDTO | null> {
  const wallet = await findWalletRowById(db, id);
  if (!wallet) return null;
  if (input.status === "archived" && wallet.balance_minor !== 0) {
    throw new Error("Only zero-balance wallets can be archived");
  }
  if (wallet.status === input.status) return findWalletById(db, id);

  const now = Date.now();
  await db.batch([
    db.prepare(`UPDATE wallets SET status = ?, updated_at = ? WHERE id = ?`).bind(input.status, now, id),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, NULL, 'wallet.status_changed', 'neutral', 0, ?, ?, NULL, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        wallet.id,
        wallet.user_id,
        wallet.currency,
        wallet.balance_minor,
        input.actorId,
        input.memo ?? "",
        JSON.stringify({ from: wallet.status, to: input.status }),
        now,
      ),
  ]);

  return findWalletById(db, id);
}

export async function createWalletTransfer(
  db: D1Database,
  input: { fromWalletId: string; toWalletId: string; amountMinor: number; actorId: string; memo?: string },
): Promise<WalletTransferDTO> {
  if (input.fromWalletId === input.toWalletId) throw new Error("Transfer wallets must be different");
  const [fromWallet, toWallet] = await Promise.all([
    findWalletRowById(db, input.fromWalletId),
    findWalletRowById(db, input.toWalletId),
  ]);
  if (!fromWallet || !toWallet) throw new Error("Wallet not found");
  if (fromWallet.status !== "active" || toWallet.status !== "active") {
    throw new Error("Transfers require active wallets");
  }
  if (fromWallet.currency !== toWallet.currency) {
    throw new Error("Wallet currencies must match");
  }
  if (fromWallet.balance_minor < input.amountMinor) {
    throw new Error("Insufficient wallet balance");
  }

  const now = Date.now();
  const transferId = crypto.randomUUID();
  const fromAfter = fromWallet.balance_minor - input.amountMinor;
  const toAfter = toWallet.balance_minor + input.amountMinor;

  await db.batch([
    db.prepare(`UPDATE wallets SET balance_minor = ?, updated_at = ? WHERE id = ?`).bind(fromAfter, now, fromWallet.id),
    db.prepare(`UPDATE wallets SET balance_minor = ?, updated_at = ? WHERE id = ?`).bind(toAfter, now, toWallet.id),
    db
      .prepare(
        `INSERT INTO wallet_transfers (
          id, from_wallet_id, to_wallet_id, amount_minor, currency, status, memo, created_by, created_at
        )
        VALUES (?, ?, ?, ?, ?, 'posted', ?, ?, ?)`,
      )
      .bind(
        transferId,
        fromWallet.id,
        toWallet.id,
        input.amountMinor,
        fromWallet.currency,
        input.memo ?? "",
        input.actorId,
        now,
      ),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, ?, 'transfer', 'debit', ?, ?, ?, ?, ?, ?, '{}', ?)`,
      )
      .bind(
        crypto.randomUUID(),
        fromWallet.id,
        fromWallet.user_id,
        transferId,
        input.amountMinor,
        fromWallet.currency,
        fromAfter,
        toWallet.id,
        input.actorId,
        input.memo ?? "",
        now,
      ),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, ?, 'transfer', 'credit', ?, ?, ?, ?, ?, ?, '{}', ?)`,
      )
      .bind(
        crypto.randomUUID(),
        toWallet.id,
        toWallet.user_id,
        transferId,
        input.amountMinor,
        toWallet.currency,
        toAfter,
        fromWallet.id,
        input.actorId,
        input.memo ?? "",
        now,
      ),
  ]);

  const transfer = await findWalletTransferById(db, transferId);
  if (!transfer) throw new Error("Wallet transfer was not created");
  return transfer;
}

export async function findWalletTransferById(db: D1Database, id: string): Promise<WalletTransferDTO | null> {
  const row = await db.prepare(`SELECT * FROM wallet_transfers WHERE id = ?`).bind(id).first<WalletTransferRow>();
  return row ? toWalletTransferDTO(row) : null;
}

export async function reverseWalletTransfer(
  db: D1Database,
  id: string,
  input: { actorId: string; memo?: string },
): Promise<WalletTransferDTO | null> {
  const transferRow = await db.prepare(`SELECT * FROM wallet_transfers WHERE id = ?`).bind(id).first<WalletTransferRow>();
  if (!transferRow) return null;
  if (transferRow.status === "reversed") return toWalletTransferDTO(transferRow);

  const [fromWallet, toWallet] = await Promise.all([
    findWalletRowById(db, transferRow.from_wallet_id),
    findWalletRowById(db, transferRow.to_wallet_id),
  ]);
  if (!fromWallet || !toWallet) throw new Error("Wallet not found");
  if (toWallet.balance_minor < transferRow.amount_minor) {
    throw new Error("Receiving wallet no longer has enough balance to reverse this transfer");
  }

  const now = Date.now();
  const fromAfter = fromWallet.balance_minor + transferRow.amount_minor;
  const toAfter = toWallet.balance_minor - transferRow.amount_minor;
  const memo = input.memo || `Reversal of transfer ${transferRow.id}`;

  await db.batch([
    db
      .prepare(`UPDATE wallet_transfers SET status = 'reversed', reversed_by = ?, reversed_at = ? WHERE id = ?`)
      .bind(input.actorId, now, transferRow.id),
    db.prepare(`UPDATE wallets SET balance_minor = ?, updated_at = ? WHERE id = ?`).bind(fromAfter, now, fromWallet.id),
    db.prepare(`UPDATE wallets SET balance_minor = ?, updated_at = ? WHERE id = ?`).bind(toAfter, now, toWallet.id),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, ?, 'transfer.reversal', 'credit', ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        fromWallet.id,
        fromWallet.user_id,
        transferRow.id,
        transferRow.amount_minor,
        transferRow.currency,
        fromAfter,
        toWallet.id,
        input.actorId,
        memo,
        JSON.stringify({ reversalOf: transferRow.id }),
        now,
      ),
    db
      .prepare(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transfer_id, transaction_type, direction, amount_minor,
          currency, balance_after_minor, related_wallet_id, actor_id, memo, metadata, created_at
        )
        VALUES (?, ?, ?, ?, 'transfer.reversal', 'debit', ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        toWallet.id,
        toWallet.user_id,
        transferRow.id,
        transferRow.amount_minor,
        transferRow.currency,
        toAfter,
        fromWallet.id,
        input.actorId,
        memo,
        JSON.stringify({ reversalOf: transferRow.id }),
        now,
      ),
  ]);

  return findWalletTransferById(db, transferRow.id);
}

export async function listWalletTransactions(
  db: D1Database,
  filter: { walletId?: string; userId?: string; page: number; pageSize: number },
): Promise<Paginated<WalletTransactionDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (filter.walletId) {
    where.push("wallet_id = ?");
    binds.push(filter.walletId);
  }
  if (filter.userId) {
    where.push("user_id = ?");
    binds.push(filter.userId);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM wallet_transactions ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();
  const rows = await db
    .prepare(`SELECT * FROM wallet_transactions ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds, filter.pageSize, (filter.page - 1) * filter.pageSize)
    .all<WalletTransactionRow>();

  return {
    items: rows.results.map(toWalletTransactionDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

export async function getWalletStats(db: D1Database) {
  const [total, active, frozen, archived, balances] = await db.batch<{ n: number; currency?: string; balance?: number }>([
    db.prepare(`SELECT COUNT(*) AS n FROM wallets`),
    db.prepare(`SELECT COUNT(*) AS n FROM wallets WHERE status = 'active'`),
    db.prepare(`SELECT COUNT(*) AS n FROM wallets WHERE status = 'frozen'`),
    db.prepare(`SELECT COUNT(*) AS n FROM wallets WHERE status = 'archived'`),
    db
      .prepare(
        `SELECT currency, SUM(balance_minor) AS balance
         FROM wallets
         WHERE status != 'archived'
         GROUP BY currency
         ORDER BY currency ASC
         LIMIT 8`,
      ),
  ]);

  const count = (result: D1Result<{ n: number }> | undefined) => result?.results[0]?.n ?? 0;
  return {
    total: count(total as D1Result<{ n: number }>),
    active: count(active as D1Result<{ n: number }>),
    frozen: count(frozen as D1Result<{ n: number }>),
    archived: count(archived as D1Result<{ n: number }>),
    balancesByCurrency: (balances?.results ?? []).map((row) => ({
      currency: String(row.currency ?? ""),
      balanceMinor: Number(row.balance ?? 0),
    })),
  };
}
