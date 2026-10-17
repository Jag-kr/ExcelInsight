import { describe, it, expect } from 'vitest';
import { grainAt, canDrill, drillRows, drillLabel } from './drill';

describe('drill chain', () => {
  it('year -> quarter -> month -> day, then ends', () => {
    expect([0, 1, 2, 3, 4].map(n => grainAt('year', n))).toEqual(['year', 'quarter', 'month', 'day', null]);
    expect([0, 1, 2, 3].map(n => grainAt('quarter', n))).toEqual(['quarter', 'month', 'day', null]);
    expect([0, 1, 2].map(n => grainAt('month', n))).toEqual(['month', 'day', null]);
  });

  it('week and day have no children', () => {
    expect(grainAt('week', 0)).toBe('week');
    expect(grainAt('week', 1)).toBeNull();
    expect(grainAt('day', 1)).toBeNull();
    expect(canDrill('week', [])).toBe(false);
    expect(canDrill('day', [])).toBe(false);
  });

  it('canDrill is true until the finest grain is showing', () => {
    expect([[], ['2025'], ['2025', '2025-Q1'], ['2025', '2025-Q1', '2025-01']].map(p => canDrill('year', p))).toEqual([true, true, true, false]);
    expect(canDrill('month', [])).toBe(true);
    expect(canDrill('month', ['2025-01'])).toBe(false);
  });
});

describe('drillRows', () => {
  // Dec/Jan boundary: Dec 2024 is Q4 2024, Jan 2025 is Q1 2025.
  const rows = [
    { D: '2024-12-31', v: 1 },
    { D: '2025-01-01', v: 2 },
    { D: '2025-01-15', v: 3 },
    { D: '2025-02-10', v: 4 },
    { D: '2025-05-05', v: 5 },
    { D: '', v: 6 },
    { D: 'not a date', v: 7 },
  ];
  const vs = (r: typeof rows) => r.map(x => x.v);

  it('path [] returns the same array', () => {
    expect(drillRows(rows, 'D', 'year', [])).toBe(rows);
  });

  it('one level keeps the clicked bucket and drops blank or unparseable dates', () => {
    expect(vs(drillRows(rows, 'D', 'year', ['2025']))).toEqual([2, 3, 4, 5]);
    expect(vs(drillRows(rows, 'D', 'year', ['2024']))).toEqual([1]);
  });

  it('two levels narrow to the quarter, then the month', () => {
    expect(vs(drillRows(rows, 'D', 'year', ['2025', '2025-Q1']))).toEqual([2, 3, 4]);
    expect(vs(drillRows(rows, 'D', 'year', ['2024', '2024-Q4']))).toEqual([1]);
    expect(vs(drillRows(rows, 'D', 'year', ['2025', '2025-Q1', '2025-01']))).toEqual([2, 3]);
    expect(vs(drillRows(rows, 'D', 'quarter', ['2025-Q1', '2025-02']))).toEqual([4]);
    expect(vs(drillRows(rows, 'D', 'month', ['2025-01']))).toEqual([2, 3]);
  });

  it('a path longer than the chain matches nothing', () => {
    expect(drillRows(rows, 'D', 'month', ['2025-01', '2025-01-01', 'x'])).toEqual([]);
  });
});

describe('drillLabel', () => {
  it('joins the path', () => {
    expect(drillLabel(['2025'])).toBe('2025');
    expect(drillLabel(['2025', '2025-Q2'])).toBe('2025 › 2025-Q2');
  });
});
