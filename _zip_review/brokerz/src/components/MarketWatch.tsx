import { useMemo, useRef, useState } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import type { Instrument, Tick } from "@/types";
import { INSTRUMENTS, CATEGORY_LABELS } from "@/data/instruments";
import { formatPrice } from "@/lib/market";

interface Props {
  selectedId: string;
  onSelect: (inst: Instrument) => void;
  ticks: Record<string, Tick>;
}

export default function MarketWatch({ selectedId, onSelect, ticks }: Props) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const prevBids = useRef<Record<string, number>>({});

  const filtered = useMemo(
    () =>
      INSTRUMENTS.filter(
        (i) =>
          i.symbol.toLowerCase().includes(query.toLowerCase()) ||
          i.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, Instrument[]>>((acc, i) => {
        (acc[i.category] ||= []).push(i);
        return acc;
      }, {}),
    [filtered]
  );

  return (
    <div className="flex h-full flex-col bg-[#131722]">
      <div className="flex items-center justify-between border-b border-[#1e222d] px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d1d4dc]">
          Market Watch
        </span>
        <span className="text-[10px] text-[#787b86]">{filtered.length}</span>
      </div>

      <div className="border-b border-[#1e222d] p-2">
        <div className="flex items-center gap-2 rounded border border-[#1e222d] bg-[#0f1115] px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-[#787b86]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol..."
            className="w-full bg-transparent text-xs text-[#d1d4dc] placeholder-[#787b86] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[#1e222d] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#787b86]">
        <span>Symbol</span>
        <span className="w-16 text-right">Bid</span>
        <span className="w-16 text-right">Ask</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(grouped).map(([cat, list]) => {
          const isOpen = !collapsed[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))}
                className="sticky top-0 flex w-full items-center gap-1.5 bg-[#1e222d] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#787b86] hover:text-[#d1d4dc]"
              >
                <ChevronDown className={`h-3 w-3 transition ${isOpen ? "" : "-rotate-90"}`} />
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
              {isOpen &&
                list.map((inst) => {
                  const tick = ticks[inst.id];
                  const isSelected = inst.id === selectedId;
                  const bid = tick?.bid ?? inst.basePrice;
                  const ask = tick?.ask ?? inst.basePrice;
                  const prev = prevBids.current[inst.id] ?? bid;
                  const dir = bid > prev ? "up" : bid < prev ? "down" : "flat";
                  prevBids.current[inst.id] = bid;
                  const priceClass =
                    dir === "up" ? "text-[#2962ff]" : dir === "down" ? "text-[#f23645]" : "text-[#787b86]";
                  return (
                    <button
                      key={inst.id}
                      onClick={() => onSelect(inst)}
                      className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-1.5 text-left transition ${
                        isSelected
                          ? "border-l-2 border-[#00b67a] bg-[#00b67a]/10"
                          : "border-l-2 border-transparent hover:bg-[#1e222d]/80"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Star className={`h-3 w-3 ${isSelected ? "text-[#00b67a]" : "text-[#2a2e39]"}`} />
                        <span className="truncate text-xs font-medium text-[#d1d4dc]">{inst.symbol}</span>
                      </div>
                      <span className={`w-16 text-right font-mono text-[11px] ${priceClass}`}>
                        {formatPrice(bid, inst.digits)}
                      </span>
                      <span className={`w-16 text-right font-mono text-[11px] ${priceClass}`}>
                        {formatPrice(ask, inst.digits)}
                      </span>
                    </button>
                  );
                })}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-[#787b86]">No symbols found</div>
        )}
      </div>
    </div>
  );
}
