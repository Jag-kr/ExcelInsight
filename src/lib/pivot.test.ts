import { describe, it, expect } from 'vitest';
import { computePivot, PIVOT_MAX_ROWS, PIVOT_MAX_COLS, type PivotSpec } from './pivot';

const DATA = [
  { Region: 'North', Q: 'Q1', Sales: 100 },
  { Region: 'North', Q: 'Q1', Sales: 50 },
  { Region: 'North', Q: 'Q2', Sales: 10 },
  { Region: 'South', Q: 'Q1', Sales: 300 },
  { Region: 'East',  Q: 'Q2', Sales: 20 },
];
const sum: PivotSpec['value'] = { column: 'Sales', agg: 'sum' };

describe('computePivot', () => {
  it('counts rows per row label with no cols', () => {
    const p = computePivot(DATA, { rows: 'Region', value: { column: null, agg: 'count' } });
    expect(p.rowLabels).toEqual(['North', 'East', 'South']); // 3, then 1-1 tie by label
    expect(p.cells).toEqual([[3], [1], [1]]);
    expect(p.rowTotals).toEqual([3, 1, 1]);
    expect(p.colLabels).toEqual([]);
    expect(p.colTotals).toEqual([]);
    expect(p.grand).toBe(5);
  });

  it('builds a rows x cols sum matrix, ordered by total descending', () => {
    const p = computePivot(DATA, { rows: 'Region', cols: 'Q', value: sum });
    expect(p.rowLabels).toEqual(['South', 'North', 'East']); // 300, 160, 20
    expect(p.colLabels).toEqual(['Q1', 'Q2']);               // 450, 30
    expect(p.cells).toEqual([[300, null], [150, 10], [null, 20]]);
    expect(p.rowTotals).toEqual([300, 160, 20]);
    expect(p.colTotals).toEqual([450, 30]);
    expect(p.grand).toBe(480);
  });

  it('totals aggregate the raw rows, not the cells', () => {
    const rows = [
      { r: 'a', c: 'x', v: 1 }, { r: 'a', c: 'x', v: 1 }, { r: 'a', c: 'x', v: 1 },
      { r: 'a', c: 'y', v: 9 },
    ];
    const p = computePivot(rows, { rows: 'r', cols: 'c', value: { column: 'v', agg: 'average' } });
    expect(p.colLabels).toEqual(['y', 'x']);
    expect(p.cells).toEqual([[9, 1]]);
    expect(p.rowTotals).toEqual([3]);   // not (1 + 9) / 2
    expect(p.grand).toBe(3);
  });

  it('labels blank cells (blank)', () => {
    const p = computePivot(
      [{ r: null, v: 1 }, { r: '', v: 1 }, { r: '  ', v: 1 }, { r: 'a', v: 5 }],
      { rows: 'r', value: { column: 'v', agg: 'sum' } },
    );
    expect(p.rowLabels).toEqual(['a', '(blank)']);
    expect(p.rowTotals).toEqual([5, 3]);
  });

  it('sorts date buckets ascending, (blank) last, and blanks non-dates', () => {
    const rows = [
      { d: '2025-03-10', v: 1 }, { d: '2025-01-05', v: 100 }, { d: 'not a date', v: 1000 },
      { d: '2025-01-20', v: 1 }, { d: '2024-12-31', v: 1 },
    ];
    const p = computePivot(rows, { rows: 'd', rowGrain: 'month', value: { column: 'v', agg: 'sum' } });
    expect(p.rowLabels).toEqual(['2024-12', '2025-01', '2025-03', '(blank)']);
    expect(p.rowTotals).toEqual([1, 101, 1, 1000]);
  });

  it('breaks total ties by label, (blank) last', () => {
    const p = computePivot(
      [{ r: 'b' }, { r: null }, { r: 'a' }],
      { rows: 'r', value: { column: null, agg: 'count' } },
    );
    expect(p.rowLabels).toEqual(['a', 'b', '(blank)']);
  });

  it('puts null totals last', () => {
    const p = computePivot(
      [{ r: 'a', v: 'x' }, { r: 'b', v: 1 }],
      { rows: 'r', value: { column: 'v', agg: 'sum' } },
    );
    expect(p.rowLabels).toEqual(['b', 'a']);
    expect(p.rowTotals).toEqual([1, null]);
  });

  it('truncates rows but keeps full counts and grand', () => {
    const rows = Array.from({ length: 60 }, (_, i) => ({ r: `r${String(i).padStart(2, '0')}`, v: i + 1 }));
    const p = computePivot(rows, { rows: 'r', value: { column: 'v', agg: 'sum' } });
    expect(p.rowLabels).toHaveLength(PIVOT_MAX_ROWS);
    expect(p.cells).toHaveLength(PIVOT_MAX_ROWS);
    expect(p.rowCount).toBe(60);
    expect(p.rowLabels[0]).toBe('r59');
    expect(p.grand).toBe((60 * 61) / 2);
  });

  it('truncates columns at the cap', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ r: 'a', c: `c${String(i).padStart(2, '0')}`, v: 1 }));
    const p = computePivot(rows, { rows: 'r', cols: 'c', value: { column: 'v', agg: 'sum' } });
    expect(p.colLabels).toHaveLength(PIVOT_MAX_COLS);
    expect(p.cells[0]).toHaveLength(PIVOT_MAX_COLS);
    expect(p.colTotals).toHaveLength(PIVOT_MAX_COLS);
    expect(p.colCount).toBe(20);
    expect(p.grand).toBe(20);
  });

  it("handles '__proto__' and 'constructor' labels", () => {
    const rows = [
      { r: '__proto__', c: 'constructor', v: 2 }, { r: 'constructor', c: '__proto__', v: 3 },
      { r: '__proto__', c: '__proto__', v: 4 },
    ];
    const p = computePivot(rows, { rows: 'r', cols: 'c', value: { column: 'v', agg: 'sum' } });
    expect(p.rowLabels).toEqual(['__proto__', 'constructor']);
    expect(p.colLabels).toEqual(['__proto__', 'constructor']);
    expect(p.cells).toEqual([[4, 2], [3, null]]);
  });

  it('returns empty arrays and a null grand for empty data', () => {
    const p = computePivot([], { rows: 'r', cols: 'c', value: sum });
    expect(p).toEqual({ rowLabels: [], colLabels: [], cells: [], rowTotals: [], colTotals: [], grand: null, rowCount: 0, colCount: 0 });
  });

  it('counts rows per combination when value.column is null', () => {
    const p = computePivot(DATA, { rows: 'Region', cols: 'Q', value: { column: null, agg: 'count' } });
    expect(p.rowLabels).toEqual(['North', 'East', 'South']); // 3, 1, 1: ties by label
    expect(p.cells).toEqual([[2, 1], [null, 1], [1, null]]);
    expect(p.colTotals).toEqual([3, 2]);
    expect(p.grand).toBe(5);
  });

  it('does not mutate the input', () => {
    const rows = DATA.map(r => ({ ...r }));
    const copy = JSON.parse(JSON.stringify(rows));
    computePivot(rows, { rows: 'Region', cols: 'Q', value: sum });
    expect(rows).toEqual(copy);
  });

  it('pivots 100k rows quickly', () => {
    const rows = Array.from({ length: 100_000 }, (_, i) => ({ r: `r${i % 20}`, c: `c${i % 12}`, v: i }));
    const t0 = performance.now();
    const p = computePivot(rows, { rows: 'r', cols: 'c', value: { column: 'v', agg: 'sum' } });
    expect(performance.now() - t0).toBeLessThan(500);
    expect(p.rowCount).toBe(20);
    expect(p.colCount).toBe(12);
  });
});
