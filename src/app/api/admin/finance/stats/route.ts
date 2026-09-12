import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { adminStats } from "@/services/finance";

export const GET = apiHandler(async () => {
  await requirePermission("finance.manage");
  return jsonOk({ stats: await adminStats() });
});
