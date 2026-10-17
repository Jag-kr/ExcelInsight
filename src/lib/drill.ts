import { bucketDate, type DateGrain } from '@/lib/data-analyzer';

/** Week and day have no finer grain, so a week chart is not drillable. */
export const NEXT_GRAIN: Partial<Record<DateGrain, DateGrain>> = { year: 'quarter', quarter: 'month', month: 'day' };

/** Drill position on one card: `path[i]` is the bucket clicked at grain `grainAt(base, i)`. Transient, never stored. */
export interface DrillState { base: DateGrain; path: string[] }

/** The grain after `depth` steps down from `base`; null when the chain ends first. */
export function grainAt(base: DateGrain, depth: number): DateGrain | null {
  let g: DateGrain | undefined = base;
  for (let i = 0; i < depth && g; i++) g = NEXT_GRAIN[g];
  return g ?? null;
}

/** True when the grain the card shows after `path` still has a finer one to click into. */
export function canDrill(base: DateGrain, path: string[]): boolean {
  const g = grainAt(base, path.length);
  return !!g && !!NEXT_GRAIN[g];
}

/** Rows inside the drilled bucket: every path step must match; unparseable dates drop out. */
export function drillRows<T extends Record<string, any>>(rows: T[], column: string, base: DateGrain, path: string[]): T[] {
  if (!path.length) return rows;
  const grains = path.map((_, i) => grainAt(base, i));
  return rows.filter(r => path.every((label, i) => grains[i] !== null && bucketDate(r[column], grains[i]!) === label));
}

export const drillLabel = (path: string[]): string => path.join(' › ');
