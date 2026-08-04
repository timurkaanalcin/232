import { useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import type { Position, ClosedTrade, Instrument, Tick } from "@/types";
import { formatPrice, calcPnL } from "@/lib/market";

interface Props {
  positions: Position[];
  closedTrades: ClosedTrade[];
  ticks: Record<string, Tick>;
  instruments: Record<string, Instrument>;
  onClosePosition: (id: string) => void;
}

type Tab = "trade" | "history" | "exposure";

export default function Toolbox({
  positions,
  closedTrades,
  ticks,
  instruments,
  onClosePosition,
}: Props) {
  const [tab, setTab] = useState<Tab>("trade");

  return (
    <div className="flex h-full flex-col bg-[#111111]">
      {/* Tabs */}
      <div className="flex border-b border-black/30">
        {(["trade", "history", "exposure"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              tab === t
                ? "border-b-2 border-yellow-400 text-yellow-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === "trade" && (
          <TradeTab
            positions={positions}
            ticks={ticks}
            instruments={instruments}
            onClosePosition={onClosePosition}
          />
        )}
        {tab === "history" && <HistoryTab closedTrades={closedTrades} />}
        {tab === "exposure" && (
          <ExposureTab positions={positions} ticks={ticks} instruments={instruments} />
        )}
      </div>
    </div>
  );
}

function TradeTab({
  positions,
  ticks,
  instruments,
  onClosePosition,
}: {
  positions: Position[];
  ticks: Record<string, Tick>;
  instruments: Record<string, Instrument>;
  onClosePosition: (id: string) => void;
}) {
  if (positions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-white/30">
        No open positions. Place an order to start trading.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-black/30 text-[10px] uppercase tracking-wider text-white/30">
            <th className="px-2 py-1.5 text-left font-medium">Symbol</th>
            <th className="px-2 py-1.5 text-left font-medium">Type</th>
            <th className="px-2 py-1.5 text-right font-medium">Volume</th>
            <th className="px-2 py-1.5 text-right font-medium">Open Price</th>
            <th className="px-2 py-1.5 text-right font-medium">Current</th>
            <th className="px-2 py-1.5 text-right font-medium">Profit</th>
            <th className="px-2 py-1.5 text-center font-medium">Close</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const inst = instruments[pos.symbol.toLowerCase()] ?? instruments[Object.keys(instruments)[0]];
            const tick = ticks[inst.id];
            const currentPrice = tick ? (pos.type === "buy" ? tick.bid : tick.ask) : pos.openPrice;
            const pnl = calcPnL(pos.type, pos.volume, pos.openPrice, currentPrice, inst);
            const pnlClass = pnl >= 0 ? "text-green-400" : "text-red-400";
            return (
              <tr key={pos.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-2 py-1.5 font-medium text-white/90">{pos.symbol}</td>
                <td className="px-2 py-1.5">
                  <span className={`flex items-center gap-1 ${pos.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                    {pos.type === "buy" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {pos.type === "buy" ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-white/70">{pos.volume.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-white/70">{formatPrice(pos.openPrice, inst.digits)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-white/70">{formatPrice(currentPrice, inst.digits)}</td>
                <td className={`px-2 py-1.5 text-right font-mono font-semibold ${pnlClass}`}>
                  {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => onClosePosition(pos.id)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/5 text-white/40 transition hover:bg-red-500/20 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTab({ closedTrades }: { closedTrades: ClosedTrade[] }) {
  if (closedTrades.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-white/30">
        No trade history yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-black/30 text-[10px] uppercase tracking-wider text-white/30">
            <th className="px-2 py-1.5 text-left font-medium">Time</th>
            <th className="px-2 py-1.5 text-left font-medium">Symbol</th>
            <th className="px-2 py-1.5 text-left font-medium">Type</th>
            <th className="px-2 py-1.5 text-right font-medium">Volume</th>
            <th className="px-2 py-1.5 text-right font-medium">Open</th>
            <th className="px-2 py-1.5 text-right font-medium">Close</th>
            <th className="px-2 py-1.5 text-right font-medium">Profit</th>
          </tr>
        </thead>
        <tbody>
          {closedTrades.map((t) => (
            <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-2 py-1.5 text-white/50">
                {new Date(t.closeTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="px-2 py-1.5 font-medium text-white/90">{t.symbol}</td>
              <td className={`px-2 py-1.5 ${t.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                {t.type === "buy" ? "Buy" : "Sell"}
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-white/70">{t.volume.toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-white/70">{t.openPrice.toFixed(5)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-white/70">{t.closePrice.toFixed(5)}</td>
              <td className={`px-2 py-1.5 text-right font-mono font-semibold ${t.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {t.profit >= 0 ? "+" : ""}{t.profit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExposureTab({
  positions,
  ticks,
  instruments,
}: {
  positions: Position[];
  ticks: Record<string, Tick>;
  instruments: Record<string, Instrument>;
}) {
  const bySymbol = positions.reduce<Record<string, { netVolume: number; pnl: number }>>((acc, pos) => {
    const inst = instruments[pos.symbol.toLowerCase()] ?? instruments[Object.keys(instruments)[0]];
    const tick = ticks[inst.id];
    const currentPrice = tick ? (pos.type === "buy" ? tick.bid : tick.ask) : pos.openPrice;
    const pnl = calcPnL(pos.type, pos.volume, pos.openPrice, currentPrice, inst);
    const vol = pos.type === "buy" ? pos.volume : -pos.volume;
    if (!acc[pos.symbol]) acc[pos.symbol] = { netVolume: 0, pnl: 0 };
    acc[pos.symbol].netVolume += vol;
    acc[pos.symbol].pnl += pnl;
    return acc;
  }, {});

  const entries = Object.entries(bySymbol);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-white/30">
        No exposure. Open positions to see your exposure summary.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-black/30 text-[10px] uppercase tracking-wider text-white/30">
            <th className="px-2 py-1.5 text-left font-medium">Symbol</th>
            <th className="px-2 py-1.5 text-right font-medium">Net Volume</th>
            <th className="px-2 py-1.5 text-right font-medium">P&L</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([symbol, data]) => (
            <tr key={symbol} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-2 py-1.5 font-medium text-white/90">{symbol}</td>
              <td className="px-2 py-1.5 text-right font-mono text-white/70">
                {data.netVolume > 0 ? "+" : ""}{data.netVolume.toFixed(2)}
              </td>
              <td className={`px-2 py-1.5 text-right font-mono font-semibold ${data.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
