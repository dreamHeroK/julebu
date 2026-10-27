#!/usr/bin/env bash
# 在 WSL 里跑：打开页面 → 抓控制台错误 → 截图
set -uo pipefail
export PATH="$HOME/.local/bin:$PATH"

URL="${1:-http://127.0.0.1:8080/}"
OUT="${2:-/mnt/d/learning/julebu/.workbuddy/rea/page}"

code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/)
echo "server: $code"

TID=$(curl -s -X PUT "http://127.0.0.1:9222/json/new?${URL}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
echo "target: $TID"
sleep 2

rea inspect-web-page http://127.0.0.1:9222 "$TID" \
  --observation-ms 2500 --include-console-text --format json > "${OUT}-inspect.json" 2>&1

python3 - "$TID" "$OUT" <<'PY'
import json, sys, base64
tid, out = sys.argv[1], sys.argv[2]
d = json.load(open(f"{out}-inspect.json", encoding="utf-8"))
nr = d["normalized_result"]
ev = nr.get("console", {}).get("events", [])
errs = [e for e in ev if e.get("level") in ("error", "warning")]
print(f"console events: {len(ev)}  errors/warnings: {len(errs)}")
for e in errs[:12]:
    txt = (e.get("text") or "")[:300]
    print(f"  [{e.get('level')}] {txt}")
print("title:", nr.get("target", {}).get("title"))
print("dom nodes:", nr.get("dom", {}).get("total_nodes"))
PY

rea capture-web-screenshot http://127.0.0.1:9222 "$TID" --format json > "${OUT}-shot.json" 2>&1
python3 - "$OUT" <<'PY'
import json, sys, base64
out = sys.argv[1]
d = json.load(open(f"{out}-shot.json", encoding="utf-8"))
a = d["normalized_result"]["artifact"]
open(f"{out}.png", "wb").write(base64.b64decode(a["data_base64"]))
print("screenshot:", f"{out}.png", a["bytes"], "bytes")
PY
