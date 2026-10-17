import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { addCalculatedColumn, analyzeColumns, readFirstSheet } from './data-analyzer';

/** A real .xlsx file as bytes, built the way Excel would store it. */
function xlsxBytes(rows: unknown[][]) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
}

describe('readFirstSheet', () => {
  it('turns Excel date serials into ISO dates the analyser recognises', () => {
    const { rows } = readFirstSheet(XLSX, xlsxBytes([
      ['Ordered', 'Amount'],
      [new Date(2025, 0, 1), 10],
      [new Date(2025, 0, 31, 14, 30), 20],
      [new Date(2025, 11, 31), 30],
    ]), false);
    expect(rows.map(r => r.Ordered)).toEqual(['2025-01-01', '2025-01-31 14:30', '2025-12-31']);
    expect(rows.map(r => r.Amount)).toEqual([10, 20, 30]);
    expect(analyzeColumns(rows).find(c => c.name === 'Ordered')?.type).toBe('date');
  });

  it('keeps CSV dates as written, untouched by the local timezone', () => {
    const csv = new TextEncoder().encode('Ordered,Amount,Share\n2025-01-15,3,50%\n1/31/2025,4.5,25%');
    const { rows } = readFirstSheet(XLSX, csv, true);
    expect(rows.map(r => r.Ordered)).toEqual(['2025-01-15', '1/31/2025']);
    // Non-date cells keep SheetJS's typed parsing.
    expect(rows.map(r => r.Amount)).toEqual([3, 4.5]);
    expect(rows.map(r => r.Share)).toEqual([0.5, 0.25]);
  });
});

describe('addCalculatedColumn', () => {
  const rows: Record<string, unknown>[] = [{ Sales: 10, Qty: 2 }, { Sales: 5, Qty: 0 }, { Sales: null, Qty: 1 }];
  const cols = ['Sales', 'Qty'];
  const add = (name: string, f: string, d = rows, c = cols) => addCalculatedColumn(d, c, name, f);

  it('adds the column, keeps the others, and nulls blank/zero-division rows', () => {
    const r = add('Unit', '[Sales] / [Qty]');
    expect(r).toEqual({ ok: true, data: [
      { Sales: 10, Qty: 2, Unit: 5 },
      { Sales: 5, Qty: 0, Unit: null },
      { Sales: null, Qty: 1, Unit: null },
    ] });
  });

  it('does not mutate the input rows', () => {
    const before = JSON.stringify(rows);
    add('X', '[Sales] + 1');
    expect(JSON.stringify(rows)).toBe(before);
  });

  it('rejects empty, bracketed, too long and colliding names (case-insensitive)', () => {
    for (const n of ['  ', 'a[b', 'a]b', '__proto__', 'x'.repeat(81), 'sales', 'Sales']) {
      expect(add(n, '1')).toMatchObject({ ok: false });
    }
  });

  it('reports compile errors with a 1-based position', () => {
    const r = add('X', '[Sales] + [Nope]');
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toMatch(/\(at character \d+\)$/);
  });

  it('lets a formula reference an earlier calculated column', () => {
    const a = add('Total', '[Sales] * [Qty]');
    if (!('data' in a)) throw new Error('first add failed');
    const b = add('Double', '[Total] * 2', a.data, [...cols, 'Total']);
    expect(b).toMatchObject({ ok: true });
    expect((b as { data: Record<string, unknown>[] }).data[0].Double).toBe(40);
  });
});
