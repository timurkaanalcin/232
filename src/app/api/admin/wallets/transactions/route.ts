import { apiHandler, badRequest, jsonOk, requirePermission } from "@/lib/api";
import { paginationSchema } from "@/lib/validators";
import { listWalletTransactions } from "@/services/wallets";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("wallets.view");
  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid transaction query");

  const walletId = url.searchParams.get("walletId") ?? undefined;
  const userId = url.searchParams.get("userId") ?? undefined;
  if (walletId && !/^[0-9a-f-]{36}$/i.test(walletId)) throw badRequest("Invalid wallet id");
  if (userId && !/^[0-9a-f-]{36}$/i.test(userId)) throw badRequest("Invalid user id");

  return jsonOk(await listWalletTransactions(db, { ...parsed.data, walletId, userId }));
});
