"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost } from "@/lib/client-api";
import {
  changeTone,
  formatCompact,
  formatNewsTime,
  formatNumber,
  formatPct,
  formatPrice,
  formatSigned,
  formatVolume,
  REGION_LABELS,
  TYPE_LABELS,
} from "@/lib/finance/format";
import type { CandlePoint, ChartRange, NewsDTO, QuoteDTO } from "@/lib/finance/types";
import { PriceChart } from "@/modules/finance/price-chart";
import { cn } from "@/lib/utils";

export function QuotePage({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<ChartRange>("1d");
  const quoteQuery = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => apiGet<{ quote: QuoteDTO }>(`/api/markets/quote/${encodeURIComponent(symbol)}`),
    refetchInterval: 15_000,
  });
  const chartQuery = useQuery({
    queryKey: ["chart", symbol, range],
    queryFn: () =>
      apiGet<{ quote: QuoteDTO; candles: CandlePoint[] }>(
        `/api/markets/chart/${encodeURIComponent(symbol)}?range=${range}`,
      ),
  });
  const newsQuery = useQuery({
    queryKey: ["news", symbol],
    queryFn: () => apiGet<{ news: NewsDTO[] }>(`/api/news?ticker=${encodeURIComponent(symbol)}`),
  });

  const quote = quoteQuery.data?.quote;
  if (quoteQuery.isError) {
    return <p className="text-sm text-muted-foreground">Bu sembol bulunamadı.</p>;
  }
  if (!quote) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const current = quote;
  const tone = changeTone(current.changePct);

  async function addWatchlist() {
    const id = current.instrumentId;
    try {
      await apiPost("/api/watchlist", { symbol: id });
      toast.success("İzleme listesine eklendi");
    } catch {
      const raw = localStorage.getItem("borsahatti_watchlist");
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      if (!list.includes(id)) list.push(id);
      localStorage.setItem("borsahatti_watchlist", JSON.stringify(list));
      toast.success("Yerel izleme listesine eklendi");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {TYPE_LABELS[quote.type]} · {quote.exchange} · {REGION_LABELS[quote.region]}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {quote.nameTr || quote.name}{" "}
            <span className="text-xl font-medium text-muted-foreground">{quote.symbol}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <div className="text-4xl font-semibold tabular-nums">{formatPrice(quote.price, quote.currency)}</div>
            <div
              className={cn(
                "text-lg tabular-nums",
                tone === "up" && "text-emerald-700",
                tone === "down" && "text-rose-700",
              )}
            >
              {formatSigned(quote.changeAbs)} ({formatPct(quote.changePct)})
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Kaynak: {quote.source === "live" ? "canlı piyasa" : "gösterge / önbellek"} ·{" "}
            {new Date(quote.updatedAt).toLocaleTimeString("tr-TR")}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void addWatchlist()}>
            <StarIcon className="size-4" />
            İzle
          </Button>
          <Button asChild variant="outline">
            <Link href={`/compare?a=${encodeURIComponent(quote.instrumentId)}`}>Karşılaştır</Link>
          </Button>
        </div>
      </div>

      <PriceChart
        candles={chartQuery.data?.candles ?? []}
        range={range}
        onRange={setRange}
        currency={quote.currency}
        loading={chartQuery.isFetching}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Açılış" value={formatPrice(quote.open, quote.currency)} />
        <Stat label="Gün içi yüksek" value={formatPrice(quote.high, quote.currency)} />
        <Stat label="Gün içi düşük" value={formatPrice(quote.low, quote.currency)} />
        <Stat label="Önceki kapanış" value={formatPrice(quote.prevClose, quote.currency)} />
        <Stat label="Hacim" value={formatVolume(quote.volume)} />
        <Stat label="Ort. hacim" value={formatVolume(quote.avgVolume)} />
        <Stat label="Piyasa değeri" value={formatCompact(quote.marketCap, quote.currency)} />
        <Stat label="F/K" value={formatNumber(quote.peRatio)} />
        <Stat label="Temettü verimi" value={quote.dividendYield != null ? formatPct(quote.dividendYield) : "—"} />
        <Stat label="52 hafta yüksek" value={formatPrice(quote.week52High, quote.currency)} />
        <Stat label="52 hafta düşük" value={formatPrice(quote.week52Low, quote.currency)} />
        <Stat label="Sektör" value={quote.sector || "—"} />
      </div>

      <section className="rounded-xl border bg-white p-5 dark:bg-card">
        <h2 className="text-lg font-semibold">Hakkında</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{quote.descriptionTr || quote.description}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">İlgili haberler</h2>
        <div className="grid gap-3">
          {(newsQuery.data?.news ?? []).map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="rounded-xl border bg-white p-4 dark:bg-card">
              <div className="text-xs text-[#1967d2]">{article.category}</div>
              <div className="mt-1 font-medium">{article.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {article.author} · {formatNewsTime(article.publishedAt)}
              </div>
            </Link>
          ))}
          {newsQuery.data?.news.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu sembole bağlı haber yok.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}
