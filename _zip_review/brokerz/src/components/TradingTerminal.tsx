import { useEffect, useState, useCallback } from "react";
import {
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
  Order,
} from "@/types";
import { INSTRUMENTS } from "@/data/instruments";
import {
  getBidAsk,
  formatPrice,
  calcPnL,
} from "@/lib/market";
import MarketWatch from "@/components/MarketWatch";
import { TradingViewChart } from "@/components/TradingViewChart";
import OrderDialog, { type OrderPayload } from "@/components/OrderDialog";
import Toolbox from "@/components/Toolbox";
import {
  TEST_ACCOUNT_EMAIL,
  type CustomerSession,
  updateCustomerBalance,
} from "@/lib/customerAuth";
import {
  appendTestClosedTrade,
  loadTestAccountHistory,
  type DepositRecord,
} from "@/lib/testAccountHistory";
import DepositPanel from "@/components/DepositPanel";
import NotificationBell from "@/components/NotificationBell";
import { showLocalPush } from "@/lib/push";

interface Props {
  onBack: () => void;
  onLogout?: () => void;
  session?: CustomerSession | null;
  /** Mobile-first layout inside customer app shell */
  compact?: boolean;
  onOpenKyc?: () => void;
  onBalanceChange?: () => void;
}

const TIMEFRAMES: Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

export default function TradingTerminal({
  onBack,
  onLogout,
  session,
  compact,
  onOpenKyc,
  onBalanceChange,
}: Props) {
  const isTestAccount = (session?.email || "").toLowerCase() === TEST_ACCOUNT_EMAIL;
  const seeded = isTestAccount ? loadTestAccountHistory() : null;

  const [selected, setSelected] = useState<Instrument>(INSTRUMENTS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("H1");
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => seeded?.closedTrades ?? []);
  const [deposits] = useState<DepositRecord[]>(() => seeded?.deposits ?? []);
  const [showOrder, setShowOrder] = useState(false);
  const [orderDirection, setOrderDirection] = useState<Direction>("buy");
  const [showWatch, setShowWatch] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "win" | "loss" | "info" } | null>(null);

  const initialBal = seeded?.balance ?? session?.balance ?? 10000;
  const [account, setAccount] = useState<AccountInfo>({
    type: "raw",
    balance: initialBal,
    equity: initialBal,
    margin: 0,
    freeMargin: initialBal,
    marginLevel: 0,
    leverage: 500,
    currency: "USD",
    name: session?.name || "Customer",
    number: session?.accountNumber || "5001284563",
  });

  useEffect(() => {
    if (!session) return;
    if (isTestAccount) {
      const history = loadTestAccountHistory();
      setClosedTrades(history.closedTrades);
      setAccount((a) => ({
        ...a,
        balance: history.balance,
        equity: history.balance,
        freeMargin: history.balance - a.margin,
        name: session.name || a.name,
        number: session.accountNumber || a.number,
      }));
      updateCustomerBalance(session.id, history.balance);
      return;
    }
    const bal = Number(session.balance ?? 0);
    setAccount((a) => ({
      ...a,
      balance: bal,
      equity: bal,
      freeMargin: bal - a.margin,
      name: session.name || a.name,
      number: session.accountNumber || a.number,
    }));
  }, [session, isTestAccount]);

  const instrumentsMap = INSTRUMENTS.reduce<Record<string, Instrument>>((acc, i) => {
    acc[i.id] = i;
    acc[i.symbol.toLowerCase()] = i;
    return acc;
  }, {});

  useEffect(() => {
    const init: Record<string, Tick> = {};
    INSTRUMENTS.forEach((inst) => {
      init[inst.id] = getBidAsk(inst.basePrice, inst);
    });
    setTicks(init);
  }, []);

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

  const showToast = (msg: string, type: "win" | "loss" | "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const totalPnL = positions.reduce((sum, pos) => {
    const inst = instrumentsMap[pos.symbol.toLowerCase()] ?? instrumentsMap[pos.symbol] ?? selected;
    const tick = ticks[inst.id];
    if (!tick) return sum;
    const price = pos.type === "buy" ? tick.bid : tick.ask;
    return sum + calcPnL(pos.type, pos.volume, pos.openPrice, price, inst);
  }, 0);

  const totalMargin = positions.reduce((sum, pos) => sum + (pos.margin || 0), 0);
  const equity = account.balance + totalPnL;
  const freeMargin = equity - totalMargin;
  const marginLevel = totalMargin > 0 ? (equity / totalMargin) * 100 : 0;

  useEffect(() => {
    setAccount((a) => ({ ...a, equity, margin: totalMargin, freeMargin, marginLevel }));
  }, [equity, totalMargin, freeMargin, marginLevel]);

  const executeTrade = useCallback(
    (payload: OrderPayload) => {
      const { dir, volume, sl, tp, mode, limitPrice } = payload;
      const tick = ticks[selected.id];
      if (!tick) return;

      if (mode === "limit" && limitPrice && Number.isFinite(limitPrice)) {
        const order: Order = {
          id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol: selected.symbol,
          type: dir,
          volume,
          price: limitPrice,
          openTime: Date.now(),
          status: "pending",
          sl,
          tp,
          mode: "limit",
        };
        setPendingOrders((o) => [order, ...o]);
        setShowOrder(false);
        showToast(`Limit ${dir.toUpperCase()} ${volume} ${selected.symbol} @ ${limitPrice}`, "info");
        return;
      }

      const openPrice = dir === "buy" ? tick.ask : tick.bid;
      const margin = (volume * selected.contractSize * openPrice) / account.leverage;
      const pos: Position = {
        id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        symbol: selected.symbol,
        type: dir,
        volume,
        openPrice,
        openTime: Date.now(),
        sl,
        tp,
        margin,
        swap: 0,
        commission: account.type === "raw" ? volume * 3 : 0,
      };
      setPositions((p) => [...p, pos]);
      setShowOrder(false);
      showToast(`${dir.toUpperCase()} ${volume.toFixed(2)} ${selected.symbol} @ ${formatPrice(openPrice, selected.digits)}`, "info");
    },
    [ticks, selected, account.leverage, account.type]
  );

  const closePosition = useCallback(
    (id: string) => {
      setPositions((prev) => {
        const pos = prev.find((p) => p.id === id);
        if (!pos) return prev;
        const inst = instrumentsMap[pos.symbol.toLowerCase()];
        if (!inst) return prev;
        const tick = ticks[inst.id];
        if (!tick) return prev;
        const closePrice = pos.type === "buy" ? tick.bid : tick.ask;
        const profit = calcPnL(pos.type, pos.volume, pos.openPrice, closePrice, inst);
        const closed: ClosedTrade = {
          id: `cls_${Date.now()}`,
          symbol: pos.symbol,
          type: pos.type,
          volume: pos.volume,
          openPrice: pos.openPrice,
          closePrice,
          openTime: pos.openTime,
          closeTime: Date.now(),
          profit,
          swap: pos.swap,
          commission: pos.commission,
        };
        setClosedTrades((c) => [closed, ...c]);
        setAccount((a) => {
          const nextBal = Math.round((a.balance + profit) * 100) / 100;
          if (session?.id) updateCustomerBalance(session.id, nextBal);
          if ((session?.email || "").toLowerCase() === TEST_ACCOUNT_EMAIL) {
            appendTestClosedTrade(closed, nextBal);
          }
          return { ...a, balance: nextBal };
        });
        showToast(
          `Closed ${pos.symbol} ${profit >= 0 ? "+" : ""}${profit.toFixed(2)}`,
          profit >= 0 ? "win" : "loss"
        );
        return prev.filter((p) => p.id !== id);
      });
    },
    [ticks, instrumentsMap, session]
  );

  useEffect(() => {
    if (positions.length === 0) return;
    positions.forEach((pos) => {
      const inst = instrumentsMap[pos.symbol.toLowerCase()];
      if (!inst) return;
      const tick = ticks[inst.id];
      if (!tick) return;
      if (pos.type === "buy") {
        const currentBid = tick.bid;
        if (pos.sl && currentBid <= pos.sl) closePosition(pos.id);
        else if (pos.tp && currentBid >= pos.tp) closePosition(pos.id);
      } else {
        const currentAsk = tick.ask;
        if (pos.sl && currentAsk >= pos.sl) closePosition(pos.id);
        else if (pos.tp && currentAsk <= pos.tp) closePosition(pos.id);
      }
    });
  }, [ticks, positions, closePosition, instrumentsMap]);

  useEffect(() => {
    if (pendingOrders.length === 0) return;
    setPendingOrders((orders) => {
      const remain: Order[] = [];
      orders.forEach((ord) => {
        const inst = instrumentsMap[ord.symbol.toLowerCase()];
        if (!inst) {
          remain.push(ord);
          return;
        }
        const tick = ticks[inst.id];
        if (!tick) {
          remain.push(ord);
          return;
        }
        const hit =
          ord.type === "buy"
            ? tick.ask <= ord.price
            : tick.bid >= ord.price;
        if (!hit) {
          remain.push(ord);
          return;
        }
        const openPrice = ord.price;
        const margin = (ord.volume * inst.contractSize * openPrice) / account.leverage;
        const pos: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          symbol: ord.symbol,
          type: ord.type,
          volume: ord.volume,
          openPrice,
          openTime: Date.now(),
          sl: ord.sl,
          tp: ord.tp,
          margin,
          swap: 0,
          commission: 0,
        };
        setPositions((p) => [...p, pos]);
        showToast(`Limit filled ${ord.symbol} @ ${ord.price}`, "info");
        showLocalPush("Limit emir gerçekleşti", `${ord.symbol} ${ord.type} ${ord.volume}`);
      });
      return remain;
    });
  }, [ticks, pendingOrders.length, instrumentsMap, account.leverage]);

  return (
    <div className={`flex flex-col bg-[#140106] font-sans text-[#fff6ed] ${compact ? "h-full min-h-0" : "h-[100dvh]"}`}>
      {session && (
        <DepositPanel
          customerId={session.id}
          onBalanceChange={(bal) => {
            setAccount((a) => ({ ...a, balance: bal, equity: bal, freeMargin: bal - a.margin }));
            onBalanceChange?.();
          }}
        />
      )}
      <header className="flex shrink-0 items-center justify-between border-b border-[#ffb2c7]/15 bg-[#1a040a] px-2 py-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#ffb2c7]/70 transition hover:bg-white/10 hover:text-white"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="flex h-8 items-center rounded-sm bg-white px-1.5 sm:h-9 sm:px-2">
              <img src="/ubs-logo.png" alt="UBS" className="h-6 w-auto bg-transparent object-contain sm:h-7" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12px] font-bold tracking-wide text-[#fff6ed] sm:text-[13px]">UBS WebTrader</div>
              <div className="hidden text-[10px] font-medium text-[#ffb2c7]/60 sm:block">TradingView desk</div>
            </div>
            <span className="hidden rounded-full bg-[#f83b00] px-2 py-0.5 text-[10px] font-semibold text-white xs:inline sm:ml-1">
              LIVE
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {session && <NotificationBell customerId={session.id} tone="dark" />}
          <div className="flex items-center gap-1 md:hidden">
            <Stat label="Bal" value={`$${account.balance.toFixed(0)}`} />
          </div>
          <div className="hidden items-center gap-1.5 md:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-[#ffb2c7]/15 bg-white/[0.04] px-2.5 py-1">
              <User className="h-3 w-3 text-[#f83b00]" />
              <span className="text-[11px] font-medium text-[#fff6ed]">
                {session?.email || account.name}
              </span>
              <span className="text-[10px] text-[#ffb2c7]/55">Customer</span>
            </div>
            <Stat label="Balance" value={`$${account.balance.toFixed(2)}`} />
            <Stat
              label="Equity"
              value={`$${equity.toFixed(2)}`}
              tone={equity >= account.balance ? "up" : "down"}
            />
            <Stat label="Margin" value={`$${totalMargin.toFixed(2)}`} />
            <Stat label="Free" value={`$${freeMargin.toFixed(2)}`} />
            {totalMargin > 0 && (
              <Stat
                label="Level"
                value={`${marginLevel.toFixed(1)}%`}
                tone={marginLevel > 200 ? "up" : marginLevel > 100 ? "warn" : "down"}
              />
            )}
          </div>
          {onOpenKyc && (
            <button
              type="button"
              onClick={onOpenKyc}
              className="rounded-full px-2 py-1.5 text-[10px] font-semibold text-[#ffb2c7]/80 hover:bg-white/10 sm:text-[11px]"
            >
              KYC
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="hidden rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-[#ffb2c7]/80 transition hover:bg-[#f83b00] hover:text-white sm:inline"
            >
              Log out
            </button>
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#ffb2c7]/70 hover:bg-white/10 hover:text-white">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-[260px] shrink-0 border-r border-[#1e222d] md:block">
          <MarketWatch selectedId={selected.id} onSelect={setSelected} ticks={ticks} />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-[#ffb2c7]/15 bg-[#1a040a] px-2 py-1.5 sm:px-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm font-bold text-[#fff6ed]">{selected.symbol}</span>
                <span className="hidden truncate text-[10px] text-[#ffb2c7]/55 sm:inline">{selected.name}</span>
              </div>
              <div className="flex max-w-[52vw] items-center gap-0.5 overflow-x-auto rounded-full border border-[#ffb2c7]/15 bg-[#140106] p-0.5 sm:max-w-none">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold transition sm:px-2.5 sm:text-[11px] ${
                      timeframe === tf
                        ? "bg-[#f83b00] text-white"
                        : "text-[#ffb2c7]/55 hover:bg-white/5 hover:text-[#fff6ed]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-full border border-[#ffb2c7]/15 bg-[#140106] px-2 py-1 sm:flex">
                <Clock className="h-3 w-3 text-[#f83b00]" />
                <span className="text-[11px] text-[#ffb2c7]/55">Connected</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#fff6ed] sm:text-sm">
                {formatPrice(currentPrice, selected.digits)}
              </span>
              <button className="hidden h-7 w-7 items-center justify-center rounded-full text-[#ffb2c7]/55 hover:bg-white/10 sm:flex">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className={`relative min-h-0 flex-1 overflow-hidden bg-[#22060e] ${compact ? "min-h-[220px]" : "min-h-[280px] sm:min-h-[400px]"}`}>
            <TradingViewChart symbol={selected.tvSymbol} theme="dark" interval={timeframe} />
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 sm:bottom-3 sm:left-3 sm:right-auto">
              <button
                onClick={() => {
                  setOrderDirection("sell");
                  setShowOrder(true);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#e11d48] px-3 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 sm:flex-none sm:px-4 sm:py-2"
              >
                <TrendingDown className="h-3.5 w-3.5" />
                Sell
                <span className="font-mono opacity-90">
                  {currentTick ? formatPrice(currentTick.bid, selected.digits) : "—"}
                </span>
              </button>
              <button
                onClick={() => {
                  setOrderDirection("buy");
                  setShowOrder(true);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#16a34a] px-3 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 sm:flex-none sm:px-4 sm:py-2"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Buy
                <span className="font-mono opacity-90">
                  {currentTick ? formatPrice(currentTick.ask, selected.digits) : "—"}
                </span>
              </button>
              <button
                onClick={() => {
                  setOrderDirection(orderDirection);
                  setShowOrder(true);
                }}
                className="hidden items-center gap-1.5 rounded-full border border-[#ffb2c7]/20 bg-[#1a040a]/95 px-3 py-2 text-xs font-medium text-[#fff6ed] shadow-lg backdrop-blur transition hover:bg-[#22060e] sm:flex"
              >
                <Plus className="h-3.5 w-3.5 text-[#f83b00]" />
                New Order
              </button>
            </div>
          </div>

          <div className={`shrink-0 border-t border-[#1e222d] ${compact ? "h-40" : "h-44 sm:h-48 lg:h-56"}`}>
            <Toolbox
              positions={positions}
              pendingOrders={pendingOrders}
              closedTrades={closedTrades}
              deposits={deposits}
              ticks={ticks}
              instruments={instrumentsMap}
              onClosePosition={closePosition}
              onCancelOrder={(id) => setPendingOrders((o) => o.filter((x) => x.id !== id))}
              accountLabel={session?.email || account.number}
            />
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setShowWatch(true)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#f83b00] text-white shadow-lg md:hidden"
        aria-label="Market watch"
      >
        <Monitor className="h-5 w-5" />
      </button>

      {showWatch && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setShowWatch(false)} aria-label="Close" />
          <div className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-hidden rounded-t-2xl border-t border-[#ffb2c7]/20 bg-[#1a040a]">
            <div className="flex items-center justify-between border-b border-[#ffb2c7]/15 px-4 py-3">
              <span className="text-sm font-bold">Semboller</span>
              <button type="button" onClick={() => setShowWatch(false)} className="text-[12px] text-[#ffb2c7]/70">
                Kapat
              </button>
            </div>
            <div className="h-[60dvh] overflow-y-auto">
              <MarketWatch
                selectedId={selected.id}
                onSelect={(inst) => {
                  setSelected(inst);
                  setShowWatch(false);
                }}
                ticks={ticks}
              />
            </div>
          </div>
        </div>
      )}

      {showOrder && (
        <OrderDialog
          inst={selected}
          tick={currentTick ?? null}
          initialDir={orderDirection}
          onClose={() => setShowOrder(false)}
          onExecute={executeTrade}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`flex items-center gap-2 rounded-full border px-5 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === "win"
                ? "border-[#16a34a]/40 bg-[#16a34a]/15 text-[#4ade80]"
                : toast.type === "loss"
                  ? "border-[#e11d48]/40 bg-[#e11d48]/15 text-[#fb7185]"
                  : "border-[#f83b00]/40 bg-[#f83b00]/15 text-[#f83b00]"
            }`}
          >
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "warn";
}) {
  const toneClass =
    tone === "up"
      ? "text-[#4ade80]"
      : tone === "down"
        ? "text-[#fb7185]"
        : tone === "warn"
          ? "text-[#fbbf24]"
          : "text-[#fff6ed]";
  return (
    <div className="rounded-full border border-[#ffb2c7]/15 bg-[#140106] px-2.5 py-1">
      <span className="text-[10px] text-[#ffb2c7]/55">{label}</span>
      <span className={`ml-2 text-[11px] font-bold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}
