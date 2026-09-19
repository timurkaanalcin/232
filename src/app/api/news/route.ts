import { apiHandler, jsonOk } from "@/lib/api";
import { listNews } from "@/services/finance";

export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const news = await listNews({
    category: url.searchParams.get("category") ?? undefined,
    ticker: url.searchParams.get("ticker") ?? undefined,
  });
  return jsonOk({ news });
});
