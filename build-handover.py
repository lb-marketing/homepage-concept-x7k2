#!/usr/bin/env python3
"""Builds the homepage handover for the web team from brand.html.

    _exports/homepage-handover/
      index.html        the chosen page: no top nav, no footer, no variants panel,
                        no unused versions, final copy in the markup
      media/            the local files the page uses
      README.md         the handover doc (HANDOVER-HOMEPAGE.md)
    _exports/LinearB-homepage-handover.zip

brand.html stays the working file with every option. Re-run after it changes."""
import html, os, re, shutil, zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '_exports', 'homepage-handover')
ZIP = os.path.join(ROOT, '_exports', 'LinearB-homepage-handover.zip')
s = open(os.path.join(ROOT, 'brand.html'), encoding='utf-8').read()


def element_at(src, k):
    """(start, end) of the element whose opening tag starts at k, matched by counting its own tag."""
    tag = re.match(r'<([a-z0-9]+)', src[k:]).group(1)
    depth = 0
    for m in re.finditer(r'<(/?)%s\b[^>]*>' % tag, src[k:]):
        if m.group(0).endswith('/>'):
            continue
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return k, k + m.end()
    raise ValueError('unclosed <%s> at %d' % (tag, k))


def remove_all(src, pattern):
    """Removes every element whose opening tag matches `pattern`, outermost first."""
    while True:
        m = re.search(pattern, src)
        if not m:
            return src
        a, b = element_at(src, m.start())
        # take the element's own line with it when it sits alone on one
        line_a = src.rfind('\n', 0, a) + 1
        if not src[line_a:a].strip() and src[b:b + 1] == '\n':
            a, b = line_a, b + 1
        src = src[:a] + src[b:]


# 1. page chrome the web team already has: top nav and footer
s = remove_all(s, r'<header\b')
s = remove_all(s, r'<footer\b')

# 2. versions that were not chosen, the empty "off" placeholders, and the hidden concept eyebrows
s = remove_all(s, r'<[a-z0-9]+\b[^>]*\bdata-slot="[^"]*"[^>]*\shidden\b[^>]*>')
s = remove_all(s, r'<div class="slot-empty"')
s = remove_all(s, r'<i class="mode\b')
s = remove_all(s, r'<p class="eyebrow"')
s = re.sub(r'\s(?:data-slot|data-option)="[^"]*"|\sdata-default\b', '', s)

# 3. final copy in the markup: the page swapped concept wording for data-brand at runtime
while True:
    m = re.search(r'<([a-z0-9]+)\b([^>]*?)\sdata-brand="([^"]*)"([^>]*)>', s)
    if not m:
        break
    a, b = element_at(s, m.start())
    tag = m.group(1)
    s = s[:a] + '<%s%s%s>%s</%s>' % (tag, m.group(2), m.group(4), html.unescape(m.group(3)), tag) + s[b:]

# 4. scripts: the variants panel, the unused APEX versions and the 3D concept scene
s = s.replace('<script src="variants.js"></script>\n', '')
s = s.replace('<script src="apex-options.js"></script>\n', '')
s = s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n', '')
a = s.index('const MASK = "data:image/png;base64,')
b = s.index('/* Shared by both versions:')
s = s[:a] + s[b:]
# script sections that only drive versions the page no longer has; each runs to the next section
# marker, or to the end of the script it sits in
DROP = [
    'Hero visual, explore measure act option', 'Hero tunnels: the cost readout flips',
    'Hero visual, APEX outcomes option', 'Hero visual, build-up options', 'Role card icons',
    'Product tour video', 'Seats: one PR', 'Closing counter', 'Closing block, context to the button',
    'Closing block, agent books the demo', 'Version switch',
]
for title in DROP:
    a = s.index('/* ---------- ' + title)
    ends = [s.find('\n/* ---------- ', a + 1), s.find('\n})();\n</script>', a)]
    b = min(e for e in ends if e > 0) + 1
    s = s[:a] + s[b:]
# the "Is AI paying off?" hero's own script
a = s.index('<!-- hero: "Is AI paying off?"')
b = s.index('</script>', a) + len('</script>\n')
s = s[:a] + s[b:]

# 5. head: a production page is indexable
s = s.replace('<meta name="robots" content="noindex, nofollow">\n', '')

s = s.replace('/* a variant that isn\'t showing stays hidden, whatever display its own styles set */\n[data-slot][hidden]{display:none !important}\n', '')
assert 'data-slot="' not in s and 'data-brand=' not in s and '<header' not in s and '<footer' not in s

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, 'media'))
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(s)
for f in sorted(set(re.findall(r'media/([A-Za-z0-9._-]+)', s))):
    shutil.copy(os.path.join(ROOT, 'media', f), os.path.join(OUT, 'media', f))
shutil.copy(os.path.join(ROOT, 'HANDOVER-HOMEPAGE.md'), os.path.join(OUT, 'README.md'))

with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(OUT):
        for fn in sorted(files):
            path = os.path.join(root, fn)
            z.write(path, os.path.join('homepage-handover', os.path.relpath(path, OUT)))
print('wrote', os.path.relpath(ZIP, ROOT), '·', len(s) // 1024, 'KB page ·',
      sorted(os.listdir(os.path.join(OUT, 'media'))))
