"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";
import { SITE_NAME, type FinanceVideo } from "@/modules/marketing/news-articles";

export function NewsVideoSection({ videos }: { videos: FinanceVideo[] }) {
  const [active, setActive] = useState(videos[0]?.youtubeId ?? "");

  if (!videos.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-lg font-bold">{SITE_NAME} Videoları</h2>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border bg-black lg:col-span-3">
          <div className="relative aspect-video w-full">
            <iframe
              title={`${SITE_NAME} video oynatıcı`}
              src={`https://www.youtube-nocookie.com/embed/${active}?rel=0&modestbranding=1`}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-2">
          {videos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v.youtubeId)}
              className={`flex gap-3 rounded-lg border p-2 text-left transition hover:bg-accent/50 ${
                active === v.youtubeId ? "border-amber-500 bg-amber-500/5" : "bg-card"
              }`}
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayIcon className="size-5 text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {v.channel} · {v.duration}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
