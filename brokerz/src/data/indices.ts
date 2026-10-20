import type { Instrument } from "@/types";

export const INDEX_INSTRUMENTS: Instrument[] = [
  // US (4)
  { id: "sp500", symbol: "US500", name: "S&P 500 Index", category: "indices", basePrice: 5460.5, volatility: 2.5, digits: 1, contractSize: 1, spread: 30, tvSymbol: "SP:SPX" },
  { id: "nasdaq", symbol: "US100", name: "NASDAQ 100 Index", category: "indices", basePrice: 19250.5, volatility: 8, digits: 1, contractSize: 1, spread: 35, tvSymbol: "NASDAQ:NDX" },
  { id: "djia", symbol: "US30", name: "Dow Jones 30 Index", category: "indices", basePrice: 39875.5, volatility: 15, digits: 1, contractSize: 1, spread: 40, tvSymbol: "DJ:DJI" },
  { id: "vix", symbol: "VIX", name: "Volatility Index", category: "indices", basePrice: 14.5, volatility: 0.5, digits: 2, contractSize: 1, spread: 30, tvSymbol: "TVC:VIX" },

  // US Futures (4)
  { id: "sp500_fut", symbol: "US500.f", name: "S&P 500 Futures", category: "indices", basePrice: 5455.0, volatility: 3.0, digits: 1, contractSize: 1, spread: 35, tvSymbol: "CME:ES1!" },
  { id: "nasdaq_fut", symbol: "US100.f", name: "NASDAQ 100 Futures", category: "indices", basePrice: 19280.0, volatility: 10, digits: 1, contractSize: 1, spread: 40, tvSymbol: "CME:NQ1!" },
  { id: "dow_fut", symbol: "US30.f", name: "Dow Jones Futures", category: "indices", basePrice: 39850.0, volatility: 18, digits: 1, contractSize: 1, spread: 45, tvSymbol: "CBOT:YM1!" },
  { id: "russell_fut", symbol: "US2000.f", name: "Russell 2000 Futures", category: "indices", basePrice: 2055.0, volatility: 4, digits: 1, contractSize: 1, spread: 40, tvSymbol: "CME:RTY1!" },

  // Europe (10)
  { id: "ger40", symbol: "GER40", name: "DAX 40 Index", category: "indices", basePrice: 18420.5, volatility: 6, digits: 1, contractSize: 1, spread: 35, tvSymbol: "XETR:DAX" },
  { id: "uk100", symbol: "UK100", name: "FTSE 100 Index", category: "indices", basePrice: 8120.5, volatility: 3, digits: 1, contractSize: 1, spread: 30, tvSymbol: "TVC:UKX" },
  { id: "fra40", symbol: "FRA40", name: "CAC 40 Index", category: "indices", basePrice: 7635.0, volatility: 4, digits: 1, contractSize: 1, spread: 35, tvSymbol: "EURONEXT:PX1" },
  { id: "esp35", symbol: "ESP35", name: "IBEX 35 Index", category: "indices", basePrice: 11250.0, volatility: 5, digits: 1, contractSize: 1, spread: 40, tvSymbol: "BME:IBEX35" },
  { id: "ita40", symbol: "ITA40", name: "FTSE MIB Index", category: "indices", basePrice: 33150.0, volatility: 8, digits: 1, contractSize: 1, spread: 40, tvSymbol: "FTSE:MIB" },
  { id: "neth25", symbol: "NETH25", name: "AEX 25 Index", category: "indices", basePrice: 915.0, volatility: 2, digits: 1, contractSize: 1, spread: 30, tvSymbol: "EURONEXT:AEX" },
  { id: "swi20", symbol: "SWI20", name: "SMI 20 Index", category: "indices", basePrice: 12050.0, volatility: 5, digits: 1, contractSize: 1, spread: 35, tvSymbol: "SIX:SMI" },
  { id: "eurostoxx", symbol: "EU50", name: "Euro Stoxx 50 Index", category: "indices", basePrice: 4950.0, volatility: 3, digits: 1, contractSize: 1, spread: 30, tvSymbol: "XETR:EUN50" },
  { id: "bel20", symbol: "BEL20", name: "BEL 20 Index", category: "indices", basePrice: 3985.0, volatility: 2, digits: 1, contractSize: 1, spread: 30, tvSymbol: "EURONEXT:BEL20" },
  { id: "port20", symbol: "PRT20", name: "PSI 20 Index", category: "indices", basePrice: 6285.0, volatility: 3, digits: 1, contractSize: 1, spread: 35, tvSymbol: "EURONEXT:PSI20" },

  // Europe Futures (4)
  { id: "dax_fut", symbol: "GER40.f", name: "DAX 40 Futures", category: "indices", basePrice: 18415.0, volatility: 7, digits: 1, contractSize: 1, spread: 40, tvSymbol: "EUREX:FDX1!" },
  { id: "ftse_fut", symbol: "UK100.f", name: "FTSE 100 Futures", category: "indices", basePrice: 8115.0, volatility: 4, digits: 1, contractSize: 1, spread: 35, tvSymbol: "ICE:ZF1!" },
  { id: "cac_fut", symbol: "FRA40.f", name: "CAC 40 Futures", category: "indices", basePrice: 7630.0, volatility: 5, digits: 1, contractSize: 1, spread: 40, tvSymbol: "EURONEXT:FCE1!" },
  { id: "estoxx_fut", symbol: "EU50.f", name: "Euro Stoxx 50 Futures", category: "indices", basePrice: 4945.0, volatility: 4, digits: 1, contractSize: 1, spread: 35, tvSymbol: "EUREX:FESX1!" },

  // Asia-Pacific (8)
  { id: "jpn225", symbol: "JPN225", name: "Nikkei 225 Index", category: "indices", basePrice: 38550.0, volatility: 12, digits: 1, contractSize: 1, spread: 45, tvSymbol: "TVC:NI225" },
  { id: "hkg50", symbol: "HKG50", name: "Hang Seng Index", category: "indices", basePrice: 17850.0, volatility: 8, digits: 1, contractSize: 1, spread: 45, tvSymbol: "HSI:HSI" },
  { id: "aus200", symbol: "AUS200", name: "ASX 200 Index", category: "indices", basePrice: 7750.0, volatility: 4, digits: 1, contractSize: 1, spread: 35, tvSymbol: "ASX:XJO" },
  { id: "chn50", symbol: "CHN50", name: "China A50 Index", category: "indices", basePrice: 12350.0, volatility: 6, digits: 1, contractSize: 1, spread: 45, tvSymbol: "SGX:XIN9" },
  { id: "kor200", symbol: "KOR200", name: "KOSPI 200 Index", category: "indices", basePrice: 365.0, volatility: 2, digits: 1, contractSize: 1, spread: 40, tvSymbol: "TVC:KOSPI200" },
  { id: "sgd30", symbol: "SGD30", name: "STI 30 Index", category: "indices", basePrice: 3325.0, volatility: 2, digits: 1, contractSize: 1, spread: 35, tvSymbol: "SGX:STI" },
  { id: "ind50", symbol: "IND50", name: "Nifty 50 Index", category: "indices", basePrice: 24850.0, volatility: 8, digits: 1, contractSize: 1, spread: 40, tvSymbol: "NSE:NIFTY" },
  { id: "twn50", symbol: "TWN50", name: "Taiwan Weighted Index", category: "indices", basePrice: 22850.0, volatility: 6, digits: 1, contractSize: 1, spread: 40, tvSymbol: "TVC:IXTWSE" },

  // Borsa Istanbul (5)
  { id: "tru100", symbol: "TRU100", name: "BIST 100 Index", category: "indices", basePrice: 9850.0, volatility: 15, digits: 1, contractSize: 1, spread: 60, tvSymbol: "BIST:XU100" },
  { id: "tru30", symbol: "TRU30", name: "BIST 30 Index", category: "indices", basePrice: 11250.0, volatility: 18, digits: 1, contractSize: 1, spread: 65, tvSymbol: "BIST:XU030" },
  { id: "trbank", symbol: "TRBANK", name: "BIST Banks Index", category: "indices", basePrice: 14250.0, volatility: 25, digits: 1, contractSize: 1, spread: 70, tvSymbol: "BIST:XBANK" },
  { id: "trfin", symbol: "TRFIN", name: "BIST Financials Index", category: "indices", basePrice: 11250.0, volatility: 20, digits: 1, contractSize: 1, spread: 65, tvSymbol: "BIST:XUMAL" },
  { id: "trind", symbol: "TRIND", name: "BIST Industry Index", category: "indices", basePrice: 13250.0, volatility: 20, digits: 1, contractSize: 1, spread: 65, tvSymbol: "BIST:XUSIN" },

  // Commodity Indices (3)
  { id: "dxy", symbol: "DXY", name: "US Dollar Index", category: "indices", basePrice: 105.25, volatility: 0.2, digits: 2, contractSize: 1, spread: 25, tvSymbol: "TVC:DXY" },
  { id: "vix_short", symbol: "VIXS", name: "VIX Short-Term Futures", category: "indices", basePrice: 15.5, volatility: 0.5, digits: 2, contractSize: 1, spread: 35, tvSymbol: "CBOE:VIX1!" },
  { id: "move", symbol: "MOVE", name: "MOVE Bond Volatility Index", category: "indices", basePrice: 102.5, volatility: 2, digits: 2, contractSize: 1, spread: 40, tvSymbol: "TVC:MOVE" },
];
