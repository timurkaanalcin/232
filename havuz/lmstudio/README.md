# LM Studio Havuz — M3 Max 36 GB (tam teslim)

Bu paket **sizin Mac’inizde** çalışır. Cloud agent `lms` göremez; indirme, yükleme ve karşılaştırma Terminal’de.

Tek komut:

```bash
cd havuz/lmstudio
chmod +x *.sh
./install.sh          # 1. dalga + sunucu + (macOS) LaunchAgent
```

Havuz masaüstü: Ayarlar → **LM Studio kullan** (`http://127.0.0.1:1234`).

## 36 GB kuralı

Birleşik bellek. OS + LM Studio ≈ 8–10 GB. **Aynı anda tek sohbet modeli.** 27B Q4 ≈ 15–17 GB; görsel mmproj ve KV ayrıca eklenir. 8-bit 27B (~27,5 GB), 70B, 120B, 480B yok.

M3 Max’te mümkünse **MLX 4-bit**. Fusion gibi yalnızca GGUF varsa llama.cpp. Yükleme: GPU max, bağlam **16384** (Ornith / Nemotron için **8192**). Görsel + 32k 36 GB’de zorlar.

Görsel **üretim** LM Studio’da yok; Netlify Havuz (Gemini) tarafında kalır. LM Studio metin + (bazı modellerde) görsel **anlama**.

Bu sıra kaynak incelemesine dayanır; bilgisayarınızda ölçülmüş başarı sıralaması değildir. Üç Claude/muhakeme adayını **özgün Qwen3.8-27B ile aynı sorularda** karşılaştırın.

## Deneme sırası

1. **barozp v2** (`./havuz-lms.sh claude`) — Claude yaklaşımı için ilk aday
2. **Qwopus Fusion** (`./havuz-lms.sh fusion`) — reasoning + uygulama
3. **Magistral 2509** (`./havuz-lms.sh turkish`) — Türkçe sohbet
4. Her birini **özgün Qwen3.8** ile kıyas (`./havuz-lms.sh baseline` + `./compare.sh`)

## Modeller

Boyutlar yaklaşık Q4 / MLX 4-bit ana dosyadır.

| Model | Boyut | Dalga | Güçlü tarafı | Sınırı / karar |
|---|---:|:---:|---|---|
| [Qwen3.8-27B özgün](https://huggingface.co/Qwen/Qwen3.8-27B) | ~16,5 GB | 1 | Vizyon + düşünme; genel yetenek referansı | Claude hedeflemez. Her türevin yanında durur. |
| [Qwen3.8 Opus-Distill-v2 — barozp](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2) | 16,8 GB (MLX4 ≈ 15,0) | 1 | Qwen3.8 + doğrulanmış Opus izleri; v1 döngü bug’ı v2 kartında düzeltilmiş | Üretici testleri sınırlı (lm-eval QUICK). Claude benzerliği bağımsız kanıtlı değil. **İlk Claude adayı.** [GGUF](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF) |
| [Qwopus3.6-27B-Fusion](https://huggingface.co/Jackrong/Qwopus3.6-27B-Fusion-GGUF) | 16,8 GB | 1 | v2 muhakeme + Coder birleşimi; web/app | Araştırma sürümü. |
| [Magistral Small 2509](https://lmstudio.ai/models/magistral) | 14,3 GB | 1 | Çok dilli reasoning; **Türkçe açık**; görsel | Claude yakınlığı ölçülmemiş. |
| Qwen3.5-9B | ~10 GB | 1 | Hızlı günlük | 27B kalitesi yok. |
| nomic-embed-text-v1.5 | <0,2 GB | 1 | RAG gömme | Sohbet modeli değil. |
| [Qwopus3.6-27B-v2](https://huggingface.co/Jackrong/Qwopus3.6-27B-v2-GGUF) | 16,6 GB | 2 | Yapılandırılmış reasoning; 35B-Coder’dan farklı | Fusion’dan sonra. Standart eval yok. |
| [TeichAI Qwen3.6 Opus-Distill-v2](https://huggingface.co/TeichAI/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2) | 16,6 GB | 2 | Genel + yaratıcı + kod; MXFP8 tablolar | MXFP8 ≠ yerel Q4. barozp bitmeden indirmeyin. [GGUF](https://huggingface.co/TeichAI/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2-GGUF) |
| [Ministral 3 14B Reasoning](https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512) | 8,2 GB | 2 | Hafif reasoning + görsel | Önce 27B. |
| [Phi-4 Reasoning 14B](https://lmstudio.ai/models/microsoft/phi-4-reasoning) | 9,1 GB | 2 | Matematik / bilim / kod | Türkçe ve Claude birincil değil. |
| [Ornith-1.0-35B](https://huggingface.co/ornith-ai/Ornith-1.0-35B-GGUF) | 21,2 GB | 3 | Araçlı kod ajanı | 36 GB’de dar; ctx 8192. Fusion yetmezse. |
| [Nemotron 3 Nano 30B-A3B](https://lmstudio.ai/models/nvidia/nemotron-3-nano) | 24,5 GB | 3 | MoE, açılır reasoning, araç | Sıkışık; Türkçe ilk tercih değil. |
| [gpt-oss-20B](https://lmstudio.ai/models/gpt-oss) | ~13,5 GB | extra | Açık ağırlık, araç | 120B yasak. Claude/TR birincil değil. |
| [Qwen3-Coder-30B-A3B](https://lmstudio.ai/models/qwen/qwen3-coder-30b) | ~18,6 GB | extra | Resmi kod ajanı | Uzun bağlamı 16k’de tutun. 480B yok. |
| bge-m3 | ~2,3 GB | extra | Çok dilli / Türkçe RAG | Sohbet değil. |
| Whisper large-v3-turbo | ~1,6 GB | extra | Yerel STT | Havuz sohbet UI’si ses göndermez; LM Studio modülü. |

**İndirmeyin**

- **barozp Opus-Distill v1:** birleşik biçim (`no prose` + `no markdown`) düşünme döngüsü; üretici v2’de düzelttiğini yazıyor. [Açıklama](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2)
- **rico03 Qwen3.8 Claude-Opus Distilled:** kartında **150 adımlık pipeline denemesi** (~%12,6 epoch), yeniden benchmark yok. Bitmiş model değil. [Açıklama](https://huggingface.co/rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled)
- MLX 8-bit 27B, gpt-oss-120b, 70B / 72B / 122B / 480B

## Otomasyon

| Komut | Ne yapar |
|---|---|
| `./install.sh` | 1. dalga indir, `:1234 --cors`, macOS LaunchAgent |
| `./download.sh` | 1. dalga |
| `./download.sh 2` / `3` / `extra` / `all` / `list` | Diğer dalgalar / tablo |
| `./havuz-lms.sh start\|stop\|status` | API |
| `./havuz-lms.sh claude\|baseline\|fusion\|turkish\|fast` | Rol yükle (öncekini boşaltır) |
| `./havuz-lms.sh load qwopus` | Katalog id’si |
| `./compare.sh` | Yüklü modele 9 soru; `results/` |
| `./embed.sh` | Sohbeti boşalt, gömme yükle |
| `./cleanup.sh` | Yasak kopyaları işaretle; silme `HAVUZ_LMS_DELETE=1` |
| `./install-launchd.sh` | Login’de sunucu (`uninstall` ile kalkar) |

Kaynak katalog: `src/lib/local-studio.json` (UI + script aynı dosya). Çıkarım: `inference.json`. Üslup metinleri: `presets/*.txt`.

36 GB’de iki 27B **birlikte yüklenmez**. Rol değiştirmek önce `unload --all` yapar.

## Özelleştirme (Havuz)

Ayarlar:

- **LM Studio kullan** / **Netlify kullan** / **Bu site**
- Üslup çipleri (sıcaklığı da ayarlar): Claude, Türkçe, Kod, Muhakeme, Yaratıcı, Ajan, Görsel, STEM, Kısa, Karşılaştırma
- Yerel modda üst bant: roller + deneme sırası. Çip **ağırlığı değiştirmez**; `./havuz-lms.sh <rol>` komutunu panoya kopyalar.

Yükleme önerisi 27B: GPU max, bağlam 16384, flash attention açık.

## Karşılaştırma

`src/lib/compare-questions.json` — 9 soru. Özellikle **soru 2** (`no prose` + `no markdown`): v1 döngü vakası; v2’de beklenen kısa kod.

```bash
./havuz-lms.sh claude && ./compare.sh
./havuz-lms.sh baseline && ./compare.sh
```

Kayıt: `lmstudio/results/` (git’e girmez). tok/s, boş çıktı, Türkçe 1–5.

## Görsel ve diğer modüller

| Modül | Nerede |
|---|---|
| Sohbet / muhakeme / kod | LM Studio, tek model |
| Görsel anlama | Qwen3.8, barozp v2, Magistral, TeichAI, Ministral |
| Görsel üretim | Netlify Havuz, Gemini |
| RAG gömme | nomic (dalga 1), bge-m3 (extra) |
| STT | Whisper extra; Havuz UI yok |
| Araçlı ajan | Fusion / Ornith / gpt-oss-20B / Qwen3-Coder |
