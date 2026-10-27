import re, urllib.request
import collections

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=10).read().decode("utf-8", "ignore")

xml = get("https://julebu.co/sitemap.xml")
locs = re.findall(r"<loc>(.*?)</loc>", xml)
print("total urls:", len(locs))

# 按一级路径分组
groups = collections.Counter()
examples = collections.defaultdict(list)
for u in locs:
    path = u.replace("https://julebu.co", "").strip("/") or "(home)"
    first = path.split("/")[0]
    groups[first] += 1
    if len(examples[first]) < 8:
        examples[first].append(path)

for g, n in groups.most_common(40):
    print(f"{n:5d}  {g}")
    for e in examples[g][:6]:
        print("        ", e)
