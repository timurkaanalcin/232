import { apiHandler, assertSameOrigin, badRequest, enforceRateLimit, getRequestMeta, jsonOk } from "@/lib/api";
import { getEnv } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { randomToken, sha256Hex } from "@/lib/crypto";
import { passwordResetEmail, sendEmail } from "@/lib/email";
import { AUDIT_ACTIONS, RATE_LIMITS, SECURITY } from "@/lib/constants";
import { forgotPasswordSchema } from "@/lib/validators";
import { findUserByEmail } from "@/services/users";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const env = getEnv();
  const meta = await getRequestMeta();
  await enforceRateLimit(`pwforgot:${meta.ip || "unknown"}`, RATE_LIMITS.PASSWORD_FORGOT, env);

  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest("Invalid email address");

  const db = env.DB;
  const user = await findUserByEmail(db, parsed.data.email);

  // Always return success to avoid leaking which emails are registered.
  if (user && user.status === "active") {
    const token = randomToken(32);
    const now = Date.now();
    await db
      .prepare(
        `INSERT INTO password_reset_tokens (id, user_id, token_hash, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), user.id, await sha256Hex(token), now, now + SECURITY.RESET_TOKEN_TTL_MS)
      .run();

    const baseUrl = env.AUTH_URL ?? new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail(env, { to: user.email, ...passwordResetEmail(resetUrl) });

    await logAudit(db, {
      actorId: user.id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      targetType: "user",
      targetId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  return jsonOk({ ok: true });
});
