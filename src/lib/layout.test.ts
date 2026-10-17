import { describe, it, expect } from 'vitest';
import {
  GridPos, CardSize, widthForSize, sizeFromWidth, defaultHeight, minSize,
  presetLayout, sortByLayout, placeAtBottom, layoutChanged,
} from './layout';

const kpi = (id: string) => ({ id, displayAs: 'kpi' });
const chart = (id: string) => ({ id, displayAs: 'chart' });

describe('size <-> width', () => {
  it('round-trips every legacy size', () => {
    for (const s of ['xs', 'sm', 'md', 'lg'] as CardSize[]) expect(sizeFromWidth(widthForSize(s))).toBe(s);
    expect(['xs', 'sm', 'md', 'lg'].map((s) => widthForSize(s as CardSize))).toEqual([3, 4, 6, 12]);
  });
  it('maps free widths to the nearest legacy size', () => {
    expect([1, 3, 4, 5, 6, 7, 12].map(sizeFromWidth)).toEqual(['xs', 'xs', 'sm', 'md', 'md', 'lg', 'lg']);
  });
  it('picks default heights', () => {
    expect(['kpi', 'slicer', 'text', 'chart', 'table', undefined].map(defaultHeight)).toEqual([2, 3, 2, 6, 6, 6]);
  });
  it('lets notes and tiles shrink further than charts', () => {
    expect(minSize('text')).toEqual({ minW: 2, minH: 1 });
    expect(minSize('kpi')).toEqual(minSize('slicer'));
    expect(minSize('chart')).toEqual({ minW: 3, minH: 3 });
  });
});

describe('presetLayout', () => {
  it('packs a legacy mixed dashboard into rows', () => {
    const l = presetLayout([kpi('k1'), kpi('k2'), kpi('k3'), kpi('k4'), chart('c1'), chart('c2'), { id: 't', displayAs: 'table', size: 'lg' }]);
    expect(l).toEqual({
      k1: { x: 0, y: 0, w: 3, h: 2 }, k2: { x: 3, y: 0, w: 3, h: 2 },
      k3: { x: 6, y: 0, w: 3, h: 2 }, k4: { x: 9, y: 0, w: 3, h: 2 },
      c1: { x: 0, y: 2, w: 6, h: 6 }, c2: { x: 6, y: 2, w: 6, h: 6 },
      t: { x: 0, y: 8, w: 12, h: 6 },
    });
  });

  it('wraps when the next card does not fit; row height is the tallest card', () => {
    const l = presetLayout([kpi('k'), chart('a'), { id: 'b', size: 'sm' }, { id: 's', displayAs: 'slicer' }]);
    // k(3)+a(6)=9, b(4) would reach 13 -> wrap to y=6 (row height 6); b(4)+s(4)=8 fits.
    expect(l).toEqual({
      k: { x: 0, y: 0, w: 3, h: 2 }, a: { x: 3, y: 0, w: 6, h: 6 },
      b: { x: 0, y: 6, w: 4, h: 6 }, s: { x: 4, y: 6, w: 4, h: 3 },
    });
  });

  it('places new items below the lowest existing edge and keeps existing layouts', () => {
    const l = presetLayout([
      { id: 'a', layout: { x: 6, y: 1, w: 6, h: 4 } },
      { id: 'n1', displayAs: 'chart' },
      { id: 'b', layout: { x: 0, y: 0, w: 3, h: 2 } },
      kpi('n2'),
    ]);
    expect(l.a).toEqual({ x: 6, y: 1, w: 6, h: 4 });
    expect(l.b).toEqual({ x: 0, y: 0, w: 3, h: 2 });
    expect(l.n1).toEqual({ x: 0, y: 5, w: 6, h: 6 });
    expect(l.n2).toEqual({ x: 6, y: 5, w: 3, h: 2 });
  });

  it('repairs out-of-range layouts and ignores invalid ones', () => {
    const l = presetLayout([
      { id: 'a', layout: { x: 10.4, y: -3, w: 6.6, h: 0 } },
      { id: 'b', layout: { x: 0, y: 0, w: 99, h: 2 } },
      { id: 'c', layout: { x: NaN, y: 0, w: 3, h: 2 } },
    ]);
    expect(l.a).toEqual({ x: 5, y: 0, w: 7, h: 1 });
    expect(l.b).toEqual({ x: 0, y: 0, w: 12, h: 2 });
    expect(l.c).toEqual({ x: 0, y: 2, w: 6, h: 6 }); // treated as missing, below repaired edge
  });

  it('returns {} for no items and does not mutate its input', () => {
    expect(presetLayout([])).toEqual({});
    const items = Object.freeze([Object.freeze({ id: 'a', layout: Object.freeze({ x: 0, y: 0, w: 3, h: 2 }) }), Object.freeze(kpi('b'))]);
    expect(() => presetLayout(items as never)).not.toThrow();
    expect(presetLayout(items as never)).toEqual(presetLayout(items as never));
  });
});

describe('sortByLayout', () => {
  const layouts: Record<string, GridPos> = {
    a: { x: 6, y: 0, w: 3, h: 2 }, b: { x: 0, y: 0, w: 3, h: 2 },
    c: { x: 0, y: 2, w: 3, h: 2 }, d: { x: 0, y: 2, w: 3, h: 2 },
  };
  it('sorts by y then x, stably', () => {
    const items = [{ id: 'd' }, { id: 'c' }, { id: 'a' }, { id: 'b' }];
    expect(sortByLayout(items, layouts).map((i) => i.id)).toEqual(['b', 'a', 'd', 'c']);
  });
  it('puts missing ids last in original order and returns a new array', () => {
    const items = Object.freeze([{ id: 'z' }, { id: 'c' }, { id: 'y' }, { id: 'b' }]);
    const out = sortByLayout(items as { id: string }[], layouts);
    expect(out.map((i) => i.id)).toEqual(['b', 'c', 'z', 'y']);
    expect(out).not.toBe(items);
    expect(items.map((i) => i.id)).toEqual(['z', 'c', 'y', 'b']);
  });
});

describe('placeAtBottom', () => {
  it('starts at the origin on an empty layout and clamps width', () => {
    expect(placeAtBottom({}, 6, 4)).toEqual({ x: 0, y: 0, w: 6, h: 4 });
    expect(placeAtBottom({}, 20, 4).w).toBe(12);
    expect(placeAtBottom({}, 0, 4).w).toBe(1);
  });
  it('goes below the lowest edge', () => {
    const l = { a: { x: 0, y: 0, w: 3, h: 2 }, b: { x: 3, y: 1, w: 3, h: 6 } };
    expect(placeAtBottom(l, 3, 2)).toEqual({ x: 0, y: 7, w: 3, h: 2 });
  });
});

describe('layoutChanged', () => {
  const base: Record<string, GridPos> = { a: { x: 0, y: 0, w: 3, h: 2 }, b: { x: 3, y: 0, w: 3, h: 2 } };
  it('is false for equal layouts', () => {
    expect(layoutChanged(base, { a: { ...base.a }, b: { ...base.b } })).toBe(false);
  });
  it('detects moved and resized cards', () => {
    expect(layoutChanged(base, { ...base, a: { ...base.a, x: 1 } })).toBe(true);
    expect(layoutChanged(base, { ...base, b: { ...base.b, h: 3 } })).toBe(true);
  });
  it('detects key set differences in either direction', () => {
    expect(layoutChanged(base, { a: base.a })).toBe(true);
    expect(layoutChanged({ a: base.a }, base)).toBe(true);
    expect(layoutChanged(base, { a: base.a, c: base.b })).toBe(true);
  });
});
