import PageHeader from "@/components/PageHeader";
import { Calendar, Newspaper, TrendingUp, BarChart2, Calculator, Clock, Download, ArrowRight, Zap } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const TOOLS = [
  { name: "Economic Calendar", desc: "Track major economic events and their potential market impact in real time.", icon: Calendar },
  { name: "Forex News", desc: "Stay up-to-date with the latest forex market news and analysis from our experts.", icon: Newspaper },
  { name: "Market Analysis", desc: "Daily market analysis and trading signals from our team of professional analysts.", icon: TrendingUp },
  { name: "Trading Calculator", desc: "Calculate margins, pip values, swaps, and profits before you trade.", icon: Calculator },
  { name: "Acuity Trading Tool", desc: "AI-powered tool for MT4/MT5 that analyses news and data to provide real-time market sentiment.", icon: Zap },
  { name: "Advanced Trading Toolkit", desc: "A comprehensive toolkit for MT4/MT5 with advanced order management and risk tools.", icon: BarChart2 },
  { name: "Earnings Calendar", desc: "Track upcoming company earnings reports and plan your stock trades accordingly.", icon: Clock },
  { name: "VPS Hosting", desc: "Free VPS hosting for your Expert Advisors — run your algorithms 24/7 without interruption.", icon: Download },
];

export default function ToolsPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Trading Tools"
        subtitle="Enhance your trading with our suite of professional-grade tools — from economic calendars to AI-powered market analysis."
        breadcrumb="Home / Tools"
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <div key={t.name} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-yellow-500/20 hover:bg-yellow-500/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition group-hover:scale-110">
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold">{t.name}</h3>
                <p className="mt-2 text-sm text-white/40">{t.desc}</p>
                <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
                  Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Economic Calendar Preview */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-2xl font-bold">Economic Calendar</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Currency</th>
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-center font-medium">Impact</th>
                  <th className="px-4 py-3 text-right font-medium">Forecast</th>
                  <th className="px-4 py-3 text-right font-medium">Previous</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["08:30", "USD", "Non-Farm Payrolls", "High", "180K", "175K"],
                  ["10:00", "EUR", "ECB Interest Rate Decision", "High", "4.25%", "4.25%"],
                  ["12:30", "GBP", "GDP Growth Rate Q/Q", "Medium", "0.2%", "0.1%"],
                  ["14:00", "JPY", "BoJ Policy Rate", "High", "0.10%", "0.10%"],
                  ["15:30", "CAD", "Employment Change", "Medium", "22K", "26K"],
                  ["16:00", "USD", "ISM Manufacturing PMI", "Medium", "48.5", "48.7"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-white/60">{row[0]}</td>
                    <td className="px-4 py-3 font-semibold text-yellow-400">{row[1]}</td>
                    <td className="px-4 py-3 text-white/70">{row[2]}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        row[3] === "High" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                      }`}>{row[3]}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white/50">{row[4]}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/50">{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Ready to trade?</h2>
          <p className="mt-3 text-white/40">Use our tools alongside the WebTrader platform for the best experience.</p>
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
