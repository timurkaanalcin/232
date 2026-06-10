import {
  apiHandler,
  assertSameOrigin,
  badRequest,
  enforceRateLimit,
  getRequestMeta,
  jsonOk,
} from "@/lib/api";
import { getEnv } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, RATE_LIMITS } from "@/lib/constants";
import { registerSchema } from "@/lib/validators";
import { createUser, findUserByEmail } from "@/services/users";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const env = getEnv();
  const meta = await getRequestMeta();
  await enforceRateLimit(`register:${meta.ip || "unknown"}`, RATE_LIMITS.REGISTER, env);

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid registration data");
  }

  const db = env.DB;
  const existing = await findUserByEmail(db, parsed.data.email);
  if (existing) {
    throw badRequest("An account with this email already exists");
  }

  const user = await createUser(db, {
    email: parsed.data.email,
    name: parsed.data.name,
    password: parsed.data.password,
  });

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.REGISTER,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { provider: "credentials" },
  });

  return jsonOk({ ok: true }, { status: 201 });
});
