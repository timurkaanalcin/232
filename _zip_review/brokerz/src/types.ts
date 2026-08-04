export type Direction = "buy" | "sell";

export type AssetClass = "forex" | "commodities" | "crypto" | "indices" | "stocks" | "bonds";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category: AssetClass;
  basePrice: number;
  volatility: number;
  digits: number;
  contractSize: number;
  spread: number; // in points
  tvSymbol: string; // TradingView symbol (e.g. "FX:EURUSD", "NASDAQ:AAPL")
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Tick {
  bid: number;
  ask: number;
  time: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: Direction;
  volume: number;
  openPrice: number;
  openTime: number;
  sl: number | null;
  tp: number | null;
  swap: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: Direction;
  volume: number;
  price: number;
  openTime: number;
  status: "pending";
  sl: number | null;
  tp: number | null;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: Direction;
  volume: number;
  openPrice: number;
  closePrice: number;
  openTime: number;
  closeTime: number;
  profit: number;
  swap: number;
}

export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1";

export type AccountType = "classic" | "raw" | "tvraw";

export interface AccountInfo {
  type: AccountType;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  currency: string;
  name: string;
  number: string;
}
