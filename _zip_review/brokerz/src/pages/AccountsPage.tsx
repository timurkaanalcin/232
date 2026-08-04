import PageHeader from "@/components/PageHeader";
import { ACCOUNT_TYPES } from "@/data/instruments";
import { Check, ArrowRight, DollarSign, TrendingUp, Shield, Zap } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

export default function AccountsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Trading Accounts"
        subtitle="Exceptional conditions on all CFD trading accounts. Choose the account that fits your trading style."
        breadcrumb="Home / Trading Accounts"
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {ACCOUNT_TYPES.map((acc) => (
              <div
                key={acc.id}
                className={`relative rounded-2xl border p-8 transition ${
                  acc.highlight
                    ? "border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 shadow-2xl shadow-yellow-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {acc.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold">{acc.name}</h3>
                <div className="mt-6 space-y-4">
                  <Row label="Starting Deposit" value={`$${acc.deposit}`} />
                  <Row label="Base Currencies" value={acc.currencies.join(", ")} />
                  <Row label="Max Leverage" value={acc.leverage} />
                  <Row label="Commissions" value={acc.commission} />
                  <Row label="Margin Call" value="100%" />
                  <Row label="Stop Out" value="50%" />
                  <Row label="Hedging" value="Allowed" />
                  <Row label="Scalping" value="Allowed" />
                  <Row label="Expert Advisors" value="Allowed" />
                </div>
                <button
                  onClick={onLaunchTerminal}
                  className={`mt-7 w-full rounded-lg py-3 text-sm font-bold transition ${
                    acc.highlight ? "bg-yellow-400 text-black hover:bg-yellow-300" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Open {acc.name} Account
                </button>
              </div>
            ))}
          </div>

          {/* Islamic Account */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h3 className="text-2xl font-bold">Islamic Account (Swap-Free)</h3>
            <p className="mt-2 text-white/40">
              A swap-free account compliant with Islamic finance principles. Available on
              Classic and RAW account types with no overnight swap charges.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Feature icon={Check} text="No overnight swap fees" />
              <Feature icon={Shield} text="Sharia-compliant trading" />
              <Feature icon={Zap} text="Same trading conditions" />
            </div>
          </div>
        </div>
      </section>

      {/* How to open */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Start trading with BROKERZ in 3 steps</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step="1" title="Register" desc="Complete registration, log in to your Client Area and upload the required documents." icon={Shield} />
            <StepCard step="2" title="Create an Account" desc="Once your documents are approved, create a Live Trading account in seconds." icon={TrendingUp} />
            <StepCard step="3" title="Make a Deposit" desc="Select a payment method, fund your trading account and start trading." icon={DollarSign} />
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={onLaunchTerminal}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-black transition hover:bg-yellow-300"
            >
              Start Trading <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm font-semibold text-white/90">{value}</span>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
      <Icon className="h-4 w-4 text-yellow-400" /> {text}
    </div>
  );
}

function StepCard({ step, title, desc, icon: Icon }: { step: string; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
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
