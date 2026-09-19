"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/client-api";
import type { QuoteDTO } from "@/lib/finance/types";
import { QuoteRow } from "@/modules/finance/quote-row";

export function SearchPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const search = useQuery({
    queryKey: ["search-page", query],
    queryFn: () => apiGet<{ results: QuoteDTO[] }>(`/api/markets/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-medium">Arama</h1>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="AAPL, BIST, USD/TRY, Bitcoin…"
        aria-label="Arama"
        className="h-11 rounded-full bg-secondary px-4"
      />
      <div className="divide-y rounded-lg border bg-white dark:bg-card">
        {(search.data?.results ?? []).map((quote) => (
          <div key={quote.instrumentId} className="px-2">
            <QuoteRow quote={quote} />
          </div>
        ))}
        {query && !search.isFetching && (search.data?.results.length ?? 0) === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Eşleşen enstrüman yok.</p>
        ) : null}
      </div>
    </div>
  );
}
