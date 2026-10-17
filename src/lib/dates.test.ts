import { describe, it, expect } from 'vitest';
import { parseDateStrict } from './dates';
import { analyzeColumns, bucketDate } from './data-analyzer';

type Parts = [number, number, number];

describe('parseDateStrict: accepts', () => {
  const accept: [string, Parts][] = [
    ['2025-01-15', [2025, 1, 15]],
    ['2025-1-5', [2025, 1, 5]],
    ['2025/01/15', [2025, 1, 15]],
    ['2025.01.15', [2025, 1, 15]],
    ['  2025-01-15  ', [2025, 1, 15]],
    ['2025-01-15T10:00:00Z', [2025, 1, 15]],
    ['2025-01-15T10:00:00.123Z', [2025, 1, 15]],
    ['2025-01-15 10:00:00', [2025, 1, 15]],
    ['2025-01-15 10:30', [2025, 1, 15]],
    // The calendar day is the one written: no timezone conversion.
    ['2025-01-15T23:30:00-05:00', [2025, 1, 15]],
    ['2025-01-15T00:30:00+05:30', [2025, 1, 15]],
    ['20250115', [2025, 1, 15]],
    ['15/01/2025', [2025, 1, 15]],
    ['1/15/2025', [2025, 1, 15]],
    ['15.01.2025', [2025, 1, 15]],
    ['15-01-2025', [2025, 1, 15]],
    ['1/15/2025 10:30', [2025, 1, 15]],
    ['31/12/99', [1999, 12, 31]], // 70-99 -> 1900s
    ['1/2/69', [2069, 1, 2]], // 00-69 -> 2000s
    ['1/2/70', [1970, 1, 2]],
    ['29/02/2024', [2024, 2, 29]],
    ['03/04/2025', [2025, 3, 4]], // ambiguous: month-first by default
    ['Jan 15, 2025', [2025, 1, 15]],
    ['January 15 2025', [2025, 1, 15]],
    ['jan. 15, 2025', [2025, 1, 15]],
    ['SEPT 3 2025', [2025, 9, 3]],
    ['15 Jan 2025', [2025, 1, 15]],
    ['15 January 2025', [2025, 1, 15]],
    ['15-Jan-25', [2025, 1, 15]],
    ['Mon, 15 Jan 2025', [2025, 1, 15]],
    ['Monday 15 January 2025', [2025, 1, 15]],
    ['Jan 15, 2025 10:30', [2025, 1, 15]],
    ['15 Jan 2025 10:30 PM', [2025, 1, 15]],
    ['Jan 2025', [2025, 1, 1]],
    ['January 2025', [2025, 1, 1]],
  ];
  it.each(accept)('%s', (s, expected) => expect(parseDateStrict(s)).toEqual(expected));

  it('a real Date gives local calendar parts', () => {
    expect(parseDateStrict(new Date(2025, 0, 15, 23, 30))).toEqual([2025, 1, 15]);
  });

  it('order only decides ambiguous values; unambiguous ones win', () => {
    expect(parseDateStrict('03/04/2025', 'dmy')).toEqual([2025, 4, 3]);
    expect(parseDateStrict('03/04/2025', 'mdy')).toEqual([2025, 3, 4]);
    expect(parseDateStrict('15/01/2025', 'mdy')).toEqual([2025, 1, 15]);
    expect(parseDateStrict('01/15/2025', 'dmy')).toEqual([2025, 1, 15]);
    // ISO is never reordered.
    expect(parseDateStrict('2025-03-04', 'dmy')).toEqual([2025, 3, 4]);
  });
});

describe('parseDateStrict: rejects', () => {
  const reject: unknown[] = [
    // free text V8's Date parser accepts
    'ORD-1000', 'Customer 1234', 'note 5', 'Mon 5', 'Q1 2025', 'abc 12/05/2024', 'Item 12/05/2024',
    'Order 2025-01-15', '2025-01-15 shipped', 'Mon Jan', 'Foo 2025', 'Marchh 15 2025',
    // impossible calendar days / years
    '2025-02-30', '31/04/2025', '29/02/2023', '2025-13-01', '2025-00-10', '2025-01-00', '32/01/2025',
    '13/13/2025', '1011-01-05', '0001-01-01', '2500-01-01', '19990230', '18991231', '21010101', '20251301',
    // bad times
    '2025-01-15 25:00', '2025-01-15 10:61',
    // plain numbers and number-like strings
    '12345', '45386', '1e3', '2025', '123456', '1.5', '-5', '1234567890',
    // junk
    '', '   ', '2025-01', '1/2', 'N/A', 'null', '-', 'T', 'Z',
    '2025-01-15-', '2025-01/15', '1/2.2025', 'x'.repeat(100), `2025-01-15${' '.repeat(80)}`,
    // non-strings
    45386, 0, 1735689600000, NaN, null, undefined, true, {}, [], new Date('nope'),
  ];
  it.each(reject.map((v, i) => [i, v] as const))('#%i %o', (_i, v) => {
    expect(parseDateStrict(v)).toBeNull();
  });
});

describe('timezone independence', () => {
  // Strings never touch Date, so the same table must hold under any TZ.
  // `TZ=America/New_York bun run test` and `TZ=Asia/Kolkata bun run test` run it for real.
  it('ISO strings with offsets and bucketDate keep the written day', () => {
    expect(parseDateStrict('2025-01-15T23:30:00-05:00')).toEqual([2025, 1, 15]);
    expect(parseDateStrict('2025-01-15T00:00:00Z')).toEqual([2025, 1, 15]);
    expect(bucketDate('2025-01-15T00:00:00Z', 'day')).toBe('2025-01-15');
    expect(bucketDate('Jan 1, 2025', 'month')).toBe('2025-01');
    expect(bucketDate('20250101', 'year')).toBe('2025');
  });
});

describe('bucketDate no longer treats text or numbers as dates', () => {
  it('returns null', () => {
    expect(bucketDate('ORD-1000', 'month')).toBeNull();
    expect(bucketDate('Customer 1234', 'month')).toBeNull();
    expect(bucketDate(45386, 'month')).toBeNull();
  });
});

describe('column typing through analyzeColumns', () => {
  const typeOf = (name: string, values: unknown[]) =>
    analyzeColumns(values.map(v => ({ [name]: v }))).find(c => c.name === name)?.type;

  const n = 60;
  it.each([
    ['OrderID', (i: number) => `ORD-${1000 + i}`],
    ['CustomerName', (i: number) => `Customer ${1000 + i}`],
    ['Notes', (i: number) => `note ${i}`],
  ])('%s-style text is not a date', (name, make) => {
    const type = typeOf(name, Array.from({ length: n }, (_, i) => make(i)));
    expect(type).not.toBe('date');
    expect(['categorical', 'text', 'id']).toContain(type);
  });

  it('ISO dates are a date column', () => {
    const vals = Array.from({ length: n }, (_, i) => `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`);
    expect(typeOf('When', vals)).toBe('date');
  });

  it('"Jan 15, 2025" strings are a date column', () => {
    const vals = Array.from({ length: n }, (_, i) => `Jan ${(i % 28) + 1}, ${2020 + (i % 5)}`);
    expect(typeOf('When', vals)).toBe('date');
  });

  it('50% dates and 50% junk is not a date', () => {
    const vals = Array.from({ length: n }, (_, i) => (i % 2 ? `2025-01-${String((i % 28) + 1).padStart(2, '0')}` : `junk value ${i}`));
    expect(typeOf('Mixed', vals)).not.toBe('date');
  });
});

describe('performance', () => {
  it('parses 100k mixed strings well under a second', () => {
    const samples = [
      '2025-01-15', '2025-01-15T10:00:00Z', '15/01/2025', 'Jan 15, 2025', '15-Jan-25', 'Mon, 15 Jan 2025',
      'ORD-1000', 'Customer 1234', 'note 5', 'Q1 2025', '12345', 'Some longer free text value here', '20250115',
    ];
    const start = performance.now();
    let hits = 0;
    for (let i = 0; i < 100_000; i++) if (parseDateStrict(samples[i % samples.length])) hits++;
    const ms = performance.now() - start;
    expect(hits).toBeGreaterThan(40_000);
    // Typically ~30-60 ms on a dev machine; the bound is loose for slow CI.
    expect(ms).toBeLessThan(1000);
  });
});
