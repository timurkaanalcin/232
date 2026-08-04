import { useEffect, useRef, useState, useCallback } from "react";
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Settings,
  Plus,
  Clock,
  Maximize2,
  Monitor,
  User,
} from "lucide-react";
import type {
  Instrument,
  Tick,
  Position,
  ClosedTrade,
  Direction,
  Timeframe,
  AccountInfo,
} from "@/types";
import { INSTRUMENTS } from "@/data/instruments";
import {
  getBidAsk,
  formatPrice,
  calcPnL,
} from "@/lib/market";
import MarketWatch from "@/components/MarketWatch";
import { TradingViewChart } from "@/components/TradingViewChart";
import OrderDialog from "@/components/OrderDialog";
import Toolbox from "@/components/Toolbox";

interface Props {
  onBack: () => void;
}

const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

export default function TradingTerminal({ onBack }: Props) {
  const [selected, setSelected] = useState<Instrument>(INSTRUMENTS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("M5");
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [showOrder, setShowOrder] = useState(false);
  const [orderDirection, setOrderDirection] = useState<Direction>("buy");
  const [toast, setToast] = useState<{ msg: string; type: "win" | "loss" | "info" } | null>(null);

  const [account, setAccount] = useState<AccountInfo>({
    type: "raw",
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
    leverage: 500,
    currency: "USD",
    name: "Demo Trader",
    number: "5001284563",
  });

  const instrumentsMap = INSTRUMENTS.reduce<Record<string, Instrument>>((acc, i) => {
    acc[i.id] = i;
    acc[i.symbol.toLowerCase()] = i;
    return acc;
  }, {});

  // Initialize all ticks
  useEffect(() => {
    const init: Record<string, Tick> = {};
    INSTRUMENTS.forEach((inst) => {
      init[inst.id] = getBidAsk(inst.basePrice, inst);
    });
    setTicks(init);
  }, []);

  // Market simulation for bid/ask ticks (trading prices)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setTicks((prev) => {
        const updated: Record<string, Tick> = {};
        INSTRUMENTS.forEach((inst) => {
          const prevTick = prev[inst.id];
          const prevPrice = prevTick ? (prevTick.bid + prevTick.ask) / 2 : inst.basePrice;
          const drift = (Math.random() - 0.5) * 2 * inst.volatility * 0.5;
          const newPrice = Math.max(prevPrice + drift, inst.basePrice * 0.3);
          updated[inst.id] = getBidAsk(newPrice, inst);
        });
        return updated;
      });
    }, 500);

    return () => clearInterval(tickInterval);
  }, []);

  const currentTick = ticks[selected.id];
  const currentPrice = currentTick ? (currentTick.bid + currentTick.ask) / 2 : selected.basePrice;

  // Calculate equity, margin, P&L
  const openPnL = positions.reduce((sum, pos) => {
    const inst = instrumentsMap[pos.symbol.toLowerCase()];
    if (!inst) return sum;
    const tick = ticks[inst.id];
    const price = tick ? (pos.type === "buy" ? tick.bid : tick.ask) : pos.openPrice;
    return sum + calcPnL(pos.type, pos.volume, pos.openPrice, price, inst);
  }, 0);

  const totalMargin = positions.reduce((sum, pos) => {
    const inst = instrumentsMap[pos.symbol.toLowerCase()];
    if (!inst) return sum;
    const tick = ticks[inst.id];
    const price = tick ? tick.ask : pos.openPrice;
    return sum + (pos.volume * inst.contractSize * price) / account.leverage;
  }, 0);

  const equity = account.balance + openPnL;
  const freeMargin = equity - totalMargin;
  const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;

  // Execute trade
  const executeTrade = useCallback(
    (dir: Direction, volume: number, sl: number | null, tp: number | null) => {
      const tick = ticks[selected.id];
      const price = tick ? (dir === "buy" ? tick.ask : tick.bid) : selected.basePrice;
      const pos: Position = {
        id: crypto.randomUUID(),
        symbol: selected.symbol,
        type: dir,
        volume,
        openPrice: price,
        openTime: Date.now(),
        sl,
        tp,
        swap: 0,
      };
      setPositions((prev) => [...prev, pos]);
      setShowOrder(false);
      setToast({ msg: `${dir === "buy" ? "Buy" : "Sell"} ${volume.toFixed(2)} ${selected.symbol} @ ${formatPrice(price, selected.digits)}`, type: "info" });
      setTimeout(() => setToast(null), 3000);
    },
    [selected, ticks]
  );

  // Close position
  const closePosition = useCallback((id: string) => {
    setPositions((prev) => {
      const pos = prev.find((p) => p.id === id);
      if (!pos) return prev;
      const inst = instrumentsMap[pos.symbol.toLowerCase()];
      const tick = ticks[inst.id];
      const closePrice = tick ? (pos.type === "buy" ? tick.bid : tick.ask) : pos.openPrice;
      const profit = calcPnL(pos.type, pos.volume, pos.openPrice, closePrice, inst);
      const closed: ClosedTrade = {
        id: pos.id,
        symbol: pos.symbol,
        type: pos.type,
        volume: pos.volume,
        openPrice: pos.openPrice,
        closePrice,
        openTime: pos.openTime,
        closeTime: Date.now(),
        profit,
        swap: 0,
      };
      setClosedTrades((ct) => [closed, ...ct]);
      setAccount((acc: AccountInfo) => ({ ...acc, balance: acc.balance + profit }));
      if (profit >= 0) {
        setToast({ msg: `Position closed: +$${profit.toFixed(2)}`, type: "win" });
      } else {
        setToast({ msg: `Position closed: $${profit.toFixed(2)}`, type: "loss" });
      }
      setTimeout(() => setToast(null), 3000);
      return prev.filter((p) => p.id !== id);
    });
  }, [ticks, instrumentsMap]);

  // Check SL/TP
  useEffect(() => {
    positions.forEach((pos) => {
      const inst = instrumentsMap[pos.symbol.toLowerCase()];
      if (!inst) return;
      const tick = ticks[inst.id];
      if (!tick) return;
      const currentBid = tick.bid;
      const currentAsk = tick.ask;

      if (pos.type === "buy") {
        if (pos.sl && currentBid <= pos.sl) {
          closePosition(pos.id);
        } else if (pos.tp && currentBid >= pos.tp) {
          closePosition(pos.id);
        }
      } else {
        if (pos.sl && currentAsk >= pos.sl) {
          closePosition(pos.id);
        } else if (pos.tp && currentAsk <= pos.tp) {
          closePosition(pos.id);
        }
      }
    });
  }, [ticks, positions, closePosition, instrumentsMap]);

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Top toolbar */}
      <header className="flex items-center justify-between border-b border-black/40 bg-[#0a0a0a] px-3 py-2">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold">BROKERZ</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/40">MT5 WebTrader</span>
          </div>
        </div>

        {/* Account info */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
              <User className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs font-medium text-white/70">{account.number}</span>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-[10px] text-white/40">Balance</span>
              <span className="ml-2 text-xs font-bold tabular-nums">${account.balance.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-[10px] text-white/40">Equity</span>
              <span className={`ml-2 text-xs font-bold tabular-nums ${equity >= account.balance ? "text-green-400" : "text-red-400"}`}>
                ${equity.toFixed(2)}
              </span>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-[10px] text-white/40">Margin</span>
              <span className="ml-2 text-xs font-bold tabular-nums text-white/70">${totalMargin.toFixed(2)}</span>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-[10px] text-white/40">Free</span>
              <span className="ml-2 text-xs font-bold tabular-nums text-white/70">${freeMargin.toFixed(2)}</span>
            </div>
            {totalMargin > 0 && (
              <div className="rounded-lg bg-white/5 px-3 py-1.5">
                <span className="text-[10px] text-white/40">Level</span>
                <span className={`ml-2 text-xs font-bold tabular-nums ${marginLevel > 200 ? "text-green-400" : marginLevel > 100 ? "text-yellow-400" : "text-red-400"}`}>
                  {marginLevel.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Market Watch */}
        <aside className="hidden w-56 shrink-0 border-r border-black/40 md:block">
          <MarketWatch
            selectedId={selected.id}
            onSelect={setSelected}
            ticks={ticks}
          />
        </aside>

        {/* Center: Chart */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Chart toolbar */}
          <div className="flex items-center justify-between border-b border-black/40 bg-[#0a0a0a] px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selected.symbol}</span>
                <span className="text-[10px] text-white/40">{selected.name}</span>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                      timeframe === tf
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "text-white/40 hover:bg-white/5 hover:text-white/60"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5">
                <Clock className="h-3 w-3 text-green-400" />
                <span className="text-[11px] text-white/50">Live</span>
              </div>
              <span className="hidden font-mono text-sm font-bold text-white/80 sm:block">
                {formatPrice(currentPrice, selected.digits)}
              </span>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="relative min-h-[400px] flex-1 overflow-hidden bg-[#0a0a0a]">
            <TradingViewChart
              symbol={selected.tvSymbol}
              theme="dark"
              interval={timeframe}
            />
            {/* One-click trade buttons overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => {
                  setOrderDirection("sell");
                  setShowOrder(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-red-500"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                Sell
                <span className="font-mono">{currentTick ? formatPrice(currentTick.bid, selected.digits) : "—"}</span>
              </button>
              <button
                onClick={() => {
                  setOrderDirection("buy");
                  setShowOrder(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-green-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-green-500"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Buy
                <span className="font-mono">{currentTick ? formatPrice(currentTick.ask, selected.digits) : "—"}</span>
              </button>
              <button
                onClick={() => {
                  setOrderDirection("buy");
                  setShowOrder(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111111]/90 px-3 py-2 text-xs font-medium text-white/70 shadow-lg backdrop-blur transition hover:bg-[#1a1a1a]"
              >
                <Plus className="h-3.5 w-3.5" />
                New Order
              </button>
            </div>
          </div>

          {/* Toolbox */}
          <div className="h-48 shrink-0 border-t border-black/40 lg:h-56">
            <Toolbox
              positions={positions}
              closedTrades={closedTrades}
              ticks={ticks}
              instruments={instrumentsMap}
              onClosePosition={closePosition}
            />
          </div>
        </main>
      </div>

      {/* Mobile Market Watch toggle */}
      <button className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg md:hidden">
        <Monitor className="h-5 w-5" />
      </button>

      {/* Order dialog */}
      {showOrder && (
        <OrderDialog
          inst={selected}
          tick={currentTick ?? null}
          onClose={() => setShowOrder(false)}
          onExecute={executeTrade}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === "win"
                ? "border-green-500/30 bg-green-500/15 text-green-300"
                : toast.type === "loss"
                  ? "border-red-500/30 bg-red-500/15 text-red-300"
                  : "border-yellow-400/30 bg-yellow-400/15 text-yellow-400"
            }`}
          >
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}


