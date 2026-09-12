import { apiHandler, assertSameOrigin, jsonOk, requireUser } from "@/lib/api";
import { addToWatchlist, getWatchlistQuotes } from "@/services/watchlists";

export const GET = apiHandler(async (req: Request) => {
  try {
    const { user } = await requireUser();
    const quotes = await getWatchlistQuotes(user.id);
    return jsonOk({ quotes, authenticated: true });
  } catch {
    const symbols = new URL(req.url).searchParams.get("symbols")?.split(",").filter(Boolean);
    const quotes = await getWatchlistQuotes(null, symbols);
    return jsonOk({ quotes, authenticated: false });
  }
});

export const POST = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  const { user } = await requireUser();
  const body = (await req.json()) as { symbol?: string };
  const quotes = await addToWatchlist(user.id, body.symbol ?? "");
  return jsonOk({ quotes, authenticated: true });
});
