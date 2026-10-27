import json
data = json.load(open("mall-net.json"))
print("total entries:", len(data))
for b in data:
    print(b.get("httpStatus", "-"), b.get("resourceType", "?"), b.get("size", 0), b["url"][:120])
