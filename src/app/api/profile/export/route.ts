import { apiHandler, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { exportUserData } from "@/services/users";

/** GDPR/KVKK right of access: full export of personal data as JSON. */
export const GET = apiHandler(async () => {
  const { user, db, meta } = await requireUser();
  const data = await exportUserData(db, user.id);

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.DATA_EXPORTED,
    targetType: "user",
    targetId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return jsonOk(data, {
    headers: {
      "Content-Disposition": `attachment; filename="livetrack-export-${Date.now()}.json"`,
      "Cache-Control": "no-store",
    },
  });
});
