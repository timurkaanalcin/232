"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/client-api";
import { formatPct, formatPrice } from "@/lib/finance/format";
import type { CandlePoint, QuoteDTO } from "@/lib/finance/types";

export function ComparePage() {
  const params = useSearchParams();
  const [left, setLeft] = useState(params.get("a") ?? "AAPL");
  const [right, setRight] = useState(params.get("b") ?? "MSFT");

  const a = useQuery({
    queryKey: ["compare", left],
    queryFn: () => apiGet<{ quote: QuoteDTO; candles: CandlePoint[] }>(`/api/markets/chart/${encodeURIComponent(left)}?range=1y`),
  });
  const b = useQuery({
    queryKey: ["compare", right],
    queryFn: () => apiGet<{ quote: QuoteDTO; candles: CandlePoint[] }>(`/api/markets/chart/${encodeURIComponent(right)}?range=1y`),
  });

  const pathA = useMemo(() => normalize(a.data?.candles ?? []), [a.data]);
  const pathB = useMemo(() => normalize(b.data?.candles ?? []), [b.data]);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-medium">Karşılaştır</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={left} onChange={(e) => setLeft(e.target.value.toUpperCase())} aria-label="Birinci sembol" />
        <Input value={right} onChange={(e) => setRight(e.target.value.toUpperCase())} aria-label="İkinci sembol" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CompareCard quote={a.data?.quote} />
        <CompareCard quote={b.data?.quote} />
      </div>
      <svg viewBox="0 0 1000 360" className="h-72 w-full rounded-lg border bg-white dark:bg-card">
        {pathA ? <path d={pathA} fill="none" stroke="var(--primary)" strokeWidth="2.5" /> : null}
        {pathB ? <path d={pathB} fill="none" stroke="var(--chart-3)" strokeWidth="2.5" /> : null}
      </svg>
      <div className="flex gap-4 text-sm">
        <span className="text-primary">{a.data?.quote.symbol ?? left}</span>
        <span className="text-[var(--chart-3)]">{b.data?.quote.symbol ?? right}</span>
      </div>
    </div>
  );
}

function CompareCard({ quote }: { quote?: QuoteDTO }) {
  if (!quote) return <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground dark:bg-card">Yükleniyor…</div>;
  return (
    <div className="rounded-lg border bg-white p-4 dark:bg-card">
      <div className="font-medium">
        {quote.nameTr} · {quote.symbol}
      </div>
      <div className="mt-1 text-2xl tabular-nums">{formatPrice(quote.price, quote.currency)}</div>
      <div className={quote.changePct >= 0 ? "text-gain" : "text-loss"}>{formatPct(quote.changePct)}</div>
    </div>
  );
}

function normalize(candles: CandlePoint[]): string {
  if (candles.length < 2) return "";
  const first = candles[0]!.c || 1;
  const indexed = candles.map((c) => c.c / first);
  const min = Math.min(...indexed);
  const max = Math.max(...indexed);
  const span = max - min || 1;
  return indexed
    .map((value, index) => {
      const x = (index / (indexed.length - 1)) * 1000;
      const y = 320 - ((value - min) / span) * 280;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
