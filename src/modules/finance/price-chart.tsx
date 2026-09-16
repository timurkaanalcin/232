"use client";

import { useMemo, useState } from "react";
import { formatNumber, formatPrice } from "@/lib/finance/format";
import type { CandlePoint, ChartRange } from "@/lib/finance/types";
import { CHART_RANGES } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const RANGE_LABEL: Record<ChartRange, string> = {
  "1d": "1G",
  "5d": "5G",
  "1mo": "1A",
  "6mo": "6A",
  ytd: "YTD",
  "1y": "1Y",
  "5y": "5Y",
  max: "Maks",
};

export function PriceChart({
  candles,
  range,
  onRange,
  currency,
  loading,
}: {
  candles: CandlePoint[];
  range: ChartRange;
  onRange: (range: ChartRange) => void;
  currency: string;
  loading?: boolean;
}) {
  const [hover, setHover] = useState<CandlePoint | null>(null);
  const up = (candles.at(-1)?.c ?? 0) >= (candles[0]?.c ?? 0);
  const path = useMemo(() => {
    if (candles.length < 2) return "";
    const min = Math.min(...candles.map((c) => c.l));
    const max = Math.max(...candles.map((c) => c.h));
    const span = max - min || 1;
    return candles
      .map((candle, index) => {
        const x = (index / (candles.length - 1)) * 1000;
        const y = 360 - ((candle.c - min) / span) * 320;
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [candles]);

  const area = path ? `${path} L1000 380 L0 380 Z` : "";
  const gridYs = [40, 120, 200, 280, 360];

  return (
    <div className="rounded-lg border bg-white dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-2">
        <div className="px-2 py-2 text-xs text-muted-foreground">
          {hover
            ? `${new Date(hover.t).toLocaleString("tr-TR")} · ${formatPrice(hover.c, currency)}`
            : loading
              ? "Grafik yükleniyor…"
              : "Fiyat grafiği"}
        </div>
        <div className="flex flex-wrap">
          {CHART_RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRange(item)}
              className={cn(
                "-mb-px border-b-2 px-2.5 py-2 text-xs font-medium",
                range === item
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {RANGE_LABEL[item]}
            </button>
          ))}
        </div>
      </div>
      <div className="relative px-2 pb-3 pt-2">
        <svg
          viewBox="0 0 1000 400"
          className="h-64 w-full sm:h-[340px]"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(event) => {
            if (!candles.length) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            const index = Math.min(candles.length - 1, Math.max(0, Math.round(ratio * (candles.length - 1))));
            setHover(candles[index] ?? null);
          }}
        >
          {gridYs.map((y) => (
            <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="currentColor" className="text-border" strokeWidth="1" />
          ))}
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={up ? "var(--gain)" : "var(--loss)"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={up ? "var(--gain)" : "var(--loss)"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area ? <path d={area} fill="url(#chartFill)" /> : null}
          {path ? (
            <path d={path} fill="none" stroke={up ? "var(--gain)" : "var(--loss)"} strokeWidth="2.5" strokeLinejoin="round" />
          ) : null}
        </svg>
        {hover ? (
          <div className="mt-1 grid grid-cols-4 gap-2 px-2 text-xs text-muted-foreground">
            <span>Açılış {formatNumber(hover.o)}</span>
            <span>Yüksek {formatNumber(hover.h)}</span>
            <span>Düşük {formatNumber(hover.l)}</span>
            <span>Hacim {formatNumber(hover.v, 0)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
