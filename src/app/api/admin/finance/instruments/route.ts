import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import type { InstrumentSeed } from "@/lib/finance/types";
import { listQuotes, upsertInstrument } from "@/services/finance";

export const GET = apiHandler(async () => {
  await requirePermission("finance.manage");
  const quotes = await listQuotes();
  return jsonOk({ instruments: quotes });
});

export const POST = apiHandler(async (req: Request) => {
  await assertSameOrigin(req);
  await requirePermission("finance.manage");
  const body = (await req.json()) as Partial<InstrumentSeed> & { active?: boolean };
  if (!body.id || !body.symbol || !body.name || !body.type) throw badRequest("id, symbol, name and type are required");
  await upsertInstrument({
    id: body.id.toUpperCase(),
    symbol: body.symbol,
    yahooSymbol: body.yahooSymbol ?? body.symbol,
    name: body.name,
    nameTr: body.nameTr ?? body.name,
    type: body.type,
    region: body.region ?? "global",
    exchange: body.exchange ?? "",
    currency: body.currency ?? "USD",
    sector: body.sector ?? "",
    description: body.description ?? "",
    descriptionTr: body.descriptionTr ?? body.description ?? "",
    basePrice: body.basePrice ?? 100,
    marketCap: body.marketCap,
    peRatio: body.peRatio,
    dividendYield: body.dividendYield,
    featured: Boolean(body.featured),
    sortOrder: body.sortOrder ?? 100,
    active: body.active,
  } as InstrumentSeed & { active?: boolean });
  return jsonOk({ ok: true });
});
