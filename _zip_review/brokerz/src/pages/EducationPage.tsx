import PageHeader from "@/components/PageHeader";
import { Video, Users, BookOpen, GraduationCap, Play, ArrowRight, Calendar, Clock } from "lucide-react";

interface Props {
  onLaunchTerminal: () => void;
}

const WEBINARS = [
  { title: "Mastering Risk Management in Forex", date: "Aug 15, 2026", duration: "60 min", level: "Beginner" },
  { title: "Advanced Price Action Strategies", date: "Aug 22, 2026", duration: "90 min", level: "Advanced" },
  { title: "Trading the NFP: Strategies & Tips", date: "Sep 5, 2026", duration: "45 min", level: "Intermediate" },
  { title: "Building Your First EA in MQL5", date: "Sep 12, 2026", duration: "120 min", level: "Advanced" },
  { title: "Crypto Trading Fundamentals", date: "Sep 19, 2026", duration: "60 min", level: "Beginner" },
  { title: "Scalping Techniques for RAW Accounts", date: "Sep 26, 2026", duration: "75 min", level: "Intermediate" },
];

const COURSES = [
  { title: "Forex Trading 101", desc: "A complete beginner's guide to forex trading — from reading candlesticks to placing your first trade.", lessons: 24, level: "Beginner" },
  { title: "Technical Analysis Masterclass", desc: "Learn to read charts, identify trends, and use indicators like a professional trader.", lessons: 18, level: "Intermediate" },
  { title: "Futures & Options Trading Hub", desc: "Exclusive tutorial videos and courses on futures and options trading.", lessons: 15, level: "Advanced" },
  { title: "Risk Management Essentials", desc: "Master position sizing, stop-loss strategies, and the psychology of trading.", lessons: 12, level: "All Levels" },
];

const SEMINARS = [
  { title: "\"Let's Bot!\" Workshops: Empowering Traders in Colombia", date: "July 2026" },
  { title: "BROKERZ Exclusive Event at The Shard, London", date: "June 2026" },
  { title: "Meet & Greet Forex Event in Caxias do Sul", date: "May 2026" },
  { title: "Outperformance Workshop in Dortmund", date: "September 2026" },
  { title: "Forex Trading and Strategies in Depth — Kiev", date: "April 2026" },
  { title: "Free Forex Seminar in Vietnam", date: "March 2026" },
];

export default function EducationPage({ onLaunchTerminal }: Props) {
  return (
    <div>
      <PageHeader
        title="Education"
        subtitle="Strengthen your trading skills with our comprehensive education hub — webinars, seminars, video tutorials, and online courses for traders of all levels."
        breadcrumb="Home / Education"
      />

      {/* Webinars */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <Video className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">Upcoming Webinars</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WEBINARS.map((w) => (
              <div key={w.title} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-yellow-500/20">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    w.level === "Beginner" ? "bg-green-500/10 text-green-400" :
                    w.level === "Intermediate" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                  }`}>{w.level}</span>
                </div>
                <h3 className="font-bold">{w.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {w.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {w.duration}</span>
                </div>
                <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-yellow-400 transition group-hover:translate-x-0.5">
                  <Play className="h-3.5 w-3.5" /> Register Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">Online Courses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {COURSES.map((c) => (
              <div key={c.title} className="group rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 transition hover:border-yellow-500/20">
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-white/40">{c.desc}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {c.lessons} lessons</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5">{c.level}</span>
                </div>
                <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
                  Start Course <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seminars */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">Global Trading Seminars</h2>
          </div>
          <p className="mb-6 text-white/40">Join our Forex seminars led by acclaimed industry experts around the world.</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SEMINARS.map((s) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-yellow-500/20">
                <div className="text-xs text-yellow-400">{s.date}</div>
                <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-white/[0.01] py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">Put your knowledge into practice</h2>
          <p className="mt-3 text-white/40">Open a free demo account and start trading with $10,000 virtual funds.</p>
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
