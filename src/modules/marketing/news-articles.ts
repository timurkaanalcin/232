export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  imageGradient: string;
  breaking?: boolean;
}

export const NEWS_CATEGORIES = ["Gündem", "Ekonomi", "Spor", "Teknoloji", "Dünya", "Sağlık"] as const;

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    category: "Gündem",
    title: "Merkez Bankası faiz kararını açıkladı: Piyasalar nasıl tepki verdi?",
    summary:
      "Para Politikası Kurulu toplantısının ardından açıklanan karar, bankacılık ve reel sektörde yeni bir değerlendirme dalgası başlattı.",
    author: "Ayşe Yılmaz",
    publishedAt: "12 dk önce",
    imageGradient: "from-red-700 via-red-900 to-slate-900",
    breaking: true,
  },
  {
    id: "2",
    category: "Ekonomi",
    title: "İstanbul borsasında günün öne çıkan hisseleri",
    summary: "Bankacılık ve enerji sektörü öncülüğünde hacimli bir seans yaşandı. Uzmanlar kısa vadeli görünümü değerlendirdi.",
    author: "Mehmet Kaya",
    publishedAt: "34 dk önce",
    imageGradient: "from-blue-800 via-indigo-900 to-slate-900",
  },
  {
    id: "3",
    category: "Spor",
    title: "Milli takım kadrosu açıklandı: Avrupa play-off maçı öncesi sürpriz isimler",
    summary: "Teknik direktör, form grafiği yüksek genç oyunculara şans verdi. Kadroda son dakika değişikliği beklenmiyor.",
    author: "Can Demir",
    publishedAt: "1 saat önce",
    imageGradient: "from-emerald-700 via-teal-900 to-slate-900",
  },
  {
    id: "4",
    category: "Teknoloji",
    title: "Yapay zekâ destekli haber odaları yaygınlaşıyor",
    summary: "Medya kuruluşları, doğrulama süreçlerini hızlandırmak için yeni araçlara yatırım yapıyor.",
    author: "Elif Arslan",
    publishedAt: "2 saat önce",
    imageGradient: "from-violet-700 via-purple-900 to-slate-900",
  },
  {
    id: "5",
    category: "Dünya",
    title: "Avrupa'da enerji fiyatlarında yeni düzenleme görüşmeleri",
    summary: "Liderler, kış dönemi öncesi tüketici tarafındaki baskıyı azaltacak ortak adımlar arıyor.",
    author: "Deniz Akın",
    publishedAt: "3 saat önce",
    imageGradient: "from-amber-700 via-orange-900 to-slate-900",
  },
  {
    id: "6",
    category: "Sağlık",
    title: "Uzmanlar mevsimsel hastalıklara karşı erken önlem çağrısı yaptı",
    summary: "Aşı takvimi ve hijyen kurallarına dikkat edilmesi gerektiği vurgulandı.",
    author: "Dr. Selin Öztürk",
    publishedAt: "4 saat önce",
    imageGradient: "from-cyan-700 via-sky-900 to-slate-900",
  },
];
