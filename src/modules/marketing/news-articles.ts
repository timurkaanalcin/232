export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  imageGradient: string;
  breaking?: boolean;
  ticker?: string;
}

export const NEWS_CATEGORIES = ["Borsa", "Döviz", "Altın", "Kripto", "Ekonomi", "Şirket"] as const;

export const MARKET_TICKER = [
  { symbol: "BIST100", value: "9.842", change: "+1,24%", up: true },
  { symbol: "USD/TRY", value: "34,18", change: "+0,08%", up: true },
  { symbol: "EUR/TRY", value: "37,02", change: "-0,12%", up: false },
  { symbol: "GRAM ALTIN", value: "2.845", change: "+0,65%", up: true },
  { symbol: "BTC", value: "$67.420", change: "+2,1%", up: true },
  { symbol: "PETROL", value: "$78,4", change: "-0,4%", up: false },
] as const;

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    category: "Borsa",
    title: "BIST 100 günü yükselişle kapattı: Bankacılık hisseleri öncülük etti",
    summary:
      "Küresel risk iştahının artmasıyla birlikte yerel endeks %1,2 yükseldi. Yabancı yatırımcı girişleri gün içinde 180 milyon doları aştı.",
    author: "Finans Editörü",
    publishedAt: "8 dk önce",
    imageGradient: "from-slate-900 via-blue-950 to-emerald-950",
    breaking: true,
    ticker: "BIST100 +1,24%",
  },
  {
    id: "2",
    category: "Döviz",
    title: "Merkez Bankası rezervleri rekor seviyede: Piyasalar nasıl yorumluyor?",
    summary: "Brüt rezervlerdeki artış döviz kurunda kısa vadeli istikrar beklentisini güçlendirdi.",
    author: "Ekonomi Masası",
    publishedAt: "22 dk önce",
    imageGradient: "from-indigo-950 via-slate-900 to-blue-900",
  },
  {
    id: "3",
    category: "Altın",
    title: "Gram altında yeni zirve: Yatırımcılar hangi seviyeleri izliyor?",
    summary: "Jeopolitik gerilim ve küresel faiz beklentileri güvenli liman talebini canlı tutuyor.",
    author: "Emtia Analiz",
    publishedAt: "41 dk önce",
    imageGradient: "from-amber-900 via-yellow-950 to-slate-900",
  },
  {
    id: "4",
    category: "Kripto",
    title: "Bitcoin 67 bin dolar bandında: Kurumsal alımlar hız kesmiyor",
    summary: "ETF girişleri ve makro veri takvimi kripto piyasasında volatiliteyi artırabilir.",
    author: "Dijital Varlıklar",
    publishedAt: "1 saat önce",
    imageGradient: "from-violet-950 via-purple-950 to-slate-900",
  },
  {
    id: "5",
    category: "Şirket",
    title: "Holding şirketinden 2 milyar TL'lik yatırım planı açıklandı",
    summary: "Enerji ve teknoloji alanındaki yeni yatırımlar 2026 sonuna kadar tamamlanacak.",
    author: "Şirket Haberleri",
    publishedAt: "2 saat önce",
    imageGradient: "from-teal-950 via-cyan-950 to-slate-900",
  },
  {
    id: "6",
    category: "Ekonomi",
    title: "Enflasyon verisi öncesi piyasalar temkinli seyrediyor",
    summary: "Analistler çekirdek enflasyonda yavaşlama sinyallerine dikkat çekiyor.",
    author: "Makro Gündem",
    publishedAt: "3 saat önce",
    imageGradient: "from-rose-950 via-red-950 to-slate-900",
  },
];
