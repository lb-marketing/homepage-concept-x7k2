/* APEX options: two alternatives to the four-card APEX section, in the same "apex" slot
   (switch between them from the variants panel).

   Product view: modelled on LinearB's own navigation, which is organised by APEX. A rail of
     the four pillars and one large panel for the selected pillar: its objective, its headline
     metric as a big chart, and the LinearB solutions behind it. It steps through the pillars
     while on screen; picking one stops it.
   Big letters: the four pillars side by side, stripped to letter, name, metric and a larger
     trend; the objective and solutions open on hover, focus or tap.

   Copy follows the style guide: no "north star" and no counting headline. The "In LinearB"
   products are the ones on linearb.io's product menu (platform pages), plus gitStream. No figures: each pillar names its headline metric, and the
   trend lines are unlabelled shapes. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PILLARS = [
  {k: 'A', name: 'AI leverage', c: '#7c85fc', obj: 'Measure AI at the PR level, where it meets delivery.',
   metric: 'AI-assisted PRs', series: [27, 28, 29, 29, 31, 32, 33, 33, 35, 36, 37, 38],
   sol: ['AI & developer productivity insights', 'AI code reviews', 'MCP server']},
  {k: 'P', name: 'Predictability', c: '#10b9d0', obj: 'Keep commitments reliable as AI makes output less predictable.',
   metric: 'Planning accuracy', series: [77, 79, 76, 78, 80, 78, 81, 80, 82, 81, 83, 84],
   sol: ['Dev team management', 'Executive reporting & ROI']},
  {k: 'E', name: 'Flow efficiency', c: '#ff6445', obj: 'Find where work stalls as AI moves bottlenecks downstream.',
   metric: 'Cycle time', series: [40, 39.5, 39, 38, 37, 36.5, 35, 34, 33.5, 32.5, 31.5, 31],
   sol: ['DevOps workflow automation', 'gitStream', 'Resource allocation']},
  {k: 'X', name: 'Developer experience', c: '#f4ab0b', obj: 'The guardrail: gains built on burnout don’t count.',
   metric: 'Developer satisfaction', series: [4.0, 4.1, 4.0, 4.1, 4.1, 4.0, 4.1, 4.1, 4.1, 4.1, 4.1, 4.1],
   sol: ['Developer experience optimization', 'Developer surveys']},
];
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const css = `
/* ---------- shared ---------- */
.apx .apx-chip{display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;background:#f1f3f6;color:#222326;font:500 13px/1.2 var(--sans)}
.apx-chart svg{display:block;width:100%;height:auto;overflow:visible}
.apx-chart .grid line{stroke:#e8ebef}
.apx-chart .ax{font:400 11.5px var(--sans);fill:#8798a7}
.apx-chart .ln{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.apx-chart .ar{opacity:0}
.apx-chart.drawn .ln{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s cubic-bezier(.3,.6,.2,1)}
.apx-chart.drawn .ar{opacity:1;transition:opacity .8s .3s}
.apx-chart .end{opacity:0}
.apx-chart.drawn .end{opacity:1;transition:opacity .3s 1s}

/* ---------- product view ---------- */
.apx-app{display:grid;grid-template-columns:260px minmax(0,1fr);border-radius:24px;overflow:hidden;background:#fff;border:1px solid var(--rule);box-shadow:var(--card-shadow);margin-top:8px}
.apx-rail{display:flex;flex-direction:column;gap:6px;padding:18px 14px;background:#1d1e21}
.apx-rail .apx-brand{display:flex;align-items:center;gap:8px;padding:4px 10px 14px;color:#fff;font:600 14px var(--display)}
.apx-rail .apx-brand img{height:15px;width:auto;filter:brightness(0) invert(1)}
.apx-tab{all:unset;box-sizing:border-box;position:relative;display:flex;align-items:center;gap:12px;padding:10px 10px 12px;border-radius:14px;cursor:pointer;color:#b6c2cc;font:500 14.5px var(--display);overflow:hidden}
.apx-tab:hover{background:#2a2c30;color:#fff}
.apx-tab:focus-visible{outline:2px solid #7b85fb;outline-offset:1px}
.apx-tab .bdg{flex:0 0 auto;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1.6px solid var(--c);color:var(--c);font:700 15px var(--display)}
.apx-tab[aria-selected=true]{background:#2c2e33;color:#fff}
.apx-tab[aria-selected=true] .bdg{background:var(--c);color:#1d1e21}
.apx-tab .bar{position:absolute;left:10px;right:10px;bottom:5px;height:2px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;opacity:0}
.apx-tab .bar::after{content:"";position:absolute;inset:0;background:var(--c);transform-origin:left;transform:scaleX(0)}
.apx-v1.auto .apx-tab[aria-selected=true] .bar{opacity:1}
.apx-v1.auto .apx-tab[aria-selected=true] .bar::after{animation:apx-fill var(--dwell) linear both}
@keyframes apx-fill{to{transform:scaleX(1)}}
.apx-panel{padding:28px 32px 26px;min-width:0;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:24px;align-content:start}
.apx-panel > *{grid-column:1/-1}
.apx-panel .apx-kick{margin:0;font:600 13px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--c)}
.apx-panel h3{margin:4px 0 6px;font:600 26px/1.2 var(--display);color:#222326}
.apx-panel .apx-obj{margin:0 0 20px;color:#4d5865;font:400 16px/1.5 var(--sans);max-width:36em}
.apx-panel .apx-m{display:flex;flex-direction:column;gap:4px;margin:0 0 4px}
.apx-panel .apx-m b{font:600 30px/1.15 var(--display);color:#222326}
.apx-panel .apx-m span{font:600 12.5px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:#8798a7}
.apx-panel .apx-chart{margin:6px 0 18px}
.apx-panel .apx-sol{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.apx-panel .apx-sol-h{font:600 13px var(--sans);color:#222326;margin-right:4px}
.apx-panel.swap > *{animation:apx-in .45s cubic-bezier(.2,.7,.2,1) both}
.apx-panel.swap > :nth-child(2){animation-delay:.03s}.apx-panel.swap > :nth-child(3){animation-delay:.06s}
@keyframes apx-in{from{opacity:0;transform:translateY(8px)}}
@media (max-width:900px){
  .apx-app{grid-template-columns:1fr}
  .apx-rail{flex-direction:row;padding:10px;gap:4px;overflow-x:auto}
  .apx-rail .apx-brand{display:none}
  .apx-tab{flex:1 0 auto;justify-content:center;padding:8px 10px 11px}
  .apx-tab .nm{display:none}
  .apx-panel{padding:22px 20px 20px}
  .apx-panel .apx-m b{font-size:24px}
}

/* ---------- big letters ---------- */
.apx-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:8px}
.apx-card{all:unset;box-sizing:border-box;white-space:normal;text-align:left;position:relative;display:flex;flex-direction:column;min-height:360px;padding:24px 22px 22px;border:1px solid var(--rule);border-radius:24px;background:#fff;cursor:pointer;overflow:hidden;transition:box-shadow .25s,transform .25s}
.apx-card:hover,.apx-card.open{box-shadow:var(--card-shadow);transform:translateY(-2px)}
.apx-card:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}
.apx-card .big{margin:0 0 10px;font:700 clamp(88px,9vw,128px)/.85 var(--display);letter-spacing:-.04em;color:#dfe3e8;transition:color .5s}
.apx-v2.in .apx-card .big{color:var(--c)}
.apx-v2.in .apx-card:nth-child(2) .big{transition-delay:.15s}.apx-v2.in .apx-card:nth-child(3) .big{transition-delay:.3s}.apx-v2.in .apx-card:nth-child(4) .big{transition-delay:.45s}
.apx-card h3{margin:0 0 18px;font:600 19px var(--display);color:#222326}
.apx-card .val{margin-top:4px;font:600 20px/1.25 var(--display);color:#222326}
.apx-card .lbl{font:600 11.5px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:#8798a7}
.apx-card .apx-chart{margin:14px 0 6px}
.apx-card .more{white-space:normal;text-align:left;position:absolute;left:0;right:0;bottom:0;padding:18px 22px 22px;background:#fff;border-top:1px solid var(--rule);transform:translateY(101%);transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.apx-card:hover .more,.apx-card:focus-visible .more,.apx-card.open .more{transform:none}
.apx-card .more .ob{display:block;margin:0 0 12px;font:400 14.5px/1.5 var(--sans);color:#222326}
.apx-card .more .sol-h{margin:0 0 8px;font:600 12.5px var(--sans);color:#4d5865}
.apx-card .more .sols{display:flex;flex-wrap:wrap;gap:6px}
.apx-card .hint{position:absolute;right:18px;top:18px;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#f1f3f6;color:#4d5865;font:500 16px/1 var(--sans);transition:transform .3s}
.apx-card:hover .hint,.apx-card.open .hint{transform:rotate(45deg)}
@media (max-width:900px){.apx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.apx-grid{grid-template-columns:1fr}.apx-card{min-height:320px}}
@media (prefers-reduced-motion:reduce){.apx-chart .ln,.apx-card .more,.apx-card .big{transition:none!important}}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

// a line chart of a pillar's metric over the last six months
function chart(P, {w = 560, h = 180, axes = true} = {}){
  const L = axes ? 34 : 2, R = 10, T = 10, B = axes ? 26 : 4;
  // never zoom in so far that a steady metric looks volatile: the range spans at least 30% of its level
  const lo = Math.min(...P.series), hi = Math.max(...P.series), span = Math.max(hi - lo, hi*0.3), mid = (hi + lo)/2;
  const y0 = mid - span*0.68, y1 = mid + span*0.68;
  const x = i => L + i*(w - L - R)/(P.series.length - 1), y = v => T + (h - T - B)*(1 - (v - y0)/(y1 - y0));
  const pts = P.series.map((v, i) => [x(i), y(v)]);
  let d = `M${pts[0]}`;
  for(let i = 0; i < pts.length - 1; i++){
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0])/6},${p1[1] + (p2[1] - p0[1])/6} ${p2[0] - (p3[0] - p1[0])/6},${p2[1] - (p3[1] - p1[1])/6} ${p2[0]},${p2[1]}`;
  }
  const id = 'apxg' + Math.random().toString(36).slice(2, 8);
  let grid = '';
  if(axes){
    for(let k = 0; k <= 3; k++){ const yy = T + (h - T - B)*k/3; grid += `<line x1="${L}" x2="${w - R}" y1="${yy}" y2="${yy}"/>`; }
    MONTHS.forEach((m, i) => { grid += `<text class="ax" x="${x(i*2)}" y="${h - 6}" text-anchor="middle">${m}</text>`; });
  }
  const last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.c}" stop-opacity=".22"/><stop offset="1" stop-color="${P.c}" stop-opacity="0"/></linearGradient></defs>`
    + `<g class="grid">${grid}</g><path class="ar" d="${d} L${last[0]},${h - B} L${pts[0][0]},${h - B} Z" fill="url(#${id})"/>`
    + `<path class="ln" d="${d}" stroke="${P.c}" pathLength="1"/><circle class="end" cx="${last[0]}" cy="${last[1]}" r="4.5" fill="${P.c}" stroke="#fff" stroke-width="2"/></svg>`;
}
const drawIn = el => requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('drawn')));
const chips = P => P.sol.map(s => `<span class="apx-chip">${s}</span>`).join('');
const whenSeen = (el, cb) => new IntersectionObserver((es, io) => { if(es[0].isIntersecting){ io.disconnect(); cb(); } }, {threshold: .3}).observe(el);

/* ---------- product view ---------- */
function productView(section){
  const app = section.querySelector('.apx-app');
  const LOGO = 'https://assets.linearb.io/image/upload/c_fit,w_240/f_auto/q_auto/v1/linearb-logo-2026';
  app.innerHTML = `<div class="apx-rail" role="tablist" aria-label="APEX pillars"><div class="apx-brand"><img src="${LOGO}" alt="LinearB"></div>`
    + PILLARS.map((P, i) => `<button type="button" class="apx-tab" role="tab" id="apx-t${i}" style="--c:${P.c}" aria-selected="false"><span class="bdg">${P.k}</span><span class="nm">${P.name}</span><i class="bar" aria-hidden="true"></i></button>`).join('')
    + `</div><div class="apx-panel" role="tabpanel" aria-live="polite"></div>`;
  const tabs = [...app.querySelectorAll('.apx-tab')], panel = app.querySelector('.apx-panel');
  const DWELL = 6000;
  section.style.setProperty('--dwell', DWELL + 'ms');
  let cur = -1, cycle = null;
  function show(i){
    cur = i;
    const P = PILLARS[i];
    tabs.forEach((t, j) => t.setAttribute('aria-selected', i === j));
    panel.style.setProperty('--c', P.c);
    panel.setAttribute('aria-labelledby', 'apx-t' + i);
    panel.innerHTML = `<p class="apx-kick">${P.k} · APEX</p><h3>${P.name}</h3><p class="apx-obj">${P.obj}</p>`
      + `<p class="apx-m"><span>Headline metric</span><b>${P.metric}</b></p>`
      + `<div class="apx-chart">${chart(P)}</div><div class="apx-sol"><span class="apx-sol-h">In LinearB</span>${chips(P)}</div>`;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    drawIn(panel.querySelector('.apx-chart'));
    // restart the active tab's progress bar
    tabs[i].querySelector('.bar').replaceWith(Object.assign(document.createElement('i'), {className: 'bar'}));
  }
  const stop = () => { clearInterval(cycle); cycle = null; section.classList.remove('auto'); };
  tabs.forEach((t, i) => t.addEventListener('click', () => { stop(); show(i); }));
  show(0);
  whenSeen(section, () => {
    show(0);
    if(reduce) return;
    section.classList.add('auto');
    cycle = setInterval(() => show((cur + 1) % PILLARS.length), DWELL);
  });
}

/* ---------- big letters ---------- */
function bigLetters(section){
  const grid = section.querySelector('.apx-grid');
  grid.innerHTML = PILLARS.map((P, i) => `<button type="button" class="apx-card" style="--c:${P.c}" aria-expanded="false" aria-describedby="apx-more-${i}">`
    + `<span class="hint" aria-hidden="true">+</span><p class="big" aria-hidden="true">${P.k}</p><h3>${P.name}</h3>`
    + `<span class="lbl">Headline metric</span><span class="val">${P.metric}</span><span class="apx-chart">${chart(P, {w: 240, h: 70, axes: false})}</span>`
    + `<span class="more" id="apx-more-${i}"><span class="ob">${P.obj}</span><span class="sol-h" style="display:block">In LinearB</span><span class="sols">${chips(P)}</span></span></button>`).join('');
  const cards = [...grid.querySelectorAll('.apx-card')];
  cards.forEach(c => c.addEventListener('click', () => {
    const open = !c.classList.contains('open');
    cards.forEach(o => { o.classList.remove('open'); o.setAttribute('aria-expanded', 'false'); });
    if(open){ c.classList.add('open'); c.setAttribute('aria-expanded', 'true'); }
  }));
  whenSeen(section, () => {
    section.classList.add('in');
    cards.forEach((c, i) => setTimeout(() => drawIn(c.querySelector('.apx-chart')), reduce ? 0 : 150*i));
  });
}

const v1 = document.getElementById('apex-view'), v2 = document.getElementById('apex-letters');
if(v1) productView(v1);
if(v2) bigLetters(v2);
})();
