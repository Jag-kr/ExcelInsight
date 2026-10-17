import { bucketDate } from '@/lib/data-analyzer';
import { aggregateValues, type DateGrain, type KpiAgg } from '@/lib/derive-dashboard-item';

/**
 * Pivot table engine: one value aggregated over a row dimension and an optional
 * column dimension. Pure, like every other recipe here: rebuilt from the
 * filtered rows on each render pass, never stored.
 */
export interface PivotSpec {
  rows: string;
  cols?: string;
  /** column null means "count the rows". */
  value: { column: string | null; agg: KpiAgg };
  /** Set only when the matching dimension is a date column. */
  rowGrain?: DateGrain;
  colGrain?: DateGrain;
  /** Colour scale on the cells. Rendering only; ignored here. */
  heat?: boolean;
}

export interface PivotResult {
  rowLabels: string[];
  /** [] when the spec has no `cols`. */
  colLabels: string[];
  /** cells[r][c]; null = no rows in that combination. Without cols: cells[r] = [rowTotal]. */
  cells: (number | null)[][];
  /** Aggregated over all of a label's rows, not summed from cells: avg/min/median/distinct would be wrong. */
  rowTotals: (number | null)[];
  colTotals: (number | null)[];
  /** Over all input rows, truncated labels included. */
  grand: number | null;
  /** Distinct labels before truncation. */
  rowCount: number;
  colCount: number;
}

export const PIVOT_MAX_ROWS = 50;
export const PIVOT_MAX_COLS = 12;

const BLANK = '(blank)';

type Row = Record<string, any>;

function labelOf(v: unknown, grain?: DateGrain): string {
  const s = grain ? bucketDate(v, grain) : v == null ? '' : String(v).trim();
  return s || BLANK;
}

/* Maps, not objects: labels come from user data ('__proto__', 'constructor'). */
function push<K>(m: Map<K, Row[]>, k: K, r: Row) {
  const list = m.get(k);
  if (list) list.push(r); else m.set(k, [r]);
}

/** Ascending for dates ('(blank)' last); descending by total otherwise (null totals last). */
function order(groups: Map<string, Row[]>, grained: boolean, total: (rows: Row[]) => number | null): string[] {
  const totals = new Map<string, number | null>();
  const labels = [...groups.keys()];
  for (const l of labels) totals.set(l, total(groups.get(l)!));
  const byLabel = (a: string, b: string) => (a === BLANK ? 1 : b === BLANK ? -1 : a < b ? -1 : a > b ? 1 : 0);
  return labels.sort((a, b) => {
    if (!grained) {
      const ta = totals.get(a)!, tb = totals.get(b)!;
      if (ta !== tb) return ta === null ? 1 : tb === null ? -1 : tb - ta;
    }
    return byLabel(a, b);
  });
}

export function computePivot(data: Row[], spec: PivotSpec): PivotResult {
  const { column, agg } = spec.value;
  const value = (rows: Row[]) => {
    const n = column ? aggregateValues(rows.map(r => r[column]), agg) : rows.length;
    return n !== null && Number.isFinite(n) ? n : null;
  };

  // One pass: every row lands in its row list, column list and cell list.
  const byRow = new Map<string, Row[]>();
  const byCol = new Map<string, Row[]>();
  const byCell = new Map<string, Map<string, Row[]>>();
  for (const r of data) {
    const rl = labelOf(r[spec.rows], spec.rowGrain);
    push(byRow, rl, r);
    if (!spec.cols) continue;
    const cl = labelOf(r[spec.cols], spec.colGrain);
    push(byCol, cl, r);
    let row = byCell.get(rl);
    if (!row) byCell.set(rl, (row = new Map()));
    push(row, cl, r);
  }

  const rowLabels = order(byRow, !!spec.rowGrain, value).slice(0, PIVOT_MAX_ROWS);
  const colLabels = order(byCol, !!spec.colGrain, value).slice(0, PIVOT_MAX_COLS);
  const rowTotals = rowLabels.map(l => value(byRow.get(l)!));

  return {
    rowLabels,
    colLabels,
    cells: rowLabels.map((l, i) => {
      if (!spec.cols) return [rowTotals[i]];
      const row = byCell.get(l)!;
      return colLabels.map(c => (row.has(c) ? value(row.get(c)!) : null));
    }),
    rowTotals,
    colTotals: colLabels.map(l => value(byCol.get(l)!)),
    grand: data.length ? value(data) : null,
    rowCount: byRow.size,
    colCount: byCol.size,
  };
}
