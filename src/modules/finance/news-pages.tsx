"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import { formatNewsTime } from "@/lib/finance/format";
import type { NewsDTO, VideoDTO } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tümü", "Borsa", "Döviz", "Altın", "Kripto", "Ekonomi", "Şirket", "Emtia"];

export function NewsIndex({ category }: { category?: string }) {
  const query = useQuery({
    queryKey: ["news", category],
    queryFn: () =>
      apiGet<{ news: NewsDTO[] }>(category ? `/api/news?category=${encodeURIComponent(category)}` : "/api/news"),
  });
  const videos = useQuery({
    queryKey: ["videos"],
    queryFn: () => apiGet<{ videos: VideoDTO[] }>("/api/videos"),
  });
  const news = query.data?.news ?? [];
  const lead = news[0];
  const rest = news.slice(1);

  return (
    <div className="grid gap-5">
      <h1 className="text-xl font-medium">Haberler</h1>
      <div className="flex gap-1 overflow-x-auto border-b [scrollbar-width:none]">
        {CATEGORIES.map((item) => {
          const href = item === "Tümü" ? "/news" : `/news?category=${encodeURIComponent(item)}`;
          const active = (category ?? "Tümü") === item;
          return (
            <Link
              key={item}
              href={href}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm",
                active ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground",
              )}
            >
              {item}
            </Link>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)]">
        <div className="grid gap-3">
          {lead ? (
            <Link href={`/news/${lead.slug}`} className="overflow-hidden rounded-lg border bg-white dark:bg-card">
              <img src={lead.imageUrl} alt="" className="h-56 w-full object-cover" />
              <div className="p-4">
                <div className="text-[11px] font-medium text-primary">{lead.category}</div>
                <h2 className="mt-1 text-xl font-medium leading-snug">{lead.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{lead.summary}</p>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {lead.author} · {formatNewsTime(lead.publishedAt)}
                </div>
              </div>
            </Link>
          ) : null}
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="grid overflow-hidden rounded-lg border bg-white sm:grid-cols-[168px_minmax(0,1fr)] dark:bg-card"
            >
              <img src={article.imageUrl} alt="" className="h-32 w-full object-cover sm:h-full" />
              <div className="p-3">
                <div className="text-[11px] font-medium text-primary">{article.category}</div>
                <h2 className="mt-0.5 text-[15px] font-medium leading-snug">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {article.author} · {formatNewsTime(article.publishedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <aside className="grid h-fit gap-3 rounded-lg border bg-white p-3 dark:bg-card">
          <h2 className="text-sm font-medium">Videolar</h2>
          {(videos.data?.videos ?? []).map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-[96px_minmax(0,1fr)] gap-3"
            >
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" className="h-16 w-24 rounded object-cover" />
              <div className="min-w-0">
                <div className="text-[13px] font-medium leading-snug">{video.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{video.channel}</div>
              </div>
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function NewsArticlePage({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ["news-article", slug],
    queryFn: () => apiGet<{ article: NewsDTO }>(`/api/news/${encodeURIComponent(slug)}`),
  });
  const article = query.data?.article;
  if (query.isError) return <p>Haber bulunamadı.</p>;
  if (!article) return <p>Yükleniyor…</p>;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="text-sm text-primary">{article.category}</div>
      <h1 className="mt-2 text-3xl font-medium tracking-tight">{article.title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {article.author} · {formatNewsTime(article.publishedAt)}
      </div>
      {article.imageUrl ? <img src={article.imageUrl} alt="" className="mt-5 w-full rounded-lg object-cover" /> : null}
      <p className="mt-5 text-lg text-muted-foreground">{article.summary}</p>
      <div className="mt-5 whitespace-pre-line text-base leading-7">{article.body}</div>
      {article.relatedSymbols.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.relatedSymbols.map((symbol) => (
            <Link key={symbol} href={`/quote/${symbol}`} className="rounded-full border bg-white px-3 py-1 text-sm dark:bg-card">
              {symbol}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
