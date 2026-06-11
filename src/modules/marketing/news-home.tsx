"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CircleStopIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  MenuIcon,
  RadioIcon,
  SearchIcon,
  WifiIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLocationSharing } from "@/hooks/use-location-sharing";
import { NEWS_ARTICLES, NEWS_CATEGORIES } from "@/modules/marketing/news-articles";
import {
  consumePendingNewsShare,
  NewsConsentDialog,
  setPendingNewsShare,
} from "@/modules/marketing/news-consent-dialog";

const CONSENT_ASKED_KEY = "livetrack_news_consent_asked";

export function NewsHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const sharing = useLocationSharing();
  const [consentOpen, setConsentOpen] = useState(false);
  const [declined, setDeclined] = useState(false);
  const confirmingRef = useRef(false);

  // Siteye girince bir kez izin sor (oturum başına).
  useEffect(() => {
    if (sessionStorage.getItem(CONSENT_ASKED_KEY)) return;
    const t = setTimeout(() => setConsentOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Giriş sonrası bekleyen paylaşımı başlat.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (!consumePendingNewsShare()) return;
    if (sharing.state !== "idle") return;
    void sharing.start("Haber sitesi ziyareti").catch(() => {});
  }, [status, session?.user, sharing]);

  const handleConsentConfirm = async () => {
    confirmingRef.current = true;
    sessionStorage.setItem(CONSENT_ASKED_KEY, "1");
    setConsentOpen(false);

    if (!session?.user) {
      setPendingNewsShare();
      router.push("/login?callbackUrl=/");
      return;
    }

    try {
      await sharing.start("Haber sitesi ziyareti");
      toast.success("Canlı konum paylaşımı başladı", {
        description: "Durdurmak için alttaki butonu kullanın.",
      });
    } catch {
      // sharing hook sets error state
    } finally {
      confirmingRef.current = false;
    }
  };

  const handleDecline = () => {
    sessionStorage.setItem(CONSENT_ASKED_KEY, "1");
    setDeclined(true);
    setConsentOpen(false);
  };

  const handleConsentOpenChange = (open: boolean) => {
    if (!open && !confirmingRef.current) handleDecline();
    if (!open) confirmingRef.current = false;
    setConsentOpen(open);
  };

  const handleStop = async () => {
    await sharing.stop();
    toast.info("Konum paylaşımı durduruldu");
  };

  const isSharing = sharing.state === "sharing";
  const busy = sharing.state === "starting" || sharing.state === "stopping";
  const [hero, ...rest] = NEWS_ARTICLES;
  if (!hero) return null;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Üst şerit */}
      <div className="border-b bg-red-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs sm:px-6">
          <span className="font-semibold tracking-wide">GÜNDEM HABER</span>
          <span className="hidden sm:inline">{new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hover:underline">Giriş</Link>
            <span>|</span>
            <Link href="/admin" className="hover:underline">Yönetim</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-xl font-black tracking-tight text-red-700">
            Gündem<span className="text-foreground">Haber</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {NEWS_CATEGORIES.map((c) => (
              <a key={c} href="#" className="text-muted-foreground hover:text-foreground">
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

      {/* Paylaşım durumu */}
      {isSharing && (
        <div className="border-b bg-emerald-600 text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
            <div className="flex items-center gap-2">
              <RadioIcon className="size-4 animate-pulse" />
              <span>Canlı konum paylaşılıyor</span>
              {sharing.connectionMode && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <WifiIcon className="mr-1 size-3" />
                  {sharing.connectionMode === "websocket" ? "Canlı" : "Yedek"}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => void handleStop()} disabled={busy}>
              <CircleStopIcon className="size-4" />
              Paylaşımı Durdur
            </Button>
          </div>
        </div>
      )}

      {sharing.error && (
        <div className="border-b bg-destructive/10 px-4 py-2 text-center text-sm text-destructive sm:px-6">
          {sharing.error}
        </div>
      )}

      {declined && !isSharing && (
        <div className="border-b bg-muted/50 px-4 py-2 text-center text-sm text-muted-foreground sm:px-6">
          Konum paylaşımı reddedildi. Haberleri okumaya devam edebilirsiniz.{" "}
          <button type="button" className="text-primary underline" onClick={() => setConsentOpen(true)}>
            İzni tekrar sor
          </button>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Manşet */}
        <article className={`overflow-hidden rounded-xl bg-gradient-to-br ${hero.imageGradient} text-white shadow-lg`}>
          <div className="p-6 sm:p-10">
            {hero.breaking && (
              <Badge className="mb-3 bg-white text-red-700 hover:bg-white">SON DAKİKA</Badge>
            )}
            <p className="text-sm font-medium text-white/80">{hero.category}</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight sm:text-4xl">{hero.title}</h1>
            <p className="mt-4 max-w-2xl text-white/90">{hero.summary}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
              <span>{hero.author}</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                {hero.publishedAt}
              </span>
            </div>
          </div>
        </article>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Haber listesi */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 border-b-2 border-red-700 pb-2 text-lg font-bold">Günün Haberleri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rest.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
                  <div className={`h-28 bg-gradient-to-br ${article.imageGradient}`} />
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold leading-snug">{article.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{article.publishedAt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-bold text-red-700">Çok Okunanlar</h3>
              <ol className="mt-3 space-y-3 text-sm">
                {NEWS_ARTICLES.slice(0, 5).map((a, i) => (
                  <li key={a.id} className="flex gap-2">
                    <span className="font-bold text-red-700">{i + 1}</span>
                    <span className="text-muted-foreground hover:text-foreground">{a.title}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <MapPinIcon className="size-4 text-primary" />
                Bölgesel içerik
              </div>
              <p className="mt-2 text-muted-foreground">
                Konum izni verdiğinizde yetkili ekipler canlı konumunuzu haritada görür. Paylaşım tamamen
                gönüllüdür ve istediğiniz an durdurulabilir.
              </p>
              {!isSharing && (
                <Button className="mt-3 w-full" size="sm" onClick={() => setConsentOpen(true)}>
                  Konum iznini aç
                </Button>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-8 border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Gündem Haber · Konum paylaşımı yalnızca açık rıza ile yapılır.</p>
          <p className="mt-1">
            <Link href="/login" className="hover:underline">Giriş</Link>
            {" · "}
            <Link href="/dashboard" className="hover:underline">Panel</Link>
          </p>
        </div>
      </footer>

      <NewsConsentDialog
        open={consentOpen}
        onOpenChange={handleConsentOpenChange}
        onConfirm={() => void handleConsentConfirm()}
        busy={busy}
        requiresLogin={!session?.user}
      />

      {busy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2Icon className="size-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
