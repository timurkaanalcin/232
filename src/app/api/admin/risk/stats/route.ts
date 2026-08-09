import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { getRiskEventStats } from "@/services/risk-events";

export const GET = apiHandler(async () => {
  const { db } = await requirePermission("risk.view");
  const stats = await getRiskEventStats(db);
  return jsonOk({ stats });
});
