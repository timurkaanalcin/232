import type { Instrument } from "@/types";

export const BOND_INSTRUMENTS: Instrument[] = [
  { id: "de10y", symbol: "DE10Y", name: "German 10-Year Bond (Bund)", category: "bonds", basePrice: 102.45, volatility: 0.08, digits: 2, contractSize: 1000, spread: 15, tvSymbol: "TVC:DE10Y" },
  { id: "us10y", symbol: "US10Y", name: "US 10-Year Treasury Note", category: "bonds", basePrice: 98.75, volatility: 0.06, digits: 2, contractSize: 1000, spread: 15, tvSymbol: "TVC:US10Y" },
  { id: "us30y", symbol: "US30Y", name: "US 30-Year Treasury Bond", category: "bonds", basePrice: 95.5, volatility: 0.08, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:US30Y" },
  { id: "us02y", symbol: "US02Y", name: "US 2-Year Treasury Note", category: "bonds", basePrice: 100.25, volatility: 0.04, digits: 2, contractSize: 1000, spread: 12, tvSymbol: "TVC:US02Y" },
  { id: "us05y", symbol: "US05Y", name: "US 5-Year Treasury Note", category: "bonds", basePrice: 99.5, volatility: 0.05, digits: 2, contractSize: 1000, spread: 14, tvSymbol: "TVC:US05Y" },
  { id: "uk10y", symbol: "UK10Y", name: "UK 10-Year Gilt", category: "bonds", basePrice: 99.25, volatility: 0.07, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:UK10Y" },
  { id: "jp10y", symbol: "JP10Y", name: "Japan 10-Year JGB", category: "bonds", basePrice: 101.5, volatility: 0.05, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:JP10Y" },
  { id: "tr10y", symbol: "TR10Y", name: "Turkey 10-Year Bond", category: "bonds", basePrice: 88.5, volatility: 0.15, digits: 2, contractSize: 1000, spread: 25, tvSymbol: "TVC:TR10Y" },
  { id: "fr10y", symbol: "FR10Y", name: "French 10-Year OAT", category: "bonds", basePrice: 101.25, volatility: 0.06, digits: 2, contractSize: 1000, spread: 16, tvSymbol: "TVC:FR10Y" },
  { id: "it10y", symbol: "IT10Y", name: "Italy 10-Year BTP", category: "bonds", basePrice: 96.5, volatility: 0.1, digits: 2, contractSize: 1000, spread: 20, tvSymbol: "TVC:IT10Y" },
  { id: "es10y", symbol: "ES10Y", name: "Spain 10-Year Bonos", category: "bonds", basePrice: 97.25, volatility: 0.08, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:ES10Y" },
  { id: "nl10y", symbol: "NL10Y", name: "Netherlands 10-Year DSL", category: "bonds", basePrice: 101.75, volatility: 0.06, digits: 2, contractSize: 1000, spread: 16, tvSymbol: "TVC:NL10Y" },
  { id: "be10y", symbol: "BE10Y", name: "Belgium 10-Year OLO", category: "bonds", basePrice: 98.5, volatility: 0.07, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:BE10Y" },
  { id: "ca10y", symbol: "CA10Y", name: "Canada 10-Year Bond", category: "bonds", basePrice: 99.5, volatility: 0.06, digits: 2, contractSize: 1000, spread: 16, tvSymbol: "TVC:CA10Y" },
  { id: "au10y", symbol: "AU10Y", name: "Australia 10-Year Bond", category: "bonds", basePrice: 96.5, volatility: 0.07, digits: 2, contractSize: 1000, spread: 18, tvSymbol: "TVC:AU10Y" },
];
