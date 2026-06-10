import { apiHandler, assertSameOrigin, badRequest, enforceRateLimit, getRequestMeta, jsonOk } from "@/lib/api";
import { getEnv } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { sha256Hex } from "@/lib/crypto";
import { AUDIT_ACTIONS, RATE_LIMITS } from "@/lib/constants";
import { resetPasswordSchema } from "@/lib/validators";
import { setUserPassword } from "@/services/users";
import { revokeAllDeviceSessions } from "@/services/device-sessions";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const env = getEnv();
  const meta = await getRequestMeta();
  await enforceRateLimit(`pwreset:${meta.ip || "unknown"}`, RATE_LIMITS.PASSWORD_RESET, env);

  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid reset request");
  }

  const db = env.DB;
  const tokenHash = await sha256Hex(parsed.data.token);
  const row = await db
    .prepare(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    )
    .bind(tokenHash, Date.now())
    .first<{ id: string; user_id: string }>();

  if (!row) throw badRequest("This reset link is invalid or has expired");

  await db.prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE id = ?`).bind(Date.now(), row.id).run();
  await setUserPassword(db, row.user_id, parsed.data.password);
  // Force re-authentication everywhere after a password reset.
  await revokeAllDeviceSessions(db, row.user_id);

  await logAudit(db, {
    actorId: row.user_id,
    action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
    targetType: "user",
    targetId: row.user_id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return jsonOk({ ok: true });
});
