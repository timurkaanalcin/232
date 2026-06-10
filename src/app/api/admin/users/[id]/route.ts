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
import { AUDIT_ACTIONS, REALTIME } from "@/lib/constants";
import { adminUpdateUserSchema } from "@/lib/validators";
import { adminUpdateUser, findUserById, toUserDTO } from "@/services/users";
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
    }
    if (parsed.data.status === "disabled" && id === actor.id) {
      throw badRequest("You cannot disable your own account");
    }
    // Admin-tier accounts can only be modified by super admins.
    if (target.role_id !== "user" && actor.role !== "super_admin") {
      throw forbidden();
    }

    await adminUpdateUser(db, id, parsed.data);

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
