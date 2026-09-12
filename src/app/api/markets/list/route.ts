import { apiHandler, jsonOk } from "@/lib/api";
import { MARKET_CATEGORIES, type InstrumentType, type MarketCategory, type MarketRegion } from "@/lib/finance/types";
import { listQuotes } from "@/services/finance";

export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  const region = url.searchParams.get("region") ?? undefined;
  const quotes = await listQuotes({
    category: MARKET_CATEGORIES.includes(category as MarketCategory) ? (category as MarketCategory) : undefined,
    type: type as InstrumentType | undefined,
    region: region as MarketRegion | undefined,
  });
  return jsonOk({ quotes });
});
