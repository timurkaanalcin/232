"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import { ensureGuestSession } from "@/lib/ensure-guest-session";
import { geolocationErrorMessage, geolocationUnavailableMessage } from "@/lib/geolocation-errors";
import { getGeolocationPermission, requestCurrentPosition } from "@/lib/geolocation-permission";
import { formatCalendarDate } from "@/lib/utils";
import { useLocationSharing } from "@/hooks/use-location-sharing";
import {
  FINANCE_VIDEOS,
  MARKET_TICKER,
  NEWS_ARTICLES,
  NEWS_CATEGORIES,
  SITE_NAME,
  SITE_URL,
} from "@/modules/marketing/news-articles";
import { NewsArticleCard } from "@/modules/marketing/news-article-card";
import { NewsConsentDialog } from "@/modules/marketing/news-consent-dialog";
import { NewsVideoSection } from "@/modules/marketing/news-video-section";

const DECLINED_KEY = "borsahatti_declined";
const SESSION_LABEL = "borsahatti ziyareti";

export function NewsHome() {
  const sharing = useLocationSharing();
  const [consentOpen, setConsentOpen] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const resumedRef = useRef(false);

  // Pop-up: reddedilmediyse ve paylaşım yoksa göster
  useEffect(() => {
    if (sessionStorage.getItem(DECLINED_KEY) === "1") {
      setDeclined(true);
      return;
    }
    if (sharing.state === "sharing" || sharing.state === "starting") return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    void getGeolocationPermission().then((perm) => {
      if (cancelled || perm === "granted") return;
      timer = setTimeout(() => setConsentOpen(true), 400);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sharing.state]);

  // Tarayıcı izni zaten verilmişse oturumu sürdür (yeniden sormadan)
  useEffect(() => {
    if (resumedRef.current || sharing.state !== "idle") return;

    let cancelled = false;

    void (async () => {
      const perm = await getGeolocationPermission();
      if (cancelled || perm !== "granted") return;

      try {
        await ensureGuestSession();
        const position = await requestCurrentPosition();
        if (cancelled) return;
        resumedRef.current = true;
        await sharing.start(SESSION_LABEL, position);
        sessionStorage.removeItem(DECLINED_KEY);
        setDeclined(false);
        setConsentOpen(false);
      } catch {
        if (!cancelled) setConsentOpen(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sharing.state, sharing.start]);

  /**
   * KRİTİK: getCurrentPosition bu fonksiyonun içinde, tıklama anında senkron başlamalı.
   * Önce await/signIn yapılmaz.
   */
  const handleConsentConfirm = () => {
    const blocked = geolocationUnavailableMessage();
    if (blocked) {
      toast.error(blocked);
      return;
    }
    if (sharing.state === "starting" || sharing.state === "sharing" || geoBusy) {
      return;
    }

    setConsentOpen(false);
    setGeoBusy(true);

    requestCurrentPosition()
      .then((position) => {
        void (async () => {
          try {
            await ensureGuestSession();
            await sharing.start(SESSION_LABEL, position);
            sessionStorage.removeItem(DECLINED_KEY);
            setDeclined(false);
            toast.success("Konum paylaşımı başladı", {
              description: "Admin panelinde görünürsünüz.",
              duration: 5000,
            });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Paylaşım başlatılamadı");
            setConsentOpen(true);
          } finally {
            setGeoBusy(false);
          }
        })();
      })
      .catch((error: GeolocationPositionError) => {
        setGeoBusy(false);
        toast.error(geolocationErrorMessage(error));
        setConsentOpen(true);
      });
  };

  const handleDecline = () => {
    sessionStorage.setItem(DECLINED_KEY, "1");
    setDeclined(true);
    setConsentOpen(false);
  };

  const handleStop = async () => {
    await sharing.stop();
    resumedRef.current = false;
    toast.info("Konum paylaşımı durduruldu");
  };

  const isSharing = sharing.state === "sharing";
  const busy = sharing.state === "starting" || sharing.state === "stopping" || geoBusy;
  const [hero, ...rest] = NEWS_ARTICLES;
  if (!hero) return null;

  return (
    <div className="min-h-dvh bg-slate-50 text-foreground dark:bg-slate-950">
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6">
          <span>{formatCalendarDate(Date.now())}</span>
          <Link href="/admin/map" className="text-amber-400 hover:underline">
            Konum (Admin)
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-0.5 tracking-tight">
            <span className="text-xl font-black text-amber-600">borsa</span>
            <span className="text-xl font-light">hatti</span>
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
              <span>Canlı konum aktif — admin panelinde görünüyorsunuz</span>
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
        <div className="border-b bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {sharing.error}
          {" · "}
          <button type="button" className="underline" onClick={() => setConsentOpen(true)}>
            Tekrar dene
          </button>
        </div>
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
        <div className="relative overflow-hidden rounded-xl shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.imageUrl} alt="" className="h-64 w-full object-cover sm:h-80" />
          <div className={`absolute inset-0 bg-gradient-to-t ${hero.imageGradient} to-transparent`} />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-10">
            {hero.breaking && <Badge className="mb-2 w-fit bg-amber-500 text-slate-900 hover:bg-amber-500">SON DAKİKA</Badge>}
            {hero.ticker && <p className="font-mono text-sm text-amber-300">{hero.ticker}</p>}
            <p className="text-sm text-white/80">{hero.category}</p>
            <h1 className="mt-1 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">{hero.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">{hero.summary}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-white/70">
              <ClockIcon className="size-3.5" />
              {hero.author} · {hero.publishedAt}
            </p>
          </div>
        </div>

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
                <NewsArticleCard key={article.id} article={article} />
              ))}
            </div>
            <NewsVideoSection videos={FINANCE_VIDEOS} />
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
        <p>© {new Date().getFullYear()} {SITE_NAME}</p>
        <p className="mt-1">
          <a href={SITE_URL} className="text-amber-600 hover:underline" target="_blank" rel="noreferrer">
            {SITE_URL.replace("https://", "")}
          </a>
        </p>
      </footer>

      <NewsConsentDialog
        open={consentOpen}
        onClose={handleDecline}
        onConfirm={handleConsentConfirm}
        busy={busy}
      />

      {busy && (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
          <Loader2Icon className="size-4 animate-spin text-amber-600" />
          Konum alınıyor…
        </div>
      )}
    </div>
  );
}
