import { useState } from "react";
import {
  ArrowRight,
  Shield,
  Zap,
  Headphones,
  ChartNoAxesCombined,
  Landmark,
  Bitcoin,
  Coins,
  BarChart3,
  Building2,
  ArrowLeftRight,
  Check,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { UNIFIED_ACCOUNT } from "@/data/instruments";

interface Props {
  onLaunchTerminal: () => void;
  onNavigate: (page: string) => void;
  onLaunchAdmin?: () => void;
  onSwitchOlymp?: () => void;
}

const NAV = [
  { label: "Instruments", path: "instruments" },
  { label: "Accounts", path: "accounts" },
  { label: "Platforms", path: "platforms" },
  { label: "Education", path: "education" },
  { label: "About", path: "about" },
  { label: "Support", path: "support" },
];

const TRUST = [
  { icon: Headphones, label: "Dedicated support" },
  { icon: Zap, label: "Ultra-fast execution" },
  { icon: Shield, label: "Safety of clients’ funds" },
  { icon: ChartNoAxesCombined, label: "Tight spreads" },
];

const ASSETS = [
  {
    title: "Forex",
    desc: "60+ currency pairs",
    bullets: ["Leverage up to 1:1000", "Spreads from 0.0 pips"],
    icon: ArrowLeftRight,
  },
  {
    title: "Commodities",
    desc: "Precious metals and energies",
    bullets: ["Ultra-low spreads", "Leverage up to 1:1000"],
    icon: Coins,
  },
  {
    title: "Cryptocurrencies",
    desc: "Bitcoin, Ethereum, and more",
    bullets: ["Leverage up to 1:200", "Zero commissions"],
    icon: Bitcoin,
  },
  {
    title: "Stock Indices",
    desc: "20+ global indices",
    bullets: ["Leverage up to 1:100", "Zero commissions"],
    icon: BarChart3,
  },
  {
    title: "Stocks and ETFs",
    desc: "500+ symbols",
    bullets: ["Leverage up to 1:20", "Zero commissions"],
    icon: Building2,
  },
  {
    title: "Bonds",
    desc: "German bonds",
    bullets: ["Leverage up to 1:100", "Tight spreads"],
    icon: Landmark,
  },
  {
    title: "Futures and Options",
    desc: "S&P 500, DJIA, NASDAQ",
    bullets: ["Low deposit requirement ($1,000)", "Competitive commissions"],
    icon: ChartNoAxesCombined,
  },
];

const PLATFORMS = [
  {
    name: "TradingView",
    tag: "NEW",
    points: [
      "Customisable charts with 110+ drawing tools",
      "400+ built-in indicators",
      "100+ fundamentals",
      "Global trading community to share ideas",
    ],
  },
  {
    name: "MT5",
    tag: null,
    points: [
      "Advanced pending orders",
      "Superior analysis tools",
      "Fully customisable charts",
      "Built-in economic calendar",
    ],
  },
  {
    name: "MT4",
    tag: null,
    points: [
      "Advanced charting and analytical tools",
      "Sophisticated order management tools",
      "Expert Advisors available",
      "Trade from your desktop or mobile device",
    ],
  },
  {
    name: "BROKERZ Trader",
    tag: null,
    points: [
      "60+ technical indicators",
      "Advanced charting tools",
      "Customisable asset watchlists",
      "Secure biometric login (app)",
    ],
  },
];

const LICENCES = [
  { name: "BROKERZ Ltd", detail: "FSA Seychelles\nLicence No. SD008" },
  {
    name: "BROKERZ UK Ltd",
    detail: "FCA, Register No. 717270\nDubai representative office\n(DFSA, Ref No. F007663)",
  },
  { name: "BROKERZ Europe Ltd", detail: "CySEC, Licence No. 278/15" },
  { name: "BROKERZ South Africa (Pty) Ltd", detail: "FSCA, FSP No. 49464" },
];

export default function LandingPage({
  onLaunchTerminal,
  onNavigate,
  onLaunchAdmin,
  onSwitchOlymp,
}: Props) {
  const [activePlatform, setActivePlatform] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);

  return (
    <div className="tw-scope tm-landing min-h-screen overflow-x-hidden">
      {/* ── Tickmill-style header ── */}
      <header className="sticky top-0 z-50 border-b border-[#ffb2c7]/15 bg-[#140106]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center text-[#fff6ed]"
            aria-label="USBANK home"
          >
            <img src="/usbank-logo.svg" alt="USBANK" className="h-8 w-auto" />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                onMouseEnter={() => setOpenNav(item.path)}
                onMouseLeave={() => setOpenNav(null)}
                className="rounded-full px-3 py-2 text-[13px] font-medium text-[#fff6ed]/85 transition hover:bg-white/5 hover:text-white"
              >
                <span className="inline-flex items-center gap-1">
                  {item.label}
                  <ChevronDown
                    className={`h-3 w-3 opacity-50 transition ${openNav === item.path ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {onLaunchAdmin && (
              <button
                type="button"
                onClick={onLaunchAdmin}
                className="hidden text-[13px] font-medium text-[#ffb2c7] transition hover:text-white sm:inline"
              >
                Log in
              </button>
            )}
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="rounded-full bg-[#f83b00] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
            >
              Open account
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ffb2c7]/20 text-[#fff6ed] lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#ffb2c7]/10 bg-[#1a040a] px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate(item.path);
                  }}
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium text-[#fff6ed] hover:bg-white/5"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLaunchTerminal();
                }}
                className="mt-2 rounded-xl border border-[#ffb2c7]/20 px-3 py-3 text-left text-sm text-[#ffb2c7]"
              >
                Open WebTrader →
              </button>
              {onSwitchOlymp && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onSwitchOlymp();
                  }}
                  className="rounded-xl border border-[#ffb2c7]/20 px-3 py-3 text-left text-sm text-[#ffb2c7]"
                >
                  Olymp Trade style →
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80"
        >
          <source src="https://assets.mixkit.co/videos/9330/9330-720.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 85% 10%, rgba(248,59,0,0.35), transparent 50%), linear-gradient(165deg, rgba(20,1,6,0.92) 0%, rgba(40,4,16,0.88) 40%, rgba(73,6,25,0.9) 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-[1200px] flex-col justify-center px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-20">
          <p className="tm-rise mb-6 text-[11px] font-semibold tracking-[0.32em] text-[#ffb2c7] uppercase">
            Multi-asset class broker
          </p>
          <h1 className="tm-rise tm-rise-2 tm-display max-w-[16ch] text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#fff6ed]">
            Welcome to the new{" "}
            <em className="not-italic text-[#ff4c7c]" style={{ fontStyle: "italic" }}>
              BROKERZ
            </em>
          </h1>
          <p className="tm-rise tm-rise-3 mt-6 max-w-xl text-[17px] leading-relaxed text-[#ffb2c7] md:text-lg">
            Access 600+ CFDs, including Forex, Commodities, Indices, Cryptocurrencies and platforms
            designed for performance.
          </p>
          <div className="tm-rise tm-rise-3 mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="inline-flex items-center gap-2 rounded-full bg-[#f83b00] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(248,59,0,0.35)] transition hover:brightness-110"
            >
              Start trading
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="inline-flex items-center gap-2 rounded-full border border-[#ffb2c7]/30 bg-transparent px-7 py-3.5 text-sm font-semibold text-[#fff6ed] transition hover:border-[#ff4c7c] hover:bg-[#fff6ed]/5"
            >
              Open live account
            </button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#ffb2c7]/12 bg-[#1a040a]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 md:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-6 py-6 ${i > 0 ? "md:border-l md:border-[#ffb2c7]/12" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ffb2c7]/20 bg-[#f83b00]/10 text-[#ff4c7c]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-medium leading-snug text-[#fff6ed]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Remote image strip */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {[
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        ].map((src) => (
          <div key={src} className="relative aspect-[5/3] overflow-hidden">
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-[#140106]/35" />
          </div>
        ))}
      </section>

      {/* Asset classes — cream elite panel */}
      <section className="bg-[#faf0e5] py-24 text-[#140106]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <h2 className="tm-display max-w-3xl text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.02em]">
            Trade Forex, CFDs, Futures and Options across asset classes
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ASSETS.map((asset) => {
              const Icon = asset.icon;
              return (
                <button
                  key={asset.title}
                  type="button"
                  onClick={() => onNavigate("instruments")}
                  className="group flex h-full flex-col rounded-2xl border border-[#140106]/08 bg-[#fff7ee] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#f83b00]/35 hover:shadow-[0_20px_50px_rgba(20,1,6,0.08)]"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#140106]/5 text-[#f83b00]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#140106]/25 transition group-hover:translate-x-0.5 group-hover:text-[#f83b00]" />
                  </div>
                  <h3 className="tm-display text-xl font-bold">{asset.title}</h3>
                  <p className="mt-1.5 text-sm text-[#490619]/70">{asset.desc}</p>
                  <ul className="mt-5 space-y-2 border-t border-[#140106]/06 pt-4">
                    {asset.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-[#280410]/85">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#147d40]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-[#490619]/55">
            *Futures and Options are available under BROKERZ UK Ltd.
          </p>
        </div>
      </section>

      {/* Accounts — tek kategori, Classic/RAW yok */}
      <section className="bg-[#140106] py-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="mx-auto mb-10 flex flex-col items-center text-center">
            <img src="/usbank-logo.svg" alt="USBANK" className="mb-6 h-10 w-auto text-[#fff6ed]" />
            <h2 className="tm-display max-w-3xl text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-[#fff6ed]">
              Exceptional conditions on all CFD trading accounts
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[#c9a4ae]">
              Tüm hesaplar aynı kategoride — aynı spread, kaldıraç ve komisyon. Classic / RAW ayrımı yok.
            </p>
          </div>

          <article className="mx-auto max-w-2xl rounded-[28px] border border-[#f83b00] bg-gradient-to-b from-[#390513] to-[#1a040a] p-8 shadow-[0_0_0_1px_rgba(248,59,0,0.25)] md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {UNIFIED_ACCOUNT.platforms.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-[#ffb2c7]/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#ffb2c7] uppercase"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <h3 className="tm-display mt-4 text-[26px] font-bold text-[#fff6ed]">{UNIFIED_ACCOUNT.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c9a4ae]">{UNIFIED_ACCOUNT.blurb}</p>
              </div>
              <img src="/usbank-logo.svg" alt="" className="h-8 w-auto opacity-90 text-[#fff6ed]" />
            </div>

            <dl className="mt-8 space-y-0 border-t border-[#ffb2c7]/12">
              <AccRow label="Starting Deposit" value={`$${UNIFIED_ACCOUNT.deposit}`} />
              <AccRow label="Available Base Currencies" value={UNIFIED_ACCOUNT.currencies.join(", ")} />
              <AccRow label="Spreads From" value={UNIFIED_ACCOUNT.spreads} />
              <AccRow label="Max Leverage" value={UNIFIED_ACCOUNT.leverage} />
              <AccRow label="Commissions" value={UNIFIED_ACCOUNT.commission} />
              <AccRow label="Account category" value="Single / Unified" />
            </dl>

            <button
              type="button"
              onClick={onLaunchTerminal}
              className="mt-8 w-full rounded-full bg-[#f83b00] py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Open USBANK account
            </button>
          </article>
        </div>
      </section>

      {/* Deposits */}
      <section className="border-y border-[#ffb2c7]/12 bg-[#1a040a] py-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="tm-display text-2xl font-bold text-[#fff6ed] md:text-3xl">
              Deposits and withdrawals
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#c9a4ae]">
              Fast funding with cards, bank transfer and local payment methods — withdrawals
              processed with institutional efficiency.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("conditions")}
            className="inline-flex items-center gap-2 rounded-full border border-[#ffb2c7]/25 px-5 py-3 text-sm font-semibold text-[#fff6ed] hover:border-[#ff4c7c]"
          >
            View methods
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Performance stats — cream */}
      <section className="bg-[#fff7ee] py-24 text-[#140106]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <h2 className="tm-display max-w-2xl text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.02em]">
            Results-driven performance in Forex and CFD trading
          </h2>
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {[
              { value: "180+", label: "Countries serviced" },
              { value: "196 BN+", label: "Average monthly trading volume" },
              { value: "0.15 sec", label: "Average execution time" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-[#f83b00] pl-6">
                <div className="tm-display text-[clamp(2.5rem,5vw,3.75rem)] font-bold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-[#490619]/70">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xs text-[#490619]/50">
            * The figures refer to BROKERZ Group’s activity in 2024 for Forex/CFDs trading.
          </p>
        </div>
      </section>

      {/* Platforms */}
      <section className="bg-[#140106] py-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <h2 className="tm-display max-w-3xl text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-[#fff6ed]">
            The ultimate Forex and CFD trading platforms at your disposal
          </h2>

          <div className="mt-10 flex flex-wrap gap-2">
            {PLATFORMS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setActivePlatform(i)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                  activePlatform === i
                    ? "bg-[#f83b00] text-white"
                    : "border border-[#ffb2c7]/20 text-[#ffb2c7] hover:border-[#ff4c7c]/50 hover:text-[#fff6ed]"
                }`}
              >
                {p.name}
                {p.tag && (
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      activePlatform === i ? "bg-white/20" : "bg-[#ff4c7c]/20 text-[#ff4c7c]"
                    }`}
                  >
                    {p.tag}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#ffb2c7]/15 bg-[#1a040a] p-8 md:p-10">
              <div className="flex items-center gap-3">
                <h3 className="tm-display text-3xl font-bold text-[#fff6ed]">
                  {PLATFORMS[activePlatform].name}
                </h3>
                {PLATFORMS[activePlatform].tag && (
                  <span className="rounded-full bg-[#ff4c7c]/20 px-2 py-0.5 text-[10px] font-bold text-[#ff4c7c] uppercase">
                    {PLATFORMS[activePlatform].tag}
                  </span>
                )}
              </div>
              <ul className="mt-8 space-y-4">
                {PLATFORMS[activePlatform].points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-[15px] text-[#ffb2c7]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#56cf87]" />
                    {pt}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs tracking-wide text-[#c9a4ae] uppercase">Available On</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onLaunchTerminal}
                  className="rounded-full bg-[#f83b00] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
                >
                  Launch WebTrader
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("platforms")}
                  className="rounded-full border border-[#ffb2c7]/20 px-6 py-3 text-sm font-semibold text-[#fff6ed] hover:border-[#ff4c7c]"
                >
                  Learn more
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-[#ffb2c7]/15 bg-[#280410] p-8">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 70% 20%, rgba(248,59,0,0.28), transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,76,124,0.15), transparent 45%)",
                }}
              />
              <div className="relative flex h-full min-h-[320px] flex-col justify-between">
                <div className="flex items-center justify-between text-[12px] text-[#c9a4ae]">
                  <span>EURUSD · M5</span>
                  <span className="inline-flex items-center gap-1.5 text-[#56cf87]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#56cf87]" />
                    Live
                  </span>
                </div>
                <svg viewBox="0 0 420 200" className="my-6 h-auto w-full" aria-hidden>
                  <defs>
                    <linearGradient id="eliteChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f83b00" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f83b00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,130 C35,120 55,150 95,105 C135,60 160,95 205,75 C250,55 275,100 320,55 C360,20 385,48 420,32 L420,200 L0,200 Z"
                    fill="url(#eliteChart)"
                  />
                  <path
                    d="M0,130 C35,120 55,150 95,105 C135,60 160,95 205,75 C250,55 275,100 320,55 C360,20 385,48 420,32"
                    fill="none"
                    stroke="#ff4c7c"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-black/25 px-3 py-3">
                    <div className="text-[10px] tracking-wide text-[#c9a4ae] uppercase">Bid</div>
                    <div className="mt-1 font-mono text-sm text-[#ff5765]">1.08742</div>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-3 py-3">
                    <div className="text-[10px] tracking-wide text-[#c9a4ae] uppercase">Ask</div>
                    <div className="mt-1 font-mono text-sm text-[#56cf87]">1.08754</div>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-3 py-3">
                    <div className="text-[10px] tracking-wide text-[#c9a4ae] uppercase">Spread</div>
                    <div className="mt-1 font-mono text-sm text-[#fff6ed]">0.1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Licences */}
      <section className="border-t border-[#ffb2c7]/12 bg-[#1a040a] py-20">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <h2 className="tm-display text-2xl font-bold text-[#fff6ed] md:text-3xl">
            BROKERZ Group licences
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LICENCES.map((lic) => (
              <div
                key={lic.name}
                className="rounded-2xl border border-[#ffb2c7]/12 bg-[#140106] p-5 transition hover:border-[#f83b00]/35"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#f83b00]" />
                  <h3 className="text-sm font-semibold text-[#fff6ed]">{lic.name}</h3>
                </div>
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-[#c9a4ae]">
                  {lic.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(248,59,0,0.28), transparent 55%), #140106",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-5 py-28 text-center md:px-8">
          <h2 className="tm-display mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#fff6ed]">
            Years of growth.
            <br />
            Millions of trades.
            <br />
            <em className="text-[#ff4c7c]">It works.</em>
          </h2>
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-2 gap-10">
            <div>
              <div className="tm-display text-4xl font-bold text-[#fff6ed] md:text-5xl">830M+</div>
              <div className="mt-2 text-sm text-[#c9a4ae]">Trades executed</div>
            </div>
            <div>
              <div className="tm-display text-4xl font-bold text-[#fff6ed] md:text-5xl">623.867</div>
              <div className="mt-2 text-sm text-[#c9a4ae]">Satisfied clients</div>
            </div>
          </div>
          <p className="mt-6 text-xs text-[#c9a4ae]/70">
            * The figures apply to all entities of the BROKERZ Group
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="inline-flex items-center gap-2 rounded-full bg-[#f83b00] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(248,59,0,0.35)] hover:brightness-110"
            >
              Start trading
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onLaunchTerminal}
              className="rounded-full border border-[#ffb2c7]/30 px-7 py-3.5 text-sm font-semibold text-[#fff6ed] hover:border-[#ff4c7c]"
            >
              Open live account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ffb2c7]/12 bg-[#0a0104]">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <img src="/usbank-logo.svg" alt="USBANK" className="h-8 w-auto" />
              <p className="mt-4 text-sm leading-relaxed text-[#c9a4ae]">
                Multi-asset class broker. CFDs on Forex, Stocks, Commodities, Indices and more.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onLaunchTerminal}
                  className="text-left text-xs font-medium text-[#ffb2c7] underline-offset-4 hover:text-[#ff4c7c] hover:underline"
                >
                  Open WebTrader
                </button>
                {onSwitchOlymp && (
                  <button
                    type="button"
                    onClick={onSwitchOlymp}
                    className="text-left text-xs font-medium text-[#ffb2c7] underline-offset-4 hover:text-[#ff4c7c] hover:underline"
                  >
                    Switch to Olymp Trade style
                  </button>
                )}
              </div>
            </div>
            {[
              {
                title: "Trading",
                links: [
                  ["instruments", "Instruments"],
                  ["accounts", "Accounts"],
                  ["platforms", "Platforms"],
                  ["conditions", "Conditions"],
                ],
              },
              {
                title: "Company",
                links: [
                  ["about", "About"],
                  ["partnership", "Partnership"],
                  ["promotions", "Promotions"],
                  ["support", "Support"],
                ],
              },
              {
                title: "Resources",
                links: [
                  ["education", "Education"],
                  ["tools", "Tools"],
                  ["copy-trading", "Copy Trading"],
                  ["support", "Help centre"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold tracking-[0.18em] text-[#ffb2c7] uppercase">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([path, label]) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => onNavigate(path)}
                        className="text-sm text-[#fff6ed]/80 transition hover:text-[#ff4c7c]"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-[#ffb2c7]/10 pt-6">
            <p className="text-[11px] leading-relaxed text-[#c9a4ae]/80">
              Risk Warning: Trading financial products on margin carries a high degree of risk and
              is not suitable for all investors. Losses can exceed the initial investment. Please
              ensure you fully understand the risks and take appropriate care to manage your risk.
            </p>
            <p className="mt-4 text-xs text-[#c9a4ae]">
              © {new Date().getFullYear()} BROKERZ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AccRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#ffb2c7]/10 py-3.5 last:border-b-0">
      <dt className="text-[13px] text-[#c9a4ae]">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-[#fff6ed]">{value}</dd>
    </div>
  );
}
