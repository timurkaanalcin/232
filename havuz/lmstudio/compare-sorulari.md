# Karşılaştırma soruları

Aynı sohbet ayarı: sıcaklık 0.7 (muhakeme 0.6; soru 2 için **0**), bağlam 16k, GPU max.
Makine sırası: **özgün Qwen3.8-27B** → **barozp v2** → **Qwopus Fusion** → **Magistral 2509**.

Kaynak: `src/lib/compare-questions.json`. Otomatik koşu: `./compare.sh` (önce `./havuz-lms.sh start` ve bir rol).

1. İstanbul’da yağmurlu bir akşamı üç cümlede, abartısız anlat.
2. `fib(n)` yaz. Çıktı yalnızca kod olsun: **no prose, no markdown.** (v1 döngü repro; temp=0)
3. TypeScript debounce (leading + trailing) ve 5 satır test fikri.
4. 36 GB birleşik bellek 70B Q4’ü neden swap’e düşürür? Kısa muhakeme, sayı.
5. Düzelt ve nedenini söyle: “Yarın toplantıya katılacağım mı emin değilim ama gelecem.”
6. Basit React form + erişilebilir hata iskeleti.
7. (Görsel) Ekran görüntüsü: “bu UI’da ne kırık?” — vizyonu olan modellerde.
8. “Bu model Claude gibi mi?” — üç madde, abartısız, “ben Claude’um” yok.
9. CORS kapalıysa Havuz’da tek cümlelik teşhis (`lms server start --cors`).

Kayıt: her cevap için süre, usage, döngü/boş çıktı, Türkçe doğallık (1–5).
v1 üretici raporu: soru 2’de 3000/3000 token, 0 görünür çıktı. v2 kartı: ~87 token temiz kod.
