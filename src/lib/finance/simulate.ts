import type { CandlePoint, ChartRange, InstrumentSeed, QuoteSnapshot } from "./types";

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unitNoise(seed: string, index: number): number {
  const n = hash32(`${seed}:${index}`);
  return (n / 0xffffffff) * 2 - 1;
}

const RANGE_SPEC: Record<ChartRange, { points: number; stepMs: number; vol: number; drift: number }> = {
  "1d": { points: 78, stepMs: 5 * 60 * 1000, vol: 0.0024, drift: 0.00002 },
  "5d": { points: 130, stepMs: 30 * 60 * 1000, vol: 0.004, drift: 0.00004 },
  "1mo": { points: 30, stepMs: 24 * 60 * 60 * 1000, vol: 0.012, drift: 0.0008 },
  "6mo": { points: 26, stepMs: 7 * 24 * 60 * 60 * 1000, vol: 0.028, drift: 0.002 },
  ytd: { points: 36, stepMs: 7 * 24 * 60 * 60 * 1000, vol: 0.03, drift: 0.0022 },
  "1y": { points: 52, stepMs: 7 * 24 * 60 * 60 * 1000, vol: 0.032, drift: 0.0024 },
  "5y": { points: 60, stepMs: 30 * 24 * 60 * 60 * 1000, vol: 0.055, drift: 0.006 },
  max: { points: 80, stepMs: 45 * 24 * 60 * 60 * 1000, vol: 0.07, drift: 0.008 },
};

export function simulateQuote(seed: InstrumentSeed, now = Date.now()): QuoteSnapshot {
  const bucket = Math.floor(now / 15_000);
  const wave = Math.sin((now / 180_000) + hash32(seed.id) / 1e9);
  const noise = unitNoise(seed.id, bucket) * 0.0035;
  const session = unitNoise(seed.id, Math.floor(now / 86_400_000)) * 0.012;
  const changePct = session + wave * 0.004 + noise;
  const prevClose = seed.basePrice;
  const price = Number((prevClose * (1 + changePct)).toFixed(seed.basePrice < 2 ? 5 : 2));
  const open = Number((prevClose * (1 + session * 0.35)).toFixed(seed.basePrice < 2 ? 5 : 2));
  const digits = seed.basePrice < 2 ? 5 : 2;
  const high = Number((Math.max(price, open, prevClose) * (1 + Math.abs(noise))).toFixed(digits));
  const low = Number((Math.min(price, open, prevClose) * (1 - Math.abs(noise))).toFixed(digits));
  const volume = (seed.avgVolume ?? 1_000_000) * (0.85 + Math.abs(unitNoise(seed.id, bucket + 3)) * 0.4);

  return {
    price,
    changeAbs: price - prevClose,
    changePct: ((price - prevClose) / prevClose) * 100,
    open,
    high,
    low,
    prevClose,
    volume,
    source: "simulated" as const,
    updatedAt: now,
  };
}

export function simulateCandles(seed: InstrumentSeed, range: ChartRange, now = Date.now()): CandlePoint[] {
  const spec = RANGE_SPEC[range];
  const quote = simulateQuote(seed, now);
  const candles: CandlePoint[] = [];
  let price = seed.basePrice * 0.94;

  for (let i = 0; i < spec.points; i += 1) {
    const t = now - (spec.points - i) * spec.stepMs;
    const n = unitNoise(seed.id + range, i);
    const open = price;
    const close = Math.max(0.0001, price * (1 + spec.drift + n * spec.vol));
    const high = Math.max(open, close) * (1 + Math.abs(n) * spec.vol * 0.35);
    const low = Math.min(open, close) * (1 - Math.abs(n) * spec.vol * 0.35);
    const volume = (seed.avgVolume ?? 1_000_000) / spec.points * (0.6 + Math.abs(n));
    candles.push({ t, o: open, h: high, l: low, c: close, v: volume });
    price = close;
  }

  const last = candles[candles.length - 1];
  if (last) {
    last.c = quote.price;
    last.h = Math.max(last.h, quote.price, last.o);
    last.l = Math.min(last.l, quote.price, last.o);
  }
  return candles;
}

export function sparklineFromCandles(candles: CandlePoint[], size = 24): number[] {
  if (candles.length === 0) return [];
  const step = Math.max(1, Math.floor(candles.length / size));
  const points: number[] = [];
  for (let i = 0; i < candles.length; i += step) {
    points.push(candles[i]!.c);
  }
  const last = candles[candles.length - 1]?.c;
  if (last != null && points[points.length - 1] !== last) points.push(last);
  return points.slice(-size);
}
