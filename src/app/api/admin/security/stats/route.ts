import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { getSecurityStats } from "@/services/security-events";

export const GET = apiHandler(async () => {
  const { db } = await requirePermission("audit.view");
  const stats = await getSecurityStats(db);
  return jsonOk({ stats });
});
