import {
  apiHandler,
  assertSameOrigin,
  badRequest,
  forbidden,
  getPermissions,
  jsonOk,
  requirePermission,
} from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, canAssignRole, requiresStatusSchedule } from "@/lib/constants";
import { adminCreateUserSchema, userSearchSchema } from "@/lib/validators";
import { createUser, findUserByEmail, findUserById, listUsers, toUserDTO } from "@/services/users";

async function canAssignManager(db: D1Database, actorId: string, actorRole: string, managerId: string): Promise<boolean> {
  if (actorRole === "super_admin") return true;
  if (managerId === actorId) return true;
  const row = await db
    .prepare(
      `SELECT u.id
       FROM users u
       LEFT JOIN users m1 ON m1.id = u.manager_id
       LEFT JOIN users m2 ON m2.id = m1.manager_id
       LEFT JOIN users m3 ON m3.id = m2.manager_id
       WHERE u.id = ? AND (u.manager_id = ? OR m1.manager_id = ? OR m2.manager_id = ? OR m3.manager_id = ?)`,
    )
    .bind(managerId, actorId, actorId, actorId, actorId)
    .first<{ id: string }>();
  return Boolean(row);
}

export const GET = apiHandler(async (request: Request) => {
  const { user: actor, db } = await requirePermission("users.view");
  const url = new URL(request.url);
  const filter = userSearchSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return jsonOk(
    await listUsers(
      db,
      actor.role === "super_admin" ? { ...filter, role: "shift" } : filter,
      { id: actor.id, role: actor.role },
    ),
  );
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("users.create");

  const parsed = adminCreateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid user data");
  }
  if (actor.role === "super_admin" && parsed.data.role !== "shift") {
    throw badRequest("Admin can only create Shift users");
  }
  if (parsed.data.role === "shift" && !parsed.data.companyName.trim()) {
    throw badRequest("Shift users must represent a company");
  }

  const permissions = await getPermissions(db, actor.role);
  if (parsed.data.role !== "user" && !permissions.has("roles.assign")) throw forbidden();
  if (!canAssignRole(actor.role, parsed.data.role)) throw forbidden();

  const existing = await findUserByEmail(db, parsed.data.email);
  if (existing) throw badRequest("An account with this email already exists");
  if (parsed.data.managerId) {
    const manager = await findUserById(db, parsed.data.managerId);
    if (!manager) throw badRequest("Selected manager does not exist");
    if (!(await canAssignManager(db, actor.id, actor.role, parsed.data.managerId))) {
      throw forbidden();
    }
  }
  if (parsed.data.role === "user") {
    if (requiresStatusSchedule(parsed.data.saleStatus) && !parsed.data.saleStatusScheduledAt) {
      throw badRequest("Sale status date and time are required for Call Back and Active clients");
    }
    if (requiresStatusSchedule(parsed.data.retentionStatus) && !parsed.data.retentionStatusScheduledAt) {
      throw badRequest("Retention status date and time are required for Call Back and Active clients");
    }
  }

  const managerId = parsed.data.managerId ?? (actor.role === "super_admin" ? null : actor.id);
  const created = await createUser(db, {
    email: parsed.data.email,
    name: parsed.data.name,
    password: parsed.data.password,
    role: parsed.data.role,
    phone: parsed.data.phone,
    address: parsed.data.address,
    dateOfBirth: parsed.data.dateOfBirth,
    image: parsed.data.image,
    department: parsed.data.department,
    saleStatus: parsed.data.saleStatus,
    saleStatusScheduledAt: parsed.data.saleStatusScheduledAt,
    retentionStatus: parsed.data.retentionStatus,
    retentionStatusScheduledAt: parsed.data.retentionStatusScheduledAt,
    adSource: parsed.data.adSource,
    companyName: parsed.data.companyName,
    managerId,
    emailVerified: true,
  });

  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.ADMIN_USER_CREATED,
    targetType: "user",
    targetId: created.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: {
      email: created.email,
      role: created.role_id,
      department: created.department,
      clientNumericId: created.client_numeric_id,
      adSource: created.ad_source,
      companyName: created.company_name,
    },
  });

  return jsonOk({ user: toUserDTO(created) }, { status: 201 });
});
