import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { listRecentActivity } from "@/services/audit-query";

/** Recent activity feed for the admin dashboard. */
export const GET = apiHandler(async () => {
  const { db } = await requirePermission("stats.view");
  const activity = await listRecentActivity(db, 12);
  return jsonOk({ activity });
});
