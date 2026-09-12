"use client";

import Link from "next/link";
import { changeTone, formatPct, formatPrice, formatSigned } from "@/lib/finance/format";
import type { QuoteDTO } from "@/lib/finance/types";
import { Sparkline } from "@/modules/finance/sparkline";
import { cn } from "@/lib/utils";

export function ChangeText({ value, className }: { value: number; className?: string }) {
  const tone = changeTone(value);
  return (
    <span
      className={cn(
        tone === "up" && "text-gain",
        tone === "down" && "text-loss",
        tone === "flat" && "text-muted-foreground",
        className,
      )}
    >
      {formatPct(value)}
    </span>
  );
}

export function QuoteRow({ quote, compact }: { quote: QuoteDTO; compact?: boolean }) {
  const up = quote.changePct >= 0;
  return (
    <Link
      href={`/quote/${encodeURIComponent(quote.instrumentId)}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/70 sm:grid-cols-[1.4fr_1fr_auto_auto]"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{quote.symbol}</div>
        <div className="truncate text-xs text-muted-foreground">{quote.nameTr || quote.name}</div>
      </div>
      {!compact ? <Sparkline points={quote.sparkline} up={up} className="hidden sm:block" /> : null}
      <div className="text-right text-sm font-medium tabular-nums">{formatPrice(quote.price, quote.currency)}</div>
      <div className="text-right text-sm tabular-nums">
        <ChangeText value={quote.changePct} />
        {!compact ? (
          <div className="hidden text-xs text-muted-foreground sm:block">{formatSigned(quote.changeAbs)}</div>
        ) : null}
      </div>
    </Link>
  );
}
