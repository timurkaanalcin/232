import PageHeader from "@/components/PageHeader";
import { INSTRUMENTS, CATEGORY_META } from "@/data/instruments";
import {
  ArrowLeftRight, Coins, Bitcoin, BarChart3, Building2, Landmark,
  TrendingUp, Check, ArrowRight,
} from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowLeftRight, Coins, Bitcoin, BarChart3, Building2, Landmark,
};

const CATEGORY_IMAGES: Record<string, string> = {
  forex: "https://images.pexels.com/photos/5833756/pexels-photo-5833756.jpeg?auto=compress&cs=tinysrgb&w=800",
  commodities: "https://images.pexels.com/photos/8442330/pexels-photo-8442330.jpeg?auto=compress&cs=tinysrgb&w=800",
  crypto: "https://images.pexels.com/photos/7267491/pexels-photo-7267491.jpeg?auto=compress&cs=tinysrgb&w=800",
  indices: "https://images.pexels.com/photos/16594725/pexels-photo-16594725.jpeg?auto=compress&cs=tinysrgb&w=800",
  stocks: "https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=800",
  bonds: "https://images.pexels.com/photos/7433839/pexels-photo-7433839.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export default function InstrumentsPage({ onLaunchTerminal }: Props) {
  const categories = Object.keys(CATEGORY_META);

  return (
    <div>
      <PageHeader
        title="Trading Instruments"
        subtitle="Trade 600+ instruments across Forex, Commodities, Cryptocurrencies, Stock Indices, Stocks, ETFs, Bonds, Futures and Options — all from a single account."
        breadcrumb="Home / Trading Instruments"
      />

      {/* Category sections */}
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = ICONS[meta.icon] ?? BarChart3;
        const instruments = INSTRUMENTS.filter((i) => i.category === cat);

        return (
          <section key={cat} className="border-b border-white/5 py-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-6">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Category info */}
                <div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <img src={CATEGORY_IMAGES[cat]} alt={meta.label} className="h-48 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{meta.label}</h2>
                  <p className="mt-2 text-sm text-white/40">{meta.desc}</p>
                </div>

                {/* Instrument table */}
                <div className="lg:col-span-2">
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                          <th className="px-4 py-3 text-left font-medium">Symbol</th>
                          <th className="px-4 py-3 text-left font-medium">Name</th>
                          <th className="px-4 py-3 text-right font-medium">Spread</th>
                          <th className="px-4 py-3 text-right font-medium">Min Volume</th>
                          <th className="px-4 py-3 text-right font-medium">Digits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instruments.map((inst) => (
                          <tr key={inst.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 font-mono font-semibold text-yellow-400">{inst.symbol}</td>
                            <td className="px-4 py-3 text-white/70">{inst.name}</td>
                            <td className="px-4 py-3 text-right text-white/60">{inst.spread}</td>
                            <td className="px-4 py-3 text-right text-white/60">0.01</td>
                            <td className="px-4 py-3 text-right text-white/60">{inst.digits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Start trading 600+ instruments</h2>
          <p className="mt-3 text-white/40">Open your account in minutes and access global markets.</p>
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
