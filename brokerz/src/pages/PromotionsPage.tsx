import PageHeader from "@/components/PageHeader";
import { Trophy, DollarSign, Calendar, TrendingUp, ArrowRight, Gift, Target, Users } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const PROMOS = [
  {
    name: "BROKERZ Trading Cup 2026",
    desc: "Compete against top traders for a share of the $30,000 prize pool. Trade across all instruments and climb the leaderboard.",
    prize: "$30,000",
    period: "Jan — Dec 2026",
    status: "Active",
    icon: Trophy,
    highlight: true,
  },
  {
    name: "Trader of the Month",
    desc: "Monthly forex trading contest that rewards the best-performing trader with a $1,000 cash prize.",
    prize: "$1,000",
    period: "Monthly",
    status: "Active",
    icon: Target,
  },
  {
    name: "NFP Machine",
    desc: "Predict the price of a given instrument on the NFP report release day for your chance to win up to $500 in cash prizes.",
    prize: "Up to $500",
    period: "Monthly",
    status: "Active",
    icon: TrendingUp,
  },
  {
    name: "Trade More, Get More",
    desc: "Rebate program offering $125,000 in cash prizes across five competitive circuits. Earn rebates on every trade.",
    prize: "$125,000",
    period: "Oct 2024 — Jul 2025",
    status: "Ended",
    icon: Gift,
  },
  {
    name: "IB Grand Prix",
    desc: "Introducing Broker competition with $125,000 in cash prizes across five competitive circuits for our partners.",
    prize: "$125,000",
    period: "Oct 2024 — Jul 2025",
    status: "Ended",
    icon: Users,
  },
  {
    name: "20% Deposit Bonus",
    desc: "Get a 20% deposit bonus when you fund your account with at least $200. Bonus available on Classic and RAW accounts.",
    prize: "20% Bonus",
    period: "Ongoing",
    status: "Active",
    icon: DollarSign,
  },
];

export default function PromotionsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="Trade more, get more. Take advantage of our trading contests, deposit bonuses, and exclusive promotions."
        breadcrumb="Home / Promotions"
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROMOS.map((p) => (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-2xl border p-6 transition ${
                  p.highlight
                    ? "border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {p.highlight && (
                  <div className="absolute right-4 top-4 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black">
                    FEATURED
                  </div>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-white/40">{p.desc}</p>
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-white/30">Prize Pool</span>
                    <span className="font-bold text-yellow-400">{p.prize}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-white/30">Period</span>
                    <span className="text-white/60">{p.period}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Status</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-white/40"
                    }`}>{p.status}</span>
                  </div>
                </div>
                <button
                  onClick={onLaunchTerminal}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-yellow-400 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  Participate <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.01] py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
          <h2 className="text-3xl font-bold">Ready to compete?</h2>
          <p className="mt-3 text-white/40">Open an account today and join our trading contests.</p>
          <button
            onClick={onLaunchTerminal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
          >
            Start Trading <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
