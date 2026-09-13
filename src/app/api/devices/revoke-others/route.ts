import { apiHandler, assertSameOrigin, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, NOTIFICATION_TYPES } from "@/lib/constants";
import { createNotification } from "@/services/notifications";
import { revokeAllDeviceSessions } from "@/services/device-sessions";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, meta } = await requireUser();

  const revoked = await revokeAllDeviceSessions(db, user.id, user.sessionId);

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.DEVICES_REVOKED_OTHERS,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { revoked },
  });

  await createNotification(db, {
    userId: user.id,
    type: NOTIFICATION_TYPES.DEVICE_REVOKED,
    title: "Other devices signed out",
    body: revoked > 0 ? `${revoked} other session(s) were ended.` : "No other active devices were found.",
    metadata: { revoked },
  });

  return jsonOk({ ok: true, revoked });
});
