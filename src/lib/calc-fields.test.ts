import { describe, it, expect } from 'vitest';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { Filter } from './filters';
import { applyCalcFields, dependentsOf, removeFieldFromItems, validateEditedField, validateNewField, type CalcField } from './calc-fields';

const rows: Record<string, unknown>[] = [{ Sales: 10, Qty: 2 }, { Sales: 5, Qty: 0 }, { Sales: null, Qty: 1 }];
const base = ['Sales', 'Qty'];
const unit: CalcField = { name: 'Unit', formula: '[Sales] / [Qty]' };
const dbl: CalcField = { name: 'Double', formula: '[Unit] * 2' };
const quad: CalcField = { name: 'Quad', formula: '[Double] * 2' };

describe('applyCalcFields', () => {
  it('returns the same array when there are no fields', () => {
    expect(applyCalcFields(rows, [])).toBe(rows);
  });

  it('adds a column, keeps the others, and nulls blank/zero-division rows', () => {
    expect(applyCalcFields(rows, [unit])).toEqual([
      { Sales: 10, Qty: 2, Unit: 5 },
      { Sales: 5, Qty: 0, Unit: null },
      { Sales: null, Qty: 1, Unit: null },
    ]);
  });

  it('lets a field use an earlier one, and only in order', () => {
    expect(applyCalcFields(rows, [unit, dbl])[0].Double).toBe(10);
    // Reversed: Double cannot see Unit yet, so it is a null column (and Unit still works).
    const rev = applyCalcFields(rows, [dbl, unit]);
    expect(rev[0]).toEqual({ Sales: 10, Qty: 2, Double: null, Unit: 5 });
  });

  it('gives a null column, never throws, when a source column is missing', () => {
    const out = applyCalcFields([{ A: 1 }], [{ name: 'X', formula: '[Gone] + 1' }]);
    expect(out).toEqual([{ A: 1, X: null }]);
  });

  it('does not mutate rows or fields', () => {
    const r = JSON.stringify(rows);
    const f = JSON.stringify([unit, dbl]);
    applyCalcFields(rows, [unit, dbl]);
    expect(JSON.stringify(rows)).toBe(r);
    expect(JSON.stringify([unit, dbl])).toBe(f);
  });
});

describe('validateNewField', () => {
  it('accepts a good field, including one built on an earlier field', () => {
    expect(validateNewField(base, [], 'Unit', unit.formula)).toBeNull();
    expect(validateNewField(base, [unit], 'Double', dbl.formula)).toBeNull();
  });

  it('rejects empty, bracketed, too long and colliding names (case-insensitive, incl. earlier fields)', () => {
    for (const n of ['  ', 'a[b', 'a]b', '__proto__', 'x'.repeat(81), 'sales', 'Sales', 'unit', 'UNIT']) {
      expect(validateNewField(base, [unit], n, '1')).not.toBeNull();
    }
  });

  it('reports compile errors with a 1-based position', () => {
    expect(validateNewField(base, [], 'X', '[Sales] + [Nope]')).toMatch(/\(at character \d+\)$/);
    expect(validateNewField(base, [], 'X', '[Unit] + 1')).not.toBeNull(); // Unit does not exist yet
  });
});

describe('validateEditedField', () => {
  const fields = [unit, dbl, quad];

  it('may use base columns and earlier fields', () => {
    expect(validateEditedField(base, fields, 'Double', '[Unit] + [Sales]')).toBeNull();
  });

  it('may not use itself or later fields', () => {
    expect(validateEditedField(base, fields, 'Double', '[Double] + 1')).toMatch(/at character/);
    expect(validateEditedField(base, fields, 'Double', '[Quad] + 1')).toMatch(/at character/);
  });

  it('rejects an unknown field and bad formulas', () => {
    expect(validateEditedField(base, fields, 'Nope', '1')).toBe('Unknown field');
    expect(validateEditedField(base, fields, 'Unit', '')).not.toBeNull();
  });
});

describe('dependentsOf', () => {
  it('reports direct and indirect dependents, in order', () => {
    expect(dependentsOf(base, [unit, dbl, quad], 'Unit')).toEqual(['Double', 'Quad']);
    expect(dependentsOf(base, [unit, dbl, quad], 'Double')).toEqual(['Quad']);
  });

  it('ignores unrelated fields, the last field and unknown names', () => {
    const other = { name: 'Other', formula: '[Sales] + 1' };
    expect(dependentsOf(base, [unit, other, dbl], 'Unit')).toEqual(['Double']);
    expect(dependentsOf(base, [unit, dbl, quad], 'Quad')).toEqual([]);
    expect(dependentsOf(base, [unit], 'Nope')).toEqual([]);
  });
});

describe('removeFieldFromItems', () => {
  const card = (id: string, extra: Partial<DashboardItem> = {}) => ({ id, type: 'bar', title: id, ...extra }) as DashboardItem;
  const f: Filter = { kind: 'in', values: ['a'] };

  it('drops the slicer of the field but keeps other slicers', () => {
    const items = [card('s1', { displayAs: 'slicer', slicerColumn: 'Unit' }), card('s2', { displayAs: 'slicer', slicerColumn: 'Sales' })];
    expect(removeFieldFromItems(items, 'Unit').map(i => i.id)).toEqual(['s2']);
  });

  it('strips the field from item filters, deleting the key when empty', () => {
    const items = [
      card('a', { filters: { Unit: f } }),
      card('b', { filters: { Unit: f, Sales: f } }),
    ];
    const out = removeFieldFromItems(items, 'Unit');
    expect('filters' in out[0]).toBe(false);
    expect(out[1].filters).toEqual({ Sales: f });
  });

  it('returns the same array when nothing references the field', () => {
    const items = [card('a', { filters: { Sales: f } }), card('b'), card('s', { displayAs: 'slicer', slicerColumn: 'Sales' })];
    expect(removeFieldFromItems(items, 'Unit')).toBe(items);
  });

  it('does not mutate its input', () => {
    const items = [card('a', { filters: { Unit: f } }), card('s', { displayAs: 'slicer', slicerColumn: 'Unit' })];
    const snapshot = JSON.parse(JSON.stringify(items));
    removeFieldFromItems(items, 'Unit');
    expect(items).toEqual(snapshot);
  });
});
