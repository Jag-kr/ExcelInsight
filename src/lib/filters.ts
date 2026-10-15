import { bucketDate, type ColumnMeta } from './data-analyzer';

export type Filter =
  | { kind: 'in'; values: string[] }
  | { kind: 'range'; min?: number; max?: number }
  | { kind: 'date'; from?: string; to?: string };
export type Filters = Record<string, Filter>;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function isActive(f: Filter): boolean {
  switch (f.kind) {
    case 'in': return f.values.length > 0;
    case 'range': return f.min !== undefined || f.max !== undefined;
    case 'date': return f.from !== undefined || f.to !== undefined;
  }
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter(isActive).length;
}

const blank = (v: unknown) => v === null || v === undefined || v === '';

function predicate(f: Filter): (v: unknown) => boolean {
  switch (f.kind) {
    case 'in': {
      const set = new Set(f.values);
      return v => !blank(v) && set.has(String(v));
    }
    case 'range': {
      const { min = -Infinity, max = Infinity } = f;
      return v => {
        if (blank(v) || (typeof v === 'string' && !v.trim())) return false;
        const n = Number(v);
        return Number.isFinite(n) && n >= min && n <= max;
      };
    }
    case 'date': {
      const { from = '', to = '￿' } = f;
      return v => {
        const d = bucketDate(v, 'day');
        return d !== null && d >= from && d <= to;
      };
    }
  }
}

/** AND across columns. Returns `rows` itself (same reference) when nothing is active. */
export function applyFilters<T extends Record<string, unknown>>(rows: T[], filters: Filters): T[] {
  const preds = Object.entries(filters)
    .filter(([, f]) => isActive(f))
    .map(([col, f]) => [col, predicate(f)] as const);
  if (!preds.length) return rows;
  return rows.filter(row => preds.every(([col, p]) => p(row[col])));
}

const isNum = (x: unknown): x is number | undefined => x === undefined || (typeof x === 'number' && Number.isFinite(x));
const isDay = (x: unknown): x is string | undefined => x === undefined || (typeof x === 'string' && ISO_DAY.test(x));

function normalizeOne(raw: unknown): Filter | null {
  // Legacy shape: a bare string is one exact value.
  if (typeof raw === 'string') return { kind: 'in', values: [raw] };
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  switch (r.kind) {
    case 'in':
      return Array.isArray(r.values) && r.values.every(v => typeof v === 'string')
        ? { kind: 'in', values: r.values as string[] }
        : null;
    case 'range':
      return isNum(r.min) && isNum(r.max) ? { kind: 'range', min: r.min, max: r.max } : null;
    case 'date':
      return isDay(r.from) && isDay(r.to) ? { kind: 'date', from: r.from, to: r.to } : null;
    default:
      return null;
  }
}

/** Accepts anything (persisted state, legacy `Record<string,string>`); drops what it can't validate. Never throws. */
export function normalizeFilters(raw: unknown): Filters {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: Filters = {};
  for (const [col, v] of Object.entries(raw)) {
    const f = normalizeOne(v);
    if (f) out[col] = f;
  }
  return out;
}

export function setFilter(filters: Filters, column: string, f: Filter | null): Filters {
  const { [column]: _removed, ...rest } = filters;
  return f && isActive(f) ? { ...rest, [column]: f } : rest;
}

export function filterKindFor(col: ColumnMeta): Filter['kind'] | null {
  switch (col.type) {
    case 'date': return 'date';
    case 'numeric': return 'range';
    case 'categorical':
    case 'range': return 'in';
    case 'text': return col.uniqueRatio < 0.5 ? 'in' : null;
    default: return null;
  }
}
