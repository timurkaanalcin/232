# LM Studio Havuz — M3 Max 36 GB (teslim)

Bu paket Mac’te çalışır. Cloud agent `lms` göremez; indirme sizin Terminal’inizde.

## 36 GB kuralı

Unified memory. OS + LM Studio ~8–10 GB. **Aynı anda tek model.** 27B Q4 ~17 GB + görsel/KV. 8-bit 27B ve 70B yok.

M3 Max’te mümkünse **MLX 4-bit**; Fusion gibi yalnızca GGUF varsa llama.cpp.

## Zorunlu indirme (1. dalga)

Deneme sıranız + özgün referans + hızlı + embedding:

| Rol | Repo | ~Boyut | Not |
|---|---|---:|---|
| Referans | `lmstudio-community/Qwen3.8-27B-MLX-4bit` | ~15–17 GB | Özgün Qwen3.8; vizyon + düşünme. Her Claude türevini bununla karşılaştırın. |
| Claude adayı | `barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit` | ~17 GB | **İlk Claude denemesi.** v1 döngü bug’ı v2’de düzeltilmiş; genel üstünlük kanıtlı değil. [Kart](https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2) |
| Kod + reasoning | `Jackrong/Qwopus3.6-27B-Fusion-GGUF` | ~16,8 GB | Web/app. Araştırma sürümü. |
| Türkçe | `lmstudio-community/Magistral-Small-2509-MLX-4bit` | ~14 GB | Çok dilli reasoning + görsel. Claude üslubu ölçülmüş değil. |
| Hızlı | `qwen/qwen3.5-9b` MLX 8-bit | ~8–13 GB | Günlük. |
| Embedding | `nomic-embed-text-v1.5` | <0,2 GB | RAG. |

Komut: `./download.sh` (quant sorarsa tablodaki bit).

## Göz önünde bulundurulan, 1. dalgada indirme

Kaynak incelemesi; sizin tablonuzla aynı çekinceler.

| Model | ~Q4 | Karar |
|---|---:|---|
| Qwopus3.6-27B-v2 | 16,6 GB | Fusion’dan sonra; reasoning-only kopya. |
| TeichAI Opus-Distill-v2 | 16,6 GB | barozp v2 bitmeden indirme. MXFP8 ≠ yerel Q4. |
| Ornith-1.0-35B | 21,2 GB | Kod ajanı alternatifi; 36 GB’de boşluk dar. Fusion yetmezse 2. dalga. |
| Nemotron 3 Nano 30B-A3B | 24,5 GB | Sıkışık; Türkçe ilk tercih değil. |
| Ministral 3 14B Reasoning | 8,2 GB | Hafif yedek; 27B’ler bitince. |
| Phi-4 Reasoning 14B | 9,1 GB | STEM; Türkçe/Claude birincil değil. |

**İndirmeyin:** barozp **v1** (düşünme döngüsü), **rico03** (150 adımlık deneme).

## Otomasyon

```bash
cd havuz/lmstudio
chmod +x *.sh
./download.sh
./havuz-lms.sh start          # :1234 + CORS
./havuz-lms.sh claude         # barozp v2
./havuz-lms.sh baseline       # özgün 3.8
./havuz-lms.sh fusion
./havuz-lms.sh turkish
./havuz-lms.sh fast
```

Login’de sunucu: `com.havuz.lms.plist` içinde `REPLACE` yolunu düzeltin, `~/Library/LaunchAgents/` altına kopyalayın, `launchctl load` edin.

Havuz masaüstü: Ayarlar → **LM Studio kullan** (`http://127.0.0.1:1234`). Üslup: Claude / Türkçe / Kod / Muhakeme.

## Özelleştirme

`presets/*.txt` — LM Studio System Prompt’a yapıştırın veya Havuz ayarlarından seçin.

Yükleme önerisi 27B: GPU max, bağlam **16384**, flash attention açık. Görsel + 32k 36 GB’de zorlar.

## Karşılaştırma

`compare-sorulari.md` — aynı 7 soru, dört model. Özellikle soru 2 (`no prose` + `no markdown`): v1’in döngü vakası; v2’de beklenen kısa kod.

## Görsel üretim

LM Studio metin/görsel **anlama**. Görsel **üretim** Netlify Havuz (Gemini) tarafında kalır.
