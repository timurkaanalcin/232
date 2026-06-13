export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  imageGradient: string;
  breaking?: boolean;
  ticker?: string;
}

export interface FinanceVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  youtubeId: string;
}

import { SITE_URL } from "@/lib/site-config";

export const SITE_NAME = "CRM Nexus";
export { SITE_URL };

export const NEWS_CATEGORIES = ["Borsa", "Döviz", "Altın", "Kripto", "Ekonomi", "Şirket"] as const;

export const MARKET_TICKER = [
  { symbol: "BIST100", value: "9.842", change: "+1,24%", up: true },
  { symbol: "USD/TRY", value: "34,18", change: "+0,08%", up: true },
  { symbol: "EUR/TRY", value: "37,02", change: "-0,12%", up: false },
  { symbol: "GRAM ALTIN", value: "2.845", change: "+0,65%", up: true },
  { symbol: "BTC", value: "$67.420", change: "+2,1%", up: true },
  { symbol: "PETROL", value: "$78,4", change: "-0,4%", up: false },
] as const;

/** Ücretsiz Unsplash görselleri — finans temalı */
export const FINANCE_VIDEOS: FinanceVideo[] = [
  {
    id: "v1",
    title: "Borsa İstanbul haftalık değerlendirme",
    channel: "borsahatti TV",
    duration: "12:40",
    youtubeId: "dX9CGRzo4v4",
  },
  {
    id: "v2",
    title: "Dolar ve euro kuru: haftanın özeti",
    channel: "Döviz Masası",
    duration: "8:15",
    youtubeId: "Xw2cKSQ-2oE",
  },
  {
    id: "v3",
    title: "Altın yatırımı: uzman görüşleri",
    channel: "Emtia Raporu",
    duration: "10:02",
    youtubeId: "GGMhgF77inc",
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    category: "Borsa",
    title: "BIST 100 günü yükselişle kapattı: Bankacılık hisseleri öncülük etti",
    summary:
      "Küresel risk iştahının artmasıyla birlikte yerel endeks %1,2 yükseldi. Yabancı yatırımcı girişleri gün içinde 180 milyon doları aştı.",
    author: "borsahatti Editörü",
    publishedAt: "8 dk önce",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&auto=format&fit=crop",
    imageGradient: "from-slate-900/80 via-blue-950/70 to-emerald-950/80",
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
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80&auto=format&fit=crop",
    imageGradient: "from-indigo-950/80 via-slate-900/70 to-blue-900/80",
  },
  {
    id: "3",
    category: "Altın",
    title: "Gram altında yeni zirve: Yatırımcılar hangi seviyeleri izliyor?",
    summary: "Jeopolitik gerilim ve küresel faiz beklentileri güvenli liman talebini canlı tutuyor.",
    author: "Emtia Analiz",
    publishedAt: "41 dk önce",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5b556fdbfb07?w=800&q=80&auto=format&fit=crop",
    imageGradient: "from-amber-900/80 via-yellow-950/70 to-slate-900/80",
  },
  {
    id: "4",
    category: "Kripto",
    title: "Bitcoin 67 bin dolar bandında: Kurumsal alımlar hız kesmiyor",
    summary: "ETF girişleri ve makro veri takvimi kripto piyasasında volatiliteyi artırabilir.",
    author: "Dijital Varlıklar",
    publishedAt: "1 saat önce",
    imageUrl: "https://images.unsplash.com/photo-1621761190629-d1438e743788?w=800&q=80&auto=format&fit=crop",
    imageGradient: "from-violet-950/80 via-purple-950/70 to-slate-900/80",
  },
  {
    id: "5",
    category: "Şirket",
    title: "Holding şirketinden 2 milyar TL'lik yatırım planı açıklandı",
    summary: "Enerji ve teknoloji alanındaki yeni yatırımlar 2026 sonuna kadar tamamlanacak.",
    author: "Şirket Haberleri",
    publishedAt: "2 saat önce",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
    imageGradient: "from-teal-950/80 via-cyan-950/70 to-slate-900/80",
  },
  {
    id: "6",
    category: "Ekonomi",
    title: "Enflasyon verisi öncesi piyasalar temkinli seyrediyor",
    summary: "Analistler çekirdek enflasyonda yavaşlama sinyallerine dikkat çekiyor.",
    author: "Makro Gündem",
    publishedAt: "3 saat önce",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop",
    imageGradient: "from-rose-950/80 via-red-950/70 to-slate-900/80",
  },
];
