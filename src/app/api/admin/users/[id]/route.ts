import {
  apiHandler,
  assertSameOrigin,
  badRequest,
  forbidden,
  getPermissions,
  jsonOk,
  notFound,
  requirePermission,
} from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, REALTIME, canAssignRole, canManageRole } from "@/lib/constants";
import { adminUpdateUserSchema } from "@/lib/validators";
import { adminUpdateUser, findUserById, generateClientNumericId, toUserDTO } from "@/services/users";
import { revokeAllDeviceSessions } from "@/services/device-sessions";
import { endLocationSession, getActiveSessionForUser } from "@/services/location-sessions";

export const PATCH = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user: actor, db, env, meta } = await requirePermission("users.manage");
    const { id } = await params;

    const target = await findUserById(db, id);
    if (!target) throw notFound("User");

    const parsed = adminUpdateUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid update");
    }

    if (parsed.data.role !== undefined) {
      const permissions = await getPermissions(db, actor.role);
      if (!permissions.has("roles.assign")) throw forbidden();
      if (id === actor.id) throw badRequest("You cannot change your own role");
      if (!canAssignRole(actor.role, parsed.data.role)) throw forbidden();
    }
    if (parsed.data.status === "disabled" && id === actor.id) {
      throw badRequest("You cannot disable your own account");
    }
    if (!canManageRole(actor.role, target.role_id)) {
      throw forbidden();
    }
    if (parsed.data.managerId === id) throw badRequest("A user cannot manage themselves");
    if (parsed.data.managerId) {
      const manager = await findUserById(db, parsed.data.managerId);
      if (!manager) throw badRequest("Selected manager does not exist");
    }

    await adminUpdateUser(db, id, {
      ...parsed.data,
      clientNumericId:
        parsed.data.role === "user" && !target.client_numeric_id
          ? await generateClientNumericId(db)
          : undefined,
    });

    if (parsed.data.status === "disabled") {
      // Disabling immediately kills all sessions and any active sharing.
      await revokeAllDeviceSessions(db, id);
      const active = await getActiveSessionForUser(db, id);
      if (active) {
        await endLocationSession(db, active.id, "admin");
        await env.LOCATION_HUB.getByName(REALTIME.HUB_NAME).sessionEnded(active.id, "admin");
      }
    }

    await logAudit(db, {
      actorId: actor.id,
      actorEmail: actor.email,
      action:
        parsed.data.role !== undefined ? AUDIT_ACTIONS.ADMIN_ROLE_ASSIGNED : AUDIT_ACTIONS.ADMIN_USER_UPDATED,
      targetType: "user",
      targetId: id,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: { changes: parsed.data, targetEmail: target.email },
    });

    const updated = await findUserById(db, id);
    return jsonOk({ user: updated ? toUserDTO(updated) : null });
  },
);
