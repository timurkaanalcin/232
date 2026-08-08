import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Instrument, Tick, Direction } from "@/types";
import { formatPrice } from "@/lib/market";

export type OrderMode = "market" | "limit";

export type OrderPayload = {
  dir: Direction;
  volume: number;
  sl: number | null;
  tp: number | null;
  mode: OrderMode;
  limitPrice: number | null;
};

interface Props {
  inst: Instrument;
  tick: Tick | null;
  onClose: () => void;
  onExecute: (payload: OrderPayload) => void;
  /** Prefer bottom sheet on narrow screens */
  sheet?: boolean;
  initialDir?: Direction;
}

export default function OrderDialog({
  inst,
  tick,
  onClose,
  onExecute,
  sheet,
  initialDir = "buy",
}: Props) {
  const [volume, setVolume] = useState(0.1);
  const [sl, setSl] = useState<string>("");
  const [tp, setTp] = useState<string>("");
  const [useSL, setUseSL] = useState(false);
  const [useTP, setUseTP] = useState(false);
  const [mode, setMode] = useState<OrderMode>("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const bid = tick?.bid ?? inst.basePrice;
  const ask = tick?.ask ?? inst.basePrice;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (useSL && !sl) setSl(formatPrice(ask - inst.volatility * 10, inst.digits));
    if (useTP && !tp) setTp(formatPrice(ask + inst.volatility * 10, inst.digits));
  }, [useSL, useTP]);

  useEffect(() => {
    if (!limitPrice) setLimitPrice(formatPrice(initialDir === "buy" ? ask : bid, inst.digits));
  }, [inst.id]);

  const margin = (volume * inst.contractSize * ask) / 500;
  const useSheet = sheet ?? isMobile;

  const fire = (dir: Direction) => {
    onExecute({
      dir,
      volume,
      sl: useSL ? Number(sl) : null,
      tp: useTP ? Number(tp) : null,
      mode,
      limitPrice: mode === "limit" ? Number(limitPrice) : null,
    });
  };

  const panel = (
    <div
      className={`relative w-full overflow-hidden border border-[#1e222d] bg-[#131722] shadow-2xl ${
        useSheet ? "max-h-[88dvh] rounded-t-2xl" : "max-w-md rounded"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#1e222d] bg-[#1e222d]/50 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-white">New Order</h2>
          <p className="text-[11px] text-[#787b86]">
            {inst.symbol} · {inst.name}
          </p>
        </div>
        <button onClick={onClose} className="text-[#787b86] hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="flex rounded-full border border-[#1e222d] bg-[#0f1115] p-0.5">
          {(["market", "limit"] as OrderMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold capitalize ${
                mode === m ? "bg-[#f83b00] text-white" : "text-[#787b86]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "limit" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#787b86]">Limit price</label>
            <input
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full rounded border border-[#1e222d] bg-[#0f1115] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00b67a]"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#787b86]">Volume (lots)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={volume}
              step={0.01}
              min={0.01}
              onChange={(e) => setVolume(Math.max(0.01, Number(e.target.value)))}
              className="flex-1 rounded border border-[#1e222d] bg-[#0f1115] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00b67a]"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setVolume((v) => Math.max(0.01, +(v - 0.01).toFixed(2)))}
                className="h-9 w-9 rounded border border-[#1e222d] bg-[#1e222d] text-[#d1d4dc]"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setVolume((v) => +(v + 0.01).toFixed(2))}
                className="h-9 w-9 rounded border border-[#1e222d] bg-[#1e222d] text-[#d1d4dc]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#787b86]">
              <input type="checkbox" checked={useSL} onChange={(e) => setUseSL(e.target.checked)} className="accent-[#00b67a]" />
              Stop Loss
            </label>
            <input
              type="text"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              disabled={!useSL}
              className="w-full rounded border border-[#1e222d] bg-[#0f1115] px-3 py-2 font-mono text-sm text-white disabled:opacity-40"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#787b86]">
              <input type="checkbox" checked={useTP} onChange={(e) => setUseTP(e.target.checked)} className="accent-[#00b67a]" />
              Take Profit
            </label>
            <input
              type="text"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              disabled={!useTP}
              className="w-full rounded border border-[#1e222d] bg-[#0f1115] px-3 py-2 font-mono text-sm text-white disabled:opacity-40"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded border border-[#1e222d] bg-[#0f1115] px-3 py-2 text-xs">
          <span className="text-[#787b86]">Required margin</span>
          <span className="font-mono font-semibold text-[#d1d4dc]">${margin.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            type="button"
            onClick={() => fire("sell")}
            className="rounded-xl bg-[#f23645] py-3.5 text-sm font-bold text-white"
          >
            Sell {mode === "limit" ? "Limit" : ""}
            <div className="font-mono text-xs font-normal opacity-80">{formatPrice(bid, inst.digits)}</div>
          </button>
          <button
            type="button"
            onClick={() => fire("buy")}
            className="rounded-xl bg-[#089981] py-3.5 text-sm font-bold text-white"
          >
            Buy {mode === "limit" ? "Limit" : ""}
            <div className="font-mono text-xs font-normal opacity-80">{formatPrice(ask, inst.digits)}</div>
          </button>
        </div>
      </div>
    </div>
  );

  if (useSheet) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        {panel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      {panel}
    </div>
  );
}
