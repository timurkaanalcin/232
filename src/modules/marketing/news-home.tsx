"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react";
import {
  CircleStopIcon,
  ClockIcon,
  Loader2Icon,
  MenuIcon,
  RadioIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WifiIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FINANCE_GUEST } from "@/lib/guest-auth";
import { geolocationErrorMessage, geolocationUnavailableMessage } from "@/lib/geolocation-errors";
import { useLocationSharing } from "@/hooks/use-location-sharing";
import { MARKET_TICKER, NEWS_ARTICLES, NEWS_CATEGORIES } from "@/modules/marketing/news-articles";
import { NewsConsentDialog } from "@/modules/marketing/news-consent-dialog";

const DECLINED_KEY = "livetrack_finance_declined";
const SESSION_LABEL = "Finans sitesi ziyareti";

async function waitForSession(maxMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const s = await getSession();
    if (s?.user?.id) return s;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

export function NewsHome() {
  const { data: session } = useSession();
  const sharing = useLocationSharing();
  const [consentOpen, setConsentOpen] = useState(false);
  const [declined, setDeclined] = useState(false);
  const confirmingRef = useRef(false);
  const startedRef = useRef(false);

  // Girişte pop-up (reddedilmediyse ve paylaşım yoksa).
  useEffect(() => {
    if (sessionStorage.getItem(DECLINED_KEY) === "1") {
      setDeclined(true);
      return;
    }
    if (sharing.state === "sharing") return;
    const t = setTimeout(() => setConsentOpen(true), 350);
    return () => clearTimeout(t);
  }, [sharing.state]);

  const finishSharing = async (position: GeolocationPosition) => {
    if (startedRef.current || sharing.state !== "idle") return;
    startedRef.current = true;

    try {
      let authed = session?.user;
      if (!authed) {
        const res = await signIn("credentials", {
          email: FINANCE_GUEST.email,
          password: FINANCE_GUEST.password,
          redirect: false,
        });
        if (res?.error) {
          throw new Error("Ziyaretçi oturumu açılamadı. npm run db:guest:remote çalıştırın.");
        }
        authed = (await waitForSession())?.user;
        if (!authed) throw new Error("Oturum açıldı ama doğrulanamadı. Sayfayı yenileyip tekrar deneyin.");
      }

      await sharing.start(SESSION_LABEL, position);
      sessionStorage.removeItem(DECLINED_KEY);
      setDeclined(false);
      toast.success("Konum paylaşımı başladı", {
        description: "Admin → Canlı Harita'da görünürsünüz.",
      });
    } catch (e) {
      startedRef.current = false;
      throw e;
    }
  };

  /** Konum isteği tıklama anında — await'den ÖNCE (tarayıcı kuralı). */
  const handleConsentConfirm = () => {
    const blocked = geolocationUnavailableMessage();
    if (blocked) {
      toast.error(blocked);
      return;
    }

    confirmingRef.current = true;
    setConsentOpen(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.success("Konum izni verildi", {
          description: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          duration: 4000,
        });
        void finishSharing(position)
          .catch((e) => {
            toast.error(e instanceof Error ? e.message : "Paylaşım başlatılamadı");
            setConsentOpen(true);
          })
          .finally(() => {
            confirmingRef.current = false;
          });
      },
      (error) => {
        startedRef.current = false;
        confirmingRef.current = false;
        toast.error(geolocationErrorMessage(error));
        setConsentOpen(true);
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 },
    );
  };

  const handleDecline = () => {
    sessionStorage.setItem(DECLINED_KEY, "1");
    setDeclined(true);
    setConsentOpen(false);
  };


  const handleStop = async () => {
    await sharing.stop();
    startedRef.current = false;
    toast.info("Konum paylaşımı durduruldu");
  };

  const isSharing = sharing.state === "sharing";
  const busy = sharing.state === "starting" || sharing.state === "stopping";
  const [hero, ...rest] = NEWS_ARTICLES;
  if (!hero) return null;

  return (
    <div className="min-h-dvh bg-slate-50 text-foreground dark:bg-slate-950">
      {/* Piyasa ticker */}
      <div className="overflow-hidden border-b bg-slate-900 text-white">
        <div className="flex animate-[marquee_40s_linear_infinite] gap-8 whitespace-nowrap py-2 text-xs font-medium">
          {[...MARKET_TICKER, ...MARKET_TICKER].map((t, i) => (
            <span key={`${t.symbol}-${i}`} className="inline-flex items-center gap-2 px-2">
              <span className="text-amber-400">{t.symbol}</span>
              <span>{t.value}</span>
              <span className={t.up ? "text-emerald-400" : "text-red-400"}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="border-b bg-gradient-to-r from-slate-900 to-blue-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs sm:px-6">
          <span>{new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}</span>
          <Link href="/admin/map" className="text-amber-400 hover:underline">
            Canlı Harita (Admin)
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-xl font-black text-amber-600">Finans</span>
            <span className="text-xl font-light tracking-tight">Terminal</span>
          </Link>
          <nav className="hidden gap-4 text-sm font-medium md:flex">
            {NEWS_CATEGORIES.map((c) => (
              <a key={c} href="#" className="text-muted-foreground hover:text-amber-600">
                {c}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü">
              <MenuIcon className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Ara">
              <SearchIcon className="size-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isSharing && (
        <div className="border-b bg-emerald-700 text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
            <div className="flex items-center gap-2">
              <RadioIcon className="size-4 animate-pulse" />
              <span>Canlı konum aktif — admin haritada görünüyorsunuz</span>
              {sharing.connectionMode && (
                <Badge className="bg-white/20 text-white hover:bg-white/20">
                  <WifiIcon className="mr-1 size-3" />
                  {sharing.connectionMode === "websocket" ? "Canlı" : "Yedek"}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => void handleStop()} disabled={busy}>
              <CircleStopIcon className="size-4" />
              Durdur
            </Button>
          </div>
        </div>
      )}

      {sharing.error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">{sharing.error}</div>
      )}

      {declined && !isSharing && (
        <div className="border-b bg-amber-500/10 px-4 py-2 text-center text-sm">
          Konum izni verilmedi.{" "}
          <button type="button" className="font-medium text-amber-700 underline" onClick={() => setConsentOpen(true)}>
            Tekrar sor
          </button>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <article className={`overflow-hidden rounded-xl bg-gradient-to-br ${hero.imageGradient} text-white shadow-xl`}>
          <div className="p-6 sm:p-10">
            {hero.breaking && <Badge className="mb-3 bg-amber-500 text-slate-900 hover:bg-amber-500">SON DAKİKA</Badge>}
            {hero.ticker && <p className="text-sm font-mono text-amber-300">{hero.ticker}</p>}
            <p className="mt-1 text-sm text-white/70">{hero.category}</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">{hero.title}</h1>
            <p className="mt-4 max-w-2xl text-white/85">{hero.summary}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
              <span>{hero.author}</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                {hero.publishedAt}
              </span>
            </div>
          </div>
        </article>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MARKET_TICKER.map((t) => (
            <div key={t.symbol} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t.symbol}</p>
              <p className="font-mono text-lg font-bold">{t.value}</p>
              <p className={`flex items-center gap-1 text-xs ${t.up ? "text-emerald-600" : "text-red-600"}`}>
                {t.up ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {t.change}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-lg font-bold">Piyasa Gündemi</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rest.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md">
                  <div className={`h-24 bg-gradient-to-br ${article.imageGradient}`} />
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 border-amber-500/40 text-xs text-amber-700">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold leading-snug">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-bold text-amber-600">Öne Çıkanlar</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {NEWS_ARTICLES.slice(0, 5).map((a, i) => (
                  <li key={a.id} className="flex gap-2">
                    <span className="font-bold text-amber-600">{i + 1}</span>
                    <span className="text-muted-foreground">{a.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-8 border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Finans Terminal · Konum yalnızca açık rıza ile paylaşılır
      </footer>

      <NewsConsentDialog
        open={consentOpen}
        onClose={handleDecline}
        onConfirm={handleConsentConfirm}
        busy={busy}
      />

      {busy && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
          <Loader2Icon className="size-4 animate-spin text-amber-600" />
          Bağlanıyor…
        </div>
      )}
    </div>
  );
}
