import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DEFAULT_ICONS, IconMap } from '../shared/icons';
import { Icon, Stack, cx, edge, listOf, modeStyle, rich, useFirstView, useReducedMotion } from '../shared/ui';
import shared from '../shared/shared.module.css';
import s from './McpRecipeDemo.module.css';
import { ChatResult, DEFAULT_CONTENT, DemoRecipe, DocResult, RecipeDemoContent, Result, SlackResult, SlidesResult } from './content';

/* Hero demo: pick a recipe and the prompt types into the AI tool, each tool it calls lights up and pulses into
   it, and the result lands as the app it was written to. Autoplays through the recipes once on screen, until
   someone interacts.

   Nothing is measured to lay it out. The prompt box renders every prompt in one grid cell, so it is as tall as
   the longest; the result windows share one cell too; and the graph keeps a fixed aspect ratio with its lines
   worked out from the content. The first paint shows the first recipe finished, which is also what a reader
   who prefers reduced motion keeps. */

export type McpRecipeDemoProps = {
  content?: RecipeDemoContent;
  icons?: IconMap;
  autoplay?: boolean;
  /** how long each recipe stays up while autoplaying */
  dwellMs?: number;
  className?: string;
};

type Phase = 'typing' | 'calling' | 'done';

/* Graph layouts: node diameters as a share of the graph's width, positions in a 1000-wide viewBox. */
const GRAPH = {
  wide:   { aspect: 1.63, node: .0915, lb: .123, hub: .155, gap: 8 },
  narrow: { aspect: 1.25, node: .12,   lb: .155, hub: .19,  gap: 12 },
} as const;
type GraphName = keyof typeof GRAPH;

const usedOf = (r: DemoRecipe) => [...new Set(r.calls.map(c => c.tool))];
const fill = (t: string, vars: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

export function McpRecipeDemo({ content = DEFAULT_CONTENT, icons = DEFAULT_ICONS, autoplay = true, dwellMs = 9000, className }: McpRecipeDemoProps) {
  const c = content, R = c.recipes, name = (k: string) => icons[k]?.name ?? k;
  const reduce = useReducedMotion();

  const [cur, setCur] = useState(0);
  const [phase, setPhase] = useState<Phase>('done');
  const [typed, setTyped] = useState(R[0]?.prompt.length ?? 0);
  const [live, setLive] = useState<string[]>([]);
  const [fired, setFired] = useState<Record<string, number>>({});
  const [hubFire, setHubFire] = useState(0);
  const [front, setFront] = useState(0);
  const [back, setBack] = useState<number | null>(R.length > 1 ? R.length - 1 : null); // something sits behind the first result
  const [auto, setAuto] = useState(false);

  const timers = useRef<number[]>([]), raf = useRef(0), frontRef = useRef(0);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; cancelAnimationFrame(raf.current); };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const land = (i: number) => {
    if (frontRef.current !== i) setBack(frontRef.current);
    frontRef.current = i; setFront(i);
  };

  const play = useCallback((i: number, animate: boolean) => {
    clear();
    const r = R[i]; if (!r) return;
    setCur(i); setLive([]);
    if (!animate || reduce) { setPhase('done'); setTyped(r.prompt.length); land(i); return; }
    // the prompt types at a steady pace, stepped by real elapsed time so it runs the same on any display
    setPhase('typing'); setTyped(0);
    const per = Math.max(4, Math.min(9, 800 / r.prompt.length)), t0 = performance.now();
    const tick = (now: number) => {
      const n = Math.min(r.prompt.length, Math.floor((now - t0) / per));
      setTyped(n);
      if (n < r.prompt.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    // one wave: each tool fires once, LinearB first and the rest a beat behind, while the status bar holds one line
    const start = r.prompt.length * per + 150, step = 160, used = usedOf(r);
    later(() => setPhase('calling'), start);
    used.forEach((k, n) => {
      later(() => { setLive(l => [...l, k]); setFired(f => ({ ...f, [k]: (f[k] ?? 0) + 1 })); }, start + n * step);
      later(() => setLive(l => l.filter(x => x !== k)), start + n * step + 700);
    });
    later(() => { setPhase('done'); setHubFire(h => h + 1); land(i); }, start + (used.length - 1) * step + 900);
  }, [R, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => clear, []);

  // autoplay: once on screen, play the first recipe, then the next every `dwellMs`, until someone interacts
  const stopped = useRef(false), curRef = useRef(0), playRef = useRef(play);
  curRef.current = cur; playRef.current = play;
  const [seen, setSeen] = useState(false);
  const rootRef = useFirstView<HTMLDivElement>(() => setSeen(true));
  useEffect(() => {
    if (!seen) return;
    playRef.current(0, true);
    if (!autoplay || reduce) return;
    setAuto(true);
    const id = window.setInterval(() => { if (!stopped.current) playRef.current((curRef.current + 1) % R.length, true); }, dwellMs);
    const el = rootRef.current;
    const stop = () => { stopped.current = true; clearInterval(id); setAuto(false); };
    ['pointerdown', 'keydown', 'focusin'].forEach(e => el?.addEventListener(e, stop, { once: true }));
    return () => { clearInterval(id); ['pointerdown', 'keydown', 'focusin'].forEach(e => el?.removeEventListener(e, stop)); };
  }, [seen, autoplay, reduce, dwellMs, R.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = R[cur];
  if (!r) return null;
  const used = usedOf(r);
  const lbCalls = r.calls.filter(x => x.tool === 'linearb' && x.call).map(x => x.call as string);
  const others = used.filter(k => k !== 'linearb');

  // the graph, drawn for both layouts; a container query shows the one that fits
  const graphSvg = (g: GraphName) => {
    const L = GRAPH[g], W = 1000, H = W / L.aspect, hub: [number, number] = [W / 2, H / 2], hr = L.hub * W / 2 + L.gap;
    return (
      <svg className={cx(s.gsvg, s[g])} viewBox={`0 0 ${W} ${H.toFixed(1)}`} aria-hidden="true">
        {c.graph.map((n, i) => {
          const d = edge([n.x * W, n.y * H], (n.tool === 'linearb' ? L.lb : L.node) * W / 2, hub, hr, i % 2 ? .08 : -.08);
          const on = used.includes(n.tool);
          return (
            <React.Fragment key={n.tool}>
              <path className={cx(s.ln, on ? s.on : s.off)} d={d} />
              {!reduce && fired[n.tool] ? <path key={`${n.tool}-${fired[n.tool]}`} className={s.pulse} pathLength={100} d={d} /> : null}
            </React.Fragment>
          );
        })}
      </svg>
    );
  };

  return (
    <div ref={rootRef} className={cx(s.root, className)}>
      <div className={s.stage}>
        <div className={cx(s.picker, auto && s.auto)} role="group" aria-label={c.labels.pickerLabel} style={{ '--dwell': `${dwellMs}ms` } as React.CSSProperties}>
          {R.map((x, i) => (
            <button key={i} type="button" className={s.card} style={modeStyle(x.mode)} aria-pressed={cur === i} onClick={() => play(i, true)}>
              <span className={s.cardTop}><Stack keys={x.card.tools} icons={icons} /><span className={shared.mode}>{c.modes[x.mode]}</span></span>
              <b>{x.card.title}</b>
              <span>{x.card.line}</span>
            </button>
          ))}
        </div>

        <div className={s.cx} style={modeStyle(r.mode)}>
          <div className={s.left}>
            {/* every prompt in one cell, so the box is always the height of the longest */}
            <div className={s.ask}>
              {R.map((x, i) => {
                const on = i === cur, shown = on ? typed : x.prompt.length;
                return (
                  <div key={i} className={cx(s.askState, on && s.on)} aria-hidden={!on}>
                    <div className={s.askH}><span className={s.client}><Icon k={x.client} icons={icons} />{name(x.client)}</span><span className={s.conn}>{x.context}</span></div>
                    <p className={cx(s.typed, (!on || phase !== 'typing') && s.done)}>
                      <span className={s.t}>{x.prompt.slice(0, shown)}</span><span className={s.rest}>{x.prompt.slice(shown)}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className={s.graph} aria-hidden="true">
              {graphSvg('wide')}{graphSvg('narrow')}
              {c.graph.map(n => (
                <span key={n.tool} className={cx(s.node, n.tool === 'linearb' && s.lb, used.includes(n.tool) ? s.on : s.off, live.includes(n.tool) && s.live)}
                  style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}>
                  <Icon k={n.tool} icons={icons} /><em>{name(n.tool)}</em>
                </span>
              ))}
              <span key={hubFire} className={cx(s.node, s.hub, hubFire > 0 && s.fire)} style={{ left: '50%', top: '50%' }}><Icon k={r.client} icons={icons} /></span>
            </div>

            <Ticker key={`${cur}-${phase}`} phase={phase} r={r} icons={icons} c={c} lbCalls={lbCalls} others={others} used={used} />
          </div>

          <div className={s.deck}>
            {R.map((x, i) => (
              <div key={i} className={cx(s.app, s[x.result.kind], i === front && s.front, i === back && i !== front && s.back)}
                aria-hidden={i !== front} {...(i !== front ? { inert: '' } : {})}>
                <ResultWindow res={x.result} icons={icons} />
              </div>
            ))}
          </div>
        </div>
        <p className={s.note}>{c.sampleNote}</p>
      </div>
    </div>
  );
}

/** The status bar: what the AI tool is doing, then what it called. */
function Ticker({ phase, r, icons, c, lbCalls, others, used }: {
  phase: Phase; r: DemoRecipe; icons: IconMap; c: RecipeDemoContent; lbCalls: string[]; others: string[]; used: string[];
}) {
  const name = (k: string) => icons[k]?.name ?? k;
  const chips = useRef<HTMLSpanElement>(null);
  const [over, setOver] = useState(false);
  // a decorative fade when the chips run out of room; the bar's size never depends on it
  useLayoutEffect(() => { const el = chips.current; setOver(!!el && el.scrollWidth > el.clientWidth + 1); }, [phase]);
  if (phase !== 'done') {
    const text = phase === 'typing' ? fill(c.labels.reading, { client: name(r.client) }) : fill(c.labels.calling, { tools: listOf(used.map(name)) });
    return <div className={s.ticker} role="status"><span className={s.say}>{text}</span></div>;
  }
  const aria = fill(c.labels.calledAria, { client: name(r.client), calls: lbCalls.join(', '), tools: listOf(others.map(name)) }).replace(/, then $/, '');
  return (
    <div className={s.ticker} role="status" aria-label={aria}>
      <Icon k="linearb" icons={icons} />
      <span ref={chips} className={cx(s.used, over && s.over)}>{lbCalls.map(t => <code key={t}>{t}</code>)}</span>
      {others.length > 0 && <><span className={s.plus}>+</span><span className={s.sum}>{others.map(k => <Icon key={k} k={k} icons={icons} />)}</span></>}
      <i className={s.ok} aria-label={c.labels.done} />
    </div>
  );
}

function ResultWindow({ res, icons }: { res: Result; icons: IconMap }) {
  switch (res.kind) {
    case 'slack': return <Slack r={res} icons={icons} />;
    case 'doc': return <Doc r={res} icons={icons} />;
    case 'slides': return <Slides r={res} icons={icons} />;
    case 'chat': return <Chat r={res} icons={icons} />;
  }
}

function Slack({ r, icons }: { r: SlackResult; icons: IconMap }) {
  return (
    <>
      <div className={s.slSide} aria-hidden="true"><b>{r.workspace}</b>{r.channels.map(ch => <span key={ch} className={cx(ch === r.channel && s.on)}>{ch}</span>)}</div>
      <div className={s.slMain}>
        <div className={s.slTop}><b>{r.channel}</b><span>{r.members}</span></div>
        <div className={s.slMsg}>
          <span className={s.slAv}><Icon k={r.botIcon} icons={icons} /></span>
          <div className={s.slBody}>
            <div className={s.slN}><b>{r.bot}</b><span className={s.tag}>{r.tag}</span><span>{r.time}</span></div>
            <p><b>{r.title}</b></p>
            <ul className={s.slList}>{r.metrics.map(m => <li key={m.text}><i className={cx(s.d, s[m.tone])} />{rich(m.text)}</li>)}</ul>
            <p className={s.slWarn}>{r.warning}</p>
            <p>{r.waitingLabel}{r.waiting.map(w => <React.Fragment key={w.title}><br /><a>{w.title}</a> · {w.age}</React.Fragment>)}</p>
            <div className={s.react}>{r.reactions.map(x => <span key={x}>{x}</span>)}</div>
          </div>
        </div>
        <div className={s.slIn}>{r.composer}</div>
      </div>
    </>
  );
}

function Doc({ r, icons }: { r: DocResult; icons: IconMap }) {
  return (
    <>
      <div className={s.gdBar}><Icon k="gdocs" icons={icons} /><div className={s.gdT}><b>{r.file}</b><span>{r.menu}</span></div><i className={s.gdShare}>{r.share}</i></div>
      <div className={s.gdCanvas}>
        <div className={s.gdPage}>
          <p className={s.h4}>{r.title}</p>
          <p className={s.gdMeta}>{r.meta}</p>
          <p>{r.summary}</p>
          <p className={s.h5}>{r.timelineLabel}</p>
          <table className={s.gdTab}><tbody>{r.timeline.map(t => <tr key={t.time}><td>{t.time}</td><td>{t.text}</td></tr>)}</tbody></table>
          <p className={s.h5}>{r.changesLabel}</p>
          <ul className={s.gdList}>{r.changes.map(ch => <li key={ch.title}><b>{ch.title}</b>, {ch.detail}{ch.comment && <> <span className={s.gdC}>{ch.comment}</span></>}</li>)}</ul>
        </div>
      </div>
    </>
  );
}

function Slides({ r, icons }: { r: SlidesResult; icons: IconMap }) {
  const max = Math.max(...r.bars.map(b => b.value));
  return (
    <>
      <div className={s.gdBar}><Icon k="gslides" icons={icons} /><div className={s.gdT}><b>{r.file}</b><span>{r.menu}</span></div><i className={cx(s.gdShare, s.show)}>{r.share}</i></div>
      <div className={s.gsB}>
        <div className={s.gsStrip} aria-hidden="true">{Array.from({ length: r.slides }, (_, i) => <i key={i} className={cx(i + 1 === r.current && s.on)} />)}</div>
        <div className={s.gsMain}>
          <div className={s.gsSlide}>
            <div className={s.gsTop}><span className={s.gsLogo}><i />{r.company}</span><span>{r.deck}</span></div>
            <p className={s.h4}>{r.headline}</p>
            <div className={s.gsBody}>
              <div className={s.gsCols} role="img" aria-label={`${r.chartTitle}: ${r.bars.map(b => `${b.label} ${b.display}`).join(', ')}`}>
                <p>{r.chartTitle}</p>
                <div className={s.gsPlot}>
                  {r.bars.map((b, i) => (
                    <div key={b.label} className={cx(i === r.bars.length - 1 && s.now)}><i style={{ height: `${(b.value / max) * 100}%` }}><b>{b.display}</b></i><span>{b.label}</span></div>
                  ))}
                </div>
              </div>
              <div className={s.gsFacts}>{r.facts.map(f => <div key={f.value}><b>{f.value}</b><span>{f.text}</span></div>)}</div>
            </div>
            <div className={s.gsFoot}><span>{r.source}</span><span>{r.page}</span></div>
          </div>
          <p className={s.gsNotes}>{r.notes}</p>
        </div>
      </div>
    </>
  );
}

function Chat({ r, icons }: { r: ChatResult; icons: IconMap }) {
  return (
    <>
      <div className={s.gptBar}><Icon k={r.appIcon} icons={icons} /><b>{r.app}</b><span>{r.context}</span></div>
      <div className={s.gptB}>
        <p>{rich(r.answer)}</p>
        <div className={s.slip}>
          <div className={s.slipAx}>{r.axis.map(a => <span key={a.label} style={{ left: `${a.at}%` }}>{a.label}</span>)}</div>
          {r.rows.map(row => (
            <div key={row.name} className={s.slipR}>
              <div className={s.slipN}><b>{row.name}</b><span>{row.meta}</span></div>
              <div className={s.slipT}><i className={s.slipPlan} style={{ width: `${row.due}%` }} /><i className={s.slipOver} style={{ left: `${row.due}%`, width: `${row.projected - row.due}%` }} /></div>
              <div className={s.slipD}><b>{row.value}</b><span>{row.deals}</span></div>
            </div>
          ))}
          <div className={s.slipK}><span className={s.kPlan}>{r.legend.due}</span><span className={s.kOver}>{r.legend.slip}</span></div>
        </div>
        <p className={s.gptNext}>{r.followUp}</p>
        <div className={s.gptIn}>{r.composer}</div>
      </div>
    </>
  );
}

export default McpRecipeDemo;
