/* Variants panel: review tool for comparing versions of parts of the page.
   Not part of the page itself; remove the <script src="variants.js"> tag to ship without it.

   Two kinds of thing can have versions, and each one with two or more shows up in the panel:
   - Headline text: an element with data-variant="<id>", its options listed in variants.json.
     In an option, " / " marks a line break.
   - Whole sections: sibling elements sharing data-slot="<slot>", each named with
     data-option="<name>". The default one carries data-default; the others carry hidden.
     A version's script can listen for the "variant:show" event to start once it is visible.

   ‹ › rotates a version in place and leaves the rest of the page alone. Rotations are kept in
   this browser until you lock them in; locking saves through serve.py, which writes the
   choice into brand.html so it is the default with or without this panel. */
(() => {
const PICKS = 'variants:picks';
const OPEN = 'variants:open';

const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const post = async (url, body) => {
  const r = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error(r.status + ' ' + r.statusText);
};
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const css = `
.vp{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:1000;width:min(340px,calc(100vw - 32px));
  background:#1d1e21;color:#e8e9ec;border:1px solid #34363b;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.35);
  font:500 12px/1.35 Inter,system-ui,sans-serif;letter-spacing:0;text-transform:none}
.vp button{all:unset;cursor:pointer;box-sizing:border-box;border-radius:6px}
.vp button:focus-visible{outline:2px solid #7b85fb;outline-offset:1px}
.vp button:disabled{opacity:.35;cursor:default}
.vp-head{display:flex;align-items:center;gap:8px;padding:9px 10px 9px 12px}
.vp-title{font-weight:600;color:#fff;cursor:pointer}
.vp-msg{flex:1;color:#9aa0aa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vp.err .vp-msg{color:#ffb4a8}
.vp-min{padding:2px 7px;color:#9aa0aa}
.vp-min:hover{background:#2c2e33;color:#fff}
.vp-list{border-top:1px solid #34363b;max-height:min(55vh,420px);overflow:auto}
.vp-row{padding:9px 12px;border-bottom:1px solid #2a2c30}
.vp-row.inview{background:#24262a;box-shadow:inset 2px 0 #7b85fb}
.vp-name{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}
.vp-name button{color:#fff;font-weight:600}
.vp-name button:hover{text-decoration:underline}
.vp-kind{color:#7d838d}
.vp-ctl{display:flex;align-items:center;gap:4px}
.vp-ctl .step{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;background:#2c2e33;font-size:14px}
.vp-ctl .step:hover:not(:disabled){background:#3a3d43}
.vp-cur{flex:1;min-width:0;padding:0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d6d8dc}
.vp-n{color:#7d838d;font-variant-numeric:tabular-nums;padding-right:2px}
.vp-lock{padding:5px 9px;background:#fff;color:#1d1e21;font-weight:600}
.vp-lock:hover:not(:disabled){background:#e3e4e7}
.vp-lock:disabled{background:none;color:#7d838d;opacity:1;padding-inline:4px}
.vp-row.changed .vp-cur{color:#f5c26b}
.vp-foot{display:flex;justify-content:space-between;padding:8px 10px}
.vp-foot button{padding:6px 10px}
.vp-foot .reset:hover:not(:disabled){background:#2c2e33}
.vp-foot .all{background:#fff;color:#1d1e21;font-weight:600}
.vp-foot .all:hover:not(:disabled){background:#e3e4e7}
.vp.closed{width:auto}
.vp.closed .vp-list,.vp.closed .vp-foot{display:none}
`;

let data = {}, picks = store.get(PICKS, {}), canSave = true, items = [];

/* ---------- headline text ---------- */
function renderText(el, text){
  const lines = text.split(' / ').map(l => l.trim()).filter(Boolean).map(l => esc(l).replace(/\*(.+?)\*/g, '<em>$1</em>'));
  el.innerHTML = el.tagName === 'H1'
    ? lines.map(l => `<span class="ln">${l}</span>`).join('')
    : lines.join('<br>');
}
function textItem(el){
  const id = el.dataset.variant, v = data[id];
  return {
    key: 't:' + id, el, kind: 'headline', watch: [el.closest('section') || el],
    name: v.label || id,
    count: () => v.options.length,
    def: () => v.default,
    label: i => v.options[i].replace(/ \/ /g, ' ').replace(/\*/g, ''),
    show: i => renderText(el, v.options[i]),
    lock: async i => {
      const prev = v.default; v.default = i;
      try { await post('/api/variants', data); } catch(e){ v.default = prev; throw e; }
    },
  };
}

/* ---------- whole sections ---------- */
function slotItem(slot, els){
  let def = Math.max(0, els.findIndex(e => e.hasAttribute('data-default')));
  return {
    key: 's:' + slot, el: els[def], kind: 'section', watch: els,
    name: els[def].getAttribute('aria-label') || slot,
    count: () => els.length,
    def: () => def,
    label: i => els[i].dataset.option || `Version ${i + 1}`,
    show: i => {
      if(!els[i].hidden) return;
      els.forEach((e, j) => { e.hidden = j !== i; });
      // let the version's own script size itself now it is visible
      els[i].dispatchEvent(new CustomEvent('variant:show', {bubbles:true}));
      dispatchEvent(new Event('resize'));
    },
    lock: async i => { await post('/api/section', {slot, option: els[i].dataset.option}); def = i; },
    scrollTarget: () => els.find(e => !e.hidden) || els[0],
  };
}

/* ---------- state ---------- */
const cur = it => { const p = picks[it.key]; return p != null && p < it.count() ? p : it.def(); };
function setPick(it, i){
  if(i === it.def()) delete picks[it.key]; else picks[it.key] = i;
  store.set(PICKS, picks);
}

/* ---------- panel ---------- */
let panel, msg, lockAll, reset;
function status(text, err){ msg.textContent = text; panel.classList.toggle('err', !!err); }
function refresh(){
  const n = items.filter(it => cur(it) !== it.def()).length;
  lockAll.disabled = !n || !canSave;
  reset.disabled = !n;
  if(!canSave) status('Preview only: run serve.py to lock in', true);
  else status(n ? `${n} not locked in` : 'All on default');
}

function row(it){
  const r = document.createElement('div');
  r.className = 'vp-row';
  r.innerHTML = `<div class="vp-name"><button class="go"></button><span class="vp-kind">${it.kind}</span></div>`
    + `<div class="vp-ctl"><button class="step prev" aria-label="Previous version">‹</button><span class="vp-cur"></span>`
    + `<span class="vp-n"></span><button class="step next" aria-label="Next version">›</button><button class="vp-lock"></button></div>`;
  const q = s => r.querySelector(s);
  q('.go').textContent = it.name;
  q('.go').title = 'Scroll to it';
  q('.go').onclick = () => (it.scrollTarget ? it.scrollTarget() : it.el).scrollIntoView({behavior:'smooth', block:'center'});
  it.update = () => {
    const i = cur(it), isDef = i === it.def();
    it.show(i);
    q('.vp-cur').textContent = q('.vp-cur').title = it.label(i);
    q('.vp-n').textContent = `${i + 1}/${it.count()}`;
    q('.vp-lock').disabled = isDef || !canSave;
    q('.vp-lock').textContent = isDef ? 'Default' : 'Lock in';
    r.classList.toggle('changed', !isDef);
    refresh();
  };
  const step = d => { const n = it.count(); setPick(it, (cur(it) + d + n) % n); it.update(); };
  q('.prev').onclick = () => step(-1);
  q('.next').onclick = () => step(1);
  q('.vp-lock').onclick = async () => {
    try { await it.lock(cur(it)); setPick(it, it.def()); it.update(); }
    catch(e){ status('Could not lock in: ' + e.message, true); }
  };
  it.row = r;
  return r;
}

function build(){
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);

  panel = document.createElement('aside');
  panel.className = 'vp';
  panel.setAttribute('aria-label', 'Variants');
  panel.innerHTML = `<div class="vp-head"><span class="vp-title">Variants</span><span class="vp-msg" aria-live="polite"></span>`
    + `<button class="vp-min"></button></div><div class="vp-list"></div>`
    + `<div class="vp-foot"><button class="reset">Reset</button><button class="all">Lock in all</button></div>`;
  document.body.append(panel);
  msg = panel.querySelector('.vp-msg');
  lockAll = panel.querySelector('.all');
  reset = panel.querySelector('.reset');
  const list = panel.querySelector('.vp-list');

  const min = panel.querySelector('.vp-min');
  const setOpen = o => {
    panel.classList.toggle('closed', !o);
    min.textContent = o ? '–' : '+';
    min.setAttribute('aria-label', o ? 'Collapse' : 'Expand');
    min.setAttribute('aria-expanded', o);
    store.set(OPEN, o);
  };
  min.onclick = () => setOpen(panel.classList.contains('closed'));
  panel.querySelector('.vp-title').onclick = () => setOpen(true);

  items.forEach(it => list.append(row(it)));
  items.forEach(it => it.update());
  setOpen(store.get(OPEN, true));

  reset.onclick = () => { picks = {}; store.set(PICKS, picks); items.forEach(it => it.update()); };
  lockAll.onclick = async () => {
    for(const it of items.filter(it => cur(it) !== it.def())){
      try { await it.lock(cur(it)); setPick(it, it.def()); it.update(); }
      catch(e){ status(`Could not lock in ${it.name}: ${e.message}`, true); return; }
    }
  };

  // highlight whichever item is on screen
  const owner = new Map();
  items.forEach(it => it.watch.forEach(el => owner.set(el, it)));
  const io = new IntersectionObserver(es => es.forEach(e => {
    const it = owner.get(e.target);
    if(it && !e.target.hidden) it.row.classList.toggle('inview', e.isIntersecting);
  }), {rootMargin:'-35% 0px -35% 0px'});
  owner.forEach((_, el) => io.observe(el));
}

(async () => {
  try {
    const r = await fetch('variants.json', {cache:'no-store'});
    if(!r.ok) throw 0;
    data = await r.json();
  } catch { data = {}; canSave = false; }
  // a plain static server can't save, so say "preview only" up front
  if(canSave) try { canSave = (await fetch('/api/variants', {method:'OPTIONS'})).ok; } catch { canSave = false; }

  const texts = [...document.querySelectorAll('[data-variant]')]
    .filter(el => data[el.dataset.variant] && data[el.dataset.variant].options.length > 1)
    .map(textItem);
  const slots = {};
  document.querySelectorAll('[data-slot]').forEach(el => (slots[el.dataset.slot] ||= []).push(el));
  const sections = Object.entries(slots).filter(([, els]) => els.length > 1).map(([s, els]) => slotItem(s, els));

  items = [...texts, ...sections].sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  if(items.length) build();
})();
})();
