"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VehicleImage } from "@/types/marketplace";

export function VehicleGallery({ images, videoUrl }: { images: VehicleImage[]; videoUrl?: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        {videoUrl && active === -1 ? (
          <div className="aspect-[16/10]">
            <iframe
              src={videoUrl}
              title="Araç videosu"
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current?.url} alt={current?.alt} className="aspect-[16/10] w-full object-cover" />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "size-20 shrink-0 overflow-hidden rounded-lg border-2",
              active === index ? "border-amber-500" : "border-transparent",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="size-full object-cover" />
          </button>
        ))}
        {videoUrl ? (
          <button
            type="button"
            onClick={() => setActive(-1)}
            className={cn(
              "flex size-20 shrink-0 items-center justify-center rounded-lg border-2 bg-[#0B1F3A] text-xs font-medium text-white",
              active === -1 ? "border-amber-500" : "border-transparent",
            )}
          >
            Video
          </button>
        ) : null}
      </div>
    </div>
  );
}
