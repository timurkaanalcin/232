import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { getAdminAnalytics } from "@/services/analytics";

export const GET = apiHandler(async () => {
  const { db } = await requirePermission("stats.view");
  const analytics = await getAdminAnalytics(db);
  return jsonOk({ analytics });
});
