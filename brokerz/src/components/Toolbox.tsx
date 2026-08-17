import { useState } from "react";
import { Download, X, TrendingUp, TrendingDown } from "lucide-react";
import type { Position, ClosedTrade, Instrument, Tick, Order } from "@/types";
import type { DepositRecord } from "@/lib/testAccountHistory";
import { formatPrice, calcPnL } from "@/lib/market";
import { exportTradesPdf } from "@/lib/exportPdf";

interface Props {
  positions: Position[];
  pendingOrders?: Order[];
  closedTrades: ClosedTrade[];
  deposits?: DepositRecord[];
  ticks: Record<string, Tick>;
  instruments: Record<string, Instrument>;
  onClosePosition: (id: string) => void;
  onCancelOrder?: (id: string) => void;
  accountLabel?: string;
}

type Tab = "trade" | "orders" | "history" | "deposits" | "exposure";

export default function Toolbox({
  positions,
  pendingOrders = [],
  closedTrades,
  deposits = [],
  ticks,
  instruments,
  onClosePosition,
  onCancelOrder,
  accountLabel = "UBS",
}: Props) {
  const [tab, setTab] = useState<Tab>("history");

  return (
    <div className="flex h-full flex-col bg-[#131722]">
      <div className="flex overflow-x-auto border-b border-[#1e222d]">
        {(["trade", "orders", "history", "deposits", "exposure"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition sm:px-4 ${
              tab === t
                ? "border-b-2 border-[#00b67a] text-[#00b67a]"
                : "text-[#787b86] hover:text-[#d1d4dc]"
            }`}
          >
            {t}
            {t === "trade" && positions.length > 0 && (
              <span className="ml-1.5 rounded bg-[#00b67a]/15 px-1.5 text-[10px] text-[#00b67a]">
                {positions.length}
              </span>
            )}
            {t === "orders" && pendingOrders.length > 0 && (
              <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 text-[10px] text-amber-300">
                {pendingOrders.length}
              </span>
            )}
            {t === "history" && closedTrades.length > 0 && (
              <span className="ml-1.5 rounded bg-[#787b86]/20 px-1.5 text-[10px] text-[#d1d4dc]">
                {closedTrades.length}
              </span>
            )}
            {t === "deposits" && deposits.length > 0 && (
              <span className="ml-1.5 rounded bg-[#00b67a]/15 px-1.5 text-[10px] text-[#00b67a]">
                {deposits.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "trade" && (
          <TradeTab
            positions={positions}
            ticks={ticks}
            instruments={instruments}
            onClosePosition={onClosePosition}
          />
        )}
        {tab === "orders" && (
          <OrdersTab orders={pendingOrders} onCancel={onCancelOrder} />
        )}
        {tab === "history" && (
          <HistoryTab closedTrades={closedTrades} accountLabel={accountLabel} />
        )}
        {tab === "deposits" && <DepositsTab deposits={deposits} />}
        {tab === "exposure" && (
          <ExposureTab positions={positions} ticks={ticks} instruments={instruments} />
        )}
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  onCancel,
}: {
  orders: Order[];
  onCancel?: (id: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#787b86]">
        No pending limit orders.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[11px]">
        <thead className="text-[#787b86]">
          <tr>
            <th className="px-3 py-2">Symbol</th>
            <th className="px-3 py-2">Side</th>
            <th className="px-3 py-2">Lots</th>
            <th className="px-3 py-2">Limit</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-[#1e222d]">
              <td className="px-3 py-2 font-semibold text-white">{o.symbol}</td>
              <td className="px-3 py-2 uppercase">{o.type}</td>
              <td className="px-3 py-2 font-mono">{o.volume}</td>
              <td className="px-3 py-2 font-mono">{o.price}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onCancel?.(o.id)}
                  className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/80"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#787b86]">
        No open positions. Place an order to start trading.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#1e222d] text-[10px] uppercase tracking-wider text-[#787b86]">
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
            const pnlClass = pnl >= 0 ? "text-[#089981]" : "text-[#f23645]";
            return (
              <tr key={pos.id} className="border-b border-[#1e222d]/80 hover:bg-[#1e222d]/50">
                <td className="px-2 py-1.5 font-medium text-[#d1d4dc]">{pos.symbol}</td>
                <td className="px-2 py-1.5">
                  <span className={`flex items-center gap-1 ${pos.type === "buy" ? "text-[#089981]" : "text-[#f23645]"}`}>
                    {pos.type === "buy" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {pos.type === "buy" ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{pos.volume.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{formatPrice(pos.openPrice, inst.digits)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{formatPrice(currentPrice, inst.digits)}</td>
                <td className={`px-2 py-1.5 text-right font-mono font-semibold ${pnlClass}`}>
                  {pnl >= 0 ? "+" : ""}
                  {pnl.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => onClosePosition(pos.id)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#1e222d] text-[#787b86] transition hover:bg-[#f23645]/20 hover:text-[#f23645]"
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

function formatTradeTime(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryTab({
  closedTrades,
  accountLabel,
}: {
  closedTrades: ClosedTrade[];
  accountLabel: string;
}) {
  if (closedTrades.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#787b86]">
        No trade history yet.
      </div>
    );
  }

  const net = closedTrades.reduce((s, t) => s + t.profit, 0);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between border-b border-[#1e222d] px-3 py-1.5 text-[10px] text-[#787b86]">
        <span>{closedTrades.length} closed trades</span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-semibold ${net >= 0 ? "text-[#089981]" : "text-[#f23645]"}`}>
            Net {net >= 0 ? "+" : ""}
            {net.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => exportTradesPdf(closedTrades, accountLabel)}
            className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] font-semibold text-white"
          >
            <Download className="h-3 w-3" />
            PDF
          </button>
        </div>
      </div>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#1e222d] text-[10px] uppercase tracking-wider text-[#787b86]">
            <th className="px-2 py-1.5 text-left font-medium">Closed</th>
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
            <tr key={t.id} className="border-b border-[#1e222d]/80 hover:bg-[#1e222d]/50">
              <td className="whitespace-nowrap px-2 py-1.5 text-[#787b86]">{formatTradeTime(t.closeTime)}</td>
              <td className="px-2 py-1.5 font-medium text-[#d1d4dc]">{t.symbol}</td>
              <td className={`px-2 py-1.5 ${t.type === "buy" ? "text-[#089981]" : "text-[#f23645]"}`}>
                {t.type === "buy" ? "Buy" : "Sell"}
              </td>
              <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{t.volume.toFixed(2)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{t.openPrice.toFixed(5)}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">{t.closePrice.toFixed(5)}</td>
              <td className={`px-2 py-1.5 text-right font-mono font-semibold ${t.profit >= 0 ? "text-[#089981]" : "text-[#f23645]"}`}>
                {t.profit >= 0 ? "+" : ""}
                {t.profit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DepositsTab({ deposits }: { deposits: DepositRecord[] }) {
  if (deposits.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#787b86]">
        No deposit history yet.
      </div>
    );
  }

  const total = deposits.reduce((s, d) => s + d.amount, 0);
  const sorted = [...deposits].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between border-b border-[#1e222d] px-3 py-1.5 text-[10px] text-[#787b86]">
        <span>{deposits.length} deposits</span>
        <span className="font-mono font-semibold text-[#089981]">Total +${total.toFixed(2)}</span>
      </div>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#1e222d] text-[10px] uppercase tracking-wider text-[#787b86]">
            <th className="px-2 py-1.5 text-left font-medium">Date</th>
            <th className="px-2 py-1.5 text-left font-medium">Method</th>
            <th className="px-2 py-1.5 text-left font-medium">Note</th>
            <th className="px-2 py-1.5 text-right font-medium">Amount</th>
            <th className="px-2 py-1.5 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.id} className="border-b border-[#1e222d]/80 hover:bg-[#1e222d]/50">
              <td className="whitespace-nowrap px-2 py-1.5 text-[#787b86]">{formatTradeTime(d.createdAt)}</td>
              <td className="px-2 py-1.5 text-[#d1d4dc]">{d.method}</td>
              <td className="px-2 py-1.5 text-[#787b86]">{d.note}</td>
              <td className="px-2 py-1.5 text-right font-mono font-semibold text-[#089981]">
                +${d.amount.toFixed(2)}
              </td>
              <td className="px-2 py-1.5 capitalize text-[#089981]">{d.status}</td>
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
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-[#787b86]">
        No exposure. Open positions to see your exposure summary.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-[#1e222d] text-[10px] uppercase tracking-wider text-[#787b86]">
            <th className="px-2 py-1.5 text-left font-medium">Symbol</th>
            <th className="px-2 py-1.5 text-right font-medium">Net Volume</th>
            <th className="px-2 py-1.5 text-right font-medium">P&L</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([symbol, data]) => (
            <tr key={symbol} className="border-b border-[#1e222d]/80 hover:bg-[#1e222d]/50">
              <td className="px-2 py-1.5 font-medium text-[#d1d4dc]">{symbol}</td>
              <td className="px-2 py-1.5 text-right font-mono text-[#d1d4dc]/80">
                {data.netVolume > 0 ? "+" : ""}
                {data.netVolume.toFixed(2)}
              </td>
              <td className={`px-2 py-1.5 text-right font-mono font-semibold ${data.pnl >= 0 ? "text-[#089981]" : "text-[#f23645]"}`}>
                {data.pnl >= 0 ? "+" : ""}
                {data.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
