import PageHeader from "@/components/PageHeader";
import { INSTRUMENTS } from "@/data/instruments";
import { Zap, Clock, Shield, TrendingUp, ArrowRight, Check } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

export default function ConditionsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Trading Conditions"
        subtitle="Institutional-grade trading conditions — ultra-tight spreads, lightning-fast execution, and transparent pricing across all instruments."
        breadcrumb="Home / Trading Conditions"
      />

      {/* Spreads */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Spreads</h2>
          </div>
          <p className="mb-6 text-white/40">Our RAW account offers spreads from 0.0 pips with deep liquidity from top-tier providers.</p>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="px-4 py-3 text-left font-medium">Symbol</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-right font-medium">Classic Spread</th>
                  <th className="px-4 py-3 text-right font-medium">RAW Spread</th>
                  <th className="px-4 py-3 text-right font-medium">Min Volume</th>
                  <th className="px-4 py-3 text-right font-medium">Max Volume</th>
                </tr>
              </thead>
              <tbody>
                {INSTRUMENTS.slice(0, 16).map((inst) => (
                  <tr key={inst.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono font-semibold text-yellow-400">{inst.symbol}</td>
                    <td className="px-4 py-3 text-white/70">{inst.name}</td>
                    <td className="px-4 py-3 text-right text-white/50">{inst.spread + 5} pts</td>
                    <td className="px-4 py-3 text-right text-white/50">{inst.spread} pts</td>
                    <td className="px-4 py-3 text-right text-white/50">0.01</td>
                    <td className="px-4 py-3 text-right text-white/50">100 lots</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Execution */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Execution Quality</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Stat value="0.15 sec" label="Average execution speed" />
            <Stat value="99.99%" label="No rejections" />
            <Stat value="0" label="Re-quotes, ever" />
            <Stat value="STP" label="Straight-through processing" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Feature text="Market execution with no dealing desk intervention" />
            <Feature text="Aggregated liquidity from top-tier providers" />
            <Feature text="No negative balance protection on all accounts" />
          </div>
        </div>
      </section>

      {/* Margin & Leverage */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Margin & Leverage</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="px-4 py-3 text-left font-medium">Account Type</th>
                  <th className="px-4 py-3 text-right font-medium">Max Leverage</th>
                  <th className="px-4 py-3 text-right font-medium">Margin Call</th>
                  <th className="px-4 py-3 text-right font-medium">Stop Out</th>
                  <th className="px-4 py-3 text-right font-medium">Hedging</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Classic", "1:1000", "100%", "50%", "Allowed"],
                  ["RAW", "1:1000", "100%", "50%", "Allowed"],
                  ["TradingView RAW", "1:1000", "100%", "50%", "Allowed"],
                  ["Islamic (Swap-Free)", "1:500", "100%", "50%", "Allowed"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white/80">{row[0]}</td>
                    {row.slice(1).map((v, i) => (
                      <td key={i} className="px-4 py-3 text-right text-white/50">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trading Hours */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Trading Hours</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Forex", hours: "24/5 (Mon 00:05 — Fri 23:55)", note: "Server time GMT+2/GMT+3" },
              { name: "Commodities (Metals)", hours: "Mon–Fri 01:00–23:59", note: "Daily break 23:59–01:00" },
              { name: "Commodities (Energies)", hours: "Mon–Fri 03:00–23:00", note: "Varies by instrument" },
              { name: "Cryptocurrencies", hours: "24/7", note: "No weekend break" },
              { name: "Stock Indices", hours: "Varies by exchange", note: "See instrument specs" },
              { name: "Stocks & ETFs", hours: "Exchange hours only", note: "NYSE, NASDAQ, LSE, etc." },
            ].map((h) => (
              <div key={h.name} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                <h3 className="font-bold text-yellow-400">{h.name}</h3>
                <div className="mt-2 text-sm text-white/50">{h.hours}</div>
                <div className="mt-1 text-xs text-white/30">{h.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Experience our trading conditions</h2>
          <button
            onClick={onLaunchTerminal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
          >
            Launch WebTrader <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="text-3xl font-bold text-yellow-400">{value}</div>
      <div className="mt-1 text-sm text-white/40">{label}</div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
      <Check className="h-4 w-4 text-yellow-400" /> {text}
    </div>
  );
}
