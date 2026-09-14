#!/usr/bin/env bash
# Yüklü modele compare-questions.json sorularını atar; sonuçları results/ altına yazar.
# Kullanım:
#   ./havuz-lms.sh start && ./havuz-lms.sh claude && ./compare.sh
#   ./compare.sh --model havuz-claude
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
QFILE="$DIR/../src/lib/compare-questions.json"
OUTDIR="$DIR/results"
BASE="${HAVUZ_LMS_BASE:-http://127.0.0.1:1234}"
MODEL="${HAVUZ_LMS_MODEL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model) MODEL="$2"; shift 2 ;;
    --base) BASE="$2"; shift 2 ;;
    *) echo "bilinmeyen arg: $1"; exit 1 ;;
  esac
done

command -v python3 >/dev/null || { echo "python3 gerekli"; exit 1; }
mkdir -p "$OUTDIR"

python3 - "$BASE" "$MODEL" "$QFILE" "$OUTDIR" <<'PY'
import json, sys, time, urllib.request, datetime, pathlib, os

base, model, qfile, outdir = sys.argv[1:5]
qdata = json.loads(pathlib.Path(qfile).read_text())
temp = qdata.get("temperature", 0.7)

def req(path, payload=None, timeout=180):
    url = base.rstrip("/") + path
    if payload is None:
        r = urllib.request.Request(url)
    else:
        r = urllib.request.Request(
            url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}
        )
    with urllib.request.urlopen(r, timeout=timeout) as res:
        return json.loads(res.read().decode())

try:
    models = req("/v1/models")
except Exception as e:
    print(f"LM Studio API yok ({base}): {e}", file=sys.stderr)
    print("Önce: ./havuz-lms.sh start && ./havuz-lms.sh claude", file=sys.stderr)
    sys.exit(1)

ids = [m.get("id") for m in models.get("data") or []]
if not model:
    model = ids[0] if ids else ""
if not model:
    print("Yüklü model yok.", file=sys.stderr)
    sys.exit(1)
print(f"model={model}  base={base}")

stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in model)
out = pathlib.Path(outdir) / f"{stamp}-{safe}.json"
md = pathlib.Path(outdir) / f"{stamp}-{safe}.md"
rows = []

for q in qdata["questions"]:
    t0 = time.time()
    payload = {
        "model": model,
        "temperature": 0 if q.get("v1LoopRepro") else temp,
        "messages": [{"role": "user", "content": q["prompt"]}],
        "stream": False,
        "max_tokens": 1024 if q.get("v1LoopRepro") else 2048,
    }
    err = None
    text = ""
    usage = {}
    try:
        body = req("/v1/chat/completions", payload, timeout=300)
        ch = (body.get("choices") or [{}])[0]
        msg = ch.get("message") or {}
        text = msg.get("content") or ""
        usage = body.get("usage") or {}
    except Exception as e:
        err = str(e)
        text = ""
    dt = time.time() - t0
    rec = {
        "id": q["id"],
        "title": q.get("title"),
        "prompt": q["prompt"],
        "seconds": round(dt, 2),
        "error": err,
        "content": text,
        "usage": usage,
        "empty": not bool((text or "").strip()),
        "v1LoopRepro": bool(q.get("v1LoopRepro")),
        "scoreHint": q.get("score"),
    }
    rows.append(rec)
    flag = "BOŞ" if rec["empty"] else "ok"
    print(f"Q{q['id']} {flag} {dt:.1f}s  {(text or err or '')[:80].replace(chr(10),' ')}")

doc = {
    "model": model,
    "base": base,
    "createdAt": stamp,
    "note": "Bu koşu sizin Mac’inizde ölçülür; cloud agent çalıştırmaz.",
    "results": rows,
}
out.write_text(json.dumps(doc, ensure_ascii=False, indent=2))
lines = [f"# Karşılaştırma {stamp}", "", f"- model: `{model}`", f"- base: {base}", ""]
for r in rows:
    lines += [
        f"## Q{r['id']} — {r.get('title')}",
        "",
        f"- süre: {r['seconds']}s",
        f"- boş: {r['empty']}",
        f"- usage: `{json.dumps(r.get('usage'))}`",
        f"- puan ipucu: {r.get('scoreHint')}",
        "",
        "```",
        (r.get("content") or r.get("error") or "")[:4000],
        "```",
        "",
    ]
md.write_text("\n".join(lines))
print(f"yazıldı: {out}")
print(f"yazıldı: {md}")
PY
