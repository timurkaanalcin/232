"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/client-api";
import { formatPct, formatPrice } from "@/lib/finance/format";
import type { QuoteDTO } from "@/lib/finance/types";
import { SITE_NAME } from "@/modules/marketing/news-articles";
import { FinanceLogo } from "@/modules/finance/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ana sayfa" },
  { href: "/markets", label: "Piyasalar" },
  { href: "/news", label: "Haberler" },
  { href: "/watchlist", label: "İzleme listesi" },
  { href: "/compare", label: "Karşılaştır" },
];

const SHELL = "mx-auto w-full max-w-[1120px] px-4";

export function FinanceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const search = useQuery({
    queryKey: ["markets", "search", query],
    queryFn: () => apiGet<{ results: QuoteDTO[] }>(`/api/markets/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });

  const ticker = useQuery({
    queryKey: ["markets", "overview-ticker"],
    queryFn: () => apiGet<{ overview: { ticker: QuoteDTO[] } }>("/api/markets/overview"),
    refetchInterval: 20_000,
  });

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = search.data?.results ?? [];

  return (
    <div className="min-h-dvh overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-background/95">
        <div className={cn(SHELL, "flex h-14 items-center gap-3")}>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Menü">
            <MenuIcon className="size-5" />
          </Button>
          <Link href="/" aria-label={`${SITE_NAME} ana sayfa`} className="shrink-0">
            <FinanceLogo />
          </Link>
          <div ref={boxRef} className="relative mx-auto hidden w-full max-w-xl md:block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setFocused(false);
                }
              }}
              placeholder="Hisse, endeks, döviz veya kripto ara"
              className="h-10 rounded-full bg-secondary pl-9"
              aria-label="Piyasa ara"
            />
            {focused && query.trim() && (
              <div className="absolute mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
                {results.map((item) => (
                  <Link
                    key={item.instrumentId}
                    href={`/quote/${encodeURIComponent(item.instrumentId)}`}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setFocused(false);
                      setQuery("");
                    }}
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="ml-2 text-muted-foreground">{item.nameTr || item.name}</span>
                    </span>
                    <span className="ml-3 shrink-0 tabular-nums">{formatPrice(item.price, item.currency)}</span>
                  </Link>
                ))}
                {search.isFetching ? <div className="px-3 py-2 text-sm text-muted-foreground">Aranıyor…</div> : null}
                {!search.isFetching && results.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Sonuç yok</div>
                ) : null}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/search" className="md:hidden" aria-label="Ara">
              <SearchIcon className="size-5" />
            </Link>
            <ThemeToggle />
            {session.status === "authenticated" &&
            session.data?.user.role &&
            ["super_admin", "admin"].includes(session.data.user.role) ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/markets">Admin</Link>
              </Button>
            ) : session.status === "authenticated" ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">Hesap</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Giriş</Link>
              </Button>
            )}
          </div>
        </div>
        <nav className="hidden border-t md:block">
          <div className={cn(SHELL, "flex items-stretch gap-1")}>
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-2.5 text-sm",
                    active
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="w-full overflow-x-auto border-t bg-white [scrollbar-width:none] dark:bg-background [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-0 px-4 py-1.5 text-xs">
            {(ticker.data?.overview.ticker ?? []).map((item, index) => (
              <Link
                key={item.instrumentId}
                href={`/quote/${item.instrumentId}`}
                className={cn("flex shrink-0 items-center gap-2 px-3 py-1", index > 0 && "border-l")}
              >
                <span className="font-medium">{item.symbol}</span>
                <span className="tabular-nums text-muted-foreground">{formatPrice(item.price, item.currency)}</span>
                <span className={item.changePct >= 0 ? "tabular-nums text-gain" : "tabular-nums text-loss"}>
                  {formatPct(item.changePct)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/40" aria-label="Kapat" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <FinanceLogo />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Kapat">
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="grid gap-1">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-muted" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-muted" onClick={() => setOpen(false)}>
                Giriş
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <main className={cn(SHELL, "min-w-0 py-5")}>{children}</main>
      <footer className="border-t bg-white py-6 text-xs text-muted-foreground dark:bg-background">
        <div className={cn(SHELL, "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between")}>
          <p>
            {SITE_NAME} bağımsız bir piyasa panosudur. Buradaki içerik yatırım tavsiyesi değildir.
          </p>
          <p>Fiyatlar gecikmeli veya gösterge olabilir.</p>
        </div>
      </footer>
    </div>
  );
}
