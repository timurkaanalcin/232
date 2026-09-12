"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import { formatNewsTime, formatPct, formatPrice } from "@/lib/finance/format";
import type { MarketOverviewDTO, QuoteDTO } from "@/lib/finance/types";
import { QuoteRow } from "@/modules/finance/quote-row";
import { Sparkline } from "@/modules/finance/sparkline";
import { Skeleton } from "@/components/ui/skeleton";

function MarketCard({ quote }: { quote: QuoteDTO }) {
  return (
    <Link href={`/quote/${quote.instrumentId}`} className="min-w-[176px] rounded-xl border bg-white p-3 shadow-sm dark:bg-card">
      <div className="text-sm font-medium">{quote.symbol}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{formatPrice(quote.price, quote.currency)}</div>
      <div className={quote.changePct >= 0 ? "text-sm text-gain" : "text-sm text-loss"}>{formatPct(quote.changePct)}</div>
      <Sparkline points={quote.sparkline} up={quote.changePct >= 0} className="mt-2 w-full" />
    </Link>
  );
}

export function FinanceHome() {
  const query = useQuery({
    queryKey: ["markets", "overview"],
    queryFn: () => apiGet<{ overview: MarketOverviewDTO }>("/api/markets/overview"),
    refetchInterval: 20_000,
  });
  const overview = query.data?.overview;

  if (!overview) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-44" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Piyasa özeti</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Endeksler, döviz, emtia ve kripto — özgün borsahatti panosu. Canlı kaynak yoksa gösterge fiyat üretilir.
        </p>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {overview.featured.map((quote) => (
            <MarketCard key={quote.instrumentId} quote={quote} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <div className="rounded-xl border bg-white p-3 dark:bg-card">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="font-semibold">İzlenenler</h2>
              <Link href="/watchlist" className="text-sm text-primary">
                Tümünü gör
              </Link>
            </div>
            {overview.featured.slice(0, 7).map((quote) => (
              <QuoteRow key={`w-${quote.instrumentId}`} quote={quote} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MoverCard title="Yükselenler" quotes={overview.gainers} />
            <MoverCard title="Düşenler" quotes={overview.losers} />
            <MoverCard title="Hacimliler" quotes={overview.mostActive} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Piyasa haberleri</h2>
            <Link href="/news" className="text-sm text-primary">
              Haberler
            </Link>
          </div>
          {overview.news.slice(0, 6).map((article, index) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className={`overflow-hidden rounded-xl border bg-white dark:bg-card ${index === 0 ? "" : "grid grid-cols-[112px_1fr] gap-3"}`}
            >
              <img src={article.imageUrl} alt="" className={index === 0 ? "h-48 w-full object-cover" : "h-full w-28 object-cover"} />
              <div className="p-3">
                <div className="text-xs font-medium text-primary">
                  {article.category}
                  {article.breaking ? " · Son dakika" : ""}
                </div>
                <h3 className="mt-1 font-semibold leading-snug">{article.title}</h3>
                {index === 0 ? <p className="mt-1 text-sm text-muted-foreground">{article.summary}</p> : null}
                <div className="mt-2 text-xs text-muted-foreground">
                  {article.author} · {formatNewsTime(article.publishedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Videolar</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-xl border bg-white dark:bg-card"
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="aspect-video w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm font-medium leading-snug">{video.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {video.channel} · {video.duration}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function MoverCard({ title, quotes }: { title: string; quotes: QuoteDTO[] }) {
  return (
    <div className="rounded-xl border bg-white p-3 dark:bg-card">
      <h3 className="mb-2 px-1 text-sm font-semibold">{title}</h3>
      {quotes.slice(0, 4).map((quote) => (
        <QuoteRow key={`${title}-${quote.instrumentId}`} quote={quote} compact />
      ))}
    </div>
  );
}
