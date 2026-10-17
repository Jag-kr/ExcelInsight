import type { ChartSpec } from './derive-dashboard-item';
import type { ChartType } from './chart-themes';

export const STACKABLE: ChartType[] = ['bar', 'horizontalBar', 'area'];

const canon = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(canon)
  : v && typeof v === 'object'
    ? Object.fromEntries(
        Object.entries(v)
          .filter(([, x]) => x !== undefined)
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([k, x]) => [k, canon(x)]))
    : v;

/** JSON with sorted keys and no undefined values: equal values give equal strings. */
export const canonSig = (v: unknown): string => JSON.stringify(canon(v)) ?? '';

/** The spec the builder can actually express: grain only on a date axis, a legend only
    with one measure (and never on a combo, whose second measure is the line), stacking only for stackable types, a whole non-negative limit. */
export function normalizeSpec(s: ChartSpec, type: ChartType, isDate: boolean): ChartSpec {
  return {
    v: 2,
    dimension: s.dimension,
    measures: s.measures,
    ...(isDate && s.grain ? { grain: s.grain } : {}),
    ...(s.series && s.measures.length === 1 && type !== 'combo' ? { series: s.series } : {}),
    ...(s.sort ? { sort: s.sort } : {}),
    ...(s.limit != null ? { limit: Math.max(0, Math.floor(s.limit)) } : {}),
    ...(s.stacked && STACKABLE.includes(type) ? { stacked: true } : {}),
  };
}

/** What a live builder does after render. `current`/`fromParent` are canonSigs of the
    builder's own and the parent's [type, spec, title]. Never emit what the parent already has;
    when the parent moved, take its value instead of overwriting it. */
export function decideSync(o: { parentChanged: boolean; current: string; fromParent: string; canEmit: boolean }): 'none' | 'hydrate' | 'emit' {
  if (o.current === o.fromParent) return 'none';
  if (o.parentChanged) return 'hydrate';
  return o.canEmit ? 'emit' : 'none';
}
