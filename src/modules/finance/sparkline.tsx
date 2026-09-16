"use client";

import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  up,
  className,
  filled = false,
}: {
  points: number[];
  up?: boolean;
  className?: string;
  filled?: boolean;
}) {
  if (points.length < 2) return <div className={cn("h-8 w-20", className)} />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 28 - ((value - min) / span) * 24;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${d} L100 32 L0 32 Z`;
  const color = up ? "var(--gain)" : "var(--loss)";

  return (
    <svg viewBox="0 0 100 32" className={cn("h-8 w-24 overflow-visible", className)} aria-hidden>
      {filled ? <path d={area} fill={color} fillOpacity="0.16" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
