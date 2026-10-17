/**
 * Safe formula engine for calculated columns: tokenizer -> recursive-descent
 * parser -> closures (compiled once, evaluated per row). No eval/Function/codegen.
 * Column names resolve ONLY through a Set of known columns and rows are read
 * with hasOwnProperty, so user text can never reach the prototype chain.
 *
 * Precedence, low to high: or, and, not, = != , < <= > >=, + -, * / %, ^, unary - +.
 * Unary binds tighter than ^, so -2^2 is (-2)^2 = 4; ^ is right-associative.
 */
export type FormulaError = { message: string; pos: number };
export type Compiled =
  | { ok: true; evaluate: (row: Record<string, unknown>) => number | null }
  | { ok: false; error: FormulaError };

type Val = number | boolean | string | null;
type Row = Record<string, unknown>;
type Ev = (row: Row) => Val;
/** `str` is true when the node is statically a string (a formula must not end in one). */
type Node = { ev: Ev; str: boolean };
type Tok = { t: 'num' | 'str' | 'col' | 'id' | 'op' | 'end' | 'bad'; v: string; pos: number; end: number };

const MAX_LEN = 500;
const MAX_DEPTH = 50;

class Fail extends Error {
  constructor(message: string, readonly pos: number) {
    super(message);
  }
}

// ---- tokenizer -------------------------------------------------------------

const NUM = /(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const ID = /[\p{L}_][\p{L}\p{N}_.]*/uy;
const OP = /<=|>=|<>|!=|==|&&|\|\||[<>=+\-*/%^!(),]/y;
const ALIAS = new Map([['==', '='], ['<>', '!='], ['&&', 'and'], ['||', 'or'], ['!', 'not']]);
const WORDS = new Set(['and', 'or', 'not']);

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const add = (t: Tok['t'], v: string, pos: number, end: number) => out.push({ t, v, pos, end });
  let i = 0;
  while (true) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) return add('end', '', src.length, src.length), out;
    const c = src[i];
    let m: RegExpExecArray | null;
    if (c === '[' || c === '"' || c === "'") {
      const j = src.indexOf(c === '[' ? ']' : c, i + 1);
      if (j < 0) return add('bad', c === '[' ? 'Unterminated column name' : 'Unterminated string', i, i + 1), out;
      add(c === '[' ? 'col' : 'str', src.slice(i + 1, j), i, j + 1);
      i = j + 1;
    } else if ((NUM.lastIndex = i), (m = NUM.exec(src))) {
      add('num', m[0], i, i + m[0].length);
      i += m[0].length;
    } else if ((ID.lastIndex = i), (m = ID.exec(src))) {
      const lower = m[0].toLowerCase();
      add(WORDS.has(lower) ? 'op' : 'id', WORDS.has(lower) ? lower : m[0], i, i + m[0].length);
      i += m[0].length;
    } else if ((OP.lastIndex = i), (m = OP.exec(src))) {
      add('op', ALIAS.get(m[0]) ?? m[0], i, i + m[0].length);
      i += m[0].length;
    } else {
      return add('bad', `Unexpected "${c}"`, i, i + 1), out;
    }
  }
}

// ---- values ----------------------------------------------------------------

/** Normalises -0 to 0 and non-finite results to null. */
const fin = (x: number): number | null => (Number.isFinite(x) ? x + 0 : null);
const toNum = (v: Val): number | null => (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : null);
const truthy = (v: Val): boolean => (typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : false);

/** Cell -> number | non-numeric string (comparable only) | null (blank or other). */
function cell(row: Row, name: string): Val {
  if (!Object.prototype.hasOwnProperty.call(row, name)) return null;
  const v = row[name];
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : v;
}

function compare(op: string, a: Val, b: Val): boolean {
  if (a === null || b === null) return op === '!=';
  const x = typeof a === 'boolean' ? +a : a;
  const y = typeof b === 'boolean' ? +b : b;
  if (typeof x !== typeof y) return op === '!=';
  const [p, q] = [x, y] as [number, number]; // same type: numbers or strings
  switch (op) {
    case '=': return p === q;
    case '!=': return p !== q;
    case '<': return p < q;
    case '<=': return p <= q;
    case '>': return p > q;
    default: return p >= q;
  }
}

const ARITH = new Map<string, (x: number, y: number) => number>([
  ['+', (x, y) => x + y],
  ['-', (x, y) => x - y],
  ['*', (x, y) => x * y],
  ['/', (x, y) => (y === 0 ? NaN : x / y)],
  ['%', (x, y) => (y === 0 ? NaN : x % y)],
  ['^', (x, y) => x ** y],
]);

function binary(op: string, a: Node, b: Node): Node {
  const A = a.ev;
  const B = b.ev;
  const f = ARITH.get(op);
  let ev: Ev;
  if (f) {
    ev = (r) => {
      const x = toNum(A(r));
      const y = toNum(B(r));
      return x === null || y === null ? null : fin(f(x, y));
    };
  } else if (op === 'and') ev = (r) => truthy(A(r)) && truthy(B(r));
  else if (op === 'or') ev = (r) => truthy(A(r)) || truthy(B(r));
  else ev = (r) => compare(op, A(r), B(r));
  return { ev, str: false };
}

// ---- functions -------------------------------------------------------------

type Fn = { min: number; max: number; run: (args: Ev[], row: Row) => Val };

/** Numeric function: any null/non-numeric argument yields null; NaN/Infinity yields null. */
const numeric = (min: number, max: number, f: (xs: number[]) => number): Fn => ({
  min,
  max,
  run: (args, row) => {
    const xs: number[] = [];
    for (const e of args) {
      const x = toNum(e(row));
      if (x === null) return null;
      xs.push(x);
    }
    return fin(f(xs));
  },
});

const FUNCS = new Map<string, Fn>([
  ['IF', { min: 3, max: 3, run: (a, r) => (truthy(a[0](r)) ? a[1](r) : a[2](r)) }],
  ['ABS', numeric(1, 1, ([x]) => Math.abs(x))],
  ['FLOOR', numeric(1, 1, ([x]) => Math.floor(x))],
  ['CEIL', numeric(1, 1, ([x]) => Math.ceil(x))],
  ['SQRT', numeric(1, 1, ([x]) => Math.sqrt(x))],
  ['MIN', numeric(1, Infinity, (xs) => Math.min(...xs))],
  ['MAX', numeric(1, Infinity, (xs) => Math.max(...xs))],
  [
    'ROUND',
    numeric(1, 2, ([x, d = 0]) => {
      if (!Number.isInteger(d) || d < 0 || d > 10) return NaN;
      const m = 10 ** d;
      return (Math.sign(x) * Math.round(Math.abs(x) * m)) / m; // half away from zero
    }),
  ],
]);

function arityMessage(name: string, { min, max }: Fn): string {
  const s = (n: number) => `${n} argument${n === 1 ? '' : 's'}`;
  if (min === max) return `${name} needs ${s(min)}`;
  return max === Infinity ? `${name} needs at least ${s(min)}` : `${name} needs ${min} or ${s(max)}`;
}

// ---- parser ----------------------------------------------------------------

const NOT: string[] = ['not'];
const LEVELS: string[][] = [['or'], ['and'], NOT, ['=', '!='], ['<', '<=', '>', '>='], ['+', '-'], ['*', '/', '%']];

class Parser {
  private i = 0;
  private depth = 0;
  private readonly toks: Tok[];

  constructor(private readonly src: string, private readonly cols: Set<string>) {
    this.toks = tokenize(src);
  }

  parse(): Node {
    const root = this.bin(0);
    const t = this.peek();
    if (t.t !== 'end') throw this.unexpected(t);
    if (root.str) throw new Fail('Formula must return a number', this.toks[0].pos);
    return root;
  }

  // A pending lexer error surfaces when the parser reaches it, so the first error wins.
  private peek(): Tok {
    const t = this.toks[this.i];
    if (t.t === 'bad') throw new Fail(t.v, t.pos);
    return t;
  }

  private next(): Tok {
    const t = this.peek();
    if (t.t !== 'end') this.i++;
    return t;
  }

  private isOp(...vs: string[]): boolean {
    const t = this.peek();
    return t.t === 'op' && vs.includes(t.v);
  }

  private unexpected(t: Tok): Fail {
    return new Fail(`Unexpected "${this.src.slice(t.pos, t.end)}"`, t.pos);
  }

  private down(pos: number): void {
    if (++this.depth > MAX_DEPTH) throw new Fail('Formula too deeply nested', pos);
  }

  private bin(level: number): Node {
    if (level === LEVELS.length) return this.pow();
    const ops = LEVELS[level];
    if (ops === NOT) {
      if (!this.isOp('not')) return this.bin(level + 1);
      this.down(this.next().pos);
      const x = this.bin(level).ev;
      this.depth--;
      return { ev: (r) => !truthy(x(r)), str: false };
    }
    let left = this.bin(level + 1);
    while (this.isOp(...ops)) {
      const op = this.next().v;
      left = binary(op, left, this.bin(level + 1));
    }
    return left;
  }

  private pow(): Node {
    const left = this.unary();
    if (!this.isOp('^')) return left;
    this.down(this.next().pos);
    const right = this.pow();
    this.depth--;
    return binary('^', left, right);
  }

  private unary(): Node {
    if (!this.isOp('-', '+')) return this.primary();
    const t = this.next();
    this.down(t.pos);
    const x = this.unary().ev;
    this.depth--;
    const neg = t.v === '-';
    return {
      ev: (r) => {
        const n = toNum(x(r));
        return n === null ? null : neg ? 0 - n : n;
      },
      str: false,
    };
  }

  private primary(): Node {
    const t = this.peek();
    if (t.t === 'num') {
      this.next();
      const n = Number(t.v);
      if (!Number.isFinite(n)) throw new Fail('Number too large', t.pos);
      return { ev: () => n, str: false };
    }
    if (t.t === 'str') {
      this.next();
      return { ev: () => t.v, str: true };
    }
    if (t.t === 'col') {
      this.next();
      return this.column(t, t.v);
    }
    if (t.t === 'id') {
      this.next();
      const lower = t.v.toLowerCase();
      if (lower === 'true' || lower === 'false') return { ev: () => lower === 'true', str: false };
      return this.isOp('(') ? this.call(t) : this.column(t, t.v);
    }
    if (t.t === 'op' && t.v === '(') {
      this.next();
      this.down(t.pos);
      const inner = this.bin(0);
      this.depth--;
      this.close();
      return inner;
    }
    const prev = this.toks[this.i - 1];
    if (prev && prev.t === 'op' && prev.v !== ')') {
      throw new Fail(`Expected a value after "${this.src.slice(prev.pos, prev.end)}"`, t.pos);
    }
    throw this.unexpected(t);
  }

  private column(t: Tok, name: string): Node {
    if (!this.cols.has(name)) throw new Fail(`Unknown column "${name}"`, t.pos);
    return { ev: (r) => cell(r, name), str: false };
  }

  private close(): void {
    const t = this.peek();
    if (t.t === 'op' && t.v === ')') {
      this.next();
      return;
    }
    throw t.t === 'end' ? new Fail('Missing ")"', t.pos) : this.unexpected(t);
  }

  private call(t: Tok): Node {
    const name = t.v.toUpperCase();
    const fn = FUNCS.get(name);
    if (!fn) throw new Fail(`Unknown function "${t.v}"`, t.pos);
    this.next(); // "("
    const args: Node[] = [];
    this.down(t.pos);
    if (!this.isOp(')')) {
      do args.push(this.bin(0));
      while (this.isOp(',') && this.next());
    }
    this.depth--;
    this.close();
    if (args.length < fn.min || args.length > fn.max) throw new Fail(arityMessage(name, fn), t.pos);
    const evs = args.map((a) => a.ev);
    return { ev: (r) => fn.run(evs, r), str: name === 'IF' && (args[1].str || args[2].str) };
  }
}

// ---- public API ------------------------------------------------------------

export function compileFormula(source: string, columns: string[]): Compiled {
  const fail = (message: string, pos: number): Compiled => ({ ok: false, error: { message, pos } });
  if (source.length > MAX_LEN) return fail('Formula too long', MAX_LEN);
  if (source.trim() === '') return fail('Enter a formula', 0);
  try {
    const { ev } = new Parser(source, new Set(columns)).parse();
    return {
      ok: true,
      evaluate: (row) => {
        const v = ev(row);
        return typeof v === 'number' ? fin(v) : typeof v === 'boolean' ? +v : null;
      },
    };
  } catch (e) {
    if (e instanceof Fail) return fail(e.message, e.pos);
    throw e;
  }
}

export function previewFormula(
  source: string,
  columns: string[],
  rows: Record<string, unknown>[],
  n = 5,
): { error?: FormulaError; values: (number | null)[] } {
  const c = compileFormula(source, columns);
  if ('error' in c) return { error: c.error, values: [] };
  return { values: rows.slice(0, n).map((r) => c.evaluate(r)) };
}
