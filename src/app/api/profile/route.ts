import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, REALTIME } from "@/lib/constants";
import { updateProfileSchema } from "@/lib/validators";
import { deleteUserAccount, findUserById, toUserDTO, updateUserProfile } from "@/services/users";
import { getActiveSessionForUser, endLocationSession } from "@/services/location-sessions";

export const GET = apiHandler(async () => {
  const { user, db } = await requireUser();
  const row = await findUserById(db, user.id);
  if (!row) throw notFound("User");
  return jsonOk({ user: toUserDTO(row) });
});

export const PATCH = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, meta } = await requireUser();

  const parsed = updateProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }

  await updateUserProfile(db, user.id, parsed.data.name);
  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.PROFILE_UPDATED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return jsonOk({ ok: true });
});

/** GDPR/KVKK right to erasure: permanently deletes the account and all data. */
export const DELETE = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, env, meta } = await requireUser();

  // Stop any active location sharing before deleting.
  const active = await getActiveSessionForUser(db, user.id);
  if (active) {
    await endLocationSession(db, active.id, "account_deleted");
    const hub = env.LOCATION_HUB.getByName(REALTIME.HUB_NAME);
    await hub.sessionEnded(active.id, "account_deleted");
  }

  // The audit entry intentionally precedes deletion (append-only trail).
  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.ACCOUNT_DELETED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  await deleteUserAccount(db, user.id);
  return jsonOk({ ok: true });
});
