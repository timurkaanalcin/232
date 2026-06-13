import { hashPassword } from "@/lib/crypto";
import type { CrmDepartment, Paginated, RetentionStatus, RoleId, UserDTO, UserRow, UserStatus } from "@/types";

type UserRowWithManager = UserRow & { manager_name?: string | null };

export function toUserDTO(row: UserRowWithManager): UserDTO {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    role: row.role_id,
    phone: row.phone ?? "",
    address: row.address ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    department: row.department ?? "client",
    retentionStatus: row.retention_status ?? "pending",
    managerId: row.manager_id ?? null,
    managerName: row.manager_name ?? null,
    status: row.status,
    emailVerified: row.email_verified === 1,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email.toLowerCase()).first<UserRow>();
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRow>();
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
  retentionStatus?: RetentionStatus;
  managerId?: string | null;
  emailVerified?: boolean;
}

export async function createUser(db: D1Database, input: CreateUserInput): Promise<UserRow> {
  const now = Date.now();
  const id = crypto.randomUUID();
  const passwordHash = input.password ? await hashPassword(input.password) : null;

  await db
    .prepare(
      `INSERT INTO users (
         id, email, email_verified, name, image, password_hash, role_id, phone, address,
         date_of_birth, department, retention_status, manager_id, status, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    )
    .bind(
      id,
      input.email.toLowerCase(),
      input.emailVerified ? 1 : 0,
      input.name,
      input.image ?? null,
      passwordHash,
      input.role ?? "user",
      input.phone ?? "",
      input.address ?? "",
      input.dateOfBirth ?? "",
      input.department ?? "client",
      input.retentionStatus ?? "pending",
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
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  image?: string;
  department?: CrmDepartment;
  retentionStatus?: RetentionStatus;
  managerId?: string | null;
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
  if (input.retentionStatus !== undefined) {
    sets.push("retention_status = ?");
    binds.push(input.retentionStatus);
  }
  if (input.managerId !== undefined) {
    sets.push("manager_id = ?");
    binds.push(input.managerId);
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
    where.push("(u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)");
    const like = `%${filter.q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    binds.push(like, like, like);
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
      `SELECT u.*, m.name AS manager_name
       FROM users u
       LEFT JOIN users m ON m.id = u.manager_id
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
  const [user, sessions, locationSessions, locations, audit] = await Promise.all([
    db
      .prepare(
        `SELECT id, email, name, image, role_id, phone, address, date_of_birth, department, retention_status,
                manager_id, status, email_verified, created_at, updated_at, last_login_at
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
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    deviceSessions: sessions.results,
    locationSessions: locationSessions.results,
    locationPoints: locations.results,
    auditTrail: audit.results,
  };
}
