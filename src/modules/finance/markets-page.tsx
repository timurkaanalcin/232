"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import { CATEGORY_LABELS, formatPct, formatPrice, formatVolume } from "@/lib/finance/format";
import { MARKET_CATEGORIES, type MarketCategory, type QuoteDTO } from "@/lib/finance/types";
import { Sparkline } from "@/modules/finance/sparkline";
import { cn } from "@/lib/utils";

export function MarketsPage({ category }: { category?: string }) {
  const active = (MARKET_CATEGORIES.includes(category as MarketCategory) ? category : "indexes") as MarketCategory;
  const query = useQuery({
    queryKey: ["markets", "list", active],
    queryFn: () => apiGet<{ quotes: QuoteDTO[] }>(`/api/markets/list?category=${active}`),
    refetchInterval: 20_000,
  });
  const quotes = query.data?.quotes ?? [];

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-medium tracking-tight">Piyasalar</h1>
      <div className="flex gap-1 overflow-x-auto border-b [scrollbar-width:none]">
        {MARKET_CATEGORIES.map((item) => (
          <Link
            key={item}
            href={item === "indexes" ? "/markets" : `/markets/${item}`}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm",
              active === item
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {CATEGORY_LABELS[item]}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b text-left text-[11px] text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Sembol</th>
              <th className="px-4 py-2 font-medium">Ad</th>
              <th className="px-4 py-2 font-medium">Grafik</th>
              <th className="px-4 py-2 text-right font-medium">Fiyat</th>
              <th className="px-4 py-2 text-right font-medium">Değişim</th>
              <th className="px-4 py-2 text-right font-medium">Hacim</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.instrumentId} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link href={`/quote/${quote.instrumentId}`} className="font-semibold text-primary">
                    {quote.symbol}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{quote.nameTr || quote.name}</td>
                <td className="px-4 py-2.5">
                  <Sparkline points={quote.sparkline} up={quote.changePct >= 0} filled />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatPrice(quote.price, quote.currency)}</td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${quote.changePct >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatPct(quote.changePct)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatVolume(quote.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
