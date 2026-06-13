import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { getCrmOverview } from "@/services/crm-overview";

export const GET = apiHandler(async () => {
  const { db } = await requirePermission("users.view");
  const overview = await getCrmOverview(db);
  return jsonOk({ overview });
});
