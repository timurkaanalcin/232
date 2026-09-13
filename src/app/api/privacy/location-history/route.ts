import { apiHandler, assertSameOrigin, badRequest, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { deleteLocationHistorySchema } from "@/lib/validators";
import { deleteEndedLocationHistory, getActiveSessionForUser } from "@/services/location-sessions";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, meta } = await requireUser();

  const parsed = deleteLocationHistorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Explicit confirmation is required");
  }

  const active = await getActiveSessionForUser(db, user.id);
  if (active) {
    throw badRequest("Stop the active sharing session before deleting location history");
  }

  const deletedSessions = await deleteEndedLocationHistory(db, user.id);

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.LOCATION_HISTORY_DELETED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { deletedSessions },
  });

  return jsonOk({ ok: true, deletedSessions });
});
