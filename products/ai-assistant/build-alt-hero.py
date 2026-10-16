"""Puts the homepage's "Ask the context layer" block into index.html as a second version
of the hero demo, for the variants panel (variants.js) to switch between.

The block runs inside a shadow root with the homepage's full stylesheet, so neither page's CSS
leaks into the other. Everything it adds sits between <!-- hx:... --> markers, so re-running
this after the homepage changes replaces the old copy instead of adding another."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
HOME = os.path.join(HERE, '..', '..', 'brand.html')
PAGE = os.path.join(HERE, 'index.html')

home = open(HOME).read()
page = open(PAGE).read()
old = re.search(r'const HXLOGO = (\{.*?\});', page)

# drop a previous copy
page = re.sub(r'\n?<!-- hx:section -->.*?<!-- /hx:section -->\n?', '\n', page, flags=re.S)
page = re.sub(r'\n?<!-- hx:script -->.*?<!-- /hx:script -->\n?', '\n', page, flags=re.S)

# --- homepage css, scoped to the shadow root -------------------------------------------
css = home[home.index('<style>') + 7:home.index('</style>')]
css = re.sub(r'(^|[}\s,]):root(?=[\s{,\[:])', r'\1:host', css)
css = re.sub(r'(^|[}\s,])html,body\{', r'\1:host{', css)
css = re.sub(r'(^|[}\s,])body\{', r'\1:host{', css)
css += '\n:host{display:block;background:transparent}\n#ask{border-top:0;padding:0}\n'

# --- homepage markup: prompts, quote and chat (its own heading is dropped) ---------------
a = home.index('<section class="wrap sect ask" id="ask">')
b = home.index('</section>', a) + len('</section>')
block = home[a:b]
block = block.replace('<section class="wrap sect ask" id="ask">', '<section class="ask" id="ask">')
block = re.sub(r'\s*<p class="eyebrow">.*?</p>\s*<h2>.*?</h2>\s*<p class="lede">.*?</p>', '', block, count=1, flags=re.S)
block = block.replace('>in linearb</button>', '>In LinearB</button>').replace('>via mcp</button>', '>Via MCP</button>')
block = block.replace('<p class="grp-h">pre-built prompts</p>', '<p class="grp-h">Pre-built prompts</p>')

# --- homepage script for the block --------------------------------------------------------
s = home.index('const ASK = [')
e = home.index(".observe(document.getElementById('ask'));", s) + len(".observe(document.getElementById('ask'));")
js = home[s:e].replace('document.getElementById(', 'R.getElementById(')
# customer logos come from the page's own embedded set (the artifact frame blocks remote images)
logos = json.loads(re.search(r'const LOGO = (\{.*?\});', page).group(1))
# the SurveyMonkey logo isn't in the page's own set: reuse the copy from the last run
logos['survey'] = json.loads(old.group(1))['survey'] if old else open('/tmp/survey.txt').read().strip()
js = js.replace("logo: 'kraken_logo_b_w_1b6fd9b633'", "logo: 'kraken'").replace("logo: 'yum-logo'", "logo: 'yum'").replace("logo: 'survey-monkey'", "logo: 'survey'")
js = js.replace('src="https://assets.linearb.io/image/upload/c_fit,w_320,h_96/f_auto/q_auto/v1/${v.logo}"', 'src="${HXLOGO[v.logo]}"')
assert 'HXLOGO[v.logo]' in js, 'voice logo hook not found'

section = '''<!-- hx:section -->
  <section class="wrap stage-wrap" aria-label="Hero demo" data-slot="hero-demo" data-option="Homepage Ask block" hidden>
    <div id="hx-host"></div>
  </section>
<!-- /hx:section -->
'''
script = f'''<!-- hx:script -->
<script>
(() => {{
const host = document.getElementById('hx-host');
const R = host.attachShadow({{ mode: 'open' }});
R.innerHTML = {json.dumps('<style>' + css + '</style>' + block)};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = (concept, brand) => brand;
const HXLOGO = {json.dumps({k: logos[k] for k in ('kraken', 'yum', 'survey')})};
{js}
}})();
</script>
<!-- /hx:script -->
'''

# the page's own demo becomes the default version of the hero-demo slot
page = page.replace('<section class="wrap stage-wrap" aria-label="AI assistant demo with sample data">',
                    '<section class="wrap stage-wrap" aria-label="Hero demo" data-slot="hero-demo" data-option="Metric list" data-default>', 1)
m = re.search(r'<section class="wrap stage-wrap" aria-label="Hero demo" data-slot="hero-demo" data-option="Metric list"[^>]*>', page)
j = page.index('</section>', m.end()) + len('</section>\n')
page = page[:j] + section + page[j:]
k = page.rindex('</script>') + len('</script>')
page = page[:k] + '\n' + script + page[k:]
open(PAGE, 'w').write(page)
print('updated', PAGE, len(page) // 1024, 'KB')
