import type { Instrument } from "@/types";

export const FOREX_INSTRUMENTS: Instrument[] = [
  // Majors (8)
  { id: "eurusd", symbol: "EURUSD", name: "Euro vs US Dollar", category: "forex", basePrice: 1.0875, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 12, tvSymbol: "FX:EURUSD" },
  { id: "gbpusd", symbol: "GBPUSD", name: "Pound vs US Dollar", category: "forex", basePrice: 1.2712, volatility: 0.0005, digits: 5, contractSize: 100000, spread: 18, tvSymbol: "FX:GBPUSD" },
  { id: "usdjpy", symbol: "USDJPY", name: "US Dollar vs Japanese Yen", category: "forex", basePrice: 156.42, volatility: 0.06, digits: 3, contractSize: 100000, spread: 10, tvSymbol: "FX:USDJPY" },
  { id: "usdchf", symbol: "USDCHF", name: "US Dollar vs Swiss Franc", category: "forex", basePrice: 0.9015, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 15, tvSymbol: "FX:USDCHF" },
  { id: "audusd", symbol: "AUDUSD", name: "Australian Dollar vs US Dollar", category: "forex", basePrice: 0.6585, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 14, tvSymbol: "FX:AUDUSD" },
  { id: "usdcad", symbol: "USDCAD", name: "US Dollar vs Canadian Dollar", category: "forex", basePrice: 1.372, volatility: 0.0005, digits: 5, contractSize: 100000, spread: 16, tvSymbol: "FX:USDCAD" },
  { id: "nzdusd", symbol: "NZDUSD", name: "New Zealand Dollar vs US Dollar", category: "forex", basePrice: 0.6012, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 18, tvSymbol: "FX:NZDUSD" },
  { id: "usdcnh", symbol: "USDCNH", name: "US Dollar vs Chinese Yuan", category: "forex", basePrice: 7.245, volatility: 0.003, digits: 4, contractSize: 100000, spread: 30, tvSymbol: "FX:USDCNH" },

  // EUR Crosses (12)
  { id: "eurjpy", symbol: "EURJPY", name: "Euro vs Japanese Yen", category: "forex", basePrice: 170.15, volatility: 0.07, digits: 3, contractSize: 100000, spread: 20, tvSymbol: "FX:EURJPY" },
  { id: "eurgbp", symbol: "EURGBP", name: "Euro vs British Pound", category: "forex", basePrice: 0.8555, volatility: 0.0003, digits: 5, contractSize: 100000, spread: 18, tvSymbol: "FX:EURGBP" },
  { id: "eurchf", symbol: "EURCHF", name: "Euro vs Swiss Franc", category: "forex", basePrice: 0.9805, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 20, tvSymbol: "FX:EURCHF" },
  { id: "eurcad", symbol: "EURCAD", name: "Euro vs Canadian Dollar", category: "forex", basePrice: 1.491, volatility: 0.0006, digits: 5, contractSize: 100000, spread: 22, tvSymbol: "FX:EURCAD" },
  { id: "euraud", symbol: "EURAUD", name: "Euro vs Australian Dollar", category: "forex", basePrice: 1.651, volatility: 0.0007, digits: 5, contractSize: 100000, spread: 25, tvSymbol: "FX:EURAUD" },
  { id: "eurnzd", symbol: "EURNZD", name: "Euro vs New Zealand Dollar", category: "forex", basePrice: 1.8075, volatility: 0.0008, digits: 5, contractSize: 100000, spread: 28, tvSymbol: "FX:EURNZD" },
  { id: "eursek", symbol: "EURSEK", name: "Euro vs Swedish Krona", category: "forex", basePrice: 11.542, volatility: 0.005, digits: 3, contractSize: 100000, spread: 40, tvSymbol: "FX:EURSEK" },
  { id: "eurnok", symbol: "EURNOK", name: "Euro vs Norwegian Krone", category: "forex", basePrice: 11.785, volatility: 0.005, digits: 3, contractSize: 100000, spread: 40, tvSymbol: "FX:EURNOK" },
  { id: "eurpln", symbol: "EURPLN", name: "Euro vs Polish Zloty", category: "forex", basePrice: 4.378, volatility: 0.002, digits: 3, contractSize: 100000, spread: 45, tvSymbol: "FX:EURPLN" },
  { id: "eurtry", symbol: "EURTRY", name: "Euro vs Turkish Lira", category: "forex", basePrice: 35.28, volatility: 0.06, digits: 3, contractSize: 100000, spread: 90, tvSymbol: "FX:EURTRY" },
  { id: "eurzar", symbol: "EURZAR", name: "Euro vs South African Rand", category: "forex", basePrice: 20.05, volatility: 0.025, digits: 3, contractSize: 100000, spread: 65, tvSymbol: "FX:EURZAR" },
  { id: "eurmxn", symbol: "EURMXN", name: "Euro vs Mexican Peso", category: "forex", basePrice: 20.28, volatility: 0.025, digits: 3, contractSize: 100000, spread: 55, tvSymbol: "FX:EURMXN" },
  { id: "eurhuf", symbol: "EURHUF", name: "Euro vs Hungarian Forint", category: "forex", basePrice: 397.5, volatility: 0.18, digits: 2, contractSize: 100000, spread: 55, tvSymbol: "FX:EURHUF" },

  // GBP Crosses (8)
  { id: "gbpjpy", symbol: "GBPJPY", name: "Pound vs Japanese Yen", category: "forex", basePrice: 198.75, volatility: 0.08, digits: 3, contractSize: 100000, spread: 25, tvSymbol: "FX:GBPJPY" },
  { id: "gbpchf", symbol: "GBPCHF", name: "Pound vs Swiss Franc", category: "forex", basePrice: 1.146, volatility: 0.0005, digits: 5, contractSize: 100000, spread: 25, tvSymbol: "FX:GBPCHF" },
  { id: "gbpcad", symbol: "GBPCAD", name: "Pound vs Canadian Dollar", category: "forex", basePrice: 1.7425, volatility: 0.0007, digits: 5, contractSize: 100000, spread: 28, tvSymbol: "FX:GBPCAD" },
  { id: "gbpaud", symbol: "GBPAUD", name: "Pound vs Australian Dollar", category: "forex", basePrice: 1.9305, volatility: 0.0008, digits: 5, contractSize: 100000, spread: 30, tvSymbol: "FX:GBPAUD" },
  { id: "gbpnzd", symbol: "GBPNZD", name: "Pound vs New Zealand Dollar", category: "forex", basePrice: 2.1135, volatility: 0.0009, digits: 5, contractSize: 100000, spread: 35, tvSymbol: "FX:GBPNZD" },
  { id: "gbptry", symbol: "GBPTRY", name: "Pound vs Turkish Lira", category: "forex", basePrice: 41.22, volatility: 0.08, digits: 3, contractSize: 100000, spread: 100, tvSymbol: "FX:GBPTRY" },
  { id: "gbpzar", symbol: "GBPZAR", name: "Pound vs South African Rand", category: "forex", basePrice: 23.42, volatility: 0.03, digits: 3, contractSize: 100000, spread: 70, tvSymbol: "FX:GBPZAR" },
  { id: "gbpmxn", symbol: "GBPMXN", name: "Pound vs Mexican Peso", category: "forex", basePrice: 23.68, volatility: 0.03, digits: 3, contractSize: 100000, spread: 60, tvSymbol: "FX:GBPMXN" },

  // JPY Crosses (8)
  { id: "audjpy", symbol: "AUDJPY", name: "Australian Dollar vs Japanese Yen", category: "forex", basePrice: 102.95, volatility: 0.05, digits: 3, contractSize: 100000, spread: 22, tvSymbol: "FX:AUDJPY" },
  { id: "cadjpy", symbol: "CADJPY", name: "Canadian Dollar vs Japanese Yen", category: "forex", basePrice: 113.95, volatility: 0.05, digits: 3, contractSize: 100000, spread: 22, tvSymbol: "FX:CADJPY" },
  { id: "chfjpy", symbol: "CHFJPY", name: "Swiss Franc vs Japanese Yen", category: "forex", basePrice: 173.45, volatility: 0.06, digits: 3, contractSize: 100000, spread: 22, tvSymbol: "FX:CHFJPY" },
  { id: "nzdjpy", symbol: "NZDJPY", name: "New Zealand Dollar vs Japanese Yen", category: "forex", basePrice: 94.05, volatility: 0.05, digits: 3, contractSize: 100000, spread: 25, tvSymbol: "FX:NZDJPY" },
  { id: "tryjpy", symbol: "TRYJPY", name: "Turkish Lira vs Japanese Yen", category: "forex", basePrice: 4.825, volatility: 0.01, digits: 3, contractSize: 100000, spread: 60, tvSymbol: "FX:TRYJPY" },
  { id: "zarjpy", symbol: "ZARJPY", name: "South African Rand vs Japanese Yen", category: "forex", basePrice: 8.485, volatility: 0.01, digits: 3, contractSize: 100000, spread: 55, tvSymbol: "FX:ZARJPY" },
  { id: "mxnjpy", symbol: "MXNJPY", name: "Mexican Peso vs Japanese Yen", category: "forex", basePrice: 8.595, volatility: 0.01, digits: 3, contractSize: 100000, spread: 55, tvSymbol: "FX:MXNJPY" },
  { id: "sgdjpy", symbol: "SGDJPY", name: "Singapore Dollar vs Japanese Yen", category: "forex", basePrice: 115.85, volatility: 0.05, digits: 3, contractSize: 100000, spread: 35, tvSymbol: "FX:SGDJPY" },

  // AUD Crosses (5)
  { id: "audcad", symbol: "AUDCAD", name: "Australian Dollar vs Canadian Dollar", category: "forex", basePrice: 0.9035, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 25, tvSymbol: "FX:AUDCAD" },
  { id: "audchf", symbol: "AUDCHF", name: "Australian Dollar vs Swiss Franc", category: "forex", basePrice: 0.5945, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 25, tvSymbol: "FX:AUDCHF" },
  { id: "audnzd", symbol: "AUDNZD", name: "Australian Dollar vs New Zealand Dollar", category: "forex", basePrice: 1.0955, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 28, tvSymbol: "FX:AUDNZD" },
  { id: "audsgd", symbol: "AUDSGD", name: "Australian Dollar vs Singapore Dollar", category: "forex", basePrice: 0.8925, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 30, tvSymbol: "FX:AUDSGD" },
  { id: "audtry", symbol: "AUDTRY", name: "Australian Dollar vs Turkish Lira", category: "forex", basePrice: 21.35, volatility: 0.04, digits: 3, contractSize: 100000, spread: 75, tvSymbol: "FX:AUDTRY" },

  // CAD Crosses (4)
  { id: "cadchf", symbol: "CADCHF", name: "Canadian Dollar vs Swiss Franc", category: "forex", basePrice: 0.6575, volatility: 0.0003, digits: 5, contractSize: 100000, spread: 25, tvSymbol: "FX:CADCHF" },
  { id: "cadsgd", symbol: "CADSGD", name: "Canadian Dollar vs Singapore Dollar", category: "forex", basePrice: 0.9885, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 30, tvSymbol: "FX:CADSGD" },
  { id: "cadtry", symbol: "CADTRY", name: "Canadian Dollar vs Turkish Lira", category: "forex", basePrice: 23.65, volatility: 0.04, digits: 3, contractSize: 100000, spread: 75, tvSymbol: "FX:CADTRY" },
  { id: "cadzar", symbol: "CADZAR", name: "Canadian Dollar vs South African Rand", category: "forex", basePrice: 13.45, volatility: 0.015, digits: 3, contractSize: 100000, spread: 60, tvSymbol: "FX:CADZAR" },

  // NZD Crosses (4)
  { id: "nzdchf", symbol: "NZDCHF", name: "New Zealand Dollar vs Swiss Franc", category: "forex", basePrice: 0.5425, volatility: 0.0003, digits: 5, contractSize: 100000, spread: 28, tvSymbol: "FX:NZDCHF" },
  { id: "nzdcad", symbol: "NZDCAD", name: "New Zealand Dollar vs Canadian Dollar", category: "forex", basePrice: 0.8245, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 28, tvSymbol: "FX:NZDCAD" },
  { id: "nzdsgd", symbol: "NZDSGD", name: "New Zealand Dollar vs Singapore Dollar", category: "forex", basePrice: 0.8135, volatility: 0.0004, digits: 5, contractSize: 100000, spread: 30, tvSymbol: "FX:NZDSGD" },
  { id: "nzdtry", symbol: "NZDTRY", name: "New Zealand Dollar vs Turkish Lira", category: "forex", basePrice: 19.52, volatility: 0.035, digits: 3, contractSize: 100000, spread: 75, tvSymbol: "FX:NZDTRY" },

  // CHF Crosses (3)
  { id: "chfsgd", symbol: "CHFSGD", name: "Swiss Franc vs Singapore Dollar", category: "forex", basePrice: 1.502, volatility: 0.0006, digits: 4, contractSize: 100000, spread: 35, tvSymbol: "FX:CHFSGD" },
  { id: "chftry", symbol: "CHFTRY", name: "Swiss Franc vs Turkish Lira", category: "forex", basePrice: 36.25, volatility: 0.06, digits: 3, contractSize: 100000, spread: 85, tvSymbol: "FX:CHFTRY" },
  { id: "chfzar", symbol: "CHFZAR", name: "Swiss Franc vs South African Rand", category: "forex", basePrice: 20.45, volatility: 0.025, digits: 3, contractSize: 100000, spread: 65, tvSymbol: "FX:CHFZAR" },

  // USD Exotics (12)
  { id: "usdtry", symbol: "USDTRY", name: "US Dollar vs Turkish Lira", category: "forex", basePrice: 32.45, volatility: 0.05, digits: 3, contractSize: 100000, spread: 80, tvSymbol: "FX:USDTRY" },
  { id: "usdzar", symbol: "USDZAR", name: "US Dollar vs South African Rand", category: "forex", basePrice: 18.42, volatility: 0.02, digits: 3, contractSize: 100000, spread: 60, tvSymbol: "FX:USDZAR" },
  { id: "usdmxn", symbol: "USDMXN", name: "US Dollar vs Mexican Peso", category: "forex", basePrice: 18.65, volatility: 0.02, digits: 3, contractSize: 100000, spread: 50, tvSymbol: "FX:USDMXN" },
  { id: "usdpln", symbol: "USDPLN", name: "US Dollar vs Polish Zloty", category: "forex", basePrice: 4.025, volatility: 0.002, digits: 3, contractSize: 100000, spread: 45, tvSymbol: "FX:USDPLN" },
  { id: "usdsek", symbol: "USDSEK", name: "US Dollar vs Swedish Krona", category: "forex", basePrice: 10.625, volatility: 0.005, digits: 3, contractSize: 100000, spread: 35, tvSymbol: "FX:USDSEK" },
  { id: "usdnok", symbol: "USDNOK", name: "US Dollar vs Norwegian Krone", category: "forex", basePrice: 10.845, volatility: 0.005, digits: 3, contractSize: 100000, spread: 35, tvSymbol: "FX:USDNOK" },
  { id: "usddkk", symbol: "USDDKK", name: "US Dollar vs Danish Krone", category: "forex", basePrice: 6.875, volatility: 0.003, digits: 3, contractSize: 100000, spread: 40, tvSymbol: "FX:USDDKK" },
  { id: "usdhuf", symbol: "USDHUF", name: "US Dollar vs Hungarian Forint", category: "forex", basePrice: 365.5, volatility: 0.15, digits: 2, contractSize: 100000, spread: 50, tvSymbol: "FX:USDHUF" },
  { id: "usdczk", symbol: "USDCZK", name: "US Dollar vs Czech Koruna", category: "forex", basePrice: 23.15, volatility: 0.01, digits: 3, contractSize: 100000, spread: 50, tvSymbol: "FX:USDCZK" },
  { id: "usdsgd", symbol: "USDSGD", name: "US Dollar vs Singapore Dollar", category: "forex", basePrice: 1.352, volatility: 0.0005, digits: 4, contractSize: 100000, spread: 35, tvSymbol: "FX:USDSGD" },
  { id: "usdhkd", symbol: "USDHKD", name: "US Dollar vs Hong Kong Dollar", category: "forex", basePrice: 7.815, volatility: 0.003, digits: 4, contractSize: 100000, spread: 30, tvSymbol: "FX:USDHKD" },
  { id: "usdthb", symbol: "USDTHB", name: "US Dollar vs Thai Baht", category: "forex", basePrice: 36.85, volatility: 0.015, digits: 3, contractSize: 100000, spread: 45, tvSymbol: "FX:USDTHB" },

  // Metals-forex (6)
  { id: "xauusd", symbol: "XAUUSD", name: "Gold vs US Dollar", category: "forex", basePrice: 2384.5, volatility: 1.2, digits: 2, contractSize: 100, spread: 25, tvSymbol: "OANDA:XAUUSD" },
  { id: "xagusd", symbol: "XAGUSD", name: "Silver vs US Dollar", category: "forex", basePrice: 28.45, volatility: 0.05, digits: 3, contractSize: 5000, spread: 22, tvSymbol: "OANDA:XAGUSD" },
  { id: "xaueur", symbol: "XAUEUR", name: "Gold vs Euro", category: "forex", basePrice: 2194.5, volatility: 1.1, digits: 2, contractSize: 100, spread: 28, tvSymbol: "OANDA:XAUEUR" },
  { id: "xaujpy", symbol: "XAUJPY", name: "Gold vs Japanese Yen", category: "forex", basePrice: 372500, volatility: 150, digits: 1, contractSize: 100, spread: 40, tvSymbol: "OANDA:XAUJPY" },
  { id: "xagjpy", symbol: "XAGJPY", name: "Silver vs Japanese Yen", category: "forex", basePrice: 4445.0, volatility: 8, digits: 1, contractSize: 5000, spread: 35, tvSymbol: "OANDA:XAGJPY" },
  { id: "xaugbp", symbol: "XAUGBP", name: "Gold vs British Pound", category: "forex", basePrice: 1875.0, volatility: 0.9, digits: 2, contractSize: 100, spread: 30, tvSymbol: "OANDA:XAUGBP" },

  // Micro / Mini (6)
  { id: "eurusd_micro", symbol: "EURUSDm", name: "Euro vs US Dollar Micro", category: "forex", basePrice: 1.0875, volatility: 0.0004, digits: 5, contractSize: 10000, spread: 12, tvSymbol: "FX:EURUSD" },
  { id: "gbpusd_micro", symbol: "GBPUSDm", name: "Pound vs US Dollar Micro", category: "forex", basePrice: 1.2712, volatility: 0.0005, digits: 5, contractSize: 10000, spread: 18, tvSymbol: "FX:GBPUSD" },
  { id: "usdjpy_micro", symbol: "USDJPYm", name: "US Dollar vs Japanese Yen Micro", category: "forex", basePrice: 156.42, volatility: 0.06, digits: 3, contractSize: 10000, spread: 10, tvSymbol: "FX:USDJPY" },
  { id: "usdtry_micro", symbol: "USDTRYm", name: "US Dollar vs Turkish Lira Micro", category: "forex", basePrice: 32.45, volatility: 0.05, digits: 3, contractSize: 10000, spread: 80, tvSymbol: "FX:USDTRY" },
  { id: "xauusd_micro", symbol: "XAUUSDm", name: "Gold Micro vs US Dollar", category: "forex", basePrice: 2384.5, volatility: 1.2, digits: 2, contractSize: 10, spread: 25, tvSymbol: "OANDA:XAUUSD" },
  { id: "xagusd_micro", symbol: "XAGUSDm", name: "Silver Micro vs US Dollar", category: "forex", basePrice: 28.45, volatility: 0.05, digits: 3, contractSize: 500, spread: 22, tvSymbol: "OANDA:XAGUSD" },

  // Additional Exotics (8)
  { id: "usdphp", symbol: "USDPHP", name: "US Dollar vs Philippine Peso", category: "forex", basePrice: 58.45, volatility: 0.025, digits: 3, contractSize: 100000, spread: 50, tvSymbol: "FX:USDPHP" },
  { id: "usdidr", symbol: "USDIDR", name: "US Dollar vs Indonesian Rupiah", category: "forex", basePrice: 16350.0, volatility: 6, digits: 2, contractSize: 100000, spread: 60, tvSymbol: "FX:USDIDR" },
  { id: "usdmyr", symbol: "USDMYR", name: "US Dollar vs Malaysian Ringgit", category: "forex", basePrice: 4.685, volatility: 0.002, digits: 3, contractSize: 100000, spread: 45, tvSymbol: "FX:USDMYR" },
  { id: "usdinr", symbol: "USDINR", name: "US Dollar vs Indian Rupee", category: "forex", basePrice: 83.45, volatility: 0.035, digits: 3, contractSize: 100000, spread: 50, tvSymbol: "FX:USDINR" },
  { id: "usdpkr", symbol: "USDPKR", name: "US Dollar vs Pakistani Rupee", category: "forex", basePrice: 278.5, volatility: 0.12, digits: 2, contractSize: 100000, spread: 55, tvSymbol: "FX:USDPKR" },
  { id: "usdbrl", symbol: "USDBRL", name: "US Dollar vs Brazilian Real", category: "forex", basePrice: 5.45, volatility: 0.008, digits: 3, contractSize: 100000, spread: 50, tvSymbol: "FX:USDBRL" },
  { id: "usdclp", symbol: "USDCLP", name: "US Dollar vs Chilean Peso", category: "forex", basePrice: 945.5, volatility: 0.4, digits: 2, contractSize: 100000, spread: 55, tvSymbol: "FX:USDCLP" },
  { id: "usdcop", symbol: "USDCOP", name: "US Dollar vs Colombian Peso", category: "forex", basePrice: 4185.0, volatility: 1.5, digits: 2, contractSize: 100000, spread: 60, tvSymbol: "FX:USDCOP" },
];
