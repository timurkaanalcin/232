import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Instrument, Tick, Direction } from "@/types";
import { formatPrice } from "@/lib/market";

interface Props {
  inst: Instrument;
  tick: Tick | null;
  onClose: () => void;
  onExecute: (dir: Direction, volume: number, sl: number | null, tp: number | null) => void;
}

export default function OrderDialog({ inst, tick, onClose, onExecute }: Props) {
  const [volume, setVolume] = useState(0.10);
  const [sl, setSl] = useState<string>("");
  const [tp, setTp] = useState<string>("");
  const [useSL, setUseSL] = useState(false);
  const [useTP, setUseTP] = useState(false);

  const bid = tick?.bid ?? inst.basePrice;
  const ask = tick?.ask ?? inst.basePrice;

  // Auto-fill SL/TP defaults
  useEffect(() => {
    if (useSL && !sl) {
      const slPrice = ask - inst.volatility * 10;
      setSl(formatPrice(slPrice, inst.digits));
    }
    if (useTP && !tp) {
      const tpPrice = ask + inst.volatility * 10;
      setTp(formatPrice(tpPrice, inst.digits));
    }
  }, [useSL, useTP]);

  const margin = volume * 100000 * ask / 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#111111] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-white">New Order</h2>
            <p className="text-[11px] text-white/40">{inst.symbol} · {inst.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {/* Volume */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/50">Volume (lots)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={volume}
                step={0.01}
                min={0.01}
                onChange={(e) => setVolume(Math.max(0.01, Number(e.target.value)))}
                className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <div className="flex gap-1">
                <button onClick={() => setVolume((v) => Math.max(0.01, v - 0.01))} className="h-9 w-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10">−</button>
                <button onClick={() => setVolume((v) => v + 0.01)} className="h-9 w-9 rounded-lg bg-white/5 text-white/60 hover:bg-white/10">+</button>
              </div>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {[0.01, 0.05, 0.10, 0.50, 1.00].map((v) => (
                <button
                  key={v}
                  onClick={() => setVolume(v)}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                    volume === v ? "bg-yellow-400/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {v.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* SL / TP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-white/50">
                <input type="checkbox" checked={useSL} onChange={(e) => setUseSL(e.target.checked)} className="accent-yellow-400" />
                Stop Loss
              </label>
              <input
                type="text"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                disabled={!useSL}
                placeholder="—"
                className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-yellow-400 disabled:opacity-40"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-white/50">
                <input type="checkbox" checked={useTP} onChange={(e) => setUseTP(e.target.checked)} className="accent-yellow-400" />
                Take Profit
              </label>
              <input
                type="text"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                disabled={!useTP}
                placeholder="—"
                className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-yellow-400 disabled:opacity-40"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-black/20 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/30">Sell / Bid</div>
              <div className="mt-1 font-mono text-lg font-bold text-red-400">{formatPrice(bid, inst.digits)}</div>
            </div>
            <div className="rounded-lg bg-black/20 p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/30">Buy / Ask</div>
              <div className="mt-1 font-mono text-lg font-bold text-green-400">{formatPrice(ask, inst.digits)}</div>
            </div>
          </div>

          {/* Margin info */}
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
            <span className="text-white/40">Required margin</span>
            <span className="font-mono font-semibold text-white/70">${margin.toFixed(2)}</span>
          </div>

          {/* Execute buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onExecute("sell", volume, useSL ? Number(sl) : null, useTP ? Number(tp) : null)}
              className="rounded-xl bg-gradient-to-b from-red-500 to-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:from-red-400 hover:to-red-500"
            >
              Sell / Bid
              <div className="font-mono text-xs font-normal opacity-80">{formatPrice(bid, inst.digits)}</div>
            </button>
            <button
              onClick={() => onExecute("buy", volume, useSL ? Number(sl) : null, useTP ? Number(tp) : null)}
              className="rounded-xl bg-gradient-to-b from-green-500 to-green-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:from-green-400 hover:to-green-500"
            >
              Buy / Ask
              <div className="font-mono text-xs font-normal opacity-80">{formatPrice(ask, inst.digits)}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
