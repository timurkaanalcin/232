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
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Piyasalar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Endeks, hisse, döviz, kripto ve emtia panoları.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {MARKET_CATEGORIES.map((item) => (
          <Link
            key={item}
            href={item === "indexes" ? "/markets" : `/markets/${item}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              active === item ? "bg-[#1a73e8] text-white" : "bg-white hover:bg-muted dark:bg-card",
            )}
          >
            {CATEGORY_LABELS[item]}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Sembol</th>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Grafik</th>
              <th className="px-4 py-3 text-right font-medium">Fiyat</th>
              <th className="px-4 py-3 text-right font-medium">Değişim</th>
              <th className="px-4 py-3 text-right font-medium">Hacim</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.instrumentId} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link href={`/quote/${quote.instrumentId}`} className="font-semibold text-[#1967d2]">
                    {quote.symbol}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{quote.nameTr || quote.name}</td>
                <td className="px-4 py-3">
                  <Sparkline points={quote.sparkline} up={quote.changePct >= 0} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(quote.price, quote.currency)}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${quote.changePct >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {formatPct(quote.changePct)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatVolume(quote.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
