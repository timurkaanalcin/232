import { apiHandler, forbidden, getPermissions, jsonOk, notFound, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import {
  getLocationSession,
  getSessionPoints,
  toLocationSessionDTO,
} from "@/services/location-sessions";
import { findUserById, toUserDTO } from "@/services/users";

/**
 * Session detail with the recorded track. Accessible by the session owner or
 * by staff with `sessions.view` - staff access is audit-logged.
 */
export const GET = apiHandler(
  async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { user, db, meta } = await requireUser();
    const { id } = await params;

    const row = await getLocationSession(db, id);
    if (!row) throw notFound("Location session");

    const isOwner = row.user_id === user.id;
    if (!isOwner) {
      const permissions = await getPermissions(db, user.role);
      if (!permissions.has("sessions.view")) throw forbidden();
      await logAudit(db, {
        actorId: user.id,
        actorEmail: user.email,
        action: AUDIT_ACTIONS.ADMIN_VIEWED_SESSION,
        targetType: "location_session",
        targetId: id,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { ownerId: row.user_id },
      });
    }

    const [points, owner] = await Promise.all([getSessionPoints(db, id), findUserById(db, row.user_id)]);
    const session = toLocationSessionDTO(row);
    if (owner) {
      session.userName = owner.name;
      session.userEmail = owner.email;
    }

    return jsonOk({ session, points, owner: owner ? toUserDTO(owner) : null });
  },
);
