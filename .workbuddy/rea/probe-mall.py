import json, urllib.request, re

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=10).read().decode("utf-8", "ignore")

# sitemap
for u in ["https://julebu.co/sitemap.xml", "https://julebu.co/robots.txt"]:
    try:
        b = get(u)
        print("===", u, len(b))
        print(b[:1500])
    except Exception as e:
        print(u, "err:", e)

# 之前逆向出的路由候选里找 course pack 线索
try:
    routes = json.load(open("routes.json"))
    items = routes["summary"]["normalized_result"]["items"]
    print("=== routes with course/pack/mall:")
    for it in items:
        p = it.get("path", "")
        if any(k in p.lower() for k in ["course", "pack", "mall", "game"]):
            print(" ", it.get("classification"), p)
except Exception as e:
    print("routes err:", e)
