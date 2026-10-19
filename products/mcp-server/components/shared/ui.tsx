import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import type { IconMap } from './icons';
import s from './shared.module.css';

/* Pieces the three MCP components share: tool logos, logo stacks, mode colours and a couple of hooks. */

export type Mode = 'ask' | 'auto' | 'build';

/** One brand colour per mode, used the same way in every component: Ask indigo, Automate teal, Build red. */
const MODE_VARS: Record<Mode, Record<string, string>> = {
  ask:   { '--m': 'var(--lb-indigo-500)', '--m-soft': 'var(--lb-indigo-200)', '--m-ink': 'var(--lb-indigo-600)', '--m-pale': 'var(--lb-indigo-100)' },
  auto:  { '--m': 'var(--lb-teal-500)',   '--m-soft': 'var(--lb-teal-200)',   '--m-ink': 'var(--lb-teal-700)',   '--m-pale': 'var(--lb-teal-100)' },
  build: { '--m': 'var(--lb-red-500)',    '--m-soft': 'var(--lb-red-200)',    '--m-ink': 'var(--lb-red-700)',    '--m-pale': 'var(--lb-red-100)' },
};
export const modeStyle = (mode: Mode, extra?: CSSProperties): CSSProperties => ({ ...(MODE_VARS[mode] as CSSProperties), ...extra });

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

/** A tool logo. Missing keys render nothing rather than throwing, so a typo in Studio can't take the page down. */
export function Icon({ k, icons, className }: { k: string; icons: IconMap; className?: string }) {
  const t = icons[k];
  if (!t) return null;
  const style = { '--i': `url("${t.src}")`, '--c': t.color } as CSSProperties;
  return <i className={cx(s.ic, t.fullColour && s.full, className)} style={style} aria-hidden="true" />;
}

/** Overlapping logos in white circles, as on the recipe cards. */
export function Stack({ keys, icons, className }: { keys: string[]; icons: IconMap; className?: string }) {
  return (
    <span className={cx(s.stack, className)} aria-hidden="true">
      {keys.map(k => <Icon key={k} k={k} icons={icons} />)}
    </span>
  );
}

/** `**bold**` in a content string becomes <b>, so copy can carry emphasis without HTML. */
export function rich(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : <React.Fragment key={i}>{part}</React.Fragment>);
}

/** "A", "A and B", "A, B and C" */
export const listOf = (names: string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(q.matches);
    const on = () => setReduce(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduce;
}

/** Calls `fn` once, the first time the element is a third on screen. */
export function useFirstView<T extends Element>(fn: () => void) {
  const ref = useRef<T>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fnRef.current(); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fnRef.current(); } }, { threshold: .35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** A gentle curve from a to b, bowed to one side so lines into the same point fan out. */
export function curve(a: [number, number], b: [number, number], bow = .12) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${(mx - dy * bow).toFixed(1)} ${(my + dx * bow).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

/** A line from circle edge to circle edge, along the axis between their centres, so it meets both square-on. */
export function edge(a: [number, number], ra: number, b: [number, number], rb: number, bow: number) {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l;
  return curve([a[0] + ux * ra, a[1] + uy * ra], [b[0] - ux * rb, b[1] - uy * rb], bow);
}
