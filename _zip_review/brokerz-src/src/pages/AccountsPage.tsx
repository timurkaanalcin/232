import PageHeader from "@/components/PageHeader";
import { UNIFIED_ACCOUNT } from "@/data/instruments";
import { Check, ArrowRight, DollarSign, TrendingUp, Shield, Zap } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

export default function AccountsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Trading Accounts"
        subtitle="Tek hesap kategorisi — tüm trader’lar için aynı koşullar. Classic / RAW ayrımı yok."
        breadcrumb="Home / Trading Accounts"
      />

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <div className="relative rounded-2xl border border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 p-8 shadow-2xl shadow-yellow-500/10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <img src="/usbank-logo.svg" alt="USBANK" className="h-9 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                Unified
              </span>
            </div>
            <h3 className="text-2xl font-bold">{UNIFIED_ACCOUNT.name}</h3>
            <p className="mt-2 text-sm text-white/50">{UNIFIED_ACCOUNT.blurb}</p>
            <div className="mt-6 space-y-4">
              <Row label="Starting Deposit" value={`$${UNIFIED_ACCOUNT.deposit}`} />
              <Row label="Base Currencies" value={UNIFIED_ACCOUNT.currencies.join(", ")} />
              <Row label="Spreads From" value={UNIFIED_ACCOUNT.spreads} />
              <Row label="Max Leverage" value={UNIFIED_ACCOUNT.leverage} />
              <Row label="Commissions" value={UNIFIED_ACCOUNT.commission} />
              <Row label="Margin Call" value="100%" />
              <Row label="Stop Out" value="50%" />
              <Row label="Hedging" value="Allowed" />
              <Row label="Scalping" value="Allowed" />
              <Row label="Expert Advisors" value="Allowed" />
            </div>
            <button
              onClick={onLaunchTerminal}
              className="mt-7 w-full rounded-lg bg-yellow-400 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Open USBANK Account
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h3 className="text-2xl font-bold">Islamic Account (Swap-Free)</h3>
            <p className="mt-2 text-white/40">
              Swap-free hesap — aynı USBANK koşulları, overnight swap yok.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Feature icon={Check} text="No overnight swap fees" />
              <Feature icon={Shield} text="Sharia-compliant trading" />
              <Feature icon={Zap} text="Same trading conditions" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Start trading with USBANK in 3 steps</h2>
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
    <div className="flex items-center justify-between border-b border-white/5 py-2.5 text-sm">
      <span className="text-white/40">{label}</span>
      <span className="font-medium text-white/90">{value}</span>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
      <Icon className="h-4 w-4 text-yellow-400" />
      {text}
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
  icon: Icon,
}: {
  step: string;
  title: string;
  desc: string;
  icon: typeof Shield;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-2 text-xs font-bold tracking-wider text-yellow-400 uppercase">Step {step}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-white/40">{desc}</p>
    </div>
  );
}
