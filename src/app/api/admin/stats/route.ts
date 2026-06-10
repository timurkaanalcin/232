import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { REALTIME } from "@/lib/constants";
import { getAdminStats } from "@/services/stats";

export const GET = apiHandler(async () => {
  const { db, env } = await requirePermission("stats.view");

  let realtimeConnections = 0;
  try {
    const counts = await env.LOCATION_HUB.getByName(REALTIME.HUB_NAME).connectionCounts();
    realtimeConnections = counts.viewers + counts.publishers;
  } catch {
    // hub unreachable - stats still useful without the connection count
  }

  const stats = await getAdminStats(db, realtimeConnections);
  return jsonOk({ stats });
});
