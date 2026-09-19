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
        "tabular-nums",
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
      className={cn(
        "grid w-full min-w-0 items-center gap-x-3 rounded-md px-2 py-1.5 hover:bg-muted/70",
        compact
          ? "grid-cols-[minmax(0,1fr)_auto_auto]"
          : "grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1.6fr)_96px_auto_auto]",
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-5">{quote.symbol}</div>
        <div className="truncate text-[11px] leading-4 text-muted-foreground">{quote.nameTr || quote.name}</div>
      </div>
      {!compact ? (
        <Sparkline points={quote.sparkline} up={up} className="hidden h-7 w-[72px] justify-self-end sm:block sm:w-24" />
      ) : null}
      <div className="text-right text-[13px] font-medium tabular-nums leading-5">{formatPrice(quote.price, quote.currency)}</div>
      <div className="min-w-[4.5rem] text-right text-[13px] leading-5">
        <ChangeText value={quote.changePct} />
        {!compact ? (
          <div className="hidden text-[11px] text-muted-foreground sm:block">{formatSigned(quote.changeAbs)}</div>
        ) : null}
      </div>
    </Link>
  );
}
