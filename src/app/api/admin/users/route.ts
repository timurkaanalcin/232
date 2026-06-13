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
import { AUDIT_ACTIONS, canAssignRole } from "@/lib/constants";
import { adminCreateUserSchema, userSearchSchema } from "@/lib/validators";
import { createUser, findUserByEmail, findUserById, listUsers, toUserDTO } from "@/services/users";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("users.view");
  const url = new URL(request.url);
  const filter = userSearchSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return jsonOk(await listUsers(db, filter));
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("users.create");

  const parsed = adminCreateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid user data");
  }

  const permissions = await getPermissions(db, actor.role);
  if (parsed.data.role !== "user" && !permissions.has("roles.assign")) throw forbidden();
  if (!canAssignRole(actor.role, parsed.data.role)) throw forbidden();

  const existing = await findUserByEmail(db, parsed.data.email);
  if (existing) throw badRequest("An account with this email already exists");
  if (parsed.data.managerId) {
    const manager = await findUserById(db, parsed.data.managerId);
    if (!manager) throw badRequest("Selected manager does not exist");
  }

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
    retentionStatus: parsed.data.retentionStatus,
    managerId: parsed.data.managerId,
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
    },
  });

  return jsonOk({ user: toUserDTO(created) }, { status: 201 });
});
