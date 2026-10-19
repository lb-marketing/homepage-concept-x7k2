import React, { useState } from 'react';
import { DEFAULT_ICONS, IconMap } from '../shared/icons';
import { Icon, Mode, Stack, cx, modeStyle } from '../shared/ui';
import shared from '../shared/shared.module.css';
import s from './McpRecipeLibrary.module.css';
import { DEFAULT_CONTENT, Preview, RecipeLibraryContent } from './content';

/* Recipe library: a line per mode saying what Ask, Automate and Build mean, a mode filter, and the recipe cards.
   The filter dims the cards it leaves out rather than removing them, so the grid never changes height. */

export type McpRecipeLibraryProps = {
  content?: RecipeLibraryContent;
  icons?: IconMap;
  className?: string;
};

const MODES: Mode[] = ['ask', 'auto', 'build'];

export function McpRecipeLibrary({ content = DEFAULT_CONTENT, icons = DEFAULT_ICONS, className }: McpRecipeLibraryProps) {
  const [filter, setFilter] = useState<Mode | 'all'>('all');
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (i: number, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
    }
    setCopied(i);
    setTimeout(() => setCopied(c => (c === i ? null : c)), 2000);
  };

  return (
    <div className={cx(s.root, className)}>
      <div className={s.filter} role="group" aria-label={content.filterLabel}>
        {(['all', ...MODES] as const).map(f => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? content.allLabel : content.modes[f].label}
          </button>
        ))}
      </div>

      <dl className={s.key}>
        {MODES.map(m => (
          <div key={m} style={modeStyle(m)}>
            <dt className={shared.mode}>{content.modes[m].label}</dt>
            <dd>{content.modes[m].line}</dd>
          </div>
        ))}
      </dl>

      <div className={s.grid}>
        {content.recipes.map((r, i) => {
          const off = filter !== 'all' && r.mode !== filter;
          return (
            <article key={i} className={cx(s.card, off && s.dim)} style={modeStyle(r.mode)} aria-hidden={off || undefined}
              {...(off ? { inert: '' } : {})}>
              <div className={s.pv} aria-hidden="true"><PreviewMock p={r.preview} icons={icons} /></div>
              <div className={s.top}><Stack keys={r.tools} icons={icons} /><span className={shared.mode}>{content.modes[r.mode].label}</span></div>
              <h3 className={s.title}>{r.title}</h3>
              <blockquote className={s.prompt}>{r.prompt}</blockquote>
              <button type="button" className={cx(s.copy, copied === i && s.done)} onClick={() => copy(i, r.prompt)}>
                {copied === i ? content.copiedLabel : content.copyLabel}
              </button>
            </article>
          );
        })}
      </div>

      <a className={s.lib} href={content.library.href}>{content.library.label} <i aria-hidden="true">→</i></a>
    </div>
  );
}

/** The small mock of what each recipe makes. */
function PreviewMock({ p, icons }: { p: Preview; icons: IconMap }) {
  switch (p.kind) {
    case 'bars':
      return <div className={s.mock}><b>{p.title}</b><div className={s.bars}>{p.rows.map(r => <span key={r.label}><em>{r.label}</em><i style={{ width: `${r.value}%` }} /></span>)}</div></div>;
    case 'message':
      return <div className={cx(s.mock, s.message)}><span className={s.av}><Icon k={p.fromIcon} icons={icons} /></span>
        <span><b>{p.from}</b> <em>{p.time}</em><br />{p.text}<br /><a>{p.link}</a> · {p.meta}</span></div>;
    case 'doc':
      return <div className={s.mock}><b>{p.title}</b><div className={s.lines}>{p.lines.map((l, i) => <i key={i} className={cx(l.bullet && s.bullet)} style={{ width: `${l.width}%` }} />)}</div></div>;
    case 'trend': {
      const max = Math.max(...p.points), step = 200 / (p.points.length - 1), x = p.markerAt * 2;
      const pts = p.points.map((v, i) => `${(i * step).toFixed(1)},${(44 - (v / max) * 38).toFixed(1)}`).join(' ');
      return <div className={s.mock}><b>{p.title}</b> <em>{p.sub}</em>
        <svg className={s.trend} viewBox="0 0 200 46" preserveAspectRatio="none"><line x1={x} y1="0" x2={x} y2="46" /><polyline points={pts} /><text x={x + 4} y="9">{p.markerLabel}</text></svg></div>;
    }
    case 'ticket':
      return <div className={cx(s.mock, s.ticket)}><span><Icon k={p.icon} icons={icons} /><b>{p.key}</b></span><span>{p.text}</span><span className={s.pri}>{p.priority}</span></div>;
    case 'tiles':
      return <div className={cx(s.mock, s.tiles)}>{p.tiles.map(t => <span key={t.label}><b>{t.value}</b><em>{t.label}</em></span>)}</div>;
    case 'event':
      return <div className={cx(s.mock, s.event)}><span><b>{p.title}</b> <em>{p.time}</em>{p.lines.map(l => <React.Fragment key={l}><br />{l}</React.Fragment>)}</span></div>;
    case 'editor':
      return <div className={cx(s.mock, s.editor)}>{p.lines.map((l, i) => <div key={i}>{editorLine(l)}</div>)}</div>;
  }
}

/** `**x**` is a heading token and `[x]` a chip, as an editor would colour them. */
function editorLine(line: string) {
  return line.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g).map((part, i) =>
    part.startsWith('**') ? <span key={i} className={s.k}>{part.slice(2, -2)}</span>
      : part.startsWith('[') ? <span key={i} className={s.chip}>{part.slice(1, -1)}</span>
        : <React.Fragment key={i}>{part}</React.Fragment>);
}

export default McpRecipeLibrary;
