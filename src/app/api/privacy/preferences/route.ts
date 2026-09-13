import { apiHandler, assertSameOrigin, badRequest, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { privacyPreferencesSchema } from "@/lib/validators";
import { applyLocationRetention } from "@/services/location-sessions";
import { getPrivacyPrefs, upsertPrivacyPrefs } from "@/services/privacy-prefs";

export const GET = apiHandler(async () => {
  const { user, db } = await requireUser();
  const preferences = await getPrivacyPrefs(db, user.id);
  return jsonOk({ preferences });
});

export const PATCH = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, meta } = await requireUser();

  const parsed = privacyPreferencesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid preference data");
  }

  const preferences = await upsertPrivacyPrefs(db, user.id, parsed.data);
  if (preferences.locationRetentionDays > 0) {
    await applyLocationRetention(db, user.id, preferences.locationRetentionDays);
  }

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.PREFS_UPDATED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: parsed.data,
  });

  return jsonOk({ preferences });
});
