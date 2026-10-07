import PageHeader from "@/components/PageHeader";
import { Users, TrendingUp, Shield, Check, ArrowRight, Star, DollarSign, Zap, Eye } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const STRATEGIES = [
  { name: "TrendMaster Pro", trader: "Alex K.", return: "+34.2%", winRate: "72%", followers: 1284, risk: "Medium", minCapital: "$500" },
  { name: "ScalpKing FX", trader: "Maria S.", return: "+28.5%", winRate: "68%", followers: 892, risk: "High", minCapital: "$1000" },
  { name: "GoldRush EA", trader: "James L.", return: "+22.1%", winRate: "75%", followers: 2103, risk: "Low", minCapital: "$200" },
  { name: "CryptoSurfer", trader: "Yuki T.", return: "+45.8%", winRate: "64%", followers: 567, risk: "High", minCapital: "$500" },
  { name: "SafeHarbor", trader: "Emma R.", return: "+15.3%", winRate: "81%", followers: 3421, risk: "Low", minCapital: "$100" },
  { name: "IndexHunter", trader: "David M.", return: "+31.7%", winRate: "69%", followers: 756, risk: "Medium", minCapital: "$300" },
];

export default function CopyTradingPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Copy Trading"
        subtitle="Automatically copy the trades of top-performing strategy providers. No management fees, full control over your capital."
        breadcrumb="Home / Copy Trading"
      />

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">How Copy Trading Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Step step="1" title="Choose a Strategy" desc="Browse our ranked list of strategy providers. Compare returns, win rates, risk levels, and follower counts." icon={Eye} />
            <Step step="2" title="Set Your Allocation" desc="Decide how much of your capital to allocate to each strategy. Set maximum risk and stop-loss levels." icon={DollarSign} />
            <Step step="3" title="Auto-Copy Trades" desc="Every trade the strategy provider opens is automatically copied to your account in real time. You can pause or stop at any time." icon={Zap} />
          </div>
        </div>
      </section>

      {/* Top Strategies */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Top Strategy Providers</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="px-4 py-3 text-left font-medium">Strategy</th>
                  <th className="px-4 py-3 text-left font-medium">Trader</th>
                  <th className="px-4 py-3 text-right font-medium">Return (30d)</th>
                  <th className="px-4 py-3 text-right font-medium">Win Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Followers</th>
                  <th className="px-4 py-3 text-center font-medium">Risk</th>
                  <th className="px-4 py-3 text-right font-medium">Min Capital</th>
                  <th className="px-4 py-3 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {STRATEGIES.map((s) => (
                  <tr key={s.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white/90">{s.name}</td>
                    <td className="px-4 py-3 text-white/60">{s.trader}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-green-400">{s.return}</td>
                    <td className="px-4 py-3 text-right text-white/50">{s.winRate}</td>
                    <td className="px-4 py-3 text-right text-white/50">{s.followers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.risk === "Low" ? "bg-green-500/10 text-green-400" :
                        s.risk === "Medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                      }`}>{s.risk}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-white/50">{s.minCapital}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={onLaunchTerminal}
                        className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-yellow-300"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">Why Copy Trade with BROKERZ?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature icon={Users} title="623,867+ Traders" desc="Join a global community of traders" />
            <Feature icon={Shield} title="Full Control" desc="Pause, stop, or adjust your allocation at any time" />
            <Feature icon={DollarSign} title="No Management Fees" desc="Keep 100% of your profits — no hidden charges" />
            <Feature icon={Star} title="Verified Performance" desc="All strategy performance is verified and transparent" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.01] py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Start copying top traders today</h2>
          <p className="mt-3 text-white/40">Join thousands of investors who grow their capital with copy trading.</p>
          <button
            onClick={onLaunchTerminal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
          >
            Start Copy Trading <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

function Step({ step, title, desc, icon: Icon }: { step: string; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-8">
      <div className="absolute right-6 top-6 text-5xl font-bold text-white/5">{step}</div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/40">{desc}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-yellow-500/20 hover:bg-yellow-500/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/40">{desc}</p>
    </div>
  );
}
