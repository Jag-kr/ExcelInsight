import { describe, it, expect } from 'vitest';
import type { ColumnMeta, ColumnType } from './data-analyzer';
import {
  applyFilters, normalizeFilters, isActive, countActive, setFilter, filterKindFor, type Filters,
} from './filters';

type Row = Record<string, unknown>;

describe('applyFilters', () => {
  const rows: Row[] = [
    { Region: 'North', Sales: 10, Day: '2025-01-10' },
    { Region: 'South', Sales: 20, Day: 'Jan 15, 2025' },
    { Region: 'North', Sales: 30, Day: '2025-01-20' },
    { Region: '', Sales: '', Day: '' },
    { Region: null, Sales: 'n/a', Day: 'not a date' },
    { Region: undefined, Sales: undefined, Day: undefined },
  ];

  it('returns the same reference with no active filters', () => {
    expect(applyFilters(rows, {})).toBe(rows);
    const inactive: Filters = {
      a: { kind: 'in', values: [] },
      b: { kind: 'range' },
      c: { kind: 'date' },
    };
    expect(applyFilters(rows, inactive)).toBe(rows);
  });

  it('in: matches stringified values, never blanks', () => {
    expect(applyFilters(rows, { Region: { kind: 'in', values: ['North', 'South'] } })).toEqual(rows.slice(0, 3));
    expect(applyFilters(rows, { Sales: { kind: 'in', values: ['10'] } })).toEqual([rows[0]]);
    expect(applyFilters(rows, { Region: { kind: 'in', values: ['', 'null', 'undefined'] } })).toEqual([]);
  });

  it('range: inclusive bounds, open ends, excludes blank and non-numeric', () => {
    const run = (min?: number, max?: number) => applyFilters(rows, { Sales: { kind: 'range', min, max } }).map(r => r.Sales);
    expect(run(10, 20)).toEqual([10, 20]);
    expect(run(21)).toEqual([30]);
    expect(run(undefined, 10)).toEqual([10]);
    expect(run(0)).toEqual([10, 20, 30]);
    expect(run(-Infinity, Infinity)).toEqual([10, 20, 30]);
  });

  it('range: numeric strings count', () => {
    expect(applyFilters([{ n: '5' }, { n: ' ' }], { n: { kind: 'range', max: 5 } })).toEqual([{ n: '5' }]);
  });

  it('date: inclusive bounds, non-ISO input parsed, undated excluded', () => {
    const run = (from?: string, to?: string) => applyFilters(rows, { Day: { kind: 'date', from, to } }).map(r => r.Day);
    expect(run('2025-01-10', '2025-01-20')).toEqual(['2025-01-10', 'Jan 15, 2025', '2025-01-20']);
    expect(run('2025-01-11', '2025-01-19')).toEqual(['Jan 15, 2025']);
    expect(run('2025-01-15', '2025-01-15')).toEqual(['Jan 15, 2025']);
    expect(run('2025-01-16')).toEqual(['2025-01-20']);
    expect(run(undefined, '2025-01-10')).toEqual(['2025-01-10']);
  });

  it('date: ISO timestamps compare by calendar day', () => {
    const r = [{ d: '2025-01-15 23:30' }, { d: '2025-01-16 00:10' }];
    expect(applyFilters(r, { d: { kind: 'date', to: '2025-01-15' } })).toEqual([r[0]]);
  });

  it('ANDs across columns', () => {
    const out = applyFilters(rows, {
      Region: { kind: 'in', values: ['North'] },
      Sales: { kind: 'range', min: 20 },
    });
    expect(out).toEqual([rows[2]]);
  });

  it('ignores inactive entries alongside active ones', () => {
    const out = applyFilters(rows, { Region: { kind: 'in', values: ['South'] }, Sales: { kind: 'range' } });
    expect(out).toEqual([rows[1]]);
  });

  it('legacy {col: value} behaves like the old String(row[col]) === val', () => {
    const data: Row[] = [
      { Region: 'North', Year: 2024 },
      { Region: 'South', Year: 2025 },
      { Region: 'North', Year: 2025 },
      { Region: 'East', Year: 2025 },
    ];
    const legacy: Record<string, string> = { Region: 'North', Year: '2025' };
    const old = data.filter(row => Object.entries(legacy).every(([col, val]) => String(row[col]) === val));
    expect(applyFilters(data, normalizeFilters(legacy))).toEqual(old);
    expect(old).toEqual([data[2]]);
  });
});

describe('normalizeFilters', () => {
  it('garbage becomes {}', () => {
    for (const raw of [undefined, null, 5, 'x', true, [], [{ kind: 'in', values: [] }]]) {
      expect(normalizeFilters(raw)).toEqual({});
    }
  });

  it('converts the legacy string shape', () => {
    expect(normalizeFilters({ Region: 'North', Year: '2025' })).toEqual({
      Region: { kind: 'in', values: ['North'] },
      Year: { kind: 'in', values: ['2025'] },
    });
  });

  it('keeps valid typed entries', () => {
    const f: Filters = {
      a: { kind: 'in', values: ['x', 'y'] },
      b: { kind: 'range', min: 1, max: 2 },
      c: { kind: 'date', from: '2025-01-01', to: '2025-12-31' },
      d: { kind: 'range', min: 0 },
      e: { kind: 'date', to: '2025-12-31' },
    };
    expect(normalizeFilters(f)).toEqual(f);
  });

  it('drops invalid entries and unknown kinds', () => {
    expect(normalizeFilters({
      a: { kind: 'in', values: [1, 2] },
      b: { kind: 'in' },
      c: { kind: 'range', min: NaN },
      d: { kind: 'range', max: Infinity },
      e: { kind: 'range', min: '3' },
      f: { kind: 'date', from: '15/01/2025' },
      g: { kind: 'date', to: 20250101 },
      h: { kind: 'regex', pattern: '.*' },
      i: null,
      j: 7,
      k: { values: ['x'] },
      ok: { kind: 'in', values: ['x'] },
    })).toEqual({ ok: { kind: 'in', values: ['x'] } });
  });
});

describe('isActive / countActive', () => {
  it('isActive per kind', () => {
    expect(isActive({ kind: 'in', values: [] })).toBe(false);
    expect(isActive({ kind: 'in', values: ['a'] })).toBe(true);
    expect(isActive({ kind: 'range' })).toBe(false);
    expect(isActive({ kind: 'range', min: 0 })).toBe(true);
    expect(isActive({ kind: 'range', max: 0 })).toBe(true);
    expect(isActive({ kind: 'date' })).toBe(false);
    expect(isActive({ kind: 'date', from: '2025-01-01' })).toBe(true);
    expect(isActive({ kind: 'date', to: '2025-01-01' })).toBe(true);
  });

  it('countActive skips inactive entries', () => {
    expect(countActive({})).toBe(0);
    expect(countActive({
      a: { kind: 'in', values: ['x'] },
      b: { kind: 'range' },
      c: { kind: 'date', from: '2025-01-01' },
    })).toBe(2);
  });
});

describe('setFilter', () => {
  const base: Filters = { a: { kind: 'in', values: ['x'] }, b: { kind: 'range', min: 1 } };

  it('sets without mutating', () => {
    const snapshot = structuredClone(base);
    const next = setFilter(base, 'c', { kind: 'date', from: '2025-01-01' });
    expect(next).not.toBe(base);
    expect(next).toEqual({ ...base, c: { kind: 'date', from: '2025-01-01' } });
    expect(base).toEqual(snapshot);
  });

  it('replaces an existing column', () => {
    expect(setFilter(base, 'a', { kind: 'in', values: ['y'] }).a).toEqual({ kind: 'in', values: ['y'] });
  });

  it('removes on null or inactive, without mutating', () => {
    const snapshot = structuredClone(base);
    const a = setFilter(base, 'a', null);
    const b = setFilter(base, 'b', { kind: 'range' });
    expect(a).toEqual({ b: base.b });
    expect(b).toEqual({ a: base.a });
    expect(base).toEqual(snapshot);
  });

  it('removing an absent column returns an equal, new object', () => {
    const next = setFilter(base, 'zzz', null);
    expect(next).toEqual(base);
    expect(next).not.toBe(base);
  });
});

describe('filterKindFor', () => {
  const col = (type: ColumnType, uniqueRatio = 0.1): ColumnMeta => ({
    name: 'c', type, uniqueCount: 1, totalCount: 10, nullCount: 0, uniqueRatio, sampleValues: [],
  });

  it('maps column types', () => {
    expect(filterKindFor(col('date'))).toBe('date');
    expect(filterKindFor(col('numeric'))).toBe('range');
    expect(filterKindFor(col('categorical'))).toBe('in');
    expect(filterKindFor(col('range'))).toBe('in');
    expect(filterKindFor(col('text', 0.49))).toBe('in');
    expect(filterKindFor(col('text', 0.5))).toBeNull();
    expect(filterKindFor(col('id'))).toBeNull();
  });
});
