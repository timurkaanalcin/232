"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiDelete, apiGet } from "@/lib/client-api";
import { DEFAULT_WATCHLIST } from "@/lib/finance/catalog";
import type { QuoteDTO } from "@/lib/finance/types";
import { QuoteRow } from "@/modules/finance/quote-row";
import { Button } from "@/components/ui/button";

const LOCAL_KEY = "borsahatti_watchlist";

export function WatchlistPage() {
  const [local, setLocal] = useState<string[]>(DEFAULT_WATCHLIST);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        setLocal(JSON.parse(raw) as string[]);
      } catch {
        setLocal(DEFAULT_WATCHLIST);
      }
    }
  }, []);

  const query = useQuery({
    queryKey: ["watchlist", local.join(",")],
    queryFn: () =>
      apiGet<{ quotes: QuoteDTO[]; authenticated: boolean }>(`/api/watchlist?symbols=${encodeURIComponent(local.join(","))}`),
    refetchInterval: 20_000,
  });
  const quotes = query.data?.quotes ?? [];

  async function remove(symbol: string) {
    try {
      await apiDelete(`/api/watchlist/${encodeURIComponent(symbol)}`);
      void query.refetch();
    } catch {
      const next = local.filter((item) => item !== symbol);
      setLocal(next);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">İzleme listesi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Giriş yaptıysanız liste hesabınıza yazılır. Aksi halde tarayıcınızda saklanır.
        </p>
      </div>
      <div className="rounded-xl border bg-white p-3 dark:bg-card">
        {quotes.map((quote) => (
          <div key={quote.instrumentId} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <QuoteRow quote={quote} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => void remove(quote.instrumentId)}>
              Kaldır
            </Button>
          </div>
        ))}
        {quotes.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Liste boş. Bir sembol sayfasından ekleyin.</p> : null}
      </div>
    </div>
  );
}
