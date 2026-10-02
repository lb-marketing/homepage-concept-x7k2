/* The lens: an abstract alternative to the 3D factory, in the same "factory" slot
   (switch between them from the variants panel).

   The same visual vocabulary as the rest of the page:
     a dot     a piece of engineering work moving through the SDLC (a PR, a commit, an agent run)
     grey      work LinearB hasn't seen yet: an unsorted mass
     indigo    work an agent did        teal   work a person did
     red       work that needs a person (only ever the guardrail)

   The story down the scroll, on a band that stays dark (dark or lit, the factory needs
   instrumenting). Each headline describes what is on screen at that point:
     0.00  a full-bleed field of grey work, too much to follow
     0.18  a LinearB lens moves across it: inside, work comes into focus and gets its details
     0.56  the lens settles on a high-impact PR: gitStream holds it and routes it to a reviewer,
           while the rest of the field keeps flowing; once approved, it merges back into the flow
     0.82  all of the work, now in colour, gathers into the LinearB mark
   All work, numbers and PRs are sample data. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a)/(b - a)); return t*t*(3 - 2*t); };
const lerp = (a, b, t) => a + (b - a)*t;
const between = (a, b, c, d, x) => smooth(a, b, x) - smooth(c, d, x);   // rises, holds, falls
const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));

const AGENT = [123, 133, 251], PERSON = [16, 185, 208], GREY = [160, 174, 188];
const RED = [229, 72, 77], GREEN = [18, 161, 80];
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const LOGO = 'https://assets.linearb.io/image/upload/c_fit,w_240/f_auto/q_auto/v1/linearb-logo-2026';
const PERSON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c.6-4.4 4.1-7.2 8.5-7.2s7.9 2.8 8.5 7.2z"/></svg>';

// the work we open up: mostly agents, some people
const PRS = [
  {n:'PR #9182', repo:'payments-api', team:'Payments', by:'Claude',   cost:'$3.80', impact:'Low',    cycle:'6.2h'},
  {n:'PR #9190', repo:'cart-web',     team:'Revenue',  by:'Copilot',  cost:'$2.40', impact:'Medium', cycle:'9.8h'},
  {n:'PR #9176', repo:'eks-addons',   team:'Platform', by:null,       cost:'No AI cost', impact:'Low', cycle:'5.1h'},
  {n:'PR #9197', repo:'auth-service', team:'Identity', by:'Windsurf', cost:'$2.15', impact:'Low',    cycle:'4.9h'},
  {n:'PR #9200', repo:'apps-mobile',  team:'Apps',     by:'Gemini',   cost:'$5.70', impact:'Medium', cycle:'14.1h'},
  {n:'PR #9188', repo:'growth-web',   team:'Growth',   by:null,       cost:'No AI cost', impact:'Low', cycle:'3.2h'},
  {n:'PR #9193', repo:'infra/rds',    team:'Platform', by:'Amazon Q', cost:'$1.90', impact:'Low',    cycle:'3.6h'},
  {n:'PR #9171', repo:'payments-api', team:'Payments', by:'Cursor',   cost:'$4.20', impact:'Medium', cycle:'11.4h'},
];
const src = pr => pr.by ? `${pr.by} (agent)` : 'Person';
// the one that needs a person (the same PR the seats section follows)
const RISK = {n:'PR #9185', repo:'infra/terraform', by:'Claude', reviewer:'Platform on-call'};

const css = `
.fx .fstage{overflow:hidden;isolation:isolate}
/* the dark band fades in from the page and back out, instead of starting and stopping on a
   hard edge; the fades sit in their own space above and below, so the pinned stage (and the
   headline on it) is always on solid dark */
/* the fades run partly over the neighbouring sections' own empty padding, so they add little gap */
.fx-lens{--fade:clamp(110px,18vh,190px);margin-block:calc(var(--fade) - 48px)}
.fx-lens::before,.fx-lens::after{content:"";position:absolute;left:0;right:0;height:calc(var(--fade) + 2px);pointer-events:none}
.fx-lens::before{bottom:calc(100% - 2px);background:linear-gradient(to bottom,rgba(34,35,38,0.000) 0.0%,rgba(34,35,38,0.020) 8.3%,rgba(34,35,38,0.074) 16.7%,rgba(34,35,38,0.156) 25.0%,rgba(34,35,38,0.259) 33.3%,rgba(34,35,38,0.376) 41.7%,rgba(34,35,38,0.500) 50.0%,rgba(34,35,38,0.624) 58.3%,rgba(34,35,38,0.741) 66.7%,rgba(34,35,38,0.844) 75.0%,rgba(34,35,38,0.926) 83.3%,rgba(34,35,38,0.980) 91.7%,rgba(34,35,38,1.000) 100.0%)}
.fx-lens::after{top:calc(100% - 2px);background:linear-gradient(to top,rgba(34,35,38,0.000) 0.0%,rgba(34,35,38,0.020) 8.3%,rgba(34,35,38,0.074) 16.7%,rgba(34,35,38,0.156) 25.0%,rgba(34,35,38,0.259) 33.3%,rgba(34,35,38,0.376) 41.7%,rgba(34,35,38,0.500) 50.0%,rgba(34,35,38,0.624) 58.3%,rgba(34,35,38,0.741) 66.7%,rgba(34,35,38,0.844) 75.0%,rgba(34,35,38,0.926) 83.3%,rgba(34,35,38,0.980) 91.7%,rgba(34,35,38,1.000) 100.0%)}
.fx-lens .fstage{justify-content:space-between;padding-block:clamp(56px,10vh,110px) clamp(20px,4vh,40px)}
.fx-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
.fx .fcaps{z-index:2}
.fx .fhead .fstate{align-self:end}
.fx .fcap-row .fcap{align-self:start}
.fx .fprog{position:relative;z-index:2}
.fx-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}
.fx-layer > *{position:absolute;left:0;top:0;will-change:transform,opacity}
.fx-view{width:100%;flex:1 1 auto;min-height:30vh}
.fx-key{display:inline-flex;align-items:center;gap:6px;font:400 12.5px var(--sans);color:var(--muted);white-space:nowrap}
.fx-key i{display:inline-block;width:8px;height:8px;border-radius:50%}
.fx-key i.agent{background:rgb(${AGENT})}
.fx-key i.person{background:rgb(${PERSON});margin-left:8px}
.fx-stats{position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 22px;padding:8px 18px;border-radius:999px;background:rgba(34,35,38,.9);font:12.5px var(--sans);color:var(--dim)}
.fx-stats{opacity:0;transition:opacity .2s}
.fx-stats .note{color:var(--dim)}
.fx-card{width:224px;background:#fff;color:#4d5865;border-radius:14px;padding:12px 14px;font:12.5px/1.45 var(--sans);box-shadow:0 10px 28px rgba(0,0,0,.4)}
.fx-card .pr{margin:0 0 8px;color:#222326}
.fx-card .pr b{font-weight:600}
.fx-card dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:3px 12px}
.fx-card dt{color:#8798a7}
.fx-card dd{margin:0;color:#222326;text-align:right}
.fx-st{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font:600 12px/1.5 var(--sans)}
.fx-st svg{width:12px;height:12px;fill:currentColor}
.fx-st.bad{background:rgba(229,72,77,.12);color:#b4262c}
.fx-st.warn{background:rgba(245,165,36,.16);color:#8a5300}
.fx-st.good{background:rgba(18,161,80,.12);color:#0f7a3d}
.fx-hold{display:grid;gap:6px}
.fx-hold .pr{margin:0;color:#222326;font:12.5px/1.4 var(--sans)}
.fx-hold .pr b{font-weight:600}
.fx-hold .rule{margin:0;font:12px/1.45 var(--sans);color:#4d5865}
.fx-hold .fx-st{justify-self:start}
.fx-card:has(.fx-hold){width:276px}
.fx-hold .fx-st{white-space:nowrap}
@media (max-width:600px){.fx-card:has(.fx-hold){width:min(276px,calc(100vw - 32px))}.fx-hold .fx-st{white-space:normal}}
.fx-tag{display:flex;align-items:center;padding:2px 4px}
/* the mark sits inside the lens, just below the rim, in white, as if printed on the glass */
.fx-tag img{height:19px;width:auto;display:block;filter:brightness(0) invert(1);opacity:.92}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

const card = pr => `<p class="pr"><b>${pr.n}</b> ${pr.repo}</p><dl><dt>Made by</dt><dd>${src(pr)}</dd><dt>Team</dt><dd>${pr.team}</dd>`
  + `<dt>Cost</dt><dd>${pr.cost}</dd><dt>Impact</dt><dd>${pr.impact}</dd><dt>Cycle time</dt><dd>${pr.cycle}</dd></dl>`;
// the held PR's card, in three steps: why it was held, where it went, how it resolved
// (the same PR, rule and findings the seats section shows)
const HOLD = {
  held:     `<span class="fx-st bad">High impact · 805 changes · 9 files</span><p class="rule">gitStream: infra changes need a Platform reviewer</p>`,
  review:   `<span class="fx-st warn">${PERSON_SVG}Routed to ${RISK.reviewer}</span><p class="rule">AI review: 2 notes · backup window unset</p>`,
  approved: `<span class="fx-st good">✓ Approved by ${RISK.reviewer} · merged</span>`,
};
const holdHTML = state => `<p class="pr"><b>${RISK.n}</b> ${RISK.repo} · ${RISK.by} (agent)</p>${HOLD[state]}`;
const holdState = (review, approved) => approved >= 1 ? 'approved' : review >= 1 ? 'review' : 'held';

function el(layer, cls, html = ''){ const e = document.createElement('div'); e.className = cls; e.innerHTML = html; layer.append(e); return e; }
function put(e, x, y, o){ e.style.transform = `translate(${x}px,${y}px)`; e.style.opacity = o; e.style.visibility = o > 0.01 ? 'visible' : 'hidden'; }
function setHTML(e, html){ if(e._html !== html){ e._html = html; e.innerHTML = html; } }

/* ---------- the LinearB mark, as a shape to gather into ----------
   Sampled from the logo image the page already carries (the same mask the hero's context
   layer is built from): white where the mark is, black around it. */
const MARK = {w: 0, h: 0, px: null};
{
  const img0 = document.querySelector('.logo img');
  if(img0){
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const data = g.getImageData(0, 0, c.width, c.height).data;
      MARK.px = new Uint8Array(c.width*c.height);
      for(let i = 0; i < MARK.px.length; i++) MARK.px[i] = data[i*4] > 128 ? 1 : 0;
      MARK.w = c.width; MARK.h = c.height;
    };
    img.src = img0.src;
  }
}
const inMark = (u, v) => { if(!MARK.px) return false; const x = Math.floor(u*MARK.w), y = Math.floor(v*MARK.h); return x >= 0 && y >= 0 && x < MARK.w && y < MARK.h && MARK.px[y*MARK.w + x] === 1; };

/* ---------- a full-stage canvas, scroll progress, headlines ---------- */
function scene(section, api){
  const stage = section.querySelector('.fstage'), canvas = section.querySelector('.fx-canvas'), ctx = canvas.getContext('2d');
  const layer = section.querySelector('.fx-layer'), prog = section.querySelector('.fprog i');
  const caps = [...section.querySelectorAll('.fhead, .fcap-row')].map(g => [...g.querySelectorAll('[data-at]')]);
  const S = {section, stage, ctx, layer, W:0, H:0, t:0, p:0, dt:0,
    // a DOM element's box in canvas coordinates
    rect(e){ const a = e.getBoundingClientRect(), b = stage.getBoundingClientRect(); return {x0: a.left - b.left, y0: a.top - b.top, x1: a.right - b.left, y1: a.bottom - b.top}; }};
  api.mount(S);
  function size(){
    const r = stage.getBoundingClientRect();
    if(!r.width || !r.height) return false;
    if(r.width === S.W && r.height === S.H) return true;
    const dpr = Math.min(2, devicePixelRatio || 1);
    S.W = r.width; S.H = r.height;
    canvas.width = Math.round(S.W*dpr); canvas.height = Math.round(S.H*dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    api.init(S);
    return true;
  }
  const progress = () => { const r = section.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top/span) : 0; };
  let visible = false, last = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(section);
  (function loop(now){
    requestAnimationFrame(loop);
    if(!visible || section.hidden || !size()){ last = now; return; }
    S.dt = Math.min(0.05, (now - (last || now))/1000) * (reduce ? 0.35 : 1);
    last = now; S.t += S.dt; S.p = progress();
    caps.forEach(g => { const on = g.findLastIndex(c => +c.dataset.at <= S.p); g.forEach((c, i) => { c.classList.toggle('on', i === on); c.ariaHidden = i !== on; }); });
    if(prog) prog.style.width = (S.p*100).toFixed(2) + '%';
    api.frame(S);
  })(0);
}

/* ---------- the lens ---------- */
function lens(section){
  let D = [], A = [], sp = 13, cols = 0, rows = 0, drift = 0, risk = null, heldAt = null, tag, info, markFor = null;
  // the piece in focus: held for a few seconds as it drifts, then handed to the next one at the centre
  let focus = null, held = 0, onCard = null, cardA = 0, ringT = 1, lastL = null;
  const capsEl = section.querySelector('.fcaps'), key = section.querySelector('.fx-stats');
  const mount = S => {
    tag = el(S.layer, 'fx-tag', `<img src="${LOGO}" alt="LinearB">`);
    info = el(S.layer, 'fx-card');
  };
  function init(S){
    const {W, H} = S;
    sp = W < 600 ? 11 : 13;
    cols = Math.ceil(W/sp) + 2; rows = Math.ceil(H/sp) + 1;
    D = [];
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      // each piece of work has a place on a clean grid, and a jittered, jiggling place in the noise
      D.push({bx: c*sp, by: r*sp + sp/2, jx: (Math.random() - 0.5)*sp*0.9, jy: (Math.random() - 0.5)*sp*0.9,
        agent: Math.random() < 0.72, pr: Math.floor(Math.random()*PRS.length), ph: Math.random()*6.28, f: 1 + Math.random()*2,
        delay: Math.random(), tx: null, ty: null});
    }
    risk = null; markFor = null;
    // the backdrop: a sparse drift of soft, out-of-focus specks, so the dark always has depth
    A = Array.from({length: Math.round(clamp(W*H/14000, 30, 110))}, () => ({
      x: Math.random()*W, y: Math.random()*H, r: 1 + Math.random()*2.6, vx: (Math.random() - 0.5)*5, vy: -(3 + Math.random()*9),
      a: 0.05 + Math.random()*0.13, ph: Math.random()*6.28, f: 0.3 + Math.random()*0.7, aqua: Math.random() < 0.35}));
  }
  // where each piece of work lands in the mark: a grid of points inside the mark's shape,
  // spaced so there is about one per piece of work; any left over fade out as the rest arrive
  function placeMark(S){
    const {W, H} = S, small = W < 600;
    const mh = Math.min(H*(small ? 0.36 : 0.44), W*0.8*MARK.h/MARK.w), mw = mh*MARK.w/MARK.h;
    const cx = W/2, cy = H*(small ? 0.6 : 0.58), x0 = cx - mw/2, y0 = cy - mh/2;
    let filled = 0; for(let i = 0; i < MARK.px.length; i += 7) filled += MARK.px[i];
    const area = mw*mh*filled*7/MARK.px.length;
    const step = Math.max(small ? 3.2 : 4, Math.sqrt(area/D.length));
    const pts = [];
    for(let y = y0 + step/2; y < y0 + mh; y += step) for(let x = x0 + step/2; x < x0 + mw; x += step)
      if(inMark((x - x0)/mw, (y - y0)/mh)) pts.push([x, y]);
    // hand the points out left to right, so work flies in without crossing the whole field
    const order = D.map((d, i) => i).sort(() => Math.random() - 0.5).slice(0, pts.length).sort((a, b) => D[a].bx - D[b].bx);
    pts.sort((a, b) => a[0] - b[0]);
    D.forEach(d => { d.tx = null; });
    order.forEach((i, k) => { D[i].tx = pts[k][0]; D[i].ty = pts[k][1]; });
    markFor = {W, H, step};
  }
  const home = d => { const span = cols*sp; return [((d.bx + drift) % span + span) % span - sp, d.by]; };
  const pos = (S, d, k = 0) => {
    const [x, y] = home(d), n = 1 - k;
    return [x + n*(d.jx + Math.sin(S.t*d.f + d.ph)*1.6), y + n*(d.jy + Math.cos(S.t*d.f*1.3 + d.ph)*1.6)];
  };
  function frame(S){
    const {ctx, W, H, p, dt, t} = S;
    const appear = smooth(0.16, 0.26, p), move = smooth(0.26, 0.54, p), lock = smooth(0.54, 0.6, p);
    const review = smooth(0.64, 0.67, p), approved = smooth(0.7, 0.72, p), release = smooth(0.73, 0.79, p);
    const gather = smooth(0.8, 0.95, p);
    drift += 16*(1 - gather)*dt;   // the field never stops: only the held PR does
    if(gather > 0 && MARK.px && (!markFor || markFor.W !== W || markFor.H !== H)) placeMark(S);

    // the lens' path: below the headline, in from the left, across, then onto the work that needs a person
    const small = W < 600;
    let lx = lerp(W*0.26, W*0.6, move), ly = lerp(H*(small ? 0.62 : 0.64), H*(small ? 0.58 : 0.6), move) + Math.sin(move*Math.PI)*H*0.05;
    if(p < 0.5){ risk = null; heldAt = null; }
    else if(!risk){ let best = Infinity; for(const d of D){ const [x, y] = home(d); const dd = (x - lx)**2 + (y - ly)**2; if(dd < best && x > W*0.25 && x < W*0.75){ best = dd; risk = d; } } }
    // the PR is held where it was picked while the field flows on around it, so the lens has a fixed
    // spot to settle on wherever the scroll stops; approved, the PR slides back into the flow
    if(risk && !heldAt) heldAt = home(risk);
    const riskAt = () => { const h = home(risk); return heldAt ? [lerp(heldAt[0], h[0], release), lerp(heldAt[1], h[1], release)] : h; };
    if(risk){ lx = lerp(lx, heldAt[0], lock); ly = lerp(ly, heldAt[1], lock); }
    const r = lerp(0, Math.min(W, H)*(small ? 0.3 : 0.2), appear)*(1 - smooth(0.8, 0.86, p));
    const inLens = d => { if(r <= 1) return 0; const [x, y] = home(d); return clamp((r - Math.hypot(x - lx, y - ly))/22); };

    ctx.clearRect(0, 0, W, H);
    // a clear area exactly around the headline and caption on screen, feathered at its edge
    const shown = [...capsEl.querySelectorAll('.fstate.on, .fcap.on')].map(e => S.rect(e));
    const C = shown.length ? shown.reduce((a, b) => ({x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1)})) : S.rect(capsEl);
    const ccx = (C.x0 + C.x1)/2, ccy = (C.y0 + C.y1)/2, rw = (C.x1 - C.x0)/2*1.28 + 30, rh = (C.y1 - C.y0)/2*1.7 + 30;
    // ...and near the section's own top and bottom, so the field eases in and out with the band's fade
    const sec = section.getBoundingClientRect(), stg = S.stage.getBoundingClientRect();
    const sTop = sec.top - stg.top, sBot = sec.bottom - stg.top;
    const edge = y => smooth(sTop, sTop + 150, y)*smooth(sBot, sBot - 120, y);
    const clear = (x, y, j = 0) => smooth(0.9, 1.55, Math.hypot((x - ccx)/rw, (y - ccy)/rh) + j)*edge(y);

    // the backdrop drift: faint during the story, a little brighter once the field has gathered
    const amb = 0.7 + 0.6*gather;
    for(const b of A){
      b.x += b.vx*dt; b.y += b.vy*dt;
      if(b.y < -10){ b.y = H + 10; b.x = Math.random()*W; }
      if(b.x < -10) b.x = W + 10; else if(b.x > W + 10) b.x = -10;
      const a = b.a*amb*(0.6 + 0.4*Math.sin(t*b.f + b.ph))*(0.35 + 0.65*clear(b.x, b.y));
      const c = b.aqua ? '159,234,237' : '200,210,220';
      ctx.fillStyle = `rgba(${c},${a*0.35})`; ctx.beginPath(); ctx.arc(b.x, b.y, b.r*2.6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(${c},${a})`; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    }
    // the mark's glow, underneath the work arriving in it
    if(gather > 0 && markFor){
      const my = H*(small ? 0.6 : 0.58);
      const g = ctx.createRadialGradient(W/2, my, 0, W/2, my, Math.min(W, H)*0.42);
      g.addColorStop(0, `rgba(159,234,237,${0.12*gather})`); g.addColorStop(1, 'rgba(159,234,237,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // the LinearB mark floats just above the top of the lens
    const tw = tag.offsetWidth || 96, th = tag.offsetHeight || 22;
    const tagX = lx, tagY = ly - r - th/2 - 12, showTag = r > th*3 && gather < 0.01;
    const underTag = () => false;
    let near = null, nd = Infinity;
    // keep the piece in focus: at rest, for a few seconds while it's near the centre; while the lens
    // is being scrolled across the field, for as long as it stays inside the lens
    const speed = lastL && dt > 0 ? Math.hypot(lx - lastL[0], ly - lastL[1])/dt : 0;
    lastL = [lx, ly];
    if(focus){
      const [fx, fy] = home(focus), moving = speed > 30;
      if(!moving) held += dt;
      const lost = inLens(focus) < 0.5 || focus === risk;
      const done = !moving && (held > 3.6 || Math.hypot(fx - lx, fy - ly) > r*0.55);
      if(lost || done) focus = null;
    }
    const cell = markFor ? Math.min(4.4, markFor.step*0.82) : 4.4;
    for(const d of D){
      const k = inLens(d);
      let [x, y] = pos(S, d, k);
      // gathering: every piece of work flies to its place in the mark, taking its colour on the way
      const e = gather > 0 && markFor ? smooth(0, 1, gather*1.4 - d.delay*0.4) : 0;
      let fade = 1;
      if(e > 0){
        if(d.tx !== null){ x = lerp(x, d.tx, e); y = lerp(y, d.ty, e); }
        else fade = 1 - e;   // no place in the mark: it fades as the rest arrive
      }
      const seen = d.tx !== null ? Math.max(k, e) : k*(1 - e);
      if(seen <= 0.02){
        const a = (0.14 + 0.3*Math.pow(0.5 + 0.5*Math.sin(t*d.f*2 + d.ph), 3))*clear(x, y, (d.ph - 3.14)*0.035)*fade;
        if(a < 0.01) continue;
        ctx.fillStyle = rgba(GREY, a); ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
        continue;
      }
      if(k > 0.5 && d !== risk && e === 0){ const dd = (x - lx)**2 + (y - ly)**2; if(dd < nd){ nd = dd; near = d; } }
      if(d === risk && lock > 0.5 && gather < 0.01) continue;
      if(e === 0 && underTag(x, y)) continue;
      const own = d === risk && approved > 0 ? GREEN : d.agent ? AGENT : PERSON;
      ctx.fillStyle = rgba(mix(GREY, own, seen), (0.35 + 0.6*seen)*fade);
      const s = lerp(2.4, e > 0 ? cell : 4.4, seen);
      ctx.fillRect(x - s/2, y - s/2, s, s);
    }
    if(!focus && near){ focus = near; held = 0; ringT = 0; }
    if(!near && !focus) onCard = null;
    ringT = Math.min(1, ringT + dt/0.35);
    // the card fades out, changes to the new piece, and fades back in
    if(focus && focus !== onCard){ cardA = Math.max(0, cardA - dt/0.18); if(cardA === 0) onCard = focus; }
    else cardA = Math.min(1, cardA + dt/0.25);
    // the rim
    if(r > 1){
      ctx.strokeStyle = 'rgba(159,234,237,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI*2); ctx.stroke();
    }
    // the work that needs a person at the lens' centre, or a ring on the piece in focus
    if(risk && lock > 0.5 && gather < 0.01){
      const [x, y] = riskAt(), c = mix(RED, GREEN, approved);
      if(approved < 1){
        const pulse = 0.5 + 0.5*Math.sin(t*5);
        ctx.strokeStyle = rgba(c, 0.35 + 0.35*pulse); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 9 + 4*pulse, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = rgba(c); ctx.fillRect(x - 4, y - 4, 8, 8);
    } else if(focus && appear > 0.9 && gather < 0.01){
      // the ring closes in on each new piece as it's picked up
      const [x, y] = pos(S, focus, inLens(focus)), g = smooth(0, 1, ringT);
      ctx.strokeStyle = `rgba(255,255,255,${0.85*g})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, lerp(16, 8, g), 0, Math.PI*2); ctx.stroke();
    }
    // the tag on the rim, and the card beside the lens
    put(tag, tagX - tw/2, tagY - th/2, showTag ? smooth(0.2, 0.28, p)*(1 - smooth(0.78, 0.84, p)) : 0);
    const heldNow = risk && lock > 0.5;
    const html = heldNow ? `<div class="fx-hold">${holdHTML(holdState(review, approved))}</div>` : onCard ? card(PRS[onCard.pr]) : '';
    setHTML(info, html);
    const cw = info.offsetWidth || 224, ch = info.offsetHeight || 150;
    let cx = lx + r + 18; if(cx + cw > W - 8) cx = lx - r - 18 - cw;
    put(info, clamp(cx, 8, W - cw - 8), clamp(ly - ch/2, 8, H - ch - 8), html ? smooth(0.3, 0.36, p)*(1 - smooth(0.78, 0.82, p))*(heldNow ? 1 : cardA) : 0);
    // the colour key (and the sample-data note) arrive with the colour
    if(key) key.style.opacity = smooth(0.18, 0.26, p);
  }
  scene(section, {mount, init, frame});
}

const l = document.getElementById('factory-lens');
if(l) lens(l);
})();
