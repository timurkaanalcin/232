import PageHeader from "@/components/PageHeader";
import { Monitor, Smartphone, LineChart, BarChart3, Check, ArrowRight, Zap, Download } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const PLATFORMS = [
  {
    name: "MetaTrader 5",
    desc: "The world's most popular trading platform with advanced charting, 38 indicators, 21 timeframes, and one-click trading.",
    icon: Monitor,
    features: ["38 technical indicators", "21 timeframes", "One-click trading", "Algorithmic trading (EAs)", "Depth of market", "Economic calendar"],
    highlight: true,
  },
  {
    name: "MetaTrader 4",
    desc: "The classic platform trusted by millions of traders worldwide. Simple, powerful, and reliable.",
    icon: BarChart3,
    features: ["30 technical indicators", "9 timeframes", "Expert Advisors", "Custom indicators", "Algorithmic trading", "Simple interface"],
  },
  {
    name: "TradingView",
    desc: "Advanced charting with TradingView's industry-leading tools, drawing tools, and social trading features.",
    icon: LineChart,
    features: ["Advanced charting", "100+ indicators", "Drawing tools", "Social trading", "Custom scripts", "Real-time data"],
  },
  {
    name: "BROKERZ Trader",
    desc: "Our mobile-first platform designed for traders on the go. Full trading functionality from your phone.",
    icon: Smartphone,
    features: ["iOS & Android", "One-tap trading", "Real-time charts", "Account management", "Biometric login", "Push notifications"],
  },
];

export default function PlatformsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Trading Platforms"
        subtitle="The ultimate Forex and CFD trading platforms at your disposal. Trade from any device, anywhere in the world."
        breadcrumb="Home / Trading Platforms"
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {PLATFORMS.map((p) => (
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
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-white/40">{p.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/60">
                      <Check className="h-3.5 w-3.5 text-yellow-400" /> {f}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onLaunchTerminal}
                    className="flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-300"
                  >
                    Launch <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform comparison */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold">Platform comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-center font-medium">MT5</th>
                  <th className="px-4 py-3 text-center font-medium">MT4</th>
                  <th className="px-4 py-3 text-center font-medium">TradingView</th>
                  <th className="px-4 py-3 text-center font-medium">BROKERZ Trader</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Technical Indicators", "38", "30", "100+", "20+"],
                  ["Timeframes", "21", "9", "15+", "9"],
                  ["One-click trading", "Yes", "Yes", "Yes", "Yes"],
                  ["Expert Advisors", "Yes", "Yes", "No", "No"],
                  ["Algorithmic trading", "Yes", "Yes", "Scripts", "No"],
                  ["Desktop", "Yes", "Yes", "Web", "No"],
                  ["Mobile", "iOS/Android", "iOS/Android", "iOS/Android", "iOS/Android"],
                  ["Web version", "Yes", "Yes", "Yes", "No"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white/70">{row[0]}</td>
                    {row.slice(1).map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center text-white/50">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <Zap className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
          <h2 className="text-3xl font-bold">Ready to start trading?</h2>
          <p className="mt-3 text-white/40">Launch any platform instantly from your browser.</p>
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
