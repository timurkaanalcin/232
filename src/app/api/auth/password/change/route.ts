import { apiHandler, assertSameOrigin, badRequest, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { verifyPassword } from "@/lib/crypto";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { changePasswordSchema } from "@/lib/validators";
import { findUserById, setUserPassword } from "@/services/users";
import { revokeAllDeviceSessions } from "@/services/device-sessions";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, meta } = await requireUser();

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const row = await findUserById(db, user.id);
  if (!row?.password_hash) {
    throw badRequest("This account uses Google sign-in. Use the password reset flow to set a password.");
  }

  const valid = await verifyPassword(row.password_hash, parsed.data.currentPassword);
  if (!valid) throw badRequest("Current password is incorrect");

  await setUserPassword(db, user.id, parsed.data.newPassword);
  // Sign out all other devices; the current session stays valid.
  await revokeAllDeviceSessions(db, user.id, user.sessionId);

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return jsonOk({ ok: true });
});
