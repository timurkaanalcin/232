import { apiHandler, badRequest, jsonOk, notFound } from "@/lib/api";
import { CHART_RANGES, type ChartRange } from "@/lib/finance/types";
import { getChart } from "@/services/finance";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ symbol: string }> }) => {
  const { symbol } = await context.params;
  const range = new URL(req.url).searchParams.get("range") ?? "1d";
  if (!CHART_RANGES.includes(range as ChartRange)) throw badRequest("Invalid chart range");
  const chart = await getChart(decodeURIComponent(symbol), range as ChartRange);
  if (!chart) throw notFound("Instrument");
  return jsonOk(chart);
});
