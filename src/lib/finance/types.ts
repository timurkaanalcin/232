export type InstrumentType = "index" | "stock" | "etf" | "crypto" | "fx" | "commodity";
export type MarketRegion = "us" | "eu" | "asia" | "tr" | "global";
export type ChartRange = "1d" | "5d" | "1mo" | "6mo" | "ytd" | "1y" | "5y" | "max";
export type QuoteSource = "live" | "cache" | "simulated" | "seed" | "admin";

export interface QuoteSnapshot {
  price: number;
  changeAbs: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  source: QuoteSource;
  updatedAt: number;
}

export interface InstrumentSeed {
  id: string;
  symbol: string;
  yahooSymbol: string;
  name: string;
  nameTr: string;
  type: InstrumentType;
  region: MarketRegion;
  exchange: string;
  currency: string;
  sector: string;
  description: string;
  descriptionTr: string;
  basePrice: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  featured?: boolean;
  sortOrder?: number;
}

export interface CandlePoint {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface QuoteDTO {
  instrumentId: string;
  symbol: string;
  yahooSymbol: string;
  name: string;
  nameTr: string;
  type: InstrumentType;
  region: MarketRegion;
  exchange: string;
  currency: string;
  sector: string;
  description: string;
  descriptionTr: string;
  price: number;
  changeAbs: number;
  changePct: number;
  open: number | null;
  high: number | null;
  low: number | null;
  prevClose: number | null;
  volume: number | null;
  marketCap: number | null;
  peRatio: number | null;
  dividendYield: number | null;
  week52High: number | null;
  week52Low: number | null;
  avgVolume: number | null;
  featured: boolean;
  sparkline: number[];
  source: QuoteSource;
  updatedAt: number;
}

export interface NewsDTO {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  imageUrl: string;
  sourceUrl: string;
  ticker: string | null;
  breaking: boolean;
  featured: boolean;
  published: boolean;
  publishedAt: number;
  relatedSymbols: string[];
}

export interface VideoDTO {
  id: string;
  title: string;
  channel: string;
  youtubeId: string;
  duration: string;
  category: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export interface WatchlistItemDTO {
  instrumentId: string;
  symbol: string;
  addedAt: number;
}

export interface MarketOverviewDTO {
  ticker: QuoteDTO[];
  featured: QuoteDTO[];
  gainers: QuoteDTO[];
  losers: QuoteDTO[];
  mostActive: QuoteDTO[];
  news: NewsDTO[];
  videos: VideoDTO[];
}

export const CHART_RANGES: ChartRange[] = ["1d", "5d", "1mo", "6mo", "ytd", "1y", "5y", "max"];

export const MARKET_CATEGORIES = [
  "indexes",
  "stocks",
  "bist",
  "us",
  "europe",
  "asia",
  "currencies",
  "crypto",
  "commodities",
  "etfs",
] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number];
