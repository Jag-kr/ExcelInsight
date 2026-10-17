import { parseDateStrict } from './dates';

/**
 * Load-time date repairs that need a whole column to decide, so the per-cell
 * parser (dates.ts) can stay simple and everything downstream only ever sees
 * ISO `yyyy-mm-dd` text:
 *
 *  - serial: Excel stores dates as numbers; a General-formatted column of
 *    them (45386) would be typed numeric and summed. A header that looks like
 *    a date plus values in the serial / yyyymmdd range converts them.
 *  - dayFirst: `03/04/2025` is ambiguous per cell. If another value in the
 *    column proves day-first (`13/01/2025`), the whole column is rewritten.
 *
 * Pure and timezone-free: integer day arithmetic only, no local-time Date math.
 */
export type DateNote = { kind: 'serial' | 'dayFirst'; columns: string[] };

type Row = Record<string, unknown>;

const pad = (n: number) => String(n).padStart(2, '0');
const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

// Strong words name a date wherever they appear. Weak words ("Shipped",
// "Due") are also quantities ("Units Shipped", "Amount Due"), so they only
// count when they are the whole header, ignoring filler like "On" / "At" / "UTC".
const STRONG = new Set(['date', 'datetime', 'timestamp', 'created', 'updated', 'modified', 'dob', 'birth', 'birthday']);
const WEAK = new Set(['time', 'booked', 'ordered', 'shipped', 'delivered', 'due']);
const FILLER = new Set(['on', 'at', 'utc', 'gmt', 'local']);
const NOT_DATES = new Set(['candidate', 'mandate']);

/**
 * Does the header look like a date column? Words split on non-letters and
 * camelCase, so `OrderDate`, `ship_date`, `DATE (UTC)`, `Created At` match and
 * `Quantity`, `Candidate Score`, `Day`, `Dt` do not (`orderdate` matches by its
 * `date` suffix; `day`/`dt` are too ambiguous to trust).
 */
export function hasDateHint(header: string): boolean {
  const words = header
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
  if (words.some(w => STRONG.has(w) || (w.length > 4 && w.endsWith('date') && !NOT_DATES.has(w)))) return true;
  const rest = words.filter(w => !FILLER.has(w));
  return rest.length === 1 && WEAK.has(rest[0]);
}

/** Excel serial (1900 system, or 1904 when asked) to `yyyy-mm-dd[ hh:mm]`; the time only when non-zero. */
function serialToIso(n: number, date1904: boolean): string {
  const sec = Math.round(n * 86400);
  const days = Math.floor(sec / 86400);
  const s = sec - days * 86400;
  // 25569 = 1970-01-01 in the 1900 system; the 1904 system starts 1462 days later.
  const t = new Date((days + (date1904 ? 1462 : 0) - 25569) * 864e5);
  const iso = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  const H = (s / 3600) | 0;
  const M = ((s % 3600) / 60) | 0;
  return H || M ? `${iso} ${pad(H)}:${pad(M)}` : iso;
}

function toIso(n: number, date1904: boolean): string | null {
  if (n >= 20000 && n <= 80000) return serialToIso(n, date1904);
  if (Number.isInteger(n) && n >= 19000101 && n <= 21001231) {
    const p = parseDateStrict(String(n)); // yyyymmdd, calendar-checked
    if (p) return `${p[0]}-${pad(p[1])}-${pad(p[2])}`;
  }
  return null;
}

/** Converts a hinted number column in place when >= 90% of its values fit. */
function convertSerials(rows: Row[], col: string, date1904: boolean): boolean {
  const out: (string | null)[] = new Array(rows.length).fill(null);
  let nonEmpty = 0;
  let fit = 0;
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][col];
    if (isEmpty(v)) continue;
    nonEmpty++;
    if (typeof v !== 'number') continue;
    const s = toIso(v, date1904);
    if (s !== null) { out[i] = s; fit++; }
  }
  if (!nonEmpty || fit / nonEmpty < 0.9) return false;
  for (let i = 0; i < rows.length; i++) if (out[i] !== null) rows[i][col] = out[i];
  return true;
}

const NUMERIC_DATE = /^(\d{1,2})([-/.])(\d{1,2})\2(\d{4}|\d{2})/; // a sep b year; time text may follow

/** Rewrites a text column proven day-first (and never month-first) to ISO, keeping any time text. */
function convertDayFirst(rows: Row[], col: string): boolean {
  // Cheap reject so ordinary text columns cost ~60 cells, not a full scan.
  let seen = 0;
  let ok = 0;
  for (let i = 0; i < rows.length && seen < 60; i++) {
    const v = rows[i][col];
    if (isEmpty(v)) continue;
    seen++;
    if (parseDateStrict(v)) ok++;
  }
  if (!seen || ok / seen < 0.5) return false;

  let nonEmpty = 0;
  let parsed = 0;
  let numeric = 0;
  let dmy = false;
  let mdy = false;
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][col];
    if (isEmpty(v)) continue;
    nonEmpty++;
    if (typeof v !== 'string' || !parseDateStrict(v)) continue;
    parsed++;
    const m = NUMERIC_DATE.exec(v.trim());
    if (!m) continue;
    numeric++;
    if (+m[1] > 12) dmy = true;
    else if (+m[3] > 12) mdy = true;
  }
  // Mixed evidence or none: keep the month-first default.
  if (parsed / nonEmpty < 0.7 || !numeric || !dmy || mdy) return false;

  for (let i = 0; i < rows.length; i++) {
    const v = rows[i][col];
    if (typeof v !== 'string') continue;
    const s = v.trim();
    const m = NUMERIC_DATE.exec(s);
    const p = m && parseDateStrict(s, 'dmy');
    if (m && p) rows[i][col] = `${p[0]}-${pad(p[1])}-${pad(p[2])}${s.slice(m[0].length)}`;
  }
  return true;
}

/**
 * Repairs date columns in place (rows are the fresh objects from sheet_to_json)
 * and reports which columns changed, one note per kind that occurred.
 * Measured: 100k rows x 30 columns of mixed text/numbers in 0.25-0.45 s (vitest, one core).
 */
export function normalizeDateColumns(rows: Row[], opts: { date1904?: boolean } = {}): DateNote[] {
  const cols = new Set<string>();
  for (const r of rows) for (const k in r) cols.add(k);
  const serial: string[] = [];
  const dayFirst: string[] = [];
  for (const col of cols) {
    if (hasDateHint(col) && convertSerials(rows, col, !!opts.date1904)) serial.push(col);
    else if (convertDayFirst(rows, col)) dayFirst.push(col);
  }
  const notes: DateNote[] = [];
  if (serial.length) notes.push({ kind: 'serial', columns: serial });
  if (dayFirst.length) notes.push({ kind: 'dayFirst', columns: dayFirst });
  return notes;
}
