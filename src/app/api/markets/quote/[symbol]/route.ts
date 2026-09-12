import { apiHandler, jsonOk, notFound } from "@/lib/api";
import { getQuote } from "@/services/finance";

export const GET = apiHandler(async (_req: Request, context: { params: Promise<{ symbol: string }> }) => {
  const { symbol } = await context.params;
  const quote = await getQuote(decodeURIComponent(symbol));
  if (!quote) throw notFound("Instrument");
  return jsonOk({ quote });
});
