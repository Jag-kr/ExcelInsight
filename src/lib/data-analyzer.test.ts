import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { analyzeColumns, readFirstSheet } from './data-analyzer';

/** A real .xlsx file as bytes, built the way Excel would store it. */
function xlsxBytes(rows: any[][]) {
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
