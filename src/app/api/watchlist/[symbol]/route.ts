import { apiHandler, assertSameOrigin, jsonOk, requireUser } from "@/lib/api";
import { removeFromWatchlist } from "@/services/watchlists";

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ symbol: string }> }) => {
  await assertSameOrigin(req);
  const { user } = await requireUser();
  const { symbol } = await context.params;
  const quotes = await removeFromWatchlist(user.id, decodeURIComponent(symbol));
  return jsonOk({ quotes, authenticated: true });
});
