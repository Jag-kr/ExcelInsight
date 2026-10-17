/**
 * Strict date recognition for spreadsheet cells.
 *
 * `new Date(string)` is far too lenient for type detection: V8 happily parses
 * "ORD-1000", "Customer 1234" or "note 5" into some year-1xxx date, so text
 * columns were typed `date` and bucketed into nonsense months. This module
 * accepts a closed list of shapes and rejects everything else. Strings are
 * read as written, never through the local timezone.
 *
 * Accepted (case-insensitive, optional leading weekday name, optional time):
 *   2025-01-15, 2025/1/5, 2025.01.15   (+ T/space time, Z or +hh:mm offset)
 *   20250115                           (yyyymmdd, 1900..2100)
 *   15/01/2025, 1/15/25, 15.1.2025, 15-01-25
 *   Jan 15, 2025 | January 15 2025 | 15 Jan 2025 | 15-Jan-25 | Jan 2025
 * Years must be 1800..2200 and the day must exist in the month.
 */

type Parts = [year: number, month: number, day: number];

/** Which part comes first in an ambiguous `a/b/yyyy` where both are <= 12. */
export type DateOrder = 'mdy' | 'dmy';

// hh:mm[:ss[.sss]] [AM|PM] [Z|+hh[:mm]]. Three capture groups: hh, mm, ss.
const TIME = '(?:(?:T|\\s+)(\\d{1,2}):(\\d{2})(?::(\\d{2})(?:\\.\\d+)?)?(?:\\s*[ap]m)?\\s*(?:z|[+-]\\d{2}(?::?\\d{2})?)?)?$';

const ISO = new RegExp(`^(\\d{4})([-/.])(\\d{1,2})\\2(\\d{1,2})${TIME}`, 'i'); // y sep m d | time from 5
const NUM = new RegExp(`^(\\d{1,2})([-/.])(\\d{1,2})\\2(\\d{4}|\\d{2})${TIME}`, 'i'); // a sep b y | time from 5
const DMON = new RegExp(`^(\\d{1,2})[\\s-]+([a-z]{3,9})\\.?,?[\\s-]+(\\d{4}|\\d{2})${TIME}`, 'i'); // d mon y | time from 4
const MDY = new RegExp(`^([a-z]{3,9})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})${TIME}`, 'i'); // mon d y | time from 4
const MY = /^([a-z]{3,9})\.?,?[\s-]+(\d{4})$/i; // mon y
const COMPACT = /^\d{8}$/;
const WEEKDAY_PREFIX = /^([a-z]{3,9})\.?,?\s+/i;

const MONTHS = new Map<string, number>();
[
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
].forEach((name, i) => {
  MONTHS.set(name, i + 1);
  MONTHS.set(name.slice(0, 3), i + 1);
});
MONTHS.set('sept', 9);

const WEEKDAYS = new Set([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'tues', 'thur', 'thurs',
]);

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysIn(y: number, m: number): number {
  return m === 2 && y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : DAYS_IN_MONTH[m];
}

/** The tuple when y/m/d is a real calendar day in 1800..2200, else null. */
function make(y: number, m: number, d: number): Parts | null {
  return y >= 1800 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= daysIn(y, m) ? [y, m, d] : null;
}

/** Capture groups hh, mm, ss start at `i`; true when absent or in range. */
function timeOk(m: RegExpExecArray, i: number): boolean {
  return m[i] === undefined || (+m[i] <= 23 && +m[i + 1] <= 59 && (m[i + 2] === undefined || +m[i + 2] <= 59));
}

/** "25" -> 2025, "99" -> 1999 (00-69 are 2000s); 4-digit years pass through. */
function year(s: string): number {
  const n = +s;
  return s.length === 2 ? (n < 70 ? 2000 + n : 1900 + n) : n;
}

const monthOf = (name: string): number => MONTHS.get(name.toLowerCase()) ?? 0;

function parseString(s: string, order: DateOrder): Parts | null {
  let m: RegExpExecArray | null;
  const c = s.charCodeAt(0);

  if (c >= 48 && c <= 57) {
    if (s.length === 8 && COMPACT.test(s)) {
      const n = +s;
      const y = (n / 10000) | 0;
      return y >= 1900 && y <= 2100 ? make(y, ((n / 100) | 0) % 100, n % 100) : null;
    }
    if ((m = ISO.exec(s))) return timeOk(m, 5) ? make(+m[1], +m[3], +m[4]) : null;
    if ((m = NUM.exec(s))) {
      if (!timeOk(m, 5)) return null;
      const a = +m[1];
      const b = +m[3];
      // The unambiguous side wins; otherwise the caller's order (default month-first).
      const dayFirst = a > 12 ? true : b > 12 ? false : order === 'dmy';
      return dayFirst ? make(year(m[4]), b, a) : make(year(m[4]), a, b);
    }
    if ((m = DMON.exec(s))) return timeOk(m, 4) ? make(year(m[3]), monthOf(m[2]), +m[1]) : null;
    return null;
  }

  if ((m = MDY.exec(s))) return timeOk(m, 4) ? make(+m[3], monthOf(m[1]), +m[2]) : null;
  if ((m = MY.exec(s))) return make(+m[2], monthOf(m[1]), 1);
  return null;
}

/**
 * [year, month (1-12), day] of a date cell, or null when it is not a date.
 * `Date` objects give local calendar parts; strings must match one of the
 * shapes above; numbers are never dates here (Excel serials are converted at
 * load time). `order` only decides ambiguous `03/04/2025`-style values.
 */
export function parseDateStrict(v: unknown, order: DateOrder = 'mdy'): Parts | null {
  if (typeof v === 'string') {
    if (v.length > 60) return null;
    let s = v.trim();
    if (s.length < 6 || s.length > 40) return null;
    // Weekday prefix ("Mon, 15 Jan 2025"): drop it, then parse the rest normally.
    const c = s.charCodeAt(0);
    if (c > 57) {
      const w = WEEKDAY_PREFIX.exec(s);
      if (!w || !WEEKDAYS.has(w[1].toLowerCase())) return parseString(s, order);
      s = s.slice(w[0].length);
    }
    return parseString(s, order);
  }
  if (v instanceof Date) {
    return isNaN(v.getTime()) ? null : [v.getFullYear(), v.getMonth() + 1, v.getDate()];
  }
  return null;
}
