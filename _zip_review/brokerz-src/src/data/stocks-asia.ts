import type { Instrument } from "@/types";

const mk = (
  id: string, symbol: string, name: string, basePrice: number,
  volatility: number, digits: number, spread: number, exchange: string,
): Instrument => ({
  id, symbol, name, category: "stocks", basePrice, volatility, digits,
  contractSize: 1, spread, tvSymbol: `${exchange}:${symbol}`,
});

export const ASIA_STOCKS: Instrument[] = [
  // Japan — Tokyo Stock Exchange (20)
  mk("t7203", "7203", "Toyota Motor Corporation", 2850.0, 8.0, 2, 30, "TSE"),
  mk("t6758", "6758", "Sony Group Corporation", 18500.0, 50, 2, 40, "TSE"),
  mk("t9984", "9984", "SoftBank Group", 9500.0, 30, 2, 35, "TSE"),
  mk("t7974", "7974", "Nintendo Co Ltd", 12500.0, 40, 2, 35, "TSE"),
  mk("t8306", "8306", "Mitsubishi UFJ Financial", 1850.0, 5.0, 2, 25, "TSE"),
  mk("t8316", "8316", "Sumitomo Mitsui Financial", 9500.0, 30, 2, 30, "TSE"),
  mk("t9433", "9433", "KDDI Corporation", 4850.0, 15, 2, 28, "TSE"),
  mk("t9432", "9432", "NTT Data Corporation", 1850.0, 5.0, 2, 25, "TSE"),
  mk("t4502", "4502", "Takeda Pharmaceutical", 4850.0, 15, 2, 28, "TSE"),
  mk("t4568", "4568", "Daiichi Sankyo", 9500.0, 30, 2, 30, "TSE"),
  mk("t8035", "8035", "Tokyo Electron", 28500.0, 80, 2, 45, "TSE"),
  mk("t6861", "6861", "Keyence Corporation", 68500.0, 200, 2, 50, "TSE"),
  mk("t6594", "6594", "Nidec Corporation", 18500.0, 50, 2, 35, "TSE"),
  mk("t6902", "6902", "Denso Corporation", 2850.0, 8.0, 2, 30, "TSE"),
  mk("t7267", "7267", "Honda Motor Company", 3850.0, 12, 2, 28, "TSE"),
  mk("t7201", "7201", "Nissan Motor Company", 685.0, 2.0, 2, 25, "TSE"),
  mk("t8411", "8411", "Mizuho Financial Group", 2850.0, 8.0, 2, 25, "TSE"),
  mk("t9020", "9020", "East Japan Railway", 6850.0, 20, 2, 30, "TSE"),
  mk("t9201", "9201", "Japan Airlines", 3850.0, 12, 2, 28, "TSE"),
  mk("t3382", "3382", "Seven & i Holdings", 2850.0, 8.0, 2, 25, "TSE"),

  // China — HKEx / SSE / SZSE (20)
  mk("h9988", "9988", "Alibaba Group (HK)", 85.5, 0.2, 2, 22, "HKEX"),
  mk("h0700", "700", "Tencent Holdings", 385.0, 1.0, 2, 28, "HKEX"),
  mk("h3690", "3690", "Meituan", 125.0, 0.4, 2, 25, "HKEX"),
  mk("h1810", "1810", "Xiaomi Corporation", 18.5, 0.05, 2, 18, "HKEX"),
  mk("h1211", "1211", "BYD Company", 285.0, 0.8, 2, 28, "HKEX"),
  mk("h2318", "2318", "Ping An Insurance", 48.5, 0.15, 2, 20, "HKEX"),
  mk("h9398", "9398", "China Construction Bank", 6.5, 0.02, 2, 15, "HKEX"),
  mk("h1398", "1398", "ICBC", 5.5, 0.02, 2, 15, "HKEX"),
  mk("h3988", "3988", "Bank of China", 4.5, 0.02, 2, 15, "HKEX"),
  mk("h0941", "941", "China Mobile", 68.5, 0.2, 2, 22, "HKEX"),
  mk("h1299", "1299", "AIA Group", 68.5, 0.2, 2, 22, "HKEX"),
  mk("h9618", "9618", "JD.com (HK)", 125.0, 0.4, 2, 25, "HKEX"),
  mk("h9999", "9999", "NetEase (HK)", 185.0, 0.5, 2, 25, "HKEX"),
  mk("h1024", "1024", "Kuaishou Technology", 48.5, 0.15, 2, 22, "HKEX"),
  mk("s600519", "600519", "Kweichow Moutai", 1685.0, 5.0, 2, 35, "SSE"),
  mk("s601318", "601318", "Ping An Insurance (A)", 48.5, 0.15, 2, 22, "SSE"),
  mk("s600036", "600036", "China Merchants Bank", 38.5, 0.1, 2, 20, "SSE"),
  mk("s601166", "601166", "Industrial Bank", 18.5, 0.05, 2, 18, "SSE"),
  mk("z000858", "000858", "Wuliangye Yibin", 185.0, 0.5, 2, 25, "SZSE"),
  mk("z300750", "300750", "CATL (Contemporary Amperex)", 185.0, 0.5, 2, 25, "SZSE"),

  // South Korea — KRX (10)
  mk("k005930", "005930", "Samsung Electronics", 68500.0, 200, 2, 45, "KRX"),
  mk("k000660", "000660", "SK Hynix", 185000.0, 500, 2, 50, "KRX"),
  mk("k005490", "005490", "POSCO Holdings", 485000.0, 1500, 2, 55, "KRX"),
  mk("k035420", "035420", "NAVER Corporation", 185000.0, 500, 2, 45, "KRX"),
  mk("k373220", "373220", "LG Energy Solution", 385000.0, 1200, 2, 55, "KRX"),
  mk("k066570", "066570", "LG Electronics", 95000.0, 300, 2, 35, "KRX"),
  mk("k051910", "051910", "LG Chem", 385000.0, 1200, 2, 50, "KRX"),
  mk("k207940", "207940", "Samsung Biologics", 685000.0, 2000, 2, 60, "KRX"),
  mk("k329180", "329180", "HD Hyundai Heavy Industries", 185000.0, 500, 2, 45, "KRX"),
  mk("k006400", "006400", "Samsung SDI", 285000.0, 800, 2, 50, "KRX"),

  // India — NSE (10)
  mk("reliance", "RELIANCE", "Reliance Industries", 2850.0, 8.0, 2, 30, "NSE"),
  mk("tcs", "TCS", "Tata Consultancy Services", 3850.0, 12, 2, 32, "NSE"),
  mk("hdfc", "HDFCBANK", "HDFC Bank", 1685.0, 5.0, 2, 28, "NSE"),
  mk("infy", "INFY", "Infosys", 1850.0, 5.0, 2, 28, "NSE"),
  mk("icici", "ICICIBANK", "ICICI Bank", 1250.0, 4.0, 2, 25, "NSE"),
  mk("sbin", "SBIN", "State Bank of India", 825.0, 2.5, 2, 25, "NSE"),
  mk("bharti", "BHARTIARTL", "Bharti Airtel", 1685.0, 5.0, 2, 28, "NSE"),
  mk("itc", "ITC", "ITC Limited", 485.0, 1.5, 2, 22, "NSE"),
  mk("lt", "LT", "Larsen & Toubro", 3850.0, 12, 2, 32, "NSE"),
  mk("hcl", "HCLTECH", "HCL Technologies", 1685.0, 5.0, 2, 28, "NSE"),

  // Australia — ASX (8)
  mk("bhp", "BHP", "BHP Group Ltd", 48.5, 0.15, 2, 20, "ASX"),
  mk("cba", "CBA", "Commonwealth Bank of Australia", 125.0, 0.4, 2, 25, "ASX"),
  mk("csl", "CSL", "CSL Limited", 285.0, 0.8, 2, 28, "ASX"),
  mk("nab", "NAB", "National Australia Bank", 35.5, 0.15, 2, 20, "ASX"),
  mk("wbc", "WBC", "Westpac Banking Corporation", 28.5, 0.1, 2, 18, "ASX"),
  mk("anz", "ANZ", "ANZ Group Holdings", 28.5, 0.1, 2, 18, "ASX"),
  mk("rio2", "RIO", "Rio Tinto Limited", 125.0, 0.4, 2, 25, "ASX"),
  mk("fmgl", "FMG", "Fortescue Metals Group", 22.5, 0.05, 2, 18, "ASX"),

  // Singapore / Other Asia (7)
  mk("d05", "D05", "DBS Group Holdings", 38.5, 0.15, 2, 20, "SGX"),
  mk("o39", "O39", "OCBC Bank", 18.5, 0.05, 2, 18, "SGX"),
  mk("u11", "U11", "United Overseas Bank", 38.5, 0.15, 2, 20, "SGX"),
  mk("z74", "Z74", "Singapore Telecommunications (Singtel)", 3.5, 0.02, 2, 15, "SGX"),
  mk("f34", "F34", "Wilmar International", 3.5, 0.02, 2, 15, "SGX"),
  mk("c6l", "C6L", "Singapore Airlines", 6.5, 0.02, 2, 15, "SGX"),
  mk("c09", "C09", "City Developments Limited", 12.5, 0.05, 2, 18, "SGX"),
];
