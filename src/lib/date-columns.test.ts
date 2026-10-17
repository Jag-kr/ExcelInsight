import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { analyzeColumns, readFirstSheet } from './data-analyzer';
import { hasDateHint, normalizeDateColumns } from './date-columns';

/** A real .xlsx file as bytes, built the way Excel would store it. */
function xlsxBytes(rows: unknown[][], date1904 = false) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  if (date1904) wb.Workbook = { WBProps: { date1904: true } };
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
}
const xlsx = (rows: unknown[][], date1904 = false) => readFirstSheet(XLSX, xlsxBytes(rows, date1904), false);
const csv = (text: string) => readFirstSheet(XLSX, new TextEncoder().encode(text), true);

describe('hasDateHint', () => {
  it('matches date-like headers', () => {
    for (const h of ['Date', 'DATE (UTC)', 'OrderDate', 'ship_date', 'orderdate', 'Created At', 'updated', 'DateTime',
      'Timestamp', 'Date of Birth', 'DOB', 'Shipped', 'Due', 'Delivered On', 'UTCDate']) {
      expect(hasDateHint(h), h).toBe(true);
    }
  });
  it('rejects quantities and ambiguous short tokens', () => {
    for (const h of ['Quantity', 'Amount', 'UnitPrice', 'Candidate Score', 'Candidate', 'Day', 'dt', 'Units Shipped',
      'Amount Due', 'Run Time Total', 'Data', 'OrderID', 'Col7']) {
      expect(hasDateHint(h), h).toBe(false);
    }
  });
});

describe('serial / yyyymmdd number columns', () => {
  const serials = [45386, 45390, 45391.5, 45400];

  it('converts a General-format serial column named Date, not the same numbers named Quantity', () => {
    const { rows, notes } = xlsx([['Date', 'Quantity'], ...serials.map(n => [n, n])]);
    expect(rows.map(r => r.Date)).toEqual(['2024-04-04', '2024-04-08', '2024-04-09 12:00', '2024-04-18']);
    expect(rows.map(r => r.Quantity)).toEqual(serials);
    expect(notes).toEqual([{ kind: 'serial', columns: ['Date'] }]);
    const types = analyzeColumns(rows);
    expect(types.find(c => c.name === 'Date')?.type).toBe('date');
    expect(types.find(c => c.name === 'Quantity')?.type).not.toBe('date');
  });

  it('matches SheetJS decoding of date-formatted serials, including times', () => {
    for (const n of [25569, 45386, 45386.5, 45386.75, 45386.999, 80000, 20000.25]) {
      const p = XLSX.SSF.parse_date_code(n);
      const pad = (x: number) => String(x).padStart(2, '0');
      const want = `${p.y}-${pad(p.m)}-${pad(p.d)}${p.H || p.M ? ` ${pad(p.H)}:${pad(p.M)}` : ''}`;
      const row: Record<string, unknown> = { Date: n };
      normalizeDateColumns([row]);
      expect(row.Date, String(n)).toBe(want);
    }
  });

  it('still converts a hinted column with blanks and stray text', () => {
    const { rows } = xlsx([['OrderDate', 'x'], [45386, 1], [null, 2], [45390, 3], [null, 4], [45391, 5]]);
    expect(rows.map(r => r.OrderDate)).toEqual(['2024-04-04', undefined, '2024-04-08', undefined, '2024-04-09']);
    // Text in a minority of cells stays as it is.
    const mixed = Array.from({ length: 19 }, () => [45386]).concat([['n/a'] as never]);
    const r2 = xlsx([['Date'], ...mixed]).rows;
    expect(r2[0].Date).toBe('2024-04-04');
    expect(r2[19].Date).toBe('n/a');
  });

  it('leaves a hinted column alone when the numbers are outside the serial range or too few fit', () => {
    const small = xlsx([['Date'], [100], [2500], [5000]]);
    expect(small.rows.map(r => r.Date)).toEqual([100, 2500, 5000]);
    expect(small.notes).toEqual([]);
    const half = xlsx([['Date'], [45386], [45387], [100], [200]]);
    expect(half.rows.map(r => r.Date)).toEqual([45386, 45387, 100, 200]);
  });

  it('converts yyyymmdd only with a header hint', () => {
    const data = [[20250115], [20251231], [20240229]];
    expect(xlsx([['Date'], ...data]).rows.map(r => r.Date)).toEqual(['2025-01-15', '2025-12-31', '2024-02-29']);
    expect(xlsx([['Reference'], ...data]).rows.map(r => r.Reference)).toEqual([20250115, 20251231, 20240229]);
    // 20251341 is not a calendar date.
    expect(xlsx([['Date'], [20251341], [20251342]]).rows.map(r => r.Date)).toEqual([20251341, 20251342]);
  });

  it('uses the 1904 epoch when the workbook says so', () => {
    const { rows } = xlsx([['Date'], [43924], [43925.5]], true);
    // 1904 serial + 1462 = the 1900-system serial 45386 / 45387.5.
    expect(rows.map(r => r.Date)).toEqual(['2024-04-04', '2024-04-05 12:00']);
  });

  it('converts CSV numbers the same way', () => {
    const { rows, notes } = csv('Date,Qty\n45386,45386\n45390,45390\n20250115,3');
    // 20250115 fits as yyyymmdd, so all three convert.
    expect(rows.map(r => r.Date)).toEqual(['2024-04-04', '2024-04-08', '2025-01-15']);
    expect(rows.map(r => r.Qty)).toEqual([45386, 45390, 3]);
    expect(notes).toEqual([{ kind: 'serial', columns: ['Date'] }]);
  });

  it('leaves genuinely date-formatted Excel cells to the existing path, with no note', () => {
    const { rows, notes } = xlsx([['Date'], [new Date(2025, 0, 1)], [new Date(2025, 0, 31, 14, 30)]]);
    expect(rows.map(r => r.Date)).toEqual(['2025-01-01', '2025-01-31 14:30']);
    expect(notes).toEqual([]);
  });
});

describe('day-first text date columns', () => {
  it('rewrites a column proven day-first to ISO, keeping the time', () => {
    const { rows, notes } = csv('When,N\n13/01/2025,1\n03/04/2025 14:30,2\n3/4/25,3\n5.6.2025,4\nn/a,5\n2025-02-03,6');
    expect(rows.map(r => r.When)).toEqual(['2025-01-13', '2025-04-03 14:30', '2025-04-03', '2025-06-05', 'n/a', '2025-02-03']);
    expect(notes).toEqual([{ kind: 'dayFirst', columns: ['When'] }]);
    expect(analyzeColumns(rows).find(c => c.name === 'When')?.type).toBe('date');
  });

  it('leaves month-first, all-ambiguous and mixed columns untouched', () => {
    const month = ['01/13/2025', '03/04/2025', '12/25/2025'];
    const ambiguous = ['03/04/2025', '05/06/2025', '01/02/2025'];
    const mixed = ['13/01/2025', '01/13/2025', '03/04/2025'];
    const text = ['Month', 'Ambig', 'Mixed'].join(',') + '\n' + month.map((_, i) => [month[i], ambiguous[i], mixed[i]].join(',')).join('\n');
    const { rows, notes } = csv(text);
    expect(rows.map(r => r.Month)).toEqual(month);
    expect(rows.map(r => r.Ambig)).toEqual(ambiguous);
    expect(rows.map(r => r.Mixed)).toEqual(mixed);
    expect(notes).toEqual([]);
  });

  it('does not touch ordinary text columns', () => {
    const { rows } = csv('Name,Code\nCustomer 1,ORD-1000\nCustomer 2,ORD-1001');
    expect(rows).toEqual([{ Name: 'Customer 1', Code: 'ORD-1000' }, { Name: 'Customer 2', Code: 'ORD-1001' }]);
  });

  it('works on text cells in an .xlsx too', () => {
    const { rows, notes } = xlsx([['Shipped'], ['13/01/2025'], ['03/04/2025']]);
    expect(rows.map(r => r.Shipped)).toEqual(['2025-01-13', '2025-04-03']);
    expect(notes).toEqual([{ kind: 'dayFirst', columns: ['Shipped'] }]);
  });
});

describe('notes', () => {
  it('aggregates columns per kind and omits kinds that did not occur', () => {
    const { notes } = csv('Date,Created,Seen\n45386,45387,13/01/2025\n45390,45391,03/04/2025');
    expect(notes).toEqual([
      { kind: 'serial', columns: ['Date', 'Created'] },
      { kind: 'dayFirst', columns: ['Seen'] },
    ]);
    expect(csv('A,B\n1,2').notes).toEqual([]);
  });
});

describe('user-like 19-column CSV', () => {
  it('types Date as a date and the id/name/note text columns as anything but', () => {
    const head = 'Date,Region,Product,Quantity,UnitPrice,StoreLocation,CustomerType,Discount,Salesperson,TotalPrice,PaymentMethod,Promotion,Returned,OrderID,CustomerName,ShippingCost,Category,Rating,Notes';
    const lines = Array.from({ length: 300 }, (_, i) => [
      44927 + i, ['North', 'South', 'East'][i % 3], `Product ${i % 7}`, (i % 9) + 1, 10 + (i % 50) * 1.5,
      `Store ${i % 12}`, i % 2 ? 'New' : 'Returning', (i % 5) * 5, `Rep ${i % 8}`, 100 + i * 3.25,
      ['Card', 'Cash'][i % 2], i % 3 ? 'Yes' : 'No', i % 10 ? 'No' : 'Yes', `ORD-${1000 + i}`,
      `Customer ${1234 + i}`, 5 + (i % 6), `Cat ${i % 4}`, (i % 5) + 1, `note ${i % 40}`,
    ].join(','));
    const { rows, notes } = csv([head, ...lines].join('\n'));
    expect(notes).toEqual([{ kind: 'serial', columns: ['Date'] }]);
    expect(rows[0].Date).toBe('2023-01-01');
    const type = Object.fromEntries(analyzeColumns(rows).map(c => [c.name, c.type]));
    expect(type.Date).toBe('date');
    for (const c of ['OrderID', 'CustomerName', 'Notes']) expect(type[c], c).not.toBe('date');
    expect(type.Quantity).not.toBe('date');
    expect(type.TotalPrice).toBe('numeric');
  });
});

describe('performance', () => {
  it('handles 100k rows x 30 columns', () => {
    const rows = Array.from({ length: 100_000 }, (_, i) => {
      const r: Record<string, unknown> = { Date: 45000 + (i % 700), Placed: `${(i % 28) + 1}/${(i % 12) + 1}/2025` };
      for (let c = 0; c < 28; c++) r[`c${c}`] = c % 3 ? `Customer ${i}` : i * c;
      return r;
    });
    const t0 = performance.now();
    const notes = normalizeDateColumns(rows);
    const ms = performance.now() - t0;
    console.log(`normalizeDateColumns 100k x 30: ${ms.toFixed(0)} ms`);
    expect(notes.map(n => n.kind)).toEqual(['serial', 'dayFirst']);
    expect(ms).toBeLessThan(3000);
  });
});
