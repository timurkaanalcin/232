import PageHeader from "@/components/PageHeader";
import { Users, DollarSign, TrendingUp, Check, ArrowRight, Award, Gift, BarChart3, Megaphone, Handshake } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const PROGRAMS = [
  {
    name: "Introducing Broker (IB)",
    desc: "Refer traders to BROKERZ and earn competitive commissions on every trade your clients make. No upfront investment required.",
    benefits: ["Up to $10 per lot commission", "IB Loyalty Program with up to $250,000 cash prizes", "Dedicated account manager", "Comprehensive reporting dashboard", "Marketing tools & materials", "No limits on duration or volume"],
    icon: Users,
    highlight: true,
  },
  {
    name: "Affiliate Program (CPA)",
    desc: "Introduce traders to BROKERZ and earn CPA payouts. Built for long-term partnerships with reliable payments and transparent tracking.",
    benefits: ["Uncapped CPA commissions", "Reliable payments", "Transparent tracking with CellXpert", "Dedicated Affiliate Manager", "Marketing tools for conversion", "Free trading tools for your clients"],
    icon: Megaphone,
  },
  {
    name: "White Label",
    desc: "Start your own brokerage business with BROKERZ's White Label solution. Full branding, your own domain, and our technology.",
    benefits: ["Custom branding & domain", "MT4/MT5 platform access", "Full back-office support", "Liquidity & pricing from BROKERZ", "Custom trading conditions", "Dedicated technical support"],
    icon: Handshake,
  },
];

export default function PartnershipPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Partnership"
        subtitle="Grow your income with BROKERZ's partnership programs. Whether you're an Introducing Broker, Affiliate, or looking for a White Label solution, we have the right program for you."
        breadcrumb="Home / Partnership"
      />

      {/* Programs */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-8 transition ${
                  p.highlight
                    ? "border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                  <p.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-white/40">{p.desc}</p>
                <div className="mt-6 space-y-2">
                  {p.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-white/60">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" /> {b}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onLaunchTerminal}
                  className={`mt-6 w-full rounded-lg py-3 text-sm font-bold transition ${
                    p.highlight ? "bg-yellow-400 text-black hover:bg-yellow-300" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Become a Partner
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IB Loyalty */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">IB Loyalty Program</h2>
          </div>
          <p className="mb-8 text-white/40">As an IB at BROKERZ, you're automatically enrolled in the IB Loyalty Scheme. Each milestone rewards you with extra cash prizes on top of regular commissions.</p>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {[
              { level: "Level 1", lots: "10 lots", prize: "$100" },
              { level: "Level 3", lots: "500 lots", prize: "$5,000" },
              { level: "Level 5", lots: "2,000 lots", prize: "$20,000" },
              { level: "Level 7", lots: "10,000 lots", prize: "$75,000" },
              { level: "Level 8", lots: "25,000 lots", prize: "$150,000" },
              { level: "Level 9", lots: "50,000 lots", prize: "$250,000" },
            ].map((l) => (
              <div key={l.level} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                <div className="text-xs text-white/30">{l.level}</div>
                <div className="mt-1 text-lg font-bold text-yellow-400">{l.prize}</div>
                <div className="mt-1 text-xs text-white/40">{l.lots} traded by referrals</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to become an IB */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">How to become a partner</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Step step="1" title="Register" desc="Sign up as an IB or Affiliate — it's completely free." />
            <Step step="2" title="Get Your Link" desc="Receive your unique referral link and marketing materials." />
            <Step step="3" title="Refer Traders" desc="Share your link across your channels and attract new clients." />
            <Step step="4" title="Earn" desc="Get paid commissions every time your referrals trade." />
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={onLaunchTerminal}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
            >
              Become a Partner <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
      <div className="absolute right-4 top-4 text-4xl font-bold text-white/5">{step}</div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/40">{desc}</p>
    </div>
  );
}
