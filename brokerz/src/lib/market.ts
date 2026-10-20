import type { Instrument, Candle, Tick } from "@/types";

export function generateInitialCandles(inst: Instrument, count: number): Candle[] {
  const candles: Candle[] = [];
  let price = inst.basePrice;
  const now = Date.now();
  const interval = 5000; // 5s per candle (M5 feel)

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const drift = (Math.random() - 0.5) * 2 * inst.volatility;
    const close = Math.max(open + drift, inst.basePrice * 0.3);
    const high = Math.max(open, close) + Math.random() * inst.volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * inst.volatility * 0.5;
    candles.push({ time: now - i * interval, open, high, low, close });
    price = close;
  }
  return candles;
}

export function nextCandle(inst: Instrument, prevClose: number): Candle {
  const drift = (Math.random() - 0.5) * 2 * inst.volatility;
  const close = Math.max(prevClose + drift, inst.basePrice * 0.3);
  const open = prevClose;
  const high = Math.max(open, close) + Math.random() * inst.volatility * 0.5;
  const low = Math.min(open, close) - Math.random() * inst.volatility * 0.5;
  return { time: Date.now(), open, high, low, close };
}

export function tickCandle(candle: Candle, inst: Instrument): Candle {
  const drift = (Math.random() - 0.5) * 2 * inst.volatility * 0.3;
  const close = Math.max(candle.close + drift, inst.basePrice * 0.3);
  return {
    ...candle,
    close,
    high: Math.max(candle.high, close),
    low: Math.min(candle.low, close),
  };
}

export function getBidAsk(price: number, inst: Instrument): Tick {
  const halfSpread = inst.spread * Math.pow(10, -inst.digits) / 2;
  return {
    bid: price - halfSpread,
    ask: price + halfSpread,
    time: Date.now(),
  };
}

export function formatPrice(price: number, digits: number): string {
  return price.toFixed(digits);
}

// Calculate profit for a position
export function calcProfit(
  type: "buy" | "sell",
  volume: number,
  openPrice: number,
  currentPrice: number,
  inst: Instrument
): number {
  const point = Math.pow(10, -inst.digits);
  const diff =
    type === "buy"
      ? (currentPrice - openPrice) / point
      : (openPrice - currentPrice) / point;
  return diff * volume * (inst.contractSize * point / point) * point * inst.contractSize / (inst.contractSize * point);
}

// Simplified profit: (priceDiff / point) * volume * contractSize * point
export function calcProfitSimple(
  type: "buy" | "sell",
  volume: number,
  openPrice: number,
  currentPrice: number,
  inst: Instrument
): number {
  const priceDiff = type === "buy" ? currentPrice - openPrice : openPrice - currentPrice;
  return (priceDiff / openPrice) * volume * 100000 * (openPrice > 100 ? 0.01 : 1) * 0.01 + priceDiff * volume * inst.contractSize * 0.00001 * 100;
}

// Clean profit calculation
export function calcPnL(
  type: "buy" | "sell",
  volume: number,
  openPrice: number,
  currentPrice: number,
  inst: Instrument
): number {
  const priceDiff = type === "buy" ? currentPrice - openPrice : openPrice - currentPrice;
  // For forex: profit = priceDiff * contractSize * volume
  // For others: same formula works as a general approximation
  return priceDiff * inst.contractSize * volume;
}
