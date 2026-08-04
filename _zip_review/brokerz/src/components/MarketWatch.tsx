import { useState } from "react";
import { Search, Star, ChevronDown, BarChart3 } from "lucide-react";
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
  const [showAll, setShowAll] = useState(true);

  const filtered = INSTRUMENTS.filter(
    (i) =>
      i.symbol.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Instrument[]>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col bg-[#111111]">
      {/* Header */}
      <div className="border-b border-black/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-semibold text-white/80">Market Watch</span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-black/30 p-2">
        <div className="flex items-center gap-2 rounded bg-black/30 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol..."
            className="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center justify-between border-b border-black/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
        <span>Symbol</span>
        <div className="flex gap-4">
          <span>Bid</span>
          <span>Ask</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat}>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="sticky top-0 flex w-full items-center gap-1.5 bg-[#1a1a1a] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:bg-[#222222]"
            >
              <ChevronDown className={`h-3 w-3 transition ${showAll ? "" : "rotate-[-90deg]"}`} />
              {CATEGORY_LABELS[cat]}
            </button>
            {showAll &&
              list.map((inst) => {
                const tick = ticks[inst.id];
                const isSelected = inst.id === selectedId;
                const bid = tick?.bid ?? inst.basePrice;
                const ask = tick?.ask ?? inst.basePrice;
                const prevBid = tick?.bid ?? inst.basePrice;
                const change = inst.basePrice > 0 ? (bid - inst.basePrice) / inst.basePrice : 0;
                const isUp = change >= 0;
                return (
                  <button
                    key={inst.id}
                    onClick={() => onSelect(inst)}
                    onDoubleClick={() => onSelect(inst)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition ${
                      isSelected ? "bg-yellow-400/15 border-l-2 border-yellow-400" : "hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Star className="h-3 w-3 text-white/20" />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-white/90">{inst.symbol}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 font-mono text-[11px]">
                      <span className={isUp ? "text-red-400" : "text-green-400"}>
                        {formatPrice(bid, inst.digits)}
                      </span>
                      <span className={isUp ? "text-red-400" : "text-green-400"}>
                        {formatPrice(ask, inst.digits)}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-white/30">No symbols found</div>
        )}
      </div>
    </div>
  );
}
