import json

data = json.load(open('learn-extracted.json'))
want = {'food', 'animals', 'emotions', 'body', 'weather', 'fruits'}
for c in data:
    if c['slug'] not in want:
        continue
    print('=' * 20, c['slug'], c['title'])
    for g in c['groups']:
        for w in g['words']:
            n = len(w['example'].split())
            if n <= 8 and w['example'].endswith('.'):
                print('  [{}] {}词 | {} | {}'.format(w['en'], n, w['example'], w['exampleCn']))
