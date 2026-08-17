import PageHeader from "@/components/PageHeader";
import { Shield, Award, Globe, Users, TrendingUp, Zap, Check, ArrowRight, Building2, Mail, Phone, MapPin } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const REGULATIONS = [
  { entity: "BROKERZ UK Ltd", regulator: "Financial Conduct Authority (FCA)", country: "United Kingdom", office: "First Floor, The Bengal Wing, 9A Devonshire Square, London EC2M 4YN" },
  { entity: "BROKERZ Europe Ltd", regulator: "Cyprus Securities and Exchange Commission (CySEC)", country: "Cyprus", office: "Kedron 9, Mesa Geitonia, 4004 Limassol, Cyprus" },
  { entity: "BROKERZ South Africa (Pty) Ltd", regulator: "Financial Sector Conduct Authority (FSCA)", country: "South Africa", office: "FSP No. 49464" },
  { entity: "BROKERZ Ltd", regulator: "Financial Services Authority (FSA) of Seychelles", country: "Seychelles", office: "9 Raffles Place, #18-21 Republic Plaza, Singapore 048619" },
];

const NEWS = [
  { title: "BROKERZ Launches 'Trade More, Get More' Rebate Program", date: "Oct 2024", category: "Promotions" },
  { title: "BROKERZ Announces the IB Grand Prix — $125,000 Competition", date: "Sep 2024", category: "Partnership" },
  { title: "BROKERZ Wins 'Best Forex Broker' at Global Forex Awards 2025", date: "Jan 2025", category: "Awards" },
  { title: "BROKERZ Expands Crypto Offering with New Pairs", date: "Mar 2025", category: "Products" },
  { title: "BROKERZ Introduces TradingView RAW Account", date: "Jun 2025", category: "Products" },
  { title: "BROKERZ Trading Cup 2026 is Now Live", date: "Jan 2026", category: "Promotions" },
];

export default function AboutPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="About BROKERZ"
        subtitle="An award-winning, multi-regulated provider of financial services for traders and investors around the globe."
        breadcrumb="Home / About BROKERZ"
      />

      {/* Why BROKERZ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">Why BROKERZ</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature icon={Zap} title="Lightning Fast" desc="0.15-second average execution speed with no rejections or re-quotes" />
            <Feature icon={Shield} title="Multi-Regulated" desc="Licensed by FCA, CySEC, FSA, and FSCA across 4 jurisdictions" />
            <Feature icon={TrendingUp} title="Ultra-Low Spreads" desc="Spreads from 0.0 pips on RAW accounts with deep liquidity" />
            <Feature icon={Globe} title="Global Reach" desc="Servicing 180+ countries with 24/5 multilingual support" />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Stat value="830M+" label="Trades executed" />
            <Stat value="623,867" label="Satisfied clients" />
            <Stat value="196 BN+" label="Monthly volume" />
          </div>
        </div>
      </section>

      {/* Regulations */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Regulations & Licenses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {REGULATIONS.map((r) => (
              <div key={r.entity} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-bold">{r.entity}</h3>
                </div>
                <div className="space-y-2 text-sm text-white/50">
                  <div><span className="text-white/30">Regulator:</span> {r.regulator}</div>
                  <div><span className="text-white/30">Country:</span> {r.country}</div>
                  <div><span className="text-white/30">Office:</span> {r.office}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-3xl font-bold">Latest News</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {NEWS.map((n) => (
              <div key={n.title} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-yellow-500/20">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">{n.category}</span>
                  <span className="text-xs text-white/30">{n.date}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug">{n.title}</h3>
                <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-yellow-400">
                  Read more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <Award className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold">Awards & Recognition</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[
              "Best Forex Broker 2025",
              "Best RAW Spread Broker 2025",
              "Most Trusted Broker 2024",
              "Best Trading Conditions 2024",
              "Best Customer Service 2024",
              "Best Mobile Trading Platform 2025",
              "Best Crypto Broker 2025",
              "Best Partnership Program 2024",
            ].map((award) => (
              <div key={award} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 text-center">
                <Award className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
                <div className="text-sm font-semibold text-white/70">{award}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Join the BROKERZ community</h2>
          <p className="mt-3 text-white/40">Over 623,867 traders have already chosen BROKERZ.</p>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="text-4xl font-bold text-yellow-400">{value}</div>
      <div className="mt-2 text-sm text-white/40">{label}</div>
    </div>
  );
}
