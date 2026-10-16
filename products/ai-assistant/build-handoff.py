"""Builds the developer handoff: the full page plus each interactive block on its own.

    handoff/
      full-page.html          the whole page, review tools removed
      blocks/hero-demo.html    metrics, streamed answer and matched customer proof
      blocks/role-answers.html three roles, one question and reply each
      blocks/answer-xray.html  each part of an answer beside its source
      blocks/builder.html      describe a metric, watch it get built
      README.md

Generic pieces (nav, logo strip, headings, CTAs, FAQ, footer) stay out of the blocks:
Studio already has components for them. Re-run after index.html changes."""
import os, re, shutil, zipfile

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SRC = 'index.html'
OUT = 'handoff'
s = open(SRC).read()

css = s[s.index('<style>') + 7:s.index('</style>')]
fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', s).group(0)
i = s.index('</footer>'); a = s.index('<script>', i) + 8; b = s.index('</script>', a)
js = s[a:b]


def element(src, start):
    """The full element that opens at `start`, matched by counting its own tag."""
    k = src.index(start)
    tag = re.match(r'<([a-z0-9]+)', start).group(1)
    depth, pos = 0, k
    for m in re.finditer(r'<(/?)%s\b[^>]*>' % tag, src[k:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return src[k:k + m.end()]
    raise ValueError(start)


clean = lambda h: re.sub(r'\s(data-slot|data-option)="[^"]*"|\sdata-default', '', h)

hero = clean(element(s, '<section class="wrap stage-wrap" aria-label="Hero demo"'))
xray = element(s, '<div class="xr" id="xr">')
bwin = element(s, '<div class="bwin"')

BLOCKS = {
    'hero-demo': ('Hero demo', hero.replace('<section class="wrap stage-wrap"', '<section class="wrap stage-wrap blk-pad"', 1), ''),
    'role-answers': ('Role answers', '<section class="wrap blk-pad"><div class="alts" id="alts"></div></section>', '.alts{margin-top:0}'),
    'answer-xray': ('Answer X-ray', f'<section class="wrap blk-pad" style="max-width:820px">{xray}</section>', ''),
    'builder': ('Builder', f'<section class="night"><div class="wrap blk-pad"><div class="b-grid"><div><div class="bchips" id="bchips"></div></div>{bwin}</div></div></section>', '.bchips{margin-top:0}\nbody{background:var(--night)}'),
}


def page(title, body, extra_css=''):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fonts}
<style>{css}
.blk-pad{{padding-block:48px}}
{extra_css}
</style>
</head>
<body>
{body}
<script>{js}</script>
</body>
</html>
'''


shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + '/blocks')

# full page: everything, minus the review-only variants panel and the alternative hero
full = s
full = re.sub(r'\n?<!-- hx:section -->.*?<!-- /hx:section -->\n?', '\n', full, flags=re.S)
full = re.sub(r'\n?<!-- hx:script -->.*?<!-- /hx:script -->\n?', '\n', full, flags=re.S)
full = full.replace('<script src="../../variants.js"></script>', '')
full = full.replace('<meta name="robots" content="noindex, nofollow">\n', '', 1)
full = clean(full)
full = full.replace('<meta charset="utf-8">\n', '', 1)
k = full.index('</style>') + len('</style>')
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + full[:k] + '\n</head>\n<body>\n' + full[k:].strip() + '\n</body>\n</html>\n')
open(OUT + '/full-page.html', 'w').write(full)

for name, (title, body, extra) in BLOCKS.items():
    open(f'{OUT}/blocks/{name}.html', 'w').write(page(f'{title} · LinearB AI assistant block', body, extra))

shutil.copy('HANDOFF-README.md', OUT + '/README.md')

z = 'LinearB-AI-assistant-handoff.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as f:
    for root, _, files in os.walk(OUT):
        for fn in sorted(files):
            path = os.path.join(root, fn)
            f.write(path, os.path.relpath(path, OUT))
print('wrote', z, [n for n in os.listdir(OUT + '/blocks')])
