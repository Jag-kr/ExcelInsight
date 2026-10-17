import { describe, expect, it } from 'vitest';
import { canonSig, decideSync, normalizeSpec } from './canon';
import { chartTypeOptions } from './chart-themes';
import type { ChartSpec } from './derive-dashboard-item';

describe('canonSig', () => {
  it('ignores key order', () => expect(canonSig({ a: 1, b: 2 })).toBe(canonSig({ b: 2, a: 1 })));
  it('drops undefined', () => {
    expect(canonSig({ a: 1, b: undefined })).toBe(canonSig({ a: 1 }));
    expect(canonSig({ b: undefined, a: 1 })).toBe(canonSig({ a: 1 }));
  });
  it('sorts nested objects, including inside arrays', () =>
    expect(canonSig([{ y: { b: 1, a: undefined, c: 2 }, x: 1 }])).toBe('[{"x":1,"y":{"b":1,"c":2}}]'));
  it('keeps array order', () => expect(canonSig([1, 2])).not.toBe(canonSig([2, 1])));
  it('tells different values apart', () => expect(canonSig({ a: 1 })).not.toBe(canonSig({ a: 2 })));
});

describe('normalizeSpec', () => {
  const base: ChartSpec = { v: 2, dimension: 'd', measures: [{ column: null, agg: 'count' }] };
  it('drops what the builder cannot express', () => {
    const s = { ...base, grain: 'month' as const, series: 's', stacked: true, limit: 5.7 };
    expect(normalizeSpec(s, 'line', false)).toEqual({ ...base, series: 's', limit: 5 });
    expect(normalizeSpec(s, 'combo', false).series).toBeUndefined();
    expect(normalizeSpec({ ...s, measures: [...base.measures, ...base.measures] }, 'bar', true).series).toBeUndefined();
  });
  it('keeps grain on dates and stacked on stackable types', () =>
    expect(normalizeSpec({ ...base, grain: 'month', stacked: true }, 'bar', true)).toEqual({ ...base, grain: 'month', stacked: true }));
  it('combo is offered but never stacked', () => {
    expect(chartTypeOptions.map(o => o.value)).toContain('combo');
    expect(normalizeSpec({ ...base, stacked: true }, 'combo', false).stacked).toBeUndefined();
  });
  it('is idempotent', () => {
    const once = normalizeSpec({ ...base, stacked: true, limit: 3 }, 'pie', false);
    expect(canonSig(normalizeSpec(once, 'pie', false))).toBe(canonSig(once));
  });
});

describe('decideSync', () => {
  const o = { parentChanged: false, current: 'a', fromParent: 'b', canEmit: true };
  it('never acts when the parent already has the value', () => {
    expect(decideSync({ ...o, current: 'a', fromParent: 'a' })).toBe('none');
    expect(decideSync({ ...o, current: 'a', fromParent: 'a', parentChanged: true })).toBe('none');
  });
  it('emits a local edit', () => expect(decideSync(o)).toBe('emit'));
  it('does not emit without a dimension or rows', () => expect(decideSync({ ...o, canEmit: false })).toBe('none'));
  it('hydrates, never emits, when the parent moved', () => expect(decideSync({ ...o, parentChanged: true })).toBe('hydrate'));
});
