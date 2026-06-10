import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { listActiveSessions } from "@/services/location-sessions";

/** Snapshot of all active location sessions for the admin live map. */
export const GET = apiHandler(async () => {
  const { db } = await requirePermission("sessions.view");
  const sessions = await listActiveSessions(db);
  return jsonOk({ sessions });
});
