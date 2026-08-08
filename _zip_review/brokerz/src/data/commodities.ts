import type { Instrument } from "@/types";

export const COMMODITY_INSTRUMENTS: Instrument[] = [
  // Metals — Gold (8)
  { id: "xauusd", symbol: "XAUUSD", name: "Gold vs US Dollar", category: "commodities", basePrice: 2384.5, volatility: 1.2, digits: 2, contractSize: 100, spread: 25, tvSymbol: "OANDA:XAUUSD" },
  { id: "xaueur", symbol: "XAUEUR", name: "Gold vs Euro", category: "commodities", basePrice: 2194.5, volatility: 1.1, digits: 2, contractSize: 100, spread: 28, tvSymbol: "OANDA:XAUEUR" },
  { id: "xaujpy", symbol: "XAUJPY", name: "Gold vs Japanese Yen", category: "commodities", basePrice: 372500, volatility: 150, digits: 1, contractSize: 100, spread: 40, tvSymbol: "OANDA:XAUJPY" },
  { id: "xaugbp", symbol: "XAUGBP", name: "Gold vs British Pound", category: "commodities", basePrice: 1875.0, volatility: 0.9, digits: 2, contractSize: 100, spread: 30, tvSymbol: "OANDA:XAUGBP" },
  { id: "xauusd_micro", symbol: "XAUUSDm", name: "Gold Micro vs US Dollar", category: "commodities", basePrice: 2384.5, volatility: 1.2, digits: 2, contractSize: 10, spread: 25, tvSymbol: "OANDA:XAUUSD" },
  { id: "xauchf", symbol: "XAUCHF", name: "Gold vs Swiss Franc", category: "commodities", basePrice: 2645.0, volatility: 1.3, digits: 2, contractSize: 100, spread: 32, tvSymbol: "OANDA:XAUCHF" },
  { id: "xauaud", symbol: "XAUAUD", name: "Gold vs Australian Dollar", category: "commodities", basePrice: 3625.0, volatility: 1.8, digits: 2, contractSize: 100, spread: 35, tvSymbol: "OANDA:XAUAUD" },
  { id: "xaucad", symbol: "XAUCAD", name: "Gold vs Canadian Dollar", category: "commodities", basePrice: 3265.0, volatility: 1.6, digits: 2, contractSize: 100, spread: 35, tvSymbol: "OANDA:XAUCAD" },

  // Metals — Silver (5)
  { id: "xagusd", symbol: "XAGUSD", name: "Silver vs US Dollar", category: "commodities", basePrice: 28.45, volatility: 0.05, digits: 3, contractSize: 5000, spread: 22, tvSymbol: "OANDA:XAGUSD" },
  { id: "xageur", symbol: "XAGEUR", name: "Silver vs Euro", category: "commodities", basePrice: 26.15, volatility: 0.05, digits: 3, contractSize: 5000, spread: 25, tvSymbol: "OANDA:XAGEUR" },
  { id: "xagjpy", symbol: "XAGJPY", name: "Silver vs Japanese Yen", category: "commodities", basePrice: 4445.0, volatility: 8, digits: 1, contractSize: 5000, spread: 35, tvSymbol: "OANDA:XAGJPY" },
  { id: "xaggbp", symbol: "XAGGBP", name: "Silver vs British Pound", category: "commodities", basePrice: 22.35, volatility: 0.04, digits: 3, contractSize: 5000, spread: 28, tvSymbol: "OANDA:XAGGBP" },
  { id: "xagusd_micro", symbol: "XAGUSDm", name: "Silver Micro vs US Dollar", category: "commodities", basePrice: 28.45, volatility: 0.05, digits: 3, contractSize: 500, spread: 22, tvSymbol: "OANDA:XAGUSD" },

  // Metals — Other (6)
  { id: "xptusd", symbol: "XPTUSD", name: "Platinum vs US Dollar", category: "commodities", basePrice: 985.5, volatility: 0.8, digits: 2, contractSize: 50, spread: 35, tvSymbol: "OANDA:XPTUSD" },
  { id: "xpdusd", symbol: "XPDUSD", name: "Palladium vs US Dollar", category: "commodities", basePrice: 1025.0, volatility: 1.5, digits: 2, contractSize: 50, spread: 40, tvSymbol: "OANDA:XPDUSD" },
  { id: "xpteur", symbol: "XPTEUR", name: "Platinum vs Euro", category: "commodities", basePrice: 905.5, volatility: 0.7, digits: 2, contractSize: 50, spread: 38, tvSymbol: "OANDA:XPTEUR" },
  { id: "xpdeur", symbol: "XPDEUR", name: "Palladium vs Euro", category: "commodities", basePrice: 942.0, volatility: 1.4, digits: 2, contractSize: 50, spread: 42, tvSymbol: "OANDA:XPDEUR" },
  { id: "xcusd", symbol: "XCUUSD", name: "Copper vs US Dollar", category: "commodities", basePrice: 4.25, volatility: 0.02, digits: 3, contractSize: 25000, spread: 30, tvSymbol: "COMEX:HG1!" },
  { id: "xalusd", symbol: "XALUSD", name: "Aluminum vs US Dollar", category: "commodities", basePrice: 2450.0, volatility: 8, digits: 1, contractSize: 25, spread: 35, tvSymbol: "LME:AL1!" },

  // Energies — Oil (8)
  { id: "wti", symbol: "WTIUSD", name: "Crude Oil WTI", category: "commodities", basePrice: 78.34, volatility: 0.15, digits: 2, contractSize: 1000, spread: 30, tvSymbol: "TVC:USOIL" },
  { id: "brent", symbol: "BRENTUSD", name: "Crude Oil Brent", category: "commodities", basePrice: 82.15, volatility: 0.15, digits: 2, contractSize: 1000, spread: 30, tvSymbol: "TVC:UKOIL" },
  { id: "wti_micro", symbol: "WTIUSDm", name: "Crude Oil WTI Micro", category: "commodities", basePrice: 78.34, volatility: 0.15, digits: 2, contractSize: 100, spread: 30, tvSymbol: "TVC:USOIL" },
  { id: "brent_micro", symbol: "BRENTm", name: "Crude Oil Brent Micro", category: "commodities", basePrice: 82.15, volatility: 0.15, digits: 2, contractSize: 100, spread: 30, tvSymbol: "TVC:UKOIL" },
  { id: "wti_brent_diff", symbol: "WTIBRENT", name: "WTI vs Brent Spread", category: "commodities", basePrice: -3.81, volatility: 0.08, digits: 2, contractSize: 1000, spread: 35, tvSymbol: "TVC:USOIL" },
  { id: "heatoil", symbol: "HEATOIL", name: "Heating Oil", category: "commodities", basePrice: 2.45, volatility: 0.012, digits: 3, contractSize: 10000, spread: 35, tvSymbol: "NYMEX:HO1!" },
  { id: "gasoline", symbol: "GASOLINE", name: "RBOB Gasoline", category: "commodities", basePrice: 2.38, volatility: 0.012, digits: 3, contractSize: 10000, spread: 35, tvSymbol: "NYMEX:RB1!" },
  { id: "ethanol", symbol: "ETHANOL", name: "Ethanol", category: "commodities", basePrice: 1.65, volatility: 0.01, digits: 3, contractSize: 1000, spread: 35, tvSymbol: "CBOT:ZE1!" },

  // Energies — Gas (5)
  { id: "natgas", symbol: "NATGAS", name: "Natural Gas", category: "commodities", basePrice: 2.18, volatility: 0.012, digits: 3, contractSize: 10000, spread: 35, tvSymbol: "NYMEX:NG1!" },
  { id: "natgas_micro", symbol: "NATGASm", name: "Natural Gas Micro", category: "commodities", basePrice: 2.18, volatility: 0.012, digits: 3, contractSize: 1000, spread: 35, tvSymbol: "NYMEX:NG1!" },
  { id: "lng", symbol: "LNGUSD", name: "Liquefied Natural Gas", category: "commodities", basePrice: 12.5, volatility: 0.05, digits: 2, contractSize: 1000, spread: 40, tvSymbol: "TVC:NATGAS" },
  { id: "propane", symbol: "PROPANE", name: "Propane", category: "commodities", basePrice: 0.85, volatility: 0.005, digits: 3, contractSize: 10000, spread: 40, tvSymbol: "NYMEX:PN1!" },
  { id: "coal", symbol: "COALUSD", name: "Coal Futures", category: "commodities", basePrice: 135.0, volatility: 0.5, digits: 2, contractSize: 1000, spread: 45, tvSymbol: "ICE:TF1!" },

  // Energies — Carbon (3)
  { id: "co2", symbol: "CO2USD", name: "Carbon Credits EU ETS", category: "commodities", basePrice: 68.5, volatility: 0.3, digits: 2, contractSize: 1000, spread: 40, tvSymbol: "ICE:CFI1!" },
  { id: "co2_micro", symbol: "CO2m", name: "Carbon Credits Micro", category: "commodities", basePrice: 68.5, volatility: 0.3, digits: 2, contractSize: 100, spread: 40, tvSymbol: "ICE:CFI1!" },
  { id: "co2uk", symbol: "CO2UK", name: "UK Carbon Credits", category: "commodities", basePrice: 52.5, volatility: 0.25, digits: 2, contractSize: 1000, spread: 40, tvSymbol: "ICE:CU1!" },

  // Agriculture — Grains (8)
  { id: "xwusd", symbol: "XWUSD", name: "Wheat", category: "commodities", basePrice: 612.5, volatility: 2.5, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZW1!" },
  { id: "corn", symbol: "CORN", name: "Corn", category: "commodities", basePrice: 455.0, volatility: 2.0, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZC1!" },
  { id: "xsusd", symbol: "XSUSD", name: "Soybean", category: "commodities", basePrice: 1185.0, volatility: 3.0, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZS1!" },
  { id: "soybean_oil", symbol: "SOYOIL", name: "Soybean Oil", category: "commodities", basePrice: 0.42, volatility: 0.005, digits: 3, contractSize: 1000, spread: 40, tvSymbol: "CBOT:ZL1!" },
  { id: "soybean_meal", symbol: "SOYMEAL", name: "Soybean Meal", category: "commodities", basePrice: 320.0, volatility: 2.0, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZM1!" },
  { id: "rice", symbol: "RICE", name: "Rough Rice", category: "commodities", basePrice: 17.5, volatility: 0.1, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZR1!" },
  { id: "oats", symbol: "OATS", name: "Oats", category: "commodities", basePrice: 325.0, volatility: 2.0, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:ZO1!" },
  { id: "hrw_wheat", symbol: "HRWW", name: "HRW Wheat", category: "commodities", basePrice: 625.0, volatility: 2.5, digits: 2, contractSize: 100, spread: 40, tvSymbol: "CBOT:KE1!" },

  // Agriculture — Softs (8)
  { id: "coffee", symbol: "COFFEE", name: "Coffee Arabica", category: "commodities", basePrice: 225.0, volatility: 1.5, digits: 2, contractSize: 100, spread: 45, tvSymbol: "ICE:KC1!" },
  { id: "coffee_rob", symbol: "COFFEER", name: "Coffee Robusta", category: "commodities", basePrice: 3850.0, volatility: 15, digits: 1, contractSize: 10, spread: 50, tvSymbol: "ICE:RC1!" },
  { id: "sugar", symbol: "SUGAR", name: "Sugar No.11", category: "commodities", basePrice: 19.5, volatility: 0.1, digits: 2, contractSize: 1000, spread: 40, tvSymbol: "ICE:SB1!" },
  { id: "sugar_white", symbol: "SUGARW", name: "White Sugar", category: "commodities", basePrice: 525.0, volatility: 2.5, digits: 2, contractSize: 100, spread: 45, tvSymbol: "ICE:SF1!" },
  { id: "cocoa", symbol: "COCOA", name: "Cocoa", category: "commodities", basePrice: 8950.0, volatility: 15, digits: 2, contractSize: 10, spread: 50, tvSymbol: "ICE:CC1!" },
  { id: "cotton", symbol: "COTTON", name: "Cotton No.2", category: "commodities", basePrice: 72.5, volatility: 0.3, digits: 2, contractSize: 1000, spread: 40, tvSymbol: "ICE:CT1!" },
  { id: "orange", symbol: "OJUSD", name: "Orange Juice", category: "commodities", basePrice: 325.0, volatility: 2.0, digits: 2, contractSize: 100, spread: 45, tvSymbol: "ICE:OJ1!" },
  { id: "lumber", symbol: "LUMBER", name: "Lumber", category: "commodities", basePrice: 545.0, volatility: 3.0, digits: 2, contractSize: 100, spread: 50, tvSymbol: "CME:LB1!" },

  // Livestock (5)
  { id: "live_cattle", symbol: "LCUSD", name: "Live Cattle", category: "commodities", basePrice: 182.5, volatility: 1.0, digits: 2, contractSize: 100, spread: 45, tvSymbol: "CME:LE1!" },
  { id: "feeder_cattle", symbol: "FCUSD", name: "Feeder Cattle", category: "commodities", basePrice: 235.0, volatility: 1.5, digits: 2, contractSize: 100, spread: 50, tvSymbol: "CME:GF1!" },
  { id: "lean_hogs", symbol: "LHUSD", name: "Lean Hogs", category: "commodities", basePrice: 92.5, volatility: 0.5, digits: 2, contractSize: 100, spread: 45, tvSymbol: "CME:HE1!" },
  { id: "pork_bellies", symbol: "PBUSD", name: "Pork Bellies", category: "commodities", basePrice: 105.0, volatility: 0.8, digits: 2, contractSize: 100, spread: 50, tvSymbol: "CME:PB1!" },
  { id: "class3_milk", symbol: "MILK3", name: "Class III Milk", category: "commodities", basePrice: 18.5, volatility: 0.1, digits: 2, contractSize: 1000, spread: 45, tvSymbol: "CME:DC1!" },

  // Dairy & Other (3)
  { id: "butter", symbol: "BUTTER", name: "Cash Butter", category: "commodities", basePrice: 2.85, volatility: 0.015, digits: 3, contractSize: 1000, spread: 45, tvSymbol: "CME:CB1!" },
  { id: "dry_whey", symbol: "WHEY", name: "Dry Whey", category: "commodities", basePrice: 0.65, volatility: 0.005, digits: 3, contractSize: 1000, spread: 45, tvSymbol: "CME:DW1!" },
  { id: "nonfat_dry", symbol: "NFDM", name: "Nonfat Dry Milk", category: "commodities", basePrice: 1.25, volatility: 0.01, digits: 3, contractSize: 1000, spread: 45, tvSymbol: "CME:DN1!" },
];
