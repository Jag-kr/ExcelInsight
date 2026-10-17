import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileFormula, previewFormula } from './formula';

type Row = Record<string, unknown>;

/** Evaluate `src`; columns default to the row's keys. Throws if it does not compile. */
function run(src: string, row: Row = {}, cols: string[] = Object.keys(row)): number | null {
  const c = compileFormula(src, cols);
  if (!('evaluate' in c)) throw new Error(`"${src}" failed: ${c.error.message}`);
  return c.evaluate(row);
}

function err(src: string, cols: string[] = []) {
  const c = compileFormula(src, cols);
  if ('evaluate' in c) throw new Error(`"${src}" should not compile`);
  return c.error;
}

describe('arithmetic and precedence', () => {
  it('literals', () => {
    expect(run('12')).toBe(12);
    expect(run('3.5')).toBe(3.5);
    expect(run('.5')).toBe(0.5);
    expect(run('1e3')).toBe(1000);
    expect(run('2.5E-1')).toBe(0.25);
  });

  it('operators and precedence', () => {
    expect(run('2+3*4')).toBe(14);
    expect(run('(2+3)*4')).toBe(20);
    expect(run('10-4-3')).toBe(3); // left-assoc
    expect(run('100/10/2')).toBe(5);
    expect(run('10 % 4')).toBe(2);
    expect(run('2*3 % 4')).toBe(2);
    expect(run('1+2 > 2')).toBe(1);
    expect(run('+5')).toBe(5);
  });

  it('^ is right-associative', () => {
    expect(run('2^3^2')).toBe(512);
    expect(run('2^-1')).toBe(0.5);
    expect(run('2*3^2')).toBe(18);
  });

  it('unary minus binds tighter than ^, so -2^2 = (-2)^2 = 4', () => {
    expect(run('-2^2')).toBe(4);
    expect(run('-(2^2)')).toBe(-4);
    expect(run('--3')).toBe(3);
    expect(run('2 - -3')).toBe(5);
  });

  it('null propagates; zero division, modulo by zero and non-finite give null', () => {
    const row = { A: 5, B: '', C: null };
    expect(run('[A] + [B]', row)).toBeNull();
    expect(run('[C] * 2', row)).toBeNull();
    expect(run('-[B]', row)).toBeNull();
    expect(run('1/0')).toBeNull();
    expect(run('1 % 0')).toBeNull();
    expect(run('0/0')).toBeNull();
    expect(run('10^400')).toBeNull();
    expect(run('0^-1')).toBeNull();
    expect(run('(-8)^0.5')).toBeNull();
    expect(compileFormula('1e999', [])).toMatchObject({ ok: false, error: { message: 'Number too large' } });
  });

  it('never returns -0', () => {
    expect(Object.is(run('-1*0'), 0)).toBe(true);
    expect(Object.is(run('ROUND(-0.4)'), 0)).toBe(true);
  });
});

describe('comparison and logic', () => {
  it('comparisons', () => {
    expect(run('1 < 2')).toBe(1);
    expect(run('2 <= 2')).toBe(1);
    expect(run('3 > 4')).toBe(0);
    expect(run('4 >= 5')).toBe(0);
    expect(run('2 = 2')).toBe(1);
    expect(run('2 == 3')).toBe(0);
    expect(run('2 != 3')).toBe(1);
    expect(run('2 <> 2')).toBe(0);
  });

  it('and / or / not, keywords and aliases, case-insensitive', () => {
    expect(run('1 and 0')).toBe(0);
    expect(run('1 AND 2')).toBe(1);
    expect(run('0 or 3')).toBe(1);
    expect(run('0 Or 0')).toBe(0);
    expect(run('not 0')).toBe(1);
    expect(run('NOT 5')).toBe(0);
    expect(run('1 && 0')).toBe(0);
    expect(run('0 || 1')).toBe(1);
    expect(run('!0')).toBe(1);
    expect(run('!(1 = 2)')).toBe(1);
  });

  it('precedence: not < equality < comparison; and > or', () => {
    expect(run('not 1 = 2')).toBe(1); // not (1 = 2)
    expect(run('1 = 2 > 0')).toBe(1); // 1 = (2 > 0): comparison binds tighter than =
    expect(run('1 or 0 and 0')).toBe(1); // 1 or (0 and 0)
    expect(run('(1 or 0) and 0')).toBe(0);
    expect(run('1 < 2 = 1')).toBe(1);
  });

  it('booleans: true/false case-insensitive; result converts to 1/0', () => {
    expect(run('true')).toBe(1);
    expect(run('FALSE')).toBe(0);
    expect(run('True + 1')).toBe(2);
    expect(run('3 > 2')).toBe(1);
  });

  it('null: comparisons false except !=; logic treats null as false', () => {
    const row = { A: '', B: 1 };
    expect(run('[A] = 0', row)).toBe(0);
    expect(run('[A] < 1', row)).toBe(0);
    expect(run('[A] != 0', row)).toBe(1);
    expect(run('[A] <> [A]', row)).toBe(1);
    expect(run('[A] = [A]', row)).toBe(0);
    expect(run('not [A]', row)).toBe(1);
    expect(run('[A] or [B]', row)).toBe(1);
    expect(run('[A] and [B]', row)).toBe(0);
  });

  it('string comparison uses the cell string; numeric strings are numbers', () => {
    const row = { Region: 'North', Sales: '10' };
    expect(run("[Region] = 'North'", row)).toBe(1);
    expect(run('[Region] = "North"', row)).toBe(1);
    expect(run("[Region] = 'north'", row)).toBe(0); // case-sensitive
    expect(run("[Region] != 'South'", row)).toBe(1);
    expect(run("[Region] < 'Z'", row)).toBe(1);
    expect(run("[Region] = 1", row)).toBe(0);
    expect(run("[Region] + 1", row)).toBeNull(); // non-numeric text is null in arithmetic
    expect(run('[Sales] + 1', row)).toBe(11);
    expect(run('[Sales] = 10', row)).toBe(1);
    expect(run("IF([Region] = 'North', 1, 0)", row)).toBe(1);
  });
});

describe('functions', () => {
  it('IF', () => {
    expect(run('IF(1 > 0, 10, 20)')).toBe(10);
    expect(run('if(0, 10, 20)')).toBe(20);
    expect(run('IF([A], 1, 2)', { A: null })).toBe(2); // null condition -> else
    expect(run('IF(1, IF(0, 1, 2), 3)')).toBe(2);
  });

  it('IF is lazy: only the chosen branch is evaluated', () => {
    expect(run('IF(1, 5, 1/0)')).toBe(5);
    expect(run('IF(0, 1/0, 7)')).toBe(7);
  });

  it('ROUND: half away from zero, digits 0..10', () => {
    expect(run('ROUND(2.5)')).toBe(3);
    expect(run('ROUND(-2.5)')).toBe(-3);
    expect(run('ROUND(2.4)')).toBe(2);
    expect(run('ROUND(1.25, 1)')).toBe(1.3);
    expect(run('ROUND(-1.25, 1)')).toBe(-1.3);
    expect(run('ROUND(1234.5678, 2)')).toBe(1234.57);
    expect(run('ROUND(1.5, 11)')).toBeNull();
    expect(run('ROUND(1.5, -1)')).toBeNull();
    expect(run('ROUND(1.5, 0.5)')).toBeNull();
  });

  it('ABS, FLOOR, CEIL, SQRT', () => {
    expect(run('ABS(-3.5)')).toBe(3.5);
    expect(run('FLOOR(-1.2)')).toBe(-2);
    expect(run('floor(1.9)')).toBe(1);
    expect(run('CEIL(1.1)')).toBe(2);
    expect(run('CEIL(-1.9)')).toBe(-1);
    expect(run('SQRT(16)')).toBe(4);
    expect(run('SQRT(-1)')).toBeNull();
  });

  it('MIN / MAX', () => {
    expect(run('MIN(3, 1, 2)')).toBe(1);
    expect(run('MAX(3, 1, 2)')).toBe(3);
    expect(run('MAX(5)')).toBe(5);
    expect(run('MIN(1, [A])', { A: '' })).toBeNull();
  });

  it('functions propagate null', () => {
    const row = { A: '' };
    for (const f of ['ABS', 'FLOOR', 'CEIL', 'SQRT', 'ROUND']) expect(run(`${f}([A])`, row)).toBeNull();
  });
});

describe('column references', () => {
  const cols = ['Sales', 'Unit Price', 'a.b', '_x', 'Total'];

  it('bracketed names with spaces and bare names', () => {
    const row = { Sales: 10, 'Unit Price': 2.5 };
    expect(run('[Sales] * [Unit Price]', row, cols)).toBe(25);
    expect(run('Sales * [Unit Price]', row, cols)).toBe(25);
    expect(run('Sales+1', row, cols)).toBe(11);
  });

  it('bare names may contain digits, underscore and dots', () => {
    expect(run('a.b + _x', { 'a.b': 1, _x: 2 }, cols)).toBe(3);
  });

  it('cell coercion', () => {
    expect(run('Sales', { Sales: ' 42 ' }, cols)).toBe(42);
    expect(run('Sales', { Sales: '1,000' }, cols)).toBeNull(); // no thousands separators
    expect(run('Sales', { Sales: 'abc' }, cols)).toBeNull();
    expect(run('Sales', { Sales: NaN }, cols)).toBeNull();
    expect(run('Sales', { Sales: Infinity }, cols)).toBeNull();
    expect(run('Sales', { Sales: true }, cols)).toBeNull();
    expect(run('Sales', { Sales: undefined }, cols)).toBeNull();
    expect(run('Sales', {}, cols)).toBeNull(); // missing key
    expect(run('Sales', { Sales: '   ' }, cols)).toBeNull();
  });

  it('matching is case-sensitive and exact', () => {
    expect(err('sales', cols)).toEqual({ message: 'Unknown column "sales"', pos: 0 });
    expect(err('[Sales ]', cols).message).toBe('Unknown column "Sales "');
  });

  it('a function name followed by "(" is a call; without "(" it is a column', () => {
    expect(run('MAX(1, 2)', { MAX: 9 }, ['MAX'])).toBe(2);
    expect(run('MAX + 1', { MAX: 9 }, ['MAX'])).toBe(10);
  });
});

describe('preview', () => {
  const rows = Array.from({ length: 8 }, (_, i) => ({ A: i }));
  it('evaluates the first n rows (default 5)', () => {
    expect(previewFormula('A * 2', ['A'], rows)).toEqual({ values: [0, 2, 4, 6, 8] });
    expect(previewFormula('A', ['A'], rows, 2).values).toEqual([0, 1]);
    expect(previewFormula('A', ['A'], [], 3).values).toEqual([]);
  });
  it('returns the error and no values on a compile error', () => {
    expect(previewFormula('A +', ['A'], rows)).toEqual({
      error: { message: 'Expected a value after "+"', pos: 3 },
      values: [],
    });
  });
});

describe('errors', () => {
  it('empty and limits', () => {
    expect(err('')).toEqual({ message: 'Enter a formula', pos: 0 });
    expect(err('   ').message).toBe('Enter a formula');
    expect(run('1+'.repeat(249) + '1')).toBe(250); // 499 chars
    expect(err('1'.repeat(501)).message).toBe('Formula too long');
    expect(err(' '.repeat(501)).message).toBe('Formula too long');
  });

  it('syntax errors with positions', () => {
    expect(err('1 + * 2')).toEqual({ message: 'Expected a value after "+"', pos: 4 });
    expect(err('2 *')).toEqual({ message: 'Expected a value after "*"', pos: 3 });
    expect(err('-')).toEqual({ message: 'Expected a value after "-"', pos: 1 });
    expect(err('1 and')).toEqual({ message: 'Expected a value after "and"', pos: 5 });
    expect(err('(1 + 2')).toEqual({ message: 'Missing ")"', pos: 6 });
    expect(err('IF(1, 2, 3')).toEqual({ message: 'Missing ")"', pos: 10 });
    expect(err('1 + 2)')).toEqual({ message: 'Unexpected ")"', pos: 5 });
    expect(err('1 2')).toEqual({ message: 'Unexpected "2"', pos: 2 });
    expect(err('1 + 2 x')).toEqual({ message: 'Unexpected "x"', pos: 6 });
    expect(err('1 # 2')).toEqual({ message: 'Unexpected "#"', pos: 2 });
    expect(err('1 & 2')).toEqual({ message: 'Unexpected "&"', pos: 2 });
    expect(err('()')).toEqual({ message: 'Expected a value after "("', pos: 1 });
    expect(err('*2')).toEqual({ message: 'Unexpected "*"', pos: 0 });
    expect(err('1, 2')).toEqual({ message: 'Unexpected ","', pos: 1 });
    expect(err('MAX(1,)')).toEqual({ message: 'Expected a value after ","', pos: 6 });
  });

  it('unterminated strings and column names', () => {
    expect(err("IF(1, 'abc, 2)")).toEqual({ message: 'Unterminated string', pos: 6 });
    expect(err('"abc')).toEqual({ message: 'Unterminated string', pos: 0 });
    expect(err('1 + [Sales', ['Sales'])).toEqual({ message: 'Unterminated column name', pos: 4 });
  });

  it('the first error in source order wins', () => {
    expect(err('1 + * [oops')).toEqual({ message: 'Expected a value after "+"', pos: 4 });
    expect(err('[oops').message).toBe('Unterminated column name');
    expect(err('Foo + )').message).toBe('Unknown column "Foo"');
  });

  it('unknown column / function', () => {
    expect(err('1 + Sales', ['Revenue'])).toEqual({ message: 'Unknown column "Sales"', pos: 4 });
    expect(err('[Sales] * 2', [])).toEqual({ message: 'Unknown column "Sales"', pos: 0 });
    expect(err('FOO(1)')).toEqual({ message: 'Unknown function "FOO"', pos: 0 });
    expect(err('1 + sum(1)', ['sum'])).toEqual({ message: 'Unknown function "sum"', pos: 4 });
  });

  it('arity errors', () => {
    expect(err('IF(1, 2)')).toEqual({ message: 'IF needs 3 arguments', pos: 0 });
    expect(err('1 + IF(1,2,3,4)')).toEqual({ message: 'IF needs 3 arguments', pos: 4 });
    expect(err('ABS()')).toEqual({ message: 'ABS needs 1 argument', pos: 0 });
    expect(err('sqrt(1, 2)').message).toBe('SQRT needs 1 argument');
    expect(err('ROUND()')).toEqual({ message: 'ROUND needs 1 or 2 arguments', pos: 0 });
    expect(err('ROUND(1,2,3)').message).toBe('ROUND needs 1 or 2 arguments');
    expect(err('MIN()')).toEqual({ message: 'MIN needs at least 1 argument', pos: 0 });
  });

  it('a formula must return a number', () => {
    expect(err("'abc'")).toEqual({ message: 'Formula must return a number', pos: 0 });
    expect(err(' "abc" ').pos).toBe(1);
    expect(err("IF(1, 'a', 'b')").message).toBe('Formula must return a number');
    expect(run('IF(1, 5, 0)')).toBe(5);
    // a text cell as the whole result is null, not an error
    expect(run('Region', { Region: 'North' })).toBeNull();
  });

  it('nesting depth', () => {
    expect(run('('.repeat(40) + '1' + ')'.repeat(40))).toBe(1);
    expect(err('('.repeat(100) + '1' + ')'.repeat(100)).message).toBe('Formula too deeply nested');
    expect(err('-'.repeat(200) + '1').message).toBe('Formula too deeply nested');
    expect(err('not '.repeat(100) + '1').message).toBe('Formula too deeply nested');
    expect(err('2' + '^2'.repeat(200)).message).toBe('Formula too deeply nested');
    expect(err('ABS('.repeat(90) + '1' + ')'.repeat(90)).message).toBe('Formula too deeply nested');
  });

  it('huge inputs are rejected without throwing', () => {
    expect(err('('.repeat(10_000)).message).toBe('Formula too long');
    expect(err('-'.repeat(10_000) + '1').message).toBe('Formula too long');
    expect(() => compileFormula('('.repeat(10_000), [])).not.toThrow();
  });
});

describe('security', () => {
  const protoNames = ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'prototype', 'valueOf'];

  it('prototype names are unknown columns (bare and bracketed)', () => {
    for (const n of protoNames) {
      for (const src of [n, `[${n}]`, `${n} + 1`, `ABS([${n}])`]) {
        expect(err(src, ['Sales']).message).toBe(`Unknown column "${n}"`);
      }
    }
  });

  it('if such a column is declared, only an own row property is read', () => {
    for (const n of protoNames) {
      expect(run(`[${n}]`, {}, [n])).toBeNull(); // not an own property: never the inherited value
      expect(run(`[${n}] + 1`, { [n]: 4 }, [n])).toBe(5);
    }
  });

  it('a row with an own __proto__ key stays safe', () => {
    const row = JSON.parse('{"__proto__": 7, "Sales": 1}') as Row;
    expect(run('[__proto__] + Sales', row, ['__proto__', 'Sales'])).toBe(8);
    expect(run('Sales', row, ['Sales'])).toBe(1);
    expect(err('[__proto__]', ['Sales']).message).toBe('Unknown column "__proto__"');
    const evil = JSON.parse('{"__proto__": {"Sales": 99}}') as Row;
    expect(run('Sales', evil, ['Sales'])).toBeNull(); // no inherited reads
  });

  it('property access, code and template syntax never compile or execute', () => {
    const g = globalThis as Record<string, unknown>;
    g.__formulaPwned = false;
    const attacks = [
      'eval("globalThis.__formulaPwned = true")',
      'eval(1)',
      'Function',
      'Function("return 1")()',
      'new Function("1")',
      '`1`',
      '${1}',
      '1; 2',
      '{1}',
      '[Sales].length',
      'Sales.length',
      'Sales.constructor',
      '[Sales]["x"]',
      'Sales["constructor"]',
      '(1).constructor',
      'this',
      'globalThis',
      'process',
      'import("x")',
      'x => 1',
      '1 ? 2 : 3',
    ];
    for (const a of attacks) {
      const c = compileFormula(a, ['Sales']);
      expect(c.ok, a).toBe(false);
    }
    expect(g.__formulaPwned).toBe(false);
    delete g.__formulaPwned;
  });

  it('the source uses no dynamic code execution', () => {
    const src = readFileSync(join(process.cwd(), 'src/lib/formula.ts'), 'utf8');
    for (const bad of ['eval(', 'new Function', 'Function(']) expect(src.includes(bad)).toBe(false);
  });
});
