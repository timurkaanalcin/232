import type { Instrument } from "@/types";

const mk = (
  id: string, symbol: string, name: string, basePrice: number,
  volatility: number, spread: number, exchange: string,
): Instrument => ({
  id, symbol, name, category: "stocks", basePrice, volatility,
  digits: 2, contractSize: 1, spread, tvSymbol: `${exchange}:${symbol}`,
});

export const ETF_INSTRUMENTS: Instrument[] = [
  // US Broad Market (10)
  mk("spy", "SPY", "SPDR S&P 500 ETF", 545.0, 1.0, 15, "AMEX"),
  mk("qqq", "QQQ", "Invesco QQQ Trust (NASDAQ 100)", 465.0, 1.5, 15, "NASDAQ"),
  mk("iwm", "IWM", "iShares Russell 2000 ETF", 205.0, 1.0, 15, "AMEX"),
  mk("voo", "VOO", "Vanguard S&P 500 ETF", 495.0, 1.0, 15, "AMEX"),
  mk("vti", "VTI", "Vanguard Total Stock Market ETF", 285.0, 0.6, 15, "AMEX"),
  mk("schd", "SCHD", "Schwab US Dividend ETF", 78.5, 0.2, 15, "AMEX"),
  mk("vym", "VYM", "Vanguard High Dividend Yield ETF", 125.0, 0.3, 15, "AMEX"),
  mk("mgk", "MGK", "Vanguard Mega Cap Growth ETF", 285.0, 0.6, 15, "AMEX"),
  mk("rpg", "RPG", "Invesco S&P 500 Pure Growth", 185.0, 0.4, 18, "AMEX"),
  mk("rpv", "RPV", "Invesco S&P 500 Pure Value", 165.0, 0.4, 18, "AMEX"),

  // Sector ETFs (15)
  mk("xlf", "XLF", "Financial Select Sector SPDR", 42.5, 0.15, 15, "AMEX"),
  mk("xle", "XLE", "Energy Select Sector SPDR", 92.5, 0.25, 15, "AMEX"),
  mk("xlk", "XLK", "Technology Select Sector SPDR", 225.0, 0.5, 15, "AMEX"),
  mk("xlv", "XLV", "Health Care Select Sector SPDR", 145.0, 0.3, 15, "AMEX"),
  mk("xli", "XLI", "Industrial Select Sector SPDR", 135.0, 0.3, 15, "AMEX"),
  mk("xly", "XLY", "Consumer Discretionary SPDR", 185.0, 0.4, 15, "AMEX"),
  mk("xlp", "XLP", "Consumer Staples Select SPDR", 78.5, 0.2, 15, "AMEX"),
  mk("xlu", "XLU", "Utilities Select Sector SPDR", 72.5, 0.2, 15, "AMEX"),
  mk("xlre", "XLRE", "Real Estate Select Sector SPDR", 42.5, 0.15, 15, "AMEX"),
  mk("xlb", "XLB", "Materials Select Sector SPDR", 88.5, 0.25, 15, "AMEX"),
  mk("xlc", "XLC", "Communication Services SPDR", 78.5, 0.2, 15, "AMEX"),
  mk("xme", "XME", "SPDR S&P Metals & Mining ETF", 68.5, 0.2, 15, "AMEX"),
  mk("kbe", "KBE", "SPDR S&P Bank ETF", 48.5, 0.15, 15, "AMEX"),
  mk("kre", "KRE", "SPDR S&P Regional Banking ETF", 52.5, 0.15, 15, "AMEX"),
  mk("iai", "IAI", "iShares US Broker-Dealers ETF", 48.5, 0.15, 15, "AMEX"),

  // International / Regional (10)
  mk("vgk", "VGK", "Vanguard FTSE Europe ETF", 62.5, 0.2, 18, "AMEX"),
  mk("ewg", "EWG", "iShares MSCI Germany ETF", 28.5, 0.1, 18, "AMEX"),
  mk("ewq", "EWQ", "iShares MSCI France ETF", 32.5, 0.1, 18, "AMEX"),
  mk("ewu", "EWU", "iShares MSCI United Kingdom ETF", 32.5, 0.1, 18, "AMEX"),
  mk("ewj", "EWJ", "iShares MSCI Japan ETF", 68.5, 0.2, 18, "AMEX"),
  mk("ewy", "EWY", "iShares MSCI South Korea ETF", 58.5, 0.2, 18, "AMEX"),
  mk("ewz", "EWZ", "iShares MSCI Brazil ETF", 32.5, 0.1, 18, "AMEX"),
  mk("ewh", "EWH", "iShares MSCI Hong Kong ETF", 22.5, 0.05, 18, "AMEX"),
  mk("ewi", "EWI", "iShares MSCI Italy ETF", 32.5, 0.1, 18, "AMEX"),
  mk("ewp", "EWP", "iShares MSCI Spain ETF", 32.5, 0.1, 18, "AMEX"),

  // Emerging Markets (8)
  mk("eem", "EEM", "iShares MSCI Emerging Markets ETF", 42.5, 0.15, 18, "AMEX"),
  mk("vwo", "VWO", "Vanguard Emerging Markets ETF", 48.5, 0.15, 18, "AMEX"),
  mk("tur", "TUR", "iShares MSCI Turkey ETF", 42.5, 0.15, 20, "AMEX"),
  mk("indl", "INDL", "Direxion Nifty India Bull 2X", 28.5, 0.1, 20, "AMEX"),
  mk("ashr", "ASHR", "Xtrackers Harvest CSI 300 China", 28.5, 0.1, 18, "AMEX"),
  mk("mchi", "MCHI", "iShares MSCI China ETF", 52.5, 0.15, 18, "AMEX"),
  mk("emxc", "EMXC", "iShares Core MSCI EM IMI", 68.5, 0.2, 18, "AMEX"),
  mk("flkr", "FLKR", "Franklin FTSE South Korea ETF", 32.5, 0.1, 18, "AMEX"),

  // Thematic / Growth (12)
  mk("arkk", "ARKK", "ARK Innovation ETF", 48.5, 0.5, 18, "AMEX"),
  mk("arkg", "ARKG", "ARK Genomic Revolution ETF", 28.5, 0.1, 18, "AMEX"),
  mk("arkf", "ARKF", "ARK Fintech Innovation ETF", 48.5, 0.15, 18, "AMEX"),
  mk("arkw", "ARKW", "ARK Next Generation Internet", 48.5, 0.15, 18, "AMEX"),
  mk("arkq", "ARKQ", "ARK Autonomous Technology", 48.5, 0.15, 18, "AMEX"),
  mk("finx", "FINX", "Global X FinTech ETF", 22.5, 0.05, 18, "NASDAQ"),
  mk("pbw", "PBW", "Invesco WilderHill Clean Energy", 32.5, 0.1, 18, "AMEX"),
  mk("icln", "ICLN", "iShares Global Clean Energy ETF", 18.5, 0.05, 18, "NASDAQ"),
  mk("tan", "TAN", "Invesco Solar ETF", 68.5, 0.2, 18, "AMEX"),
  mk("fonm", "FANM", "Global X US Infrastructure Dev", 32.5, 0.1, 18, "NASDAQ"),
  mk("soxx", "SOXX", "iShares Semiconductor ETF", 225.0, 0.5, 18, "NASDAQ"),
  mk("smh", "SMH", "VanEck Semiconductor ETF", 245.0, 0.5, 18, "AMEX"),

  // Commodity / Gold / Bond ETFs (10)
  mk("gld", "GLD", "SPDR Gold Shares", 235.0, 0.5, 18, "AMEX"),
  mk("iau", "IAU", "iShares Gold Trust", 48.5, 0.15, 15, "AMEX"),
  mk("slv", "SLV", "iShares Silver Trust", 22.5, 0.05, 15, "AMEX"),
  mk("uso", "USO", "United States Oil Fund", 78.5, 0.2, 18, "AMEX"),
  mk("ung", "UNG", "United States Natural Gas Fund", 22.5, 0.05, 18, "AMEX"),
  mk("agq", "AGQ", "ProShares Ultra Silver", 32.5, 0.1, 20, "AMEX"),
  mk("tlt", "TLT", "iShares 20+ Year Treasury Bond", 92.5, 0.25, 15, "AMEX"),
  mk("ief", "IEF", "iShares 7-10 Year Treasury Bond", 98.5, 0.2, 15, "AMEX"),
  mk("shy", "SHY", "iShares 1-3 Year Treasury Bond", 82.5, 0.15, 15, "AMEX"),
  mk("hyg", "HYG", "iShares High Yield Corp Bond", 48.5, 0.15, 15, "AMEX"),
];
