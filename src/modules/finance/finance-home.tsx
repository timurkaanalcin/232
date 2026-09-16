"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import { formatNewsTime, formatPct, formatPrice } from "@/lib/finance/format";
import type { MarketOverviewDTO, QuoteDTO } from "@/lib/finance/types";
import { QuoteRow } from "@/modules/finance/quote-row";
import { Sparkline } from "@/modules/finance/sparkline";
import { Skeleton } from "@/components/ui/skeleton";

function MarketTrendCard({ quote }: { quote: QuoteDTO }) {
  const up = quote.changePct >= 0;
  return (
    <Link
      href={`/quote/${quote.instrumentId}`}
      className="min-w-[168px] max-w-[188px] shrink-0 rounded-lg border bg-white p-3 shadow-[0_1px_2px_rgba(60,64,67,0.08)] dark:bg-card"
    >
      <div className="truncate text-[13px] font-medium">{quote.nameTr || quote.name}</div>
      <div className="mt-1 text-lg font-medium tabular-nums leading-6">{formatPrice(quote.price, quote.currency)}</div>
      <div className={`text-[13px] tabular-nums ${up ? "text-gain" : "text-loss"}`}>{formatPct(quote.changePct)}</div>
      <Sparkline points={quote.sparkline} up={up} filled className="mt-2 h-10 w-full" />
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
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-44" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-7">
      <section>
        <h1 className="text-xl font-medium tracking-tight">Piyasa eğilimleri</h1>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {overview.featured.map((quote) => (
            <MarketTrendCard key={quote.instrumentId} quote={quote} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-medium">İzleme listesi</h2>
            <Link href="/watchlist" className="text-sm text-primary hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="divide-y rounded-lg border bg-white dark:bg-card">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_96px_auto_auto] gap-x-3 px-4 py-2 text-[11px] text-muted-foreground sm:grid">
              <span>Ad</span>
              <span className="text-right">Grafik</span>
              <span className="text-right">Fiyat</span>
              <span className="min-w-[4.5rem] text-right">Değişim</span>
            </div>
            {overview.featured.slice(0, 8).map((quote) => (
              <div key={`w-${quote.instrumentId}`} className="px-2">
                <QuoteRow quote={quote} />
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MoverCard title="Yükselenler" quotes={overview.gainers} />
            <MoverCard title="Düşenler" quotes={overview.losers} />
            <MoverCard title="En aktif" quotes={overview.mostActive} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-medium">Piyasa haberleri</h2>
            <Link href="/news" className="text-sm text-primary hover:underline">
              Diğer haberler
            </Link>
          </div>
          <div className="grid gap-3">
            {overview.news.slice(0, 6).map((article, index) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className={
                  index === 0
                    ? "overflow-hidden rounded-lg border bg-white dark:bg-card"
                    : "grid grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-lg border bg-white p-2 dark:bg-card sm:grid-cols-[120px_minmax(0,1fr)]"
                }
              >
                <img
                  src={article.imageUrl}
                  alt=""
                  className={index === 0 ? "h-44 w-full object-cover" : "h-full min-h-[72px] w-full rounded object-cover"}
                />
                <div className={index === 0 ? "p-3" : "min-w-0 py-0.5 pr-1"}>
                  <div className="text-[11px] font-medium text-primary">
                    {article.category}
                    {article.breaking ? " · Son dakika" : ""}
                  </div>
                  <h3 className="mt-0.5 text-[15px] font-medium leading-snug">{article.title}</h3>
                  {index === 0 ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p> : null}
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {article.author} · {formatNewsTime(article.publishedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {overview.videos.length > 0 ? (
      <section>
        <h2 className="mb-3 text-lg font-medium">Videolar</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-lg border bg-white dark:bg-card"
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="aspect-video w-full object-cover"
              />
              <div className="p-2.5">
                <div className="text-[13px] font-medium leading-snug">{video.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {video.channel} · {video.duration}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
      ) : null}
    </div>
  );
}

function MoverCard({ title, quotes }: { title: string; quotes: QuoteDTO[] }) {
  return (
    <div className="rounded-lg border bg-white p-2 dark:bg-card">
      <h3 className="px-2 py-1 text-[13px] font-medium">{title}</h3>
      {quotes.slice(0, 5).map((quote) => (
        <QuoteRow key={`${title}-${quote.instrumentId}`} quote={quote} compact />
      ))}
    </div>
  );
}
