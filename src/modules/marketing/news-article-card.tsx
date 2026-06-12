import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@/modules/marketing/news-articles";

export function NewsArticleCard({ article, large }: { article: NewsArticle; large?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-lg">
      <div className={`relative overflow-hidden ${large ? "h-56 sm:h-72" : "h-40"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.imageUrl}
          alt=""
          className="size-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${article.imageGradient}`} />
        {article.breaking && (
          <Badge className="absolute left-3 top-3 bg-amber-500 text-slate-900 hover:bg-amber-500">SON DAKİKA</Badge>
        )}
        <Badge variant="secondary" className="absolute bottom-3 left-3 bg-black/50 text-white hover:bg-black/50">
          {article.category}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className={`font-semibold leading-snug ${large ? "text-xl sm:text-2xl" : "text-base"}`}>
          {article.title}
        </h3>
        <p className={`mt-2 text-muted-foreground ${large ? "text-sm sm:text-base" : "line-clamp-2 text-sm"}`}>
          {article.summary}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {article.author} · {article.publishedAt}
        </p>
      </div>
    </article>
  );
}
