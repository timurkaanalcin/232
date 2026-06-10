import {
  apiHandler,
  assertSameOrigin,
  forbidden,
  getPermissions,
  jsonOk,
  notFound,
  requireUser,
} from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, NOTIFICATION_TYPES, REALTIME } from "@/lib/constants";
import { createNotification } from "@/services/notifications";
import { endLocationSession, getLocationSession } from "@/services/location-sessions";

/**
 * Stop a location sharing session immediately. The owner can always stop
 * their own session; staff with `sessions.manage` can stop any session.
 * The publisher WebSocket is force-closed so transmission halts server-side.
 */
export const POST = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user, db, env, meta } = await requireUser();
    const { id } = await params;

    const row = await getLocationSession(db, id);
    if (!row) throw notFound("Location session");

    const isOwner = row.user_id === user.id;
    if (!isOwner) {
      const permissions = await getPermissions(db, user.role);
      if (!permissions.has("sessions.manage")) throw forbidden();
    }

    const reason = isOwner ? "user" : "admin";
    const ended = await endLocationSession(db, id, reason);

    if (ended) {
      await logAudit(db, {
        actorId: user.id,
        actorEmail: user.email,
        action: isOwner ? AUDIT_ACTIONS.LOCATION_SESSION_STOPPED : AUDIT_ACTIONS.ADMIN_STOPPED_SESSION,
        targetType: "location_session",
        targetId: id,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { ownerId: row.user_id, reason },
      });
      if (isOwner) {
        await logAudit(db, {
          actorId: user.id,
          actorEmail: user.email,
          action: AUDIT_ACTIONS.PERMISSION_REVOKED,
          targetType: "location_session",
          targetId: id,
          ip: meta.ip,
          userAgent: meta.userAgent,
        });
      }

      await createNotification(db, {
        userId: row.user_id,
        type: NOTIFICATION_TYPES.SESSION_STOPPED,
        title: "Location sharing stopped",
        body: isOwner ? "You stopped sharing your location." : "An administrator ended your session.",
        metadata: { sessionId: id, reason },
      });
      if (isOwner) {
        await createNotification(db, {
          userId: row.user_id,
          type: NOTIFICATION_TYPES.CONSENT_REVOKED,
          title: "Consent revoked",
          body: "Location transmission has ended.",
          metadata: { sessionId: id },
        });
      }

      const hub = env.LOCATION_HUB.getByName(REALTIME.HUB_NAME);
      await hub.sessionEnded(id, reason);
    }

    return jsonOk({ ok: true, ended });
  },
);
