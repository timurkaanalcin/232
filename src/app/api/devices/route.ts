import { apiHandler, jsonOk, requireUser } from "@/lib/api";
import { listDeviceSessions } from "@/services/device-sessions";

export const GET = apiHandler(async () => {
  const { user, db } = await requireUser();
  const devices = await listDeviceSessions(db, user.id, user.sessionId);
  return jsonOk({ devices });
});
