import type { Instrument } from "@/types";

const mk = (
  id: string, symbol: string, name: string, basePrice: number,
  volatility: number, digits: number, spread: number, tvSymbol: string,
): Instrument => ({
  id, symbol, name, category: "crypto", basePrice, volatility, digits,
  contractSize: 1, spread, tvSymbol,
});

export const CRYPTO_INSTRUMENTS: Instrument[] = [
  // Major Coins (10)
  mk("btcusd", "BTCUSD", "Bitcoin vs US Dollar", 64250, 80, 2, 50, "BINANCE:BTCUSDT"),
  mk("ethusd", "ETHUSD", "Ethereum vs US Dollar", 3380, 8, 2, 45, "BINANCE:ETHUSDT"),
  mk("solusd", "SOLUSD", "Solana vs US Dollar", 148.5, 1.5, 2, 40, "BINANCE:SOLUSDT"),
  mk("bnbusd", "BNBUSD", "BNB vs US Dollar", 585.0, 5, 2, 40, "BINANCE:BNBUSDT"),
  mk("xrpusd", "XRPUSD", "Ripple vs US Dollar", 0.5234, 0.005, 4, 40, "BINANCE:XRPUSDT"),
  mk("adausd", "ADAUSD", "Cardano vs US Dollar", 0.452, 0.005, 4, 40, "BINANCE:ADAUSDT"),
  mk("avaxusd", "AVAXUSD", "Avalanche vs US Dollar", 36.5, 0.5, 2, 40, "BINANCE:AVAXUSDT"),
  mk("dotusd", "DOTUSD", "Polkadot vs US Dollar", 6.85, 0.1, 3, 40, "BINANCE:DOTUSDT"),
  mk("maticusd", "MATICUSD", "Polygon vs US Dollar", 0.725, 0.008, 4, 40, "BINANCE:MATICUSDT"),
  mk("ltcusd", "LTCUSD", "Litecoin vs US Dollar", 84.5, 1.0, 2, 40, "BINANCE:LTCUSDT"),

  // DeFi Tokens (12)
  mk("uniusd", "UNIUSD", "Uniswap vs US Dollar", 9.85, 0.15, 2, 40, "BINANCE:UNIUSDT"),
  mk("aaveusd", "AAVEUSD", "Aave vs US Dollar", 95.5, 1.5, 2, 42, "BINANCE:AAVEUSDT"),
  mk("mkrusd", "MKRUSD", "Maker vs US Dollar", 2850, 30, 2, 45, "BINANCE:MKRUSDT"),
  mk("compusd", "COMPUSD", "Compound vs US Dollar", 65.5, 0.8, 2, 42, "BINANCE:COMPUSDT"),
  mk("sushiusd", "SUSHIUSD", "SushiSwap vs US Dollar", 0.925, 0.01, 4, 40, "BINANCE:SUSHIUSDT"),
  mk("crvusd", "CRVUSD", "Curve DAO vs US Dollar", 0.385, 0.005, 4, 40, "BINANCE:CRVUSDT"),
  mk("snxusd", "SNXUSD", "Synthetix vs US Dollar", 2.45, 0.04, 3, 40, "BINANCE:SNXUSDT"),
  mk("1inchusd", "1INCHUSD", "1inch vs US Dollar", 0.385, 0.005, 4, 40, "BINANCE:1INCHUSDT"),
  mk("dydxusd", "DYDXUSD", "dYdX vs US Dollar", 1.85, 0.03, 3, 40, "BINANCE:DYDXUSDT"),
  mk("gmxfusd", "GMXUSD", "GMX vs US Dollar", 32.5, 0.5, 2, 42, "BINANCE:GMXUSDT"),
  mk("pendleusd", "PENDLEUSD", "Pendle vs US Dollar", 5.85, 0.1, 3, 42, "BINANCE:PENDLEUSDT"),
  mk("rdntusd", "RDNTUSD", "Radiant Capital vs US Dollar", 0.085, 0.002, 4, 40, "BINANCE:RDNTUSDT"),

  // Layer 1 / Smart Contract (12)
  mk("atomusd", "ATOMUSD", "Cosmos vs US Dollar", 8.45, 0.12, 2, 40, "BINANCE:ATOMUSDT"),
  mk("nearusd", "NEARUSD", "NEAR Protocol vs US Dollar", 6.25, 0.1, 2, 40, "BINANCE:NEARUSDT"),
  mk("aptusd", "APTUSD", "Aptos vs US Dollar", 8.75, 0.15, 2, 40, "BINANCE:APTUSDT"),
  mk("ftmusd", "FTMUSD", "Fantom vs US Dollar", 0.685, 0.008, 4, 40, "BINANCE:FTMUSDT"),
  mk("seiusd", "SEIUSD", "Sei Network vs US Dollar", 0.485, 0.008, 4, 42, "BINANCE:SEIUSDT"),
  mk("suiusd", "SUIUSD", "Sui vs US Dollar", 1.25, 0.02, 3, 42, "BINANCE:SUIUSDT"),
  mk("tiausd", "TIAUSD", "Celestia vs US Dollar", 8.5, 0.15, 2, 42, "BINANCE:TIAUSDT"),
  mk("injusd", "INJUSD", "Injective vs US Dollar", 22.5, 0.3, 2, 42, "BINANCE:INJUSDT"),
  mk("kaspausd", "KASUSD", "Kaspa vs US Dollar", 0.145, 0.003, 4, 45, "BINANCE:KASUSDT"),
  mk("rndrusd", "RNDRUSD", "Render Token vs US Dollar", 7.85, 0.12, 2, 42, "BINANCE:RNDRUSDT"),
  mk("filusd", "FILUSD", "Filecoin vs US Dollar", 5.25, 0.08, 3, 40, "BINANCE:FILUSDT"),
  mk("hbarusd", "HBARUSD", "Hedera vs US Dollar", 0.092, 0.002, 4, 40, "BINANCE:HBARUSDT"),

  // Layer 2 / Scaling (8)
  mk("arbusd", "ARBUSD", "Arbitrum vs US Dollar", 1.85, 0.03, 3, 40, "BINANCE:ARBUSDT"),
  mk("opusd", "OPUSD", "Optimism vs US Dollar", 2.45, 0.04, 3, 40, "BINANCE:OPUSDT"),
  mk("matic2", "MATIC2", "Polygon PoS vs US Dollar", 0.725, 0.008, 4, 40, "BINANCE:MATICUSDT"),
  mk("mavusd", "MAVUSD", "Maverick Protocol vs US Dollar", 0.285, 0.005, 4, 42, "BINANCE:MAVUSDT"),
  mk("ldous", "LDOUSD", "Lido DAO vs US Dollar", 2.15, 0.03, 3, 40, "BINANCE:LDOUSDT"),
  mk("strkusd", "STRKUSD", "Starknet vs US Dollar", 1.15, 0.02, 3, 42, "BINANCE:STRKUSDT"),
  mk("mantleusd", "MNTUSD", "Mantle vs US Dollar", 0.685, 0.01, 4, 42, "BINANCE:MNTUSDT"),
  mk("zkuusd", "ZKUSD", "zkSync vs US Dollar", 0.185, 0.003, 4, 45, "BINANCE:ZKUSDT"),

  // Meme Coins (10)
  mk("dogeusd", "DOGEUSD", "Dogecoin vs US Dollar", 0.162, 0.002, 4, 40, "BINANCE:DOGEUSDT"),
  mk("shibusd", "SHIBUSD", "Shiba Inu vs US Dollar", 0.0000248, 0.0000003, 7, 45, "BINANCE:SHIBUSDT"),
  mk("pepeusd", "PEPEUSD", "Pepe vs US Dollar", 0.0000085, 0.0000001, 7, 45, "BINANCE:PEPEUSDT"),
  mk("flokiusd", "FLOKIUSD", "Floki vs US Dollar", 0.000185, 0.000003, 6, 45, "BINANCE:FLOKIUSDT"),
  mk("bonkusd", "BONKUSD", "Bonk vs US Dollar", 0.0000285, 0.0000005, 6, 45, "BINANCE:BONKUSDT"),
  mk("wifusd", "WIFUSD", "dogwifhat vs US Dollar", 2.85, 0.05, 3, 45, "BINANCE:WIFUSDT"),
  mk("memecoin", "MEMEUSD", "Memecoin vs US Dollar", 0.0185, 0.0003, 4, 45, "BINANCE:MEMEUSDT"),
  mk("bomeusd", "BOMEUSD", "Book of Meme vs US Dollar", 0.0085, 0.0002, 5, 45, "BINANCE:BOMEUSDT"),
  mk("myrousd", "MYROUSD", "Myro vs US Dollar", 0.085, 0.002, 4, 45, "BINANCE:MYROUSDT"),
  mk("neiro", "NEIROUSD", "Neiro vs US Dollar", 0.00125, 0.00003, 5, 45, "BINANCE:NEIROUSDT"),

  // Exchange / Platform (8)
  mk("htusd", "HTUSD", "Huobi Token vs US Dollar", 0.285, 0.005, 4, 42, "BINANCE:HTUSDT"),
  mk("okbusd", "OKBUSD", "OKB vs US Dollar", 48.5, 0.8, 2, 42, "BINANCE:OKBUSDT"),
  mk("crous", "CROUSD", "Cronos vs US Dollar", 0.125, 0.002, 4, 42, "BINANCE:CROUSDT"),
  mk("kcsusd", "KCSUSD", "KuCoin Token vs US Dollar", 8.5, 0.15, 2, 42, "BINANCE:KCSUSDT"),
  mk("bgbusd", "BGBUSD", "Bitget Token vs US Dollar", 1.25, 0.02, 3, 42, "BINANCE:BGBUSDT"),
  mk("mxusd", "MXUSD", "MXC Token vs US Dollar", 0.0285, 0.0005, 5, 42, "BINANCE:MXUSDT"),
  mk("leo", "LEOUSD", "LEO Token vs US Dollar", 9.85, 0.15, 2, 42, "BINANCE:LEOUSDT"),
  mk("gtusd", "GTUSD", "GateToken vs US Dollar", 8.5, 0.15, 2, 42, "BINANCE:GTUSDT"),

  // Privacy / Other (6)
  mk("zecusd", "ZECUSD", "Zcash vs US Dollar", 28.5, 0.5, 2, 42, "BINANCE:ZECUSDT"),
  mk("dashusd", "DASHUSD", "Dash vs US Dollar", 32.5, 0.5, 2, 42, "BINANCE:DASHUSDT"),
  mk("xmrusd", "XMRUSD", "Monero vs US Dollar", 165.0, 2.5, 2, 45, "BINANCE:XMRUSDT"),
  mk("zenusd", "ZENUSD", "Horizen vs US Dollar", 8.5, 0.15, 2, 42, "BINANCE:ZENUSDT"),
  mk("scusd", "SCUSD", "Siacoin vs US Dollar", 0.0085, 0.0002, 5, 40, "BINANCE:SCUSDT"),
  mk("arweave", "ARUSD", "Arweave vs US Dollar", 28.5, 0.5, 2, 42, "BINANCE:ARUSDT"),

  // Gaming / Metaverse / NFT (8)
  mk("sandusd", "SANDUSD", "The Sandbox vs US Dollar", 0.425, 0.006, 4, 40, "BINANCE:SANDUSDT"),
  mk("manausd", "MANAUSD", "Decentraland vs US Dollar", 0.425, 0.006, 4, 40, "BINANCE:MANAUSDT"),
  mk("axsusd", "AXSUSD", "Axie Infinity vs US Dollar", 6.85, 0.1, 2, 40, "BINANCE:AXSUSDT"),
  mk("enjusd", "ENJUSD", "Enjin Coin vs US Dollar", 0.285, 0.005, 4, 40, "BINANCE:ENJUSDT"),
  mk("chilusd", "CHZUSD", "Chiliz vs US Dollar", 0.085, 0.002, 4, 40, "BINANCE:CHZUSDT"),
  mk("galusd", "GALUSD", "Project Galaxy vs US Dollar", 1.85, 0.03, 3, 42, "BINANCE:GALUSDT"),
  mk("aliceusd", "ALICEUSD", "My Neighbor Alice vs US Dollar", 1.85, 0.03, 3, 42, "BINANCE:ALICEUSDT"),
  mk("sliusd", "SLPUSD", "Smooth Love Potion vs US Dollar", 0.0035, 0.0001, 5, 40, "BINANCE:SLPUSDT"),

  // AI / Data / Oracle (6)
  mk("linkusd", "LINKUSD", "Chainlink vs US Dollar", 14.8, 0.2, 2, 40, "BINANCE:LINKUSDT"),
  mk("agixusd", "AGIXUSD", "SingularityNET vs US Dollar", 0.585, 0.01, 4, 42, "BINANCE:AGIXUSDT"),
  mk("fet", "FETUSD", "Fetch.ai vs US Dollar", 1.45, 0.025, 3, 42, "BINANCE:FETUSDT"),
  mk("oceanusd", "OCEANUSD", "Ocean Protocol vs US Dollar", 0.585, 0.01, 4, 42, "BINANCE:OCEANUSDT"),
  mk("numerusd", "NMRUSD", "Numeraire vs US Dollar", 18.5, 0.3, 2, 42, "BINANCE:NMRUSDT"),
  mk("bandusd", "BANDUSD", "Band Protocol vs US Dollar", 1.25, 0.02, 3, 40, "BINANCE:BANDUSDT"),

  // Stablecoins & Wrapped (4)
  mk("etcusd", "ETCUSD", "Ethereum Classic vs US Dollar", 28.5, 0.5, 2, 40, "BINANCE:ETCUSDT"),
  mk("xlmusd", "XLMUSD", "Stellar vs US Dollar", 0.115, 0.002, 4, 40, "BINANCE:XLMUSDT"),
  mk("algousd", "ALGOUSD", "Algorand vs US Dollar", 0.185, 0.003, 4, 40, "BINANCE:ALGOUSDT"),
  mk("thetausd", "THETAUSD", "Theta Network vs US Dollar", 1.85, 0.03, 3, 40, "BINANCE:THETAUSDT"),

  // Additional Altcoins (6)
  mk("xtzusd", "XTZUSD", "Tezos vs US Dollar", 0.985, 0.015, 3, 40, "BINANCE:XTZUSDT"),
  mk("vetusd", "VETUSD", "VeChain vs US Dollar", 0.0285, 0.0005, 5, 40, "BINANCE:VETUSDT"),
  mk("icpusd", "ICPUSD", "Internet Computer vs US Dollar", 12.5, 0.2, 2, 40, "BINANCE:ICPUSDT"),
  mk("egaldusd", "EGLDUSD", "MultiversX vs US Dollar", 42.5, 0.8, 2, 42, "BINANCE:EGLDUSDT"),
  mk("flowusd", "FLOWUSD", "Flow vs US Dollar", 0.725, 0.008, 4, 40, "BINANCE:FLOWUSDT"),
  mk("roseusd", "ROSEUSD", "Oasis Network vs US Dollar", 0.0685, 0.001, 4, 42, "BINANCE:ROSEUSDT"),
];
