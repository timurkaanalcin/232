import { hashPassword } from "@/lib/crypto";
import { DEFAULT_COUNTRY_CODE, DEFAULT_TIMEZONE, countryForTimezone } from "@/lib/constants";
import type { CrmDepartment, CrmStatus, Paginated, RetentionStatus, RoleId, UserDTO, UserRow, UserStatus } from "@/types";

type UserRowWithManager = UserRow & {
  manager_name?: string | null;
  manager_role?: RoleId | null;
  total_deposit?: number | null;
  total_balance?: number | null;
  trade_order_count?: number | null;
  trade_total_notional?: number | null;
  trade_open_positions?: number | null;
  trade_last_at?: number | null;
};

export function toUserDTO(row: UserRowWithManager): UserDTO {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    role: row.role_id,
    clientNumericId: row.client_numeric_id ?? "",
    saleStatus: row.sale_status ?? "new",
    saleStatusScheduledAt: row.sale_status_scheduled_at ?? null,
    phone: row.phone ?? "",
    address: row.address ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    department: row.department ?? "client",
    retentionStatus: row.retention_status ?? "new",
    retentionStatusScheduledAt: row.retention_status_scheduled_at ?? null,
    adSource: row.ad_source ?? "",
    countryCode: row.country_code ?? DEFAULT_COUNTRY_CODE,
    timezone: row.timezone ?? DEFAULT_TIMEZONE,
    companyName: row.company_name ?? "",
    managerId: row.manager_id ?? null,
    managerName: row.manager_name ?? null,
    managerRole: row.manager_role ?? null,
    status: row.status,
    emailVerified: row.email_verified === 1,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    financeSummary: {
      totalDeposit: row.total_deposit ?? 0,
      totalBalance: row.total_balance ?? 0,
    },
    tradingSummary: {
      orderCount: row.trade_order_count ?? 0,
      totalNotional: row.trade_total_notional ?? 0,
      openPositions: row.trade_open_positions ?? 0,
      lastTradeAt: row.trade_last_at ?? null,
    },
  };
}

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email.toLowerCase()).first<UserRow>();
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRow>();
}

function generateEightDigitId(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(10_000_000 + ((values[0] ?? 0) % 90_000_000));
}

export async function generateClientNumericId(db: D1Database): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = generateEightDigitId();
    const existing = await db
      .prepare(`SELECT id FROM users WHERE client_numeric_id = ? LIMIT 1`)
      .bind(candidate)
      .first<{ id: string }>();
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate a unique client ID");
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  image?: string | null;
  role?: RoleId;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: CrmDepartment;
  saleStatus?: CrmStatus;
  saleStatusScheduledAt?: number | null;
  retentionStatus?: RetentionStatus;
  retentionStatusScheduledAt?: number | null;
  adSource?: string;
  managerId?: string | null;
  countryCode?: string;
  timezone?: string;
  companyName?: string;
  emailVerified?: boolean;
}

export async function createUser(db: D1Database, input: CreateUserInput): Promise<UserRow> {
  const now = Date.now();
  const id = crypto.randomUUID();
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const role = input.role ?? "user";
  const clientNumericId = role === "user" ? await generateClientNumericId(db) : "";

  await db
    .prepare(
      `INSERT INTO users (
         id, email, email_verified, name, image, password_hash, role_id, client_numeric_id, sale_status,
         sale_status_scheduled_at, phone, address, date_of_birth, department, retention_status,
         retention_status_scheduled_at, ad_source, country_code, timezone, company_name, manager_id, status, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    )
    .bind(
      id,
      input.email.toLowerCase(),
      input.emailVerified ? 1 : 0,
      input.name,
      input.image ?? null,
      passwordHash,
      role,
      clientNumericId,
      input.saleStatus ?? "new",
      input.saleStatusScheduledAt ?? null,
      input.phone ?? "",
      input.address ?? "",
      input.dateOfBirth ?? "",
      input.department ?? "client",
      input.retentionStatus ?? "new",
      input.retentionStatusScheduledAt ?? null,
      input.adSource ?? "",
      input.countryCode ?? countryForTimezone(input.timezone ?? DEFAULT_TIMEZONE),
      input.timezone ?? DEFAULT_TIMEZONE,
      input.companyName ?? "",
      input.managerId ?? null,
      now,
      now,
    )
    .run();

  const row = await findUserById(db, id);
  if (!row) throw new Error("Failed to create user");
  return row;
}

export async function updateUserProfile(db: D1Database, id: string, name: string): Promise<void> {
  await db.prepare(`UPDATE users SET name = ?, updated_at = ? WHERE id = ?`).bind(name, Date.now(), id).run();
}

export async function updateUserLocale(
  db: D1Database,
  id: string,
  input: { name: string; timezone?: string; countryCode?: string },
): Promise<void> {
  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const countryCode = input.countryCode ?? countryForTimezone(timezone);
  await db
    .prepare(`UPDATE users SET name = ?, timezone = ?, country_code = ?, updated_at = ? WHERE id = ?`)
    .bind(input.name, timezone, countryCode, Date.now(), id)
    .run();
}

export async function setUserPassword(db: D1Database, id: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  await db
    .prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`)
    .bind(passwordHash, Date.now(), id)
    .run();
}

export async function touchLastLogin(db: D1Database, id: string): Promise<void> {
  await db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).bind(Date.now(), id).run();
}

export interface AdminUpdateUserInput {
  name?: string;
  role?: RoleId;
  clientNumericId?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  image?: string;
  department?: CrmDepartment;
  saleStatus?: CrmStatus;
  saleStatusScheduledAt?: number | null;
  retentionStatus?: RetentionStatus;
  retentionStatusScheduledAt?: number | null;
  adSource?: string;
  managerId?: string | null;
  companyName?: string;
  status?: UserStatus;
}

export async function adminUpdateUser(db: D1Database, id: string, input: AdminUpdateUserInput): Promise<void> {
  const sets: string[] = [];
  const binds: unknown[] = [];
  if (input.name !== undefined) {
    sets.push("name = ?");
    binds.push(input.name);
  }
  if (input.role !== undefined) {
    sets.push("role_id = ?");
    binds.push(input.role);
  }
  if (input.clientNumericId !== undefined) {
    sets.push("client_numeric_id = ?");
    binds.push(input.clientNumericId);
  }
  if (input.phone !== undefined) {
    sets.push("phone = ?");
    binds.push(input.phone);
  }
  if (input.address !== undefined) {
    sets.push("address = ?");
    binds.push(input.address);
  }
  if (input.dateOfBirth !== undefined) {
    sets.push("date_of_birth = ?");
    binds.push(input.dateOfBirth);
  }
  if (input.image !== undefined) {
    sets.push("image = ?");
    binds.push(input.image || null);
  }
  if (input.department !== undefined) {
    sets.push("department = ?");
    binds.push(input.department);
  }
  if (input.saleStatus !== undefined) {
    sets.push("sale_status = ?");
    binds.push(input.saleStatus);
  }
  if (input.saleStatusScheduledAt !== undefined) {
    sets.push("sale_status_scheduled_at = ?");
    binds.push(input.saleStatusScheduledAt);
  }
  if (input.retentionStatus !== undefined) {
    sets.push("retention_status = ?");
    binds.push(input.retentionStatus);
  }
  if (input.retentionStatusScheduledAt !== undefined) {
    sets.push("retention_status_scheduled_at = ?");
    binds.push(input.retentionStatusScheduledAt);
  }
  if (input.adSource !== undefined) {
    sets.push("ad_source = ?");
    binds.push(input.adSource);
  }
  if (input.managerId !== undefined) {
    sets.push("manager_id = ?");
    binds.push(input.managerId);
  }
  if (input.companyName !== undefined) {
    sets.push("company_name = ?");
    binds.push(input.companyName);
  }
  if (input.status !== undefined) {
    sets.push("status = ?");
    binds.push(input.status);
  }
  if (sets.length === 0) return;
  sets.push("updated_at = ?");
  binds.push(Date.now(), id);
  await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
}

export interface ListUsersFilter {
  q?: string;
  role?: RoleId;
  status?: UserStatus;
  page: number;
  pageSize: number;
}

export async function listUsers(db: D1Database, filter: ListUsersFilter): Promise<Paginated<UserDTO>> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter.q) {
    where.push("(u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ? OR u.client_numeric_id LIKE ? OR u.ad_source LIKE ?)");
    const like = `%${filter.q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    binds.push(like, like, like, like, like);
  }
  if (filter.role) {
    where.push("u.role_id = ?");
    binds.push(filter.role);
  }
  if (filter.status) {
    where.push("u.status = ?");
    binds.push(filter.status);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM users u ${whereSql}`)
    .bind(...binds)
    .first<{ total: number }>();

  const offset = (filter.page - 1) * filter.pageSize;
  const rows = await db
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
       ),
       money_stats AS (
         SELECT client_id,
                COALESCE(SUM(CASE WHEN tx_type = 'deposit' THEN amount ELSE 0 END), 0) AS total_deposit,
                COALESCE(SUM(CASE
                  WHEN tx_type IN ('deposit', 'bonus', 'transfer') THEN amount
                  WHEN tx_type IN ('withdrawal', 'commission', 'swap') THEN -amount
                  ELSE 0
                END), 0) AS net_money
         FROM crm_money_transactions
         WHERE tx_status IN ('pending', 'approved')
         GROUP BY client_id
       ),
       account_stats AS (
         SELECT client_id, COALESCE(SUM(balance + credit), 0) AS account_balance
         FROM crm_trade_accounts
         GROUP BY client_id
       )
       SELECT u.*, m.name AS manager_name, m.role_id AS manager_role,
              COALESCE(ms.total_deposit, 0) AS total_deposit,
              COALESCE(ast.account_balance, 0) + COALESCE(ms.net_money, 0) AS total_balance,
              COALESCE(ts.order_count, 0) AS trade_order_count,
              COALESCE(ts.total_notional, 0) AS trade_total_notional,
              COALESCE(ops.open_positions, 0) AS trade_open_positions,
              ts.last_trade_at AS trade_last_at
       FROM users u
       LEFT JOIN users m ON m.id = u.manager_id
       LEFT JOIN trade_stats ts ON ts.client_id = u.id
       LEFT JOIN open_position_stats ops ON ops.client_id = u.id
       LEFT JOIN money_stats ms ON ms.client_id = u.id
       LEFT JOIN account_stats ast ON ast.client_id = u.id
       ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...binds, filter.pageSize, offset)
    .all<UserRowWithManager>();

  return {
    items: rows.results.map(toUserDTO),
    total: countRow?.total ?? 0,
    page: filter.page,
    pageSize: filter.pageSize,
  };
}

/** GDPR/KVKK erasure: removes the user and all dependent data (cascades). */
export async function deleteUserAccount(db: D1Database, id: string): Promise<void> {
  await db.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();
}

/** GDPR/KVKK access: exports all personal data held for a user. */
export async function exportUserData(db: D1Database, id: string) {
  const [user, sessions, locationSessions, locations, audit, tradeOrders, clientComments] = await Promise.all([
    db
      .prepare(
        `SELECT id, email, name, image, role_id, client_numeric_id, sale_status, sale_status_scheduled_at,
                phone, address, date_of_birth, department, retention_status, retention_status_scheduled_at,
                ad_source, extra_info, country_code, timezone, manager_id, status, email_verified, created_at, updated_at, last_login_at
         FROM users WHERE id = ?`,
      )
      .bind(id)
      .first(),
    db
      .prepare(
        `SELECT id, device_name, user_agent, ip, created_at, last_seen_at, expires_at, revoked_at
         FROM sessions WHERE user_id = ? ORDER BY created_at DESC`,
      )
      .bind(id)
      .all(),
    db
      .prepare(`SELECT * FROM location_sessions WHERE user_id = ? ORDER BY started_at DESC`)
      .bind(id)
      .all(),
    db
      .prepare(
        `SELECT session_id, lat, lng, accuracy, altitude, speed, heading, recorded_at
         FROM locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 50000`,
      )
      .bind(id)
      .all(),
    db
      .prepare(
        `SELECT action, target_type, target_id, ip, metadata, created_at
         FROM audit_logs WHERE actor_id = ? ORDER BY created_at DESC LIMIT 10000`,
      )
      .bind(id)
      .all(),
    db
      .prepare(
        `SELECT symbol, market, side, order_type, quantity, price, status, notional, pnl, created_at
         FROM crm_trade_orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 10000`,
      )
      .bind(id)
      .all(),
    db
      .prepare(
        `SELECT author_name, author_email, body, created_at
         FROM crm_client_comments WHERE client_id = ? ORDER BY created_at DESC LIMIT 10000`,
      )
      .bind(id)
      .all(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    deviceSessions: sessions.results,
    locationSessions: locationSessions.results,
    locationPoints: locations.results,
    auditTrail: audit.results,
    tradeOrders: tradeOrders.results,
    clientComments: clientComments.results,
  };
}
