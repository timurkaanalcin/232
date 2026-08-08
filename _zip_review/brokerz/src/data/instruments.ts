import type { Instrument, AccountType } from "@/types";
import { FOREX_INSTRUMENTS } from "@/data/forex";
import { COMMODITY_INSTRUMENTS } from "@/data/commodities";
import { CRYPTO_INSTRUMENTS } from "@/data/crypto";
import { INDEX_INSTRUMENTS } from "@/data/indices";
import { BOND_INSTRUMENTS } from "@/data/bonds";
import { US_STOCKS } from "@/data/stocks-us";
import { EU_STOCKS } from "@/data/stocks-eu";
import { TR_STOCKS } from "@/data/stocks-tr";
import { ASIA_STOCKS } from "@/data/stocks-asia";
import { ETF_INSTRUMENTS } from "@/data/etfs";

const RAW_INSTRUMENTS: Instrument[] = [
  ...FOREX_INSTRUMENTS,
  ...COMMODITY_INSTRUMENTS,
  ...CRYPTO_INSTRUMENTS,
  ...INDEX_INSTRUMENTS,
  ...BOND_INSTRUMENTS,
  ...US_STOCKS,
  ...EU_STOCKS,
  ...TR_STOCKS,
  ...ASIA_STOCKS,
  ...ETF_INSTRUMENTS,
];

/** First occurrence wins — avoids duplicate React keys / tick map collisions. */
export const INSTRUMENTS: Instrument[] = (() => {
  const seen = new Set<string>();
  return RAW_INSTRUMENTS.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
})();

export const CATEGORY_LABELS: Record<string, string> = {
  forex: "Forex",
  commodities: "Commodities",
  crypto: "Cryptocurrencies",
  indices: "Stock Indices",
  stocks: "Stocks & ETFs",
  bonds: "Bonds",
};

export const CATEGORY_META: Record<string, { label: string; desc: string; icon: string }> = {
  forex: { label: "Forex", desc: "80+ currency pairs & metals", icon: "ArrowLeftRight" },
  commodities: { label: "Commodities", desc: "50+ metals, energies, agriculture", icon: "Coins" },
  crypto: { label: "Cryptocurrencies", desc: "60+ cryptocurrencies", icon: "Bitcoin" },
  indices: { label: "Stock Indices", desc: "30+ global indices incl. BIST", icon: "BarChart3" },
  stocks: { label: "Stocks and ETFs", desc: "400+ US, EU, UK, Asia & Borsa Istanbul", icon: "Building2" },
  bonds: { label: "Bonds", desc: "Government bonds", icon: "Landmark" },
};

/** Tek hesap kategorisi — Classic / RAW farkı yok, tüm hesaplar aynı koşullar. */
export const UNIFIED_ACCOUNT = {
  name: "USBANK ACCOUNT",
  deposit: 100,
  currencies: ["USD", "EUR", "GBP", "ZAR"],
  leverage: "1:1000",
  commission: "Zero Commissions",
  spreads: "0.0 pips",
  platforms: ["MT4", "MT5", "TradingView", "WebTrader"],
  blurb: "Exceptional conditions on every CFD trading account — one category, same pricing for all traders.",
};

export const ACCOUNT_TYPES: {
  id: AccountType;
  name: string;
  deposit: number;
  currencies: string[];
  leverage: string;
  commission: string;
  highlight?: boolean;
}[] = [
  { id: "classic", name: "USBANK", deposit: 100, currencies: ["USD", "EUR", "GBP", "ZAR"], leverage: "1:1000", commission: "Zero Commissions", highlight: true },
  { id: "raw", name: "USBANK", deposit: 100, currencies: ["USD", "EUR", "GBP", "ZAR"], leverage: "1:1000", commission: "Zero Commissions" },
  { id: "tvraw", name: "USBANK", deposit: 100, currencies: ["USD", "EUR", "GBP", "ZAR"], leverage: "1:1000", commission: "Zero Commissions" },
];

export function formatPrice(price: number, digits: number): string {
  return price.toFixed(digits);
}

export function getInstrument(id: string): Instrument {
  return INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0];
}
