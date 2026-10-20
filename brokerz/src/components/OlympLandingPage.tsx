import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Menu, X, ChevronRight, Play } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { fill, useMessages } from "@/lib/i18n";

interface Props {
  onLaunchTerminal: () => void;
  onNavigate: (page: string) => void;
  onBackHome?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  /** olymp = lime brand; ubs = UBS red/black + logo */
  theme?: "olymp" | "ubs";
}

const A = "/olymp-assets";

const ASSETS = {
  heroVideo: `${A}/backvideobanner.C2YTF_yx.mp4`,
  hero: `${A}/hero.5jSiJh2V_Vf4Tc.webp`,
  hand: `${A}/hand.B8DUGbiV_ZOFSFU.webp`,
  handMob: `${A}/hand_mob.Diu0v2xz_Z7Sao3.webp`,
  desktop: `${A}/desktop_v2.C0bsehbf_2rJOzF.webp`,
  mobile: `${A}/mob_v2.-rubP0wr_Z1HDhcE.webp`,
  banner: `${A}/banner.Bq4zFx9X_15mkAG.webp`,
  people: `${A}/ppl.C7UL-EEl_1sjWFf.webp`,
  community: `${A}/community.Dto8Ky3v.png`,
  faq: `${A}/faq.C8XnOc2i.png`,
  bg: `${A}/bg.Bd9RjB8Z_23Dnv0.webp`,
  bg2: `${A}/bg.L1yfV3aR_Z25XIeN.webp`,
  bg3: `${A}/bg.CF-8HQYA_y1oO5.webp`,
  bgPattern: `${A}/bg.D9-H_t_b.png`,
  fire: `${A}/fire.Cm0nrSyK.png`,
  love: `${A}/love.C_skyr8g.png`,
  finish: `${A}/finish.D3vlJEYW.png`,
  books: `${A}/books.FC5gSHox.png`,
  money: `${A}/money.Bic8ryUY.png`,
  shield: `${A}/shield.BVdy6JFV.png`,
  moon: `${A}/moon.CjcG5IEH.png`,
  img1: `${A}/image.DFB_RWdL_1JhwiS.webp`,
  img2: `${A}/image.CTF7lwiU_bLD0X.webp`,
  img3: `${A}/image_condenced.CdPcjJqo_Z2tQO06.webp`,
  img4: `${A}/image.DmPlMRNV_ZvzkfC.webp`,
  img5: `${A}/image.xwLxyY5h_Jxs7s.webp`,
  img6: `${A}/image.BbfTrYMP_2aCFrt.webp`,
  yt1: `${A}/yt_preview_1.B0kribA7_Z1lvXFT.webp`,
  yt2: `${A}/yt_preview_2.DdlOLyy9_Z1vMfRj.webp`,
  yt3: `${A}/yt_preview_3.C3nr8TnV_q0BEz.webp`,
  finacom: `${A}/finacom.NY71UH9K_ZG1qCi.webp`,
  vanuatu: `${A}/vanuatu.B3ERRJAg_O9U67.webp`,
  fairness: `${A}/fairness.DNLCKdAX_Z26Qp0v.webp`,
  compensation: `${A}/compensation.BmQqNjLK_ZpfeQE.webp`,
  verify: `${A}/verifymytrade.B-HZriZb_2uy2cH.webp`,
  regulation: `${A}/regulation_bg_tablet.oJtBSYLo_M9nUP.webp`,
  gaspar: `${A}/gaspar.CwJEfYwu.mp4`,
  favicon: `${A}/favicon.svg`,
};

const THEMES = {
  olymp: {
    brand: "Olymptrade",
    accent: "#6aff41",
    btnAccent:
      "bg-[linear-gradient(90deg,#00ffc2_0%,#42ff00_100%)] text-black font-semibold hover:brightness-110 transition",
    glow: "shadow-[0_0_40px_rgba(66,255,0,0.22)]",
    blob: "bg-[radial-gradient(circle,#00ffc2_0%,#42ff00_40%,transparent_70%)]",
    blobSoft: "bg-[radial-gradient(circle,#00ffc2_0%,transparent_65%)]",
    accentText: "bg-[linear-gradient(90deg,#00ffc2,#42ff00)] bg-clip-text text-transparent",
    logo: null as string | null,
  },
  ubs: {
    brand: "UBS",
    accent: "#E60000",
    btnAccent: "bg-[color:var(--ot-accent)] text-white font-semibold hover:bg-[#c40000] transition",
    glow: "shadow-[0_20px_60px_rgba(230,0,0,0.35)]",
    blob: "bg-[radial-gradient(circle,rgba(230,0,0,0.35)_0%,transparent_70%)]",
    blobSoft: "bg-[radial-gradient(circle,rgba(230,0,0,0.25)_0%,transparent_70%)]",
    accentText: "text-[color:var(--ot-accent)]",
    logo: "/ubs-logo.png",
  },
} as const;

/** Transparent / white text on black — no frames */
const btnGhost =
  "bg-transparent text-white/80 hover:text-white transition";
const surface = "bg-transparent";
const pill = "bg-transparent text-white/65";
const muted = "text-white/55";
const faint = "text-white/40";

const NAV_KEYS = [
  { key: "trade" as const, path: "instruments" },
  { key: "account" as const, path: "accounts" },
  { key: "download" as const, path: "platforms" },
  { key: "about" as const, path: "about" },
  { key: "help" as const, path: "support" },
];

const AWARDS = [
  ["2016", "Fastest Growing Broker"],
  ["2017", "Innovative Broker"],
  ["2017", "Best Financial Broker"],
  ["2018", "Best Asian Trading Platform (Forex)"],
  ["2019", "Best Mobile Trading Experience"],
  ["2020", "Best Customer Support Broker"],
  ["2021", "Best Investment Broker"],
  ["2023", "Most Transparent Broker"],
  ["2023", "Most Trusted Financial Broker Latin America"],
  ["2026", "Best Multi-Asset Trading Platform"],
];

function Logo({
  className = "h-7",
  theme,
}: {
  className?: string;
  theme: keyof typeof THEMES;
}) {
  const t = THEMES[theme];
  if (theme === "ubs" || t.logo) {
    return (
      <img
        src={theme === "ubs" ? "/ubs-logo.png" : (t.logo as string)}
        alt={t.brand}
        className={`w-auto object-contain object-left bg-transparent ${className}`}
        style={{ background: "transparent", mixBlendMode: "normal" }}
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={`${A}/favicon.svg`} alt="" className="h-7 w-7 rounded-[8px] shadow-[0_0_20px_rgba(66,255,0,0.25)]" />
      <span className="text-[17px] font-bold tracking-[-0.03em] text-white sm:text-[18px]">{t.brand}</span>
    </span>
  );
}

export default function OlympLandingPage({
  onLaunchTerminal,
  onNavigate,
  onBackHome,
  onLogin,
  onRegister,
  theme = "olymp",
}: Props) {
  const m = useMessages();
  const t = THEMES[theme];
  const btnAccent = t.btnAccent;
  const accent = t.accent;
  const brand = t.brand;
  const mediaTone = "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [awardIdx, setAwardIdx] = useState(0);

  const NAV = useMemo(
    () =>
      NAV_KEYS.map((item) => ({
        label: m.nav[item.key],
        path: item.path,
        children: m.navItems[item.key] ?? [],
      })),
    [m]
  );

  const PILLS = m.pills;
  const CARE = useMemo(
    () =>
      [
        { icon: ASSETS.fire, ...m.care[0] },
        { icon: ASSETS.love, ...m.care[1] },
        { icon: ASSETS.finish, ...m.care[2] },
      ].filter((c) => c.title),
    [m]
  );
  const RISK = useMemo(
    () =>
      [
        { img: ASSETS.img1, icon: ASSETS.moon, ...m.risk[0] },
        { img: ASSETS.img2, icon: ASSETS.shield, ...m.risk[1] },
        { img: ASSETS.img3, icon: ASSETS.finish, ...m.risk[2] },
        { img: ASSETS.img4, icon: ASSETS.money, ...m.risk[3] },
        { img: ASSETS.img5, icon: ASSETS.shield, ...m.risk[4] },
        { img: ASSETS.img6, icon: ASSETS.books, ...m.risk[5] },
      ].filter((r) => r.title),
    [m]
  );
  const JOURNEY = useMemo(
    () =>
      [
        { img: ASSETS.yt1, ...m.journey[0] },
        { img: ASSETS.yt2, ...m.journey[1] },
        { img: ASSETS.yt3, ...m.journey[2] },
        { img: ASSETS.books, ...m.journey[3] },
      ].filter((j) => j.title),
    [m]
  );
  const SMOOTH = m.smooth;
  const REVIEWS = [
    {
      n: "Jacobo Ortiz",
      t: "My statistics",
      x: "I love numbers and often review my trade stats. After starting FTT trades on this platform, my returns rose by about 15%.",
    },
    {
      n: "Daniel Clark",
      t: "Education platform",
      x: "The learning materials are genuinely useful — I can use them whenever I need.",
    },
    {
      n: "Kiên Huỳnh",
      t: "Useful trading tools",
      x: "There are plenty of helpful tools. Lots of indicators, and applying them to charts is simple.",
    },
    {
      n: "Minh Chí",
      t: "Many assets",
      x: "There are many tradable assets. Each trading mode has its own set of instruments.",
    },
    {
      n: "Anuchit Phrombut",
      t: "Very smooth",
      x: "A solid trading platform and experience. I can access all modes without switching accounts.",
    },
    {
      n: "Theeranop Siriwanich",
      t: "Support",
      x: "I asked about a feature I did not understand; the support team helped immediately.",
    },
  ];

  useEffect(() => {
    const id = window.setInterval(() => setAwardIdx((i) => (i + 1) % AWARDS.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  const isUbs = theme === "ubs";
  const headerBg = isUbs ? "bg-white" : "bg-transparent";
  const navText = isUbs
    ? "bg-transparent text-black/70 hover:text-black transition"
    : btnGhost;
  const headerCtaGhost = isUbs
    ? "bg-transparent text-black/70 hover:text-black transition"
    : btnGhost;
  const whiteBand = isUbs ? "bg-white text-black" : "";
  const darkBand = isUbs ? "bg-black text-white" : "";
  const sectionMuted = isUbs ? "text-black/55" : muted;
  const sectionFaint = isUbs ? "text-black/40" : faint;
  const sectionHeading = isUbs ? "text-black" : "text-white";
  const cardOnWhite = isUbs ? "bg-[#f5f5f5] text-black" : surface;
  const langTone = isUbs ? "brand" : "dark";

  return (
    <div
      className="tw-scope ot-tr min-h-screen overflow-x-hidden bg-black text-white antialiased selection:bg-[color:var(--ot-accent)] selection:text-white"
      style={{ ["--ot-accent" as string]: accent }}
    >
      {/* HEADER */}
      <header className={`fixed inset-x-0 top-0 z-[60] ${headerBg}`}>
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:h-20 md:px-10">
          <div className="flex items-center gap-8 xl:gap-12">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={brand} className="border-0 bg-transparent p-0 shadow-none">
              <Logo theme={theme} className={theme === "ubs" ? "h-9 sm:h-11" : "h-7"} />
            </button>
            <nav className="hidden items-center gap-1 xl:flex">
              {NAV.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenNav(item.label)}
                  onMouseLeave={() => setOpenNav(null)}
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`border-0 bg-transparent px-3 py-2 text-[13px] font-medium tracking-wide shadow-none ${navText}`}
                  >
                    {item.label}
                  </button>
                  {openNav === item.label && (
                    <div className={`absolute left-1/2 top-[calc(100%+4px)] z-50 min-w-[260px] -translate-x-1/2 border-0 p-3 shadow-none ${isUbs ? "bg-white" : "bg-black"}`}>
                      <div className="grid gap-0.5">
                        {item.children.map(([title, desc]) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => onNavigate(item.path)}
                            className={`border-0 bg-transparent px-3 py-2.5 text-left shadow-none transition hover:text-[color:var(--ot-accent)] ${isUbs ? "text-black" : "text-white"}`}
                          >
                            <div className={`text-[13px] font-semibold ${isUbs ? "text-black" : "text-white"}`}>{title}</div>
                            <div className={`mt-0.5 text-[12px] leading-snug ${isUbs ? "text-black/50" : faint}`}>{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher tone={langTone} compact />
            {onBackHome && (
              <button type="button" onClick={onBackHome} className={`hidden border-0 bg-transparent px-3 py-2 text-[12px] shadow-none md:inline ${headerCtaGhost}`}>
                ← {m.header.home}
              </button>
            )}
            <button type="button" onClick={onLogin ?? onLaunchTerminal} className={`hidden border-0 bg-transparent px-3.5 py-2 text-[13px] font-medium shadow-none sm:inline ${headerCtaGhost}`}>
              {m.header.login}
            </button>
            <button type="button" onClick={onRegister ?? onLaunchTerminal} className={`rounded-none px-5 py-2.5 text-[13px] ${btnAccent}`}>
              {m.header.register}
            </button>
            <button
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center border-0 bg-transparent shadow-none xl:hidden ${headerCtaGhost}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={m.header.menu}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className={`max-h-[75vh] overflow-y-auto px-4 py-3 xl:hidden ${isUbs ? "bg-white" : "bg-black"}`}>
            {NAV.map((item) => (
              <div key={item.label} className="py-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate(item.path);
                  }}
                  className={`w-full border-0 bg-transparent px-2 py-2 text-left text-sm font-semibold shadow-none ${isUbs ? "text-black" : "text-white"}`}
                >
                  {item.label}
                </button>
                <div className="pb-2 pl-3">
                  {item.children.map(([c]) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onNavigate(item.path);
                      }}
                      className={`block w-full border-0 bg-transparent py-1.5 text-left text-[13px] shadow-none ${isUbs ? "text-black/55" : muted}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden pt-14 md:pt-20">
        <video
          className={`absolute inset-0 h-full w-full object-cover ${mediaTone}`}
          autoPlay
          muted
          loop
          playsInline
          poster={ASSETS.hero}
        >
          <source src={ASSETS.heroVideo} type="video/mp4" />
        </video>
        <img
          src={ASSETS.hero}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover opacity-50 ${mediaTone}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        <div className={`pointer-events-none absolute -left-24 top-1/4 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl ${t.blob}`} />

        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1200px] items-center gap-8 px-4 pb-16 pt-10 md:grid-cols-2 md:px-10 md:pb-20">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
              {m.hero.line1}
              <br />
              <span className={t.accentText}>{m.hero.trust}</span>
              {m.hero.line2 ? (
                <>
                  {" "}
                  {m.hero.line2}
                </>
              ) : null}
            </h1>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onLaunchTerminal}
                className={`inline-flex h-14 items-center justify-center px-8 text-[15px] ${t.glow} ${btnAccent}`}
              >
                {m.hero.startTrading}
              </button>
              <button
                type="button"
                onClick={onLaunchTerminal}
                className={`inline-flex h-14 items-center justify-center px-6 text-[15px] font-semibold text-white ${btnGhost}`}
              >
                {m.hero.startInvesting}
              </button>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("about")}
              className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-[color:var(--ot-accent)] hover:text-white"
            >
              {m.hero.learnMore} <ChevronRight className="h-4 w-4" />
            </button>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2">
              {PILLS.map((p) => (
                <span key={p} className={`text-[12px] font-medium tracking-wide ${pill}`}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <picture>
              <source media="(max-width: 767px)" srcSet={ASSETS.handMob} />
              <img
                src={ASSETS.hand}
                alt={`${brand} app`}
                className={`relative z-10 w-full drop-shadow-[0_40px_100px_rgba(0,0,0,0.85)] ${mediaTone}`}
              />
            </picture>
            <div className={`pointer-events-none absolute -inset-16 -z-0 rounded-full opacity-40 blur-2xl ${t.blobSoft}`} />
          </div>
        </div>
      </section>

      {/* 11 years */}
      <section className="relative overflow-hidden py-20 md:py-[120px]">
        <img src={ASSETS.bg} alt="" className={`absolute inset-0 h-full w-full object-cover opacity-35 ${mediaTone}`} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 md:grid-cols-2 md:px-10">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              {m.years.title}
              <span className="mt-2 block text-[color:var(--ot-accent)]">{m.years.accent}</span>
            </h2>
            <p className={`mt-6 max-w-md text-[16px] leading-relaxed ${muted}`}>
              {fill(m.years.body, { brand })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate("about")}
                className={`px-5 py-3 text-sm ${btnGhost}`}
              >
                {m.hero.learnMore}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("promotions")}
                className="px-5 py-3 text-sm font-semibold text-[color:var(--ot-accent)] hover:text-white transition"
              >
                {m.years.news}
              </button>
            </div>
          </div>
          <div className={`relative overflow-hidden ${surface}`}>
            <img src={ASSETS.people} alt="Community" className={`w-full object-cover ${mediaTone}`} />
          </div>
        </div>
      </section>

      {/* Modern platform */}
      <section className={`py-20 md:py-[120px] ${whiteBand}`}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[12px] font-semibold tracking-[0.22em] text-[color:var(--ot-accent)] uppercase">{m.platform.eyebrow}</p>
            <h2 className={`mt-3 text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.03em] ${sectionHeading}`}>
              {m.platform.title}
            </h2>
            <p className={`mt-4 ${sectionMuted}`}>{m.platform.subtitle}</p>
          </div>

          <div className={`relative mt-12 overflow-hidden ${surface}`}>
            <img src={ASSETS.desktop} alt={`${brand} desktop`} className={`hidden w-full md:block ${mediaTone}`} />
            <img src={ASSETS.mobile} alt={`${brand} mobile`} className={`w-full md:hidden ${mediaTone}`} />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {CARE.map((c) => (
              <div
                key={c.title}
                className={`p-7 text-center ${cardOnWhite}`}
              >
                <img src={c.icon} alt="" className={`mx-auto h-16 w-16 object-contain ${mediaTone}`} />
                <h3 className={`mt-5 text-xl font-semibold ${sectionHeading}`}>{c.title}</h3>
                <p className={`mt-2 text-sm ${sectionMuted}`}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional tools */}
      <section className={`py-20 md:py-[120px] ${darkBand}`}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          <h2 className="max-w-2xl text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.03em] text-white">
            {m.toolsTitle}
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RISK.map((r) => (
              <article
                key={r.title}
                className={`group overflow-hidden transition ${isUbs ? "bg-white/5" : surface}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={r.img} alt="" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${mediaTone}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <img src={r.icon} alt="" className={`absolute bottom-3 left-3 h-11 w-11 object-contain drop-shadow ${mediaTone}`} />
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold leading-snug text-white">{r.title}</h3>
                  <p className={`mt-2 text-sm ${muted}`}>{r.desc}</p>
                  <button
                    type="button"
                    onClick={onLaunchTerminal}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--ot-accent)] hover:text-white"
                  >
                    Learn more <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={onLaunchTerminal} className={`px-6 py-3.5 text-sm ${btnAccent}`}>
              Try it now
            </button>
            <button type="button" onClick={onLaunchTerminal} className={`px-6 py-3.5 text-sm font-semibold ${btnGhost}`}>
              Start investing
            </button>
          </div>
        </div>
      </section>

      {/* Licensed */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <img src={ASSETS.regulation} alt="" className={`absolute inset-0 h-full w-full object-cover opacity-40 ${mediaTone}`} />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-10">
          <h2 className="max-w-3xl text-[clamp(1.85rem,3.5vw,2.75rem)] font-semibold">
            {brand} is a licensed and regulated online broker
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-6 md:gap-8">
            {[ASSETS.finacom, ASSETS.vanuatu, ASSETS.fairness, ASSETS.compensation, ASSETS.verify].map((src) => (
              <img key={src} src={src} alt="Regulation" className={`h-14 w-auto object-contain opacity-90 md:h-[68px] ${mediaTone}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate("about")}
            className="mt-10 inline-flex items-center gap-2 px-0 py-2 text-sm font-semibold text-[color:var(--ot-accent)] hover:text-white transition"
          >
            Learn more <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Journey */}
      <section className={`py-20 md:py-[120px] ${whiteBand}`}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          <h2 className={`text-[clamp(2rem,4vw,3.25rem)] font-semibold ${sectionHeading}`}>{m.journeyTitle}</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((j) => (
              <article key={j.title} className={`overflow-hidden ${cardOnWhite}`}>
                <div className="relative aspect-video bg-transparent">
                  <img src={j.img} alt="" className={`h-full w-full object-cover ${mediaTone}`} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className={`flex h-12 w-12 items-center justify-center ${btnAccent}`}>
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <h3 className={`text-sm font-semibold ${sectionHeading}`}>{j.title}</h3>
                  <p className={`mt-1.5 text-[13px] ${sectionMuted}`}>{j.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={onLaunchTerminal} className={`px-6 py-3.5 text-sm ${btnAccent}`}>
              Open live account
            </button>
            <button
              type="button"
              onClick={() => onNavigate("education")}
              className="px-6 py-3.5 text-sm font-semibold text-[color:var(--ot-accent)] hover:opacity-80 transition"
            >
              Start learning
            </button>
          </div>
        </div>
      </section>

      {/* Withdrawals */}
      <section className={`relative py-20 md:py-28 ${whiteBand}`}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          <div className={`relative overflow-hidden ${surface}`}>
            <img src={ASSETS.banner} alt="Payments" className={`w-full object-cover ${mediaTone}`} />
            <img
              src={ASSETS.bgPattern}
              alt=""
              className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-contain object-right md:block"
            />
          </div>
          <div className="mt-10 text-center">
            <h2 className={`text-[clamp(1.85rem,3.5vw,2.75rem)] font-semibold ${sectionHeading}`}>
              Fast withdrawals with local payment options
            </h2>
            <p className={`mx-auto mt-3 max-w-xl ${sectionMuted}`}>
              Deposit and withdraw with methods you know — fast, local and clear.
            </p>
          </div>
        </div>
      </section>

      {/* Smooth */}
      <section className="relative overflow-hidden bg-transparent py-20 md:py-[120px]">
        <img src={ASSETS.bg2} alt="" className={`absolute inset-0 h-full w-full object-cover opacity-25 ${mediaTone}`} />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative mx-auto max-w-[1200px] px-4 md:px-10">
          <h2 className="text-center text-[clamp(2rem,4vw,3.25rem)] font-semibold">A seamless trading experience</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SMOOTH.map((s) => (
              <div
                key={s.label}
                className={`p-7 text-center ${surface}`}
              >
                <div className="text-[28px] font-semibold text-[color:var(--ot-accent)]">{s.value}</div>
                <div className={`mt-2 text-sm ${muted}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global + reviews */}
      <section className={`py-20 md:py-[120px] ${whiteBand}`}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-10">
          <h2 className={`text-center text-[clamp(2rem,4vw,3.25rem)] font-semibold ${sectionHeading}`}>
            {brand} operates in more than 130 countries
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <article key={r.n} className={`p-5 ${cardOnWhite}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center bg-[color:var(--ot-accent)] text-sm font-bold text-white">
                    {r.n[0]}
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${sectionHeading}`}>{r.n}</div>
                    <div className={`text-xs ${sectionFaint}`}>{r.t}</div>
                  </div>
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${sectionMuted}`}>{r.x}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Community / Help banners */}
      <section className={`pb-8 md:pb-12 ${whiteBand}`}>
        <div className="mx-auto grid max-w-[1200px] gap-4 px-4 sm:grid-cols-2 md:px-10">
          <button
            type="button"
            onClick={() => onNavigate("about")}
            className={`group relative min-h-[232px] overflow-hidden p-6 text-left ${cardOnWhite}`}
          >
            <img
              src={ASSETS.community}
              alt=""
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[264px] w-[264px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-80 transition group-hover:scale-110 ${mediaTone}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="relative z-10 mt-auto flex h-full flex-col justify-end">
              <div className="text-lg font-semibold text-white group-hover:text-[color:var(--ot-accent)]">Community</div>
              <div className="mt-1 text-sm text-white/70">Join our events and grow your skills</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("support")}
            className={`group relative min-h-[232px] overflow-hidden p-6 text-left ${cardOnWhite}`}
          >
            <img
              src={ASSETS.faq}
              alt=""
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[264px] w-[264px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-80 transition group-hover:scale-110 ${mediaTone}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="relative z-10 mt-auto flex h-full flex-col justify-end">
              <div className="text-lg font-semibold text-white group-hover:text-[color:var(--ot-accent)]">Help Center</div>
              <div className="mt-1 text-sm text-white/70">Free knowledge base and guides</div>
            </div>
          </button>
        </div>
      </section>

      {/* Awards */}
      <section className="relative overflow-hidden bg-transparent py-20">
        <img src={ASSETS.bg3} alt="" className={`absolute inset-0 h-full w-full object-cover opacity-15 ${mediaTone}`} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-4 text-center md:px-10">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-semibold text-white">11 years of excellence</h2>
          <div className={`mx-auto mt-10 max-w-xl px-8 py-12 ${surface}`}>
            <div className="text-sm font-semibold text-[color:var(--ot-accent)]">{AWARDS[awardIdx][0]}</div>
            <div className="mt-3 text-xl font-semibold text-white md:text-2xl">{AWARDS[awardIdx][1]}</div>
            <div className="mt-6 flex justify-center gap-1.5">
              {AWARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAwardIdx(i)}
                  className={`h-1.5 transition ${i === awardIdx ? "w-6 bg-[color:var(--ot-accent)]" : "w-1.5 bg-white/25"}`}
                  aria-label={`Award ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {AWARDS.map(([y, title], i) => (
              <button
                key={`${y}-${title}-${i}`}
                type="button"
                onClick={() => setAwardIdx(i)}
                className={`px-4 py-3 text-left transition ${btnGhost} ${i === awardIdx ? "text-white" : ""}`}
              >
                <div className="text-[11px] font-semibold text-[color:var(--ot-accent)]">{y}</div>
                <div className={`mt-0.5 text-[12px] font-medium ${i === awardIdx ? "text-white" : "text-white/70"}`}>{title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <video className={`absolute inset-0 h-full w-full object-cover opacity-40 ${mediaTone}`} autoPlay muted loop playsInline>
          <source src={ASSETS.gaspar} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-[1200px] px-4 text-center md:px-10">
          <h2 className="text-[clamp(2.2rem,5vw,3.75rem)] font-semibold tracking-[-0.03em] text-white">
            Start trading with confidence
          </h2>
          <p className={`mx-auto mt-4 max-w-lg ${muted}`}>A reliable trading platform is essential for success</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onLaunchTerminal}
              className={`px-7 py-4 text-[15px] ${t.glow} ${btnAccent}`}
            >
              Start investing
            </button>
            <button type="button" onClick={onLaunchTerminal} className={`px-7 py-4 text-[15px] font-semibold ${btnGhost}`}>
              Open a live account
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={isUbs ? "bg-white text-black" : "bg-transparent"}>
        <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-10 md:py-20">
          <div className={`grid gap-10 ${isUbs ? "md:grid-cols-[320px_1fr]" : "md:grid-cols-[220px_1fr]"}`}>
            <div>
              <Logo theme={theme} className="h-8" />
              {isUbs ? (
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-black/55">
                  <p>
                    UBS Group AG is a Swiss multinational investment bank and financial services firm, headquartered in Zurich and Basel. We are the world’s leading wealth manager and Switzerland’s largest bank.
                  </p>
                  <p>
                    Global Wealth Management · Personal &amp; Corporate Banking · Asset Management · Investment Bank
                  </p>
                  <p className="text-[12px] text-black/40">
                    Bahnhofstrasse 45, 8001 Zurich, Switzerland
                    <br />
                    Aeschenvorstadt 1, 4051 Basel, Switzerland
                    <br />
                    +41 44 234 11 11 · ubs.com
                  </p>
                  <p className="text-[11px] text-black/35">
                    UBS AG · CHE-101.329.561 · Listed on SIX Swiss Exchange and NYSE (UBS)
                  </p>
                </div>
              ) : (
                <p className={`mt-4 text-sm leading-relaxed ${faint}`}>Online trading platform and app.</p>
              )}
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(isUbs
                ? [
                    {
                      h: "Services",
                      l: [
                        ["instruments", "Wealth Management"],
                        ["accounts", "Personal Banking"],
                        ["platforms", "Investment Bank"],
                        ["tools", "Asset Management"],
                      ],
                    },
                    {
                      h: "Company",
                      l: [
                        ["about", "About UBS"],
                        ["about", "Our firm"],
                        ["promotions", "Media"],
                        ["support", "Careers"],
                      ],
                    },
                    {
                      h: "Clients",
                      l: [
                        ["education", "Insights"],
                        ["tools", "Research"],
                        ["conditions", "Legal"],
                        ["support", "Locations"],
                      ],
                    },
                    {
                      h: "Help",
                      l: [
                        ["support", "Contact us"],
                        ["support", "Client support"],
                        ["accounts", "Online banking"],
                        ["support", "Security"],
                      ],
                    },
                  ]
                : [
                    {
                      h: "Trade",
                      l: [
                        ["instruments", "Assets"],
                        ["accounts", "Accounts"],
                        ["platforms", "Platform"],
                      ],
                    },
                    {
                      h: "Company",
                      l: [
                        ["about", "About"],
                        ["promotions", "Promotions"],
                        ["support", "Support"],
                      ],
                    },
                    {
                      h: "Resources",
                      l: [
                        ["education", "Learning Center"],
                        ["tools", "Tools"],
                        ["conditions", "Conditions"],
                      ],
                    },
                    {
                      h: "Account",
                      l: [
                        ["accounts", "Live account"],
                        ["accounts", "Withdrawals"],
                        ["support", "FAQ"],
                      ],
                    },
                  ]
              ).map((col) => (
                <div key={col.h}>
                  <h4 className={`text-[12px] font-semibold tracking-[0.12em] uppercase ${isUbs ? "text-black/40" : faint}`}>{col.h}</h4>
                  <ul className="mt-3 space-y-2">
                    {col.l.map(([path, label]) => (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={() => onNavigate(path)}
                          className={`text-sm transition hover:text-[color:var(--ot-accent)] ${isUbs ? "text-black/70" : "text-white/70"}`}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className={`mt-14 text-[11px] leading-relaxed ${isUbs ? "text-black/40" : faint}`}>
            {isUbs ? (
              <>
                © {new Date().getFullYear()} UBS. UBS means UBS Group AG and its subsidiaries and affiliates. UBS provides wealth management, investment banking, asset management and personal banking services worldwide. Investing involves risk, including the possible loss of capital. Past performance is not a guarantee of future results. Products and services are subject to legal and regulatory restrictions in certain jurisdictions and may not be available in all locations.
              </>
            ) : (
              <>
                By continuing to browse you accept the Cookie Policy. Trading involves risk of loss.
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
