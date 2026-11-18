import re

with open(r'd:\Love Boi\MY\Course\index.html', encoding='utf-8') as f:
    text = f.read()

codes = re.findall(r'class="role-id-badge mono">(.*?)</div>', text)
titles = re.findall(r'class="role-title">(.*?)</h3>', text)
for i, (c, t) in enumerate(zip(codes, titles)):
    print(f'{i+1}. [{c}] -> {t}')
