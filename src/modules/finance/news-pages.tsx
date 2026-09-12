"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client-api";
import { formatNewsTime } from "@/lib/finance/format";
import type { NewsDTO, VideoDTO } from "@/lib/finance/types";

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

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Haberler ve videolar</h1>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => {
          const href = item === "Tümü" ? "/news" : `/news?category=${encodeURIComponent(item)}`;
          const active = (category ?? "Tümü") === item;
          return (
            <Link
              key={item}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-[#1a73e8] text-white" : "bg-white dark:bg-card"}`}
            >
              {item}
            </Link>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div className="grid gap-4">
          {news.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`} className="grid overflow-hidden rounded-xl border bg-white sm:grid-cols-[220px_1fr] dark:bg-card">
              <img src={article.imageUrl} alt="" className="h-40 w-full object-cover sm:h-full" />
              <div className="p-4">
                <div className="text-xs font-medium text-[#1967d2]">{article.category}</div>
                <h2 className="mt-1 text-lg font-semibold leading-snug">{article.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{article.summary}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {article.author} · {formatNewsTime(article.publishedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <aside className="grid h-fit gap-3 rounded-xl border bg-white p-4 dark:bg-card">
          <h2 className="font-semibold">Videolar</h2>
          {(videos.data?.videos ?? []).map((video) => (
            <a key={video.id} href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer" className="grid grid-cols-[96px_1fr] gap-3">
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" className="h-16 w-24 rounded object-cover" />
              <div>
                <div className="text-sm font-medium leading-snug">{video.title}</div>
                <div className="text-xs text-muted-foreground">{video.channel}</div>
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
      <div className="text-sm text-[#1967d2]">{article.category}</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{article.title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {article.author} · {formatNewsTime(article.publishedAt)}
      </div>
      {article.imageUrl ? <img src={article.imageUrl} alt="" className="mt-5 w-full rounded-xl object-cover" /> : null}
      <p className="mt-5 text-lg text-muted-foreground">{article.summary}</p>
      <div className="mt-5 whitespace-pre-line text-base leading-7">{article.body}</div>
      {article.relatedSymbols.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.relatedSymbols.map((symbol) => (
            <Link key={symbol} href={`/quote/${symbol}`} className="rounded-full bg-white px-3 py-1 text-sm dark:bg-card">
              {symbol}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
