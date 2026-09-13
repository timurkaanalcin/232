import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { getWalletStats } from "@/services/wallets";

export const GET = apiHandler(async () => {
  const { db } = await requirePermission("wallets.view");
  const stats = await getWalletStats(db);
  return jsonOk({ stats });
});
