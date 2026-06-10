import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { revokeDeviceSession } from "@/services/device-sessions";

export const DELETE = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user, db, meta } = await requireUser();
    const { id } = await params;

    if (id === user.sessionId) {
      throw badRequest("Use sign out to end the current session");
    }

    const revoked = await revokeDeviceSession(db, user.id, id);
    if (!revoked) throw notFound("Device session");

    await logAudit(db, {
      actorId: user.id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.DEVICE_REVOKED,
      targetType: "session",
      targetId: id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return jsonOk({ ok: true });
  },
);
