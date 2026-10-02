#!/usr/bin/env python3
"""Local preview server for the homepage drafts.

Serves this folder like `python3 -m http.server`, plus two endpoints the
variants panel (variants.js) uses to lock in a default:

  POST /api/variants   body: the full variants.json (headline options)
      Saves variants.json and writes each heading's default wording into brand.html.
  POST /api/section    body: {"slot": "factory", "option": "Original"}
      Makes that version of the section the one brand.html shows; the other
      versions in the slot stay in the file, marked hidden.

Either way the locked-in version is what the page shows with or without the panel.
"""
import html
import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
VARIANTS = os.path.join(ROOT, 'variants.json')
PAGE = os.path.join(ROOT, 'brand.html')


def render(tag, text):
    """Same markup variants.js renders: ' / ' marks a line break, *text* is emphasis."""
    lines = [re.sub(r'\*(.+?)\*', r'<em>\1</em>', html.escape(l.strip(), quote=False)) for l in text.split(' / ') if l.strip()]
    if tag == 'h1':
        return ''.join(f'<span class="ln">{l}</span>' for l in lines)
    return '<br>'.join(lines)


def bake(data):
    with open(PAGE, encoding='utf-8') as f:
        src = f.read()
    for vid, v in data.items():
        text = v['options'][v['default']]
        pat = re.compile(r'(<(h[1-6]|p)\b[^>]*\bdata-variant="%s"[^>]*>)(.*?)(</\2>)' % re.escape(vid), re.S)
        src = pat.sub(lambda m: m.group(1) + render(m.group(2), text) + m.group(4), src, count=1)
    tmp = PAGE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(src)
    os.replace(tmp, PAGE)


def set_section_default(slot, option):
    with open(PAGE, encoding='utf-8') as f:
        src = f.read()
    tag = re.compile(r'<[a-z][a-z0-9]*\b[^>]*\bdata-slot="%s"[^>]*>' % re.escape(slot))
    found = False

    def fix(m):
        nonlocal found
        name, rest = re.match(r'<([a-z][a-z0-9]*)(.*)>$', m.group(0), re.S).groups()
        attrs = re.findall(r'\s+([^\s=>]+)(="[^"]*"|=\'[^\']*\')?', rest)
        attrs = [(k, v) for k, v in attrs if k not in ('hidden', 'data-default')]
        mine = ('data-option', '="%s"' % option) in attrs
        found = found or mine
        attrs.append(('data-default' if mine else 'hidden', ''))
        return '<' + name + ''.join(' ' + k + v for k, v in attrs) + '>'

    src = tag.sub(fix, src)
    if not found:
        return False
    tmp = PAGE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(src)
    os.replace(tmp, PAGE)
    return True


def valid(data):
    return isinstance(data, dict) and all(
        isinstance(v, dict)
        and isinstance(v.get('options'), list) and v['options']
        and all(isinstance(o, str) and o.strip() for o in v['options'])
        and isinstance(v.get('default'), int) and 0 <= v['default'] < len(v['options'])
        for v in data.values())


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        # always serve the latest file, so a reload shows what was just locked in
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # byte ranges, so the browser can seek in the tour video (plain http.server can't)
    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        m = rng and re.match(r'bytes=(\d*)-(\d*)$', rng.strip())
        if not m or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        start, end = m.group(1), m.group(2)
        if start:
            start, end = int(start), min(int(end) if end else size - 1, size - 1)
        else:
            start, end = max(0, size - int(end or 0)), size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return None
        f = open(path, 'rb')
        f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        self._left = None
        while left > 0:
            chunk = source.read(min(64 * 1024, left))
            if not chunk:
                break
            try:
                outputfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                break
            left -= len(chunk)

    def do_OPTIONS(self):
        # lets variants.js check that saving is available
        self.send_response(204 if self.path in ('/api/variants', '/api/section') else 404)
        self.end_headers()

    def do_POST(self):
        if self.path not in ('/api/variants', '/api/section'):
            return self.send_error(404)
        try:
            data = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
        except ValueError:
            return self.send_error(400, 'Invalid JSON')
        if self.path == '/api/section':
            if not (isinstance(data, dict) and isinstance(data.get('slot'), str) and isinstance(data.get('option'), str)):
                return self.send_error(400, 'Expected {"slot", "option"}')
            if not set_section_default(data['slot'], data['option']):
                return self.send_error(404, 'No such section version')
            self.send_response(204)
            return self.end_headers()
        if not valid(data):
            return self.send_error(400, 'Unexpected variants shape')
        tmp = VARIANTS + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
        os.replace(tmp, VARIANTS)
        bake(data)
        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    print(f'Serving {ROOT} at http://localhost:{port}/brand.html')
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
