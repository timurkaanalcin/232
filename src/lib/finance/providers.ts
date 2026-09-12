import type { CandlePoint, ChartRange } from "./types";

interface YahooChartResult {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        currency?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
}

const RANGE_QUERY: Record<ChartRange, { range: string; interval: string }> = {
  "1d": { range: "1d", interval: "5m" },
  "5d": { range: "5d", interval: "30m" },
  "1mo": { range: "1mo", interval: "1d" },
  "6mo": { range: "6mo", interval: "1d" },
  ytd: { range: "ytd", interval: "1d" },
  "1y": { range: "1y", interval: "1d" },
  "5y": { range: "5y", interval: "1wk" },
  max: { range: "10y", interval: "1mo" },
};

async function fetchJson<T>(url: string, timeoutMs = 4000): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Borsahatti/1.0 (market-data; +https://borsahatti.local)",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchYahooChart(
  yahooSymbol: string,
  range: ChartRange = "1d",
): Promise<{ price: number; prevClose: number; candles: CandlePoint[] } | null> {
  const q = RANGE_QUERY[range];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooSymbol,
  )}?range=${q.range}&interval=${q.interval}&includePrePost=false`;
  const data = await fetchJson<YahooChartResult>(url);
  const result = data?.chart?.result?.[0];
  if (!result?.timestamp?.length) return null;

  const quote = result.indicators?.quote?.[0];
  const candles: CandlePoint[] = [];
  for (let i = 0; i < result.timestamp.length; i += 1) {
    const close = quote?.close?.[i];
    if (close == null) continue;
    candles.push({
      t: result.timestamp[i]! * 1000,
      o: quote?.open?.[i] ?? close,
      h: quote?.high?.[i] ?? close,
      l: quote?.low?.[i] ?? close,
      c: close,
      v: quote?.volume?.[i] ?? 0,
    });
  }
  if (candles.length === 0) return null;
  const price = result.meta?.regularMarketPrice ?? candles[candles.length - 1]!.c;
  const prevClose = result.meta?.previousClose ?? result.meta?.chartPreviousClose ?? candles[0]!.o;
  return { price, prevClose, candles };
}

export async function fetchCoinGeckoSimple(): Promise<Record<string, { usd: number; usd_24h_change: number }> | null> {
  return fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true",
  );
}

export async function fetchFrankfurterRates(): Promise<Record<string, number> | null> {
  const data = await fetchJson<{ rates?: Record<string, number> }>(
    "https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP,JPY",
  );
  return data?.rates ?? null;
}
