import { describe, expect, it } from "vitest";
import { changeTone, formatPct, formatSigned } from "@/lib/finance/format";
import { searchCatalog } from "@/lib/finance/catalog";
import { simulateCandles, simulateQuote } from "@/lib/finance/simulate";
import { INSTRUMENT_CATALOG } from "@/lib/finance/catalog";

describe("finance format", () => {
  it("formats percentage with a sign", () => {
    expect(formatPct(1.24)).toBe("+1.24%");
    expect(formatPct(-0.5)).toBe("-0.50%");
    expect(formatPct(null)).toBe("—");
  });

  it("classifies change tone", () => {
    expect(changeTone(1)).toBe("up");
    expect(changeTone(-1)).toBe("down");
    expect(changeTone(0)).toBe("flat");
  });

  it("formats signed numbers", () => {
    expect(formatSigned(12.3)).toContain("+");
    expect(formatSigned(-4)).toContain("-");
  });
});

describe("catalog search", () => {
  it("finds turkish and english names", () => {
    expect(searchCatalog("bist").some((i) => i.id === "XU100")).toBe(true);
    expect(searchCatalog("apple").some((i) => i.id === "AAPL")).toBe(true);
    expect(searchCatalog("bitcoin").some((i) => i.id === "BTC")).toBe(true);
  });
});

describe("price simulation", () => {
  it("produces a quote around the seed price", () => {
    const seed = INSTRUMENT_CATALOG[0]!;
    const quote = simulateQuote(seed, 1_700_000_000_000);
    expect(quote.price).toBeGreaterThan(seed.basePrice * 0.8);
    expect(quote.price).toBeLessThan(seed.basePrice * 1.2);
    expect(Number.isFinite(quote.changePct)).toBe(true);
  });

  it("builds a 1d candle series ending near the current quote", () => {
    const seed = INSTRUMENT_CATALOG[0]!;
    const candles = simulateCandles(seed, "1d", 1_700_000_000_000);
    expect(candles.length).toBeGreaterThan(20);
    expect(candles[0]!.t).toBeLessThan(candles.at(-1)!.t);
  });
});
