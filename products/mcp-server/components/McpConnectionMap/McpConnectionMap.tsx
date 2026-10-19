import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { DEFAULT_ICONS, IconMap } from '../shared/icons';
import { Icon, Stack, cx, edge, useFirstView, useReducedMotion } from '../shared/ui';
import s from './McpConnectionMap.module.css';
import { ConnectionMapContent, DEFAULT_CONTENT, MapTool } from './content';

/* Connection map, for the dark band: your AI tool at the centre, LinearB as the biggest source with its areas
   around it, and every other tool connected too. Choosing a tool lights LinearB and that tool flowing into the
   AI tool, and the caption says what each brings and what you can build with both. Choosing a LinearB area shows
   its MCP tools and questions.

   No layout is measured: the map keeps a fixed aspect ratio for its width (one for wide containers, one for
   narrow), every position is worked out from the content in viewBox units, and node sizes are a share of the
   width, so the first paint is already right. Every caption is rendered in one grid cell and only the chosen one
   shows, so the caption is always as tall as its tallest version and choosing never moves the page. */

export type McpConnectionMapProps = {
  content?: ConnectionMapContent;
  icons?: IconMap;
  /** Studio slot: the heading, lede and client chips that sit beside the map on wide screens */
  intro?: ReactNode;
  /** cycle through the tools every few seconds once the map is on screen, until someone interacts */
  autoplay?: boolean;
  autoplayMs?: number;
  className?: string;
};

type Sel = { t: string } | { d: string };
type Pt = [number, number];

/* The two layouts. Sizes are diameters as a share of the map's width; positions are in a 1000-wide viewBox. */
const LAYOUTS = {
  wide:   { aspect: 1.2,  tool: .075, hub: .16, lb: .125 },
  narrow: { aspect: .82,  tool: .105, hub: .22, lb: .17 },
} as const;
type LayoutName = keyof typeof LAYOUTS;

function geometry(name: LayoutName, areaKeys: string[], toolKeys: string[]) {
  const L = LAYOUTS[name], W = 1000, H = W / L.aspect;
  const hub: Pt = [W * .56, H / 2], lb: Pt = [W * .25, H / 2];
  const hr = L.hub * W / 2, lr = L.lb * W / 2, tr = L.tool * W / 2;
  const pos: Record<string, Pt> = {};
  if (name === 'wide') {
    // LinearB's areas fan out around it on the left
    const ar = 156;
    areaKeys.forEach((k, i) => {
      const a = Math.PI * (.12 + (i / Math.max(1, areaKeys.length - 1)) * .76);
      pos[k] = [lb[0] - ar * Math.sin(a), lb[1] - ar * 1.5 * Math.cos(a)];
    });
  } else {
    // no room to the left on a phone, so the areas stack in a column above and below LinearB (below clears its label)
    const half = Math.ceil(areaKeys.length / 2);
    areaKeys.forEach((k, i) => {
      const up = i < half, n = up ? half - 1 - i : i - half;
      pos[k] = [lb[0], up ? lb[1] - (lr + 70) - n * 108 : lb[1] + (lr + 128) + n * 108];
    });
  }
  // every other tool sits on an arc around the AI tool
  const rx = W * .38, ry = H * .44;
  toolKeys.forEach((k, i) => {
    const a = -Math.PI * .62 + i * (Math.PI * 1.24) / Math.max(1, toolKeys.length - 1);
    pos[k] = [hub[0] + rx * Math.cos(a), hub[1] + ry * Math.sin(a)];
  });
  const lines = [
    ...areaKeys.map(k => ({ a: k, cls: 'lnArea', d: edge(pos[k], 0, lb, lr, 0), pulse: false })),
    { a: 'linearb', cls: 'lnLb', d: edge(lb, lr, hub, hr, 0), pulse: true },
    ...toolKeys.map((k, i) => ({ a: k, cls: k === 'more' ? 'lnMore' : '', d: edge(pos[k], tr, hub, hr, i % 2 ? .06 : -.06), pulse: true })),
  ];
  return { W, H, hub, lb, pos, lines };
}

const pct = (v: number, of: number) => `${(v / of * 100).toFixed(3)}%`;
const fill = (t: string, k: string, v: string) => t.replace(`{${k}}`, v);

export function McpConnectionMap({ content = DEFAULT_CONTENT, icons = DEFAULT_ICONS, intro, autoplay = true, autoplayMs = 5000, className }: McpConnectionMapProps) {
  const c = content, L = c.labels;
  const areaKeys = Object.keys(c.areas), toolKeys = [...Object.keys(c.tools), 'more'];
  const tool = (k: string): MapTool => (k === 'more' ? c.more : c.tools[k]);
  const tname = (k: string) => (k === 'more' ? c.more.captionName : icons[k]?.name ?? k);
  const geo = { wide: geometry('wide', areaKeys, toolKeys), narrow: geometry('narrow', areaKeys, toolKeys) };

  const reduce = useReducedMotion();
  const [sel, setSel] = useState<Sel>({ t: c.start });
  const [fired, setFired] = useState<Record<string, number>>({});
  const stopped = useRef(false);

  const isTool = 't' in sel, key = 't' in sel ? sel.t : sel.d;
  const lit = isTool ? [key] : c.areas[key]?.worksWith ?? [];

  const choose = (next: Sel, user = false) => {
    if (user) stopped.current = true;
    setSel(next);
    if (!reduce) {
      const keys = ['linearb', ...('t' in next ? [next.t] : c.areas[next.d].worksWith)];
      setFired(f => { const n = { ...f }; keys.forEach(k => { n[k] = (n[k] ?? 0) + 1; }); return n; });
    }
  };

  // autoplay: once on screen, step through the tools until someone touches the map
  const selRef = useRef(sel), chooseRef = useRef(choose);
  selRef.current = sel; chooseRef.current = choose;
  const [playing, setPlaying] = useState(false);
  const rootRef = useFirstView<HTMLDivElement>(() => { if (autoplay) setPlaying(true); });
  useEffect(() => {
    if (!playing || reduce) return;
    const id = setInterval(() => {
      if (stopped.current) { clearInterval(id); return; }
      const cur = selRef.current, i = 't' in cur ? toolKeys.indexOf(cur.t) : -1;
      chooseRef.current({ t: toolKeys[(i + 1) % toolKeys.length] });
    }, autoplayMs);
    const stop = () => { stopped.current = true; };
    const el = rootRef.current;
    ['pointerdown', 'keydown', 'focusin'].forEach(e => el?.addEventListener(e, stop, { once: true }));
    return () => { clearInterval(id); ['pointerdown', 'keydown', 'focusin'].forEach(e => el?.removeEventListener(e, stop)); };
  }, [playing, reduce, autoplayMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const lineClass = (a: string, base: string) => {
    const hot = a === 'linearb' || lit.includes(a) || a === (!isTool ? key : '');
    return cx(s.ln, base && s[base], hot ? s.hot : s.cool);
  };

  const svg = (name: LayoutName) => {
    const g = geo[name];
    return (
      <svg className={cx(s.svg, s[name])} viewBox={`0 0 ${g.W} ${g.H.toFixed(1)}`} aria-hidden="true">
        {g.lines.map(l => <path key={l.a} className={lineClass(l.a, l.cls)} d={l.d} />)}
        {!reduce && g.lines.filter(l => l.pulse && fired[l.a]).map(l =>
          <path key={`${l.a}-${fired[l.a]}`} className={cx(s.pulse, s.go)} pathLength={100} d={l.d} />)}
      </svg>
    );
  };
  // positions as percentages, one set per layout, picked by a container query
  const at = (k: string | 'hub' | 'lb') => {
    const p = (name: LayoutName) => { const g = geo[name]; return k === 'hub' ? g.hub : k === 'lb' ? g.lb : g.pos[k]; };
    const w = p('wide'), n = p('narrow');
    return { '--wx': pct(w[0], 1000), '--wy': pct(w[1], geo.wide.H), '--nx': pct(n[0], 1000), '--ny': pct(n[1], geo.narrow.H) } as React.CSSProperties;
  };

  return (
    <div ref={rootRef} className={cx(s.root, className)}>
     <div className={cx(s.layout, intro != null && s.withIntro)}>
      {intro != null && <div className={s.intro}>{intro}</div>}

      <div className={s.mapBox}>
        <div className={cx(s.map, s.sel)} role="group" aria-label={L.mapLabel}>
          {svg('wide')}{svg('narrow')}
          <span className={s.hub} style={at('hub')} aria-hidden="true">
            <span>{c.hubClients.map(k => <Icon key={k} k={k} icons={icons} />)}</span><em>{c.hubLabel}</em>
          </span>
          <span className={s.lb} style={at('lb')} aria-hidden="true"><Icon k="linearb" icons={icons} /><em>{c.linearbLabel}</em></span>
          {areaKeys.map(k => (
            <button key={k} type="button" className={s.area} style={at(k)} aria-pressed={!isTool && key === k}
              title={c.areas[k].mcpTools.join(', ')} onClick={() => choose({ d: k }, true)}>{c.areas[k].label}</button>
          ))}
          {toolKeys.map(k => (
            <button key={k} type="button" style={at(k)} aria-pressed={isTool && key === k} aria-label={k === 'more' ? c.more.label : tname(k)}
              className={cx(s.tool, k === 'more' && s.more, !isTool && lit.includes(k) && s.lit, (isTool ? key === k : lit.includes(k)) ? null : s.faded)}
              onClick={() => choose({ t: k }, true)}>
              {k === 'more' ? <><span className={s.plus} aria-hidden="true">+</span><em>{c.more.label}</em></> : <Icon k={k} icons={icons} />}
            </button>
          ))}
        </div>
      </div>

      {/* every caption, stacked in one cell; only the chosen one is visible */}
      <div className={s.cap} aria-live="polite">
        {toolKeys.map(k => {
          const t = tool(k), n = tname(k), on = isTool && key === k, more = k === 'more';
          return (
            <div key={k} className={cx(s.state, on && s.on)} aria-hidden={!on}>
              <div className={s.capH}>{more ? <Icon k="linearb" icons={icons} className={s.mark} /> : <Stack keys={['linearb', k]} icons={icons} />}{fill(L.linearbAnd, 'tool', n)}</div>
              <div className={s.brings}>
                <div><p><span className={s.dot}><Icon k="linearb" icons={icons} /></span>{fill(L.brings, 'tool', 'LinearB')}</p><Tags items={t.linearbBrings} /></div>
                <div><p><span className={s.dot}>{more ? <span className={s.plus} aria-hidden="true">+</span> : <Icon k={k} icons={icons} />}</span>{fill(L.brings, 'tool', n[0].toUpperCase() + n.slice(1))}</p><Tags items={t.brings} /></div>
              </div>
              <p className={s.lbl}>{more ? L.buildMore : L.buildWithBoth}</p>
              <ul className={s.builds}>{t.builds.map(b => <li key={b}>{b}</li>)}</ul>
            </div>
          );
        })}
        {areaKeys.map(k => {
          const a = c.areas[k], on = !isTool && key === k;
          const name = a.label.toLowerCase().replace(/^ai\b/, 'AI');
          return (
            <div key={k} className={cx(s.state, on && s.on)} aria-hidden={!on}>
              <div className={s.capH}><Icon k="linearb" icons={icons} className={s.mark} />{fill(L.areaPrefix, 'area', name)}</div>
              <div className={cx(s.brings, s.areaBrings)}>
                <div><p><span className={s.dot}><Icon k="linearb" icons={icons} /></span>{L.mcpTools}</p><div className={s.codes}>{a.mcpTools.map(t => <code key={t}>{t}</code>)}</div></div>
                <div><p>{L.worksAlongside}</p><div className={s.logos}>{a.worksWith.map(t => <span key={t} className={s.dot} title={icons[t]?.name} role="img" aria-label={icons[t]?.name}><Icon k={t} icons={icons} /></span>)}</div></div>
              </div>
              <p className={s.lbl}>{L.askOnItsOwn}</p>
              <ul className={s.builds}>{a.questions.map(q => <li key={q}>{q}</li>)}</ul>
            </div>
          );
        })}
      </div>
     </div>
    </div>
  );
}

const Tags = ({ items }: { items: string[] }) => <div className={s.tags}>{items.map(x => <span key={x}>{x}</span>)}</div>;

export default McpConnectionMap;
