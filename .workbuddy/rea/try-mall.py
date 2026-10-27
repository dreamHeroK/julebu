import json, urllib.request

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=10).read().decode("utf-8", "ignore")

# 1) mall SSR HTML
try:
    html = get("https://julebu.co/mall")
    print("=== /mall html:", len(html), "bytes")
    import re
    # 看标题和正文线索
    t = re.search(r"<title[^>]*>(.*?)</title>", html)
    print("title:", t.group(1) if t else None)
    for kw in ["课程", "商城", "login", "登录", "打包", "课程包"]:
        print(kw, html.count(kw))
    # payload 内联？
    if "_payload" in html:
        print("has inline payload")
except Exception as e:
    print("mall err:", e)

# 2) 首页 payload（上次已证明可直连）
for u in ["https://julebu.co/_payload.json", "https://julebu.co/learn/_payload.json"]:
    try:
        b = get(u)
        print("===", u, len(b))
        print(b[:300])
    except Exception as e:
        print(u, "err:", e)
