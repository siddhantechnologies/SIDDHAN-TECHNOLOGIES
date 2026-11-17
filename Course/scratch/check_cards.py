import re

with open(r'd:\Love Boi\MY\Course\index.html', encoding='utf-8') as f:
    text = f.read()

cards = re.findall(r'<article class="role-card".*?</article>', text, re.DOTALL)
print('Total cards in index.html:', len(cards))
if cards:
    print('First card sample:\n', cards[0][:400])
