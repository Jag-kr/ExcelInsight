import { bucketDate, type ColumnMeta, type ChartSuggestion, type DateGrain } from '@/lib/data-analyzer';

export type { DateGrain };
import type { DashboardItem } from '@/components/DashboardGrid';

/**
 * Card data is derived from a recipe + the currently filtered dataset, never
 * stored. Also the single home for the insight tallies and table shapes that
 * SmartInsights, QuickAddPanel and buildDefaultDashboard all render.
 */

/** How a custom-built chart was specified, so it can be rebuilt later. */
export interface ManualChartSpec {
  xCol: string;
  /** null means "count rows per category" rather than aggregate a value column. */
  yCol: string | null;
  aggregation: 'sum' | 'average' | 'count';
}

export type TFn = (key: any) => string;

export interface ChartMeasure {
  /** null means "count the rows". */
  column: string | null;
  agg: KpiAgg;
}

/**
 * A chart recipe in field-well terms: one dimension on the axis, up to four
 * measures, optionally split by a legend column. Rebuilt by aggregateChart()
 * against the filtered rows on every pass, like every other recipe here.
 */
export interface ChartSpec {
  v: 2;
  dimension: string;
  /** Set only for date dimensions: bucket the axis instead of using raw values. */
  grain?: DateGrain;
  measures: ChartMeasure[];
  /** Legend breakdown. Only honoured with a single measure. */
  series?: string;
  sort?: 'value-desc' | 'value-asc' | 'label';
  /** Categories kept after sorting. 0 = all (capped at MAX_CATEGORIES). */
  limit?: number;
  stacked?: boolean;
}

export const MAX_MEASURES = 4;
export const MAX_SERIES = 8;
const MAX_CATEGORIES = 500;
const DEFAULT_LIMIT = 20;

/** Sessions saved before ChartSpec carry the old {xCol, yCol, aggregation} shape. */
export function toChartSpec(spec: ManualChartSpec | ChartSpec, chartType: string): ChartSpec {
  if ('v' in spec) return spec;
  // The old builder always counted for pies and for "count only".
  const counted = chartType === 'pie' || !spec.yCol;
  return {
    v: 2,
    dimension: spec.xCol,
    measures: [counted ? { column: null, agg: 'count' } : { column: spec.yCol, agg: spec.aggregation }],
  };
}

/**
 * The ChartSpec equivalent of an auto-suggested chart, so a suggestion card can
 * be opened in the editor. Column names may contain ':', so two-column keys are
 * resolved against the real columns rather than split. null = no equivalent
 * (scatter plots plot raw points, not aggregates).
 */
export function specFromSourceKey(key: string, columns: ColumnMeta[]): ChartSpec | null {
  const i = key.indexOf(':');
  const kind = key.slice(0, i);
  const rest = key.slice(i + 1);
  const byName = new Map(columns.map(c => [c.name, c]));
  const pair = (): [string, string] | null => {
    for (const c of columns) {
      const second = rest.slice(c.name.length + 1);
      if (rest.startsWith(`${c.name}:`) && byName.has(second)) return [c.name, second];
    }
    return null;
  };
  const totalOrMean = (col: string): KpiAgg => (byName.get(col)?.stats?.isSummable ? 'sum' : 'average');
  const count: ChartMeasure[] = [{ column: null, agg: 'count' }];

  switch (kind) {
    case 'dist': return { v: 2, dimension: rest, measures: count, limit: 15 };
    case 'pie': return { v: 2, dimension: rest, measures: count, limit: 0 };
    case 'rdist': return { v: 2, dimension: rest, measures: count, limit: 20 };
    case 'agg': {
      const p = pair();
      return p && { v: 2, dimension: p[1], measures: [{ column: p[0], agg: totalOrMean(p[0]) }], limit: 15 };
    }
    case 'top': {
      const p = pair();
      return p && { v: 2, dimension: p[0], measures: [{ column: p[1], agg: 'sum' }], limit: 10 };
    }
    case 'trend': {
      const p = pair();
      return p && { v: 2, dimension: p[0], grain: 'month', measures: [{ column: p[1], agg: totalOrMean(p[1]) }] };
    }
    default: return null;
  }
}

/** Legend/tooltip key for a measure. A lone measure keeps the legacy keys so
    saved cards and their colours are unchanged. */
export function measureKey(m: ChartMeasure, measures: ChartMeasure[]): string {
  if (measures.length === 1) return m.column ? 'value' : 'count';
  return `${m.column ?? 'Rows'} (${m.agg})`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type Row = Record<string, unknown>;
/** One recharts row: the axis label plus a number (or a gap) per data key. */
export type ChartRow = { name: string; [dataKey: string]: string | number | null };

/** Group rows under the chart's axis labels, preserving nothing but membership. */
function groupRows(rows: Row[], dimension: string, grain?: DateGrain) {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const label = grain ? bucketDate(row[dimension], grain) : String(row[dimension] ?? 'Unknown');
    if (label === null) continue;
    let g = groups.get(label);
    if (!g) groups.set(label, (g = []));
    g.push(row);
  }
  return groups;
}

/** null (no numeric cells) renders as a gap rather than a misleading zero. */
function measureValue(rows: Row[], m: ChartMeasure): number | null {
  const n = aggregateValues(m.column ? rows.map(r => r[m.column!]) : rows, m.column ? m.agg : 'count');
  return n === null ? null : round2(n);
}

/** Aggregate a chart recipe into recharts rows: [{ name, [dataKey]: number }]. */
export function aggregateChart(
  rows: Row[],
  spec: ChartSpec,
): { data: ChartRow[]; dataKeys: string[] } {
  const measures = spec.measures.slice(0, MAX_MEASURES);
  if (!spec.dimension || !measures.length) return { data: [], dataKeys: [] };

  const groups = groupRows(rows, spec.dimension, spec.grain);
  let data: ChartRow[];
  let dataKeys: string[];

  if (spec.series && measures.length === 1) {
    // Pivot: one column per legend value, keeping the biggest MAX_SERIES.
    // ponytail: the rest are dropped, not folded into an "Other" bucket.
    const m = measures[0];
    const totals = [...groupRows(rows, spec.series)]
      .map(([key, rs]) => [key, measureValue(rs, m) ?? 0] as const)
      .sort((a, b) => b[1] - a[1]);
    dataKeys = totals.slice(0, MAX_SERIES).map(([key]) => key);
    data = [...groups].map(([name, rs]) => {
      const bySeries = groupRows(rs, spec.series!);
      const row: ChartRow = { name };
      for (const key of dataKeys) row[key] = bySeries.has(key) ? measureValue(bySeries.get(key)!, m) : null;
      return row;
    });
  } else {
    dataKeys = measures.map(m => measureKey(m, measures));
    data = [...groups].map(([name, rs]) => {
      const row: ChartRow = { name };
      measures.forEach((m, i) => { row[dataKeys[i]] = measureValue(rs, m); });
      return row;
    });
  }

  // Time reads left to right; everything else defaults to biggest first.
  const sort = spec.sort ?? (spec.grain ? 'label' : 'value-desc');
  const total = (r: ChartRow) => dataKeys.reduce((n, k) => n + (Number(r[k]) || 0), 0);
  if (sort === 'label') {
    data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  } else {
    data.sort((a, b) => (sort === 'value-asc' ? total(a) - total(b) : total(b) - total(a)));
  }

  // A time axis shows the whole range by default; a top-N cut would drop the latest periods.
  const limit = spec.limit ?? (spec.grain ? 0 : DEFAULT_LIMIT);
  return { data: data.slice(0, limit > 0 ? Math.min(limit, MAX_CATEGORIES) : MAX_CATEGORIES), dataKeys };
}

export interface RepeatingColumn {
  name: string;
  uniqueCount: number;
  totalCount: number;
  repetitionRatio: number;
  topValues: { value: string; count: number; percentage: number }[];
}

/** Tally one column's value distribution, regardless of any threshold. */
export function computeColumnRepetition(
  colName: string,
  data: Record<string, any>[]
): RepeatingColumn {
  const counts: Record<string, number> = {};
  data.forEach(row => {
    const v = row[colName];
    if (v !== null && v !== undefined && v !== '') counts[String(v)] = (counts[String(v)] || 0) + 1;
  });
  const entries = Object.entries(counts);
  const uniqueCount = entries.length;
  const totalCount = data.length;
  return {
    name: colName,
    uniqueCount,
    totalCount,
    repetitionRatio: 1 - (uniqueCount / Math.max(totalCount, 1)),
    topValues: entries.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({
      value, count, percentage: Math.round((count / totalCount) * 100),
    })),
  };
}

/** Columns whose values repeat enough to be worth surfacing unprompted. */
export function computeRepeatingColumns(
  columns: ColumnMeta[],
  data: Record<string, any>[]
): RepeatingColumn[] {
  return columns
    .filter(col => col.type !== 'id')
    .map(col => computeColumnRepetition(col.name, data))
    .filter(c => c.repetitionRatio > 0.3 && c.uniqueCount <= 50 && c.uniqueCount >= 2)
    .sort((a, b) => b.repetitionRatio - a.repetitionRatio);
}

export function computeNumericInsights(columns: ColumnMeta[]): ColumnMeta[] {
  return columns.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats);
}

export function computeDataQuality(columns: ColumnMeta[]) {
  return columns
    .map(col => ({
      name: col.name,
      completeness: Math.round(((col.totalCount - col.nullCount) / col.totalCount) * 100),
      nullCount: col.nullCount,
    }))
    .filter(c => c.nullCount > 0);
}

/* ─── Insight table shapes: rendered by SmartInsights, rebuilt by deriveDashboardItem ─── */

export function statsTable(columns: ColumnMeta[], t: TFn) {
  return {
    data: computeNumericInsights(columns).map(c => ({
      [t('columns')]: c.name,
      [t('min')]: c.stats!.min.toFixed(1),
      [t('max')]: c.stats!.max.toFixed(1),
      [t('mean')]: c.stats!.mean.toFixed(2),
      [t('median')]: c.stats!.median.toFixed(1),
      [t('stdDev')]: c.stats!.stdDev.toFixed(2),
    })),
    columns: [t('columns'), t('min'), t('max'), t('mean'), t('median'), t('stdDev')],
  };
}

export function qualityTable(columns: ColumnMeta[], t: TFn) {
  return {
    data: computeDataQuality(columns).map(c => ({
      [t('columns')]: c.name,
      [`${t('complete')} %`]: `${c.completeness}%`,
      [t('nullValues')]: c.nullCount,
    })),
    columns: [t('columns'), `${t('complete')} %`, t('nullValues')],
  };
}

export function repeatTable(col: RepeatingColumn, t: TFn) {
  return {
    data: col.topValues.map(v => ({ [t('topValues')]: v.value, [t('count')]: v.count, '%': `${v.percentage}%` })),
    columns: [t('topValues'), t('count'), '%'],
  };
}

/** Insight tables carry stable ids assigned in SmartInsights; a duplicate
    appends `-copy-<ts>`, which is stripped so it rebuilds like the original. */
function rebuildTable(cardId: string, columns: ColumnMeta[], data: Record<string, any>[], t: TFn) {
  const id = cardId.replace(/(-copy-\d+)+$/, '');
  if (id === 'insight-stats-table') return statsTable(columns, t);
  if (id === 'insight-quality-table') return qualityTable(columns, t);
  if (id.startsWith('insight-repeat-table-')) {
    return repeatTable(computeColumnRepetition(id.slice('insight-repeat-table-'.length), data), t);
  }
  return null;
}

/**
 * Rebuild one card against the filtered dataset. No recipe (a session saved
 * before recipes existed) → keep the stored snapshot. Recipe that no longer
 * resolves → empty, which renders the existing "no data" state.
 */
function deriveDashboardItem(
  item: DashboardItem,
  suggestions: ChartSuggestion[],
  columns: ColumnMeta[],
  data: Record<string, any>[],
  t: TFn
): DashboardItem {
  if (item.displayAs === 'kpi') {
    return { ...item, kpiValue: computeKpiValue(data, item.kpiSpec) };
  }

  if (item.displayAs === 'insight') {
    if (item.insightType === 'stats') return { ...item, insightContent: computeNumericInsights(columns) };
    if (item.insightType === 'quality') return { ...item, insightContent: computeDataQuality(columns) };
    if (item.insightType === 'repeating') {
      const colName = item.insightContent?.name;
      /* Recomputed directly, not looked up in computeRepeatingColumns(): a filter
         can push a column below the "repeating" threshold while its distribution
         is still real, and the card was placed deliberately. */
      return colName ? { ...item, insightContent: computeColumnRepetition(colName, data) } : item;
    }
    return item;
  }

  if (item.displayAs === 'table') {
    const rebuilt = rebuildTable(item.id, columns, data, t);
    return rebuilt ? { ...item, data: rebuilt.data, tableColumns: rebuilt.columns } : item;
  }

  if (item.spec) {
    const { data: d, dataKeys } = aggregateChart(data, toChartSpec(item.spec, item.type));
    return { ...item, data: d, dataKeys };
  }

  if (item.sourceKey) {
    const match = suggestions.find(s => s.key === item.sourceKey);
    if (!match) return { ...item, data: [] };
    return { ...item, data: match.data, dataKeys: match.dataKeys, xKey: match.xKey };
  }

  return item;
}

/** Map a whole dashboard onto the filtered dataset, preserving order. */
export function deriveDashboardItems(
  items: DashboardItem[],
  suggestions: ChartSuggestion[],
  columns: ColumnMeta[],
  data: Record<string, any>[],
  t: TFn
): DashboardItem[] {
  return items.map(item => deriveDashboardItem(item, suggestions, columns, data, t));
}

/* ─── KPI cards ─── */

export type KpiAgg = 'count' | 'sum' | 'average' | 'min' | 'max' | 'median' | 'distinct';

/** How a KPI card was specified. `column: null` means "count the rows". */
export interface KpiSpec {
  column: string | null;
  agg: KpiAgg;
}

const compactNumber = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 });

/** i18n key for an aggregation's label ("distinct" is "distinctCount" there). */
export const aggKey = (a: KpiAgg) => (a === 'distinct' ? 'distinctCount' : a) as Exclude<KpiAgg, 'distinct'> | 'distinctCount';

/** Aggregations that read a numeric column; the rest work on any column. */
export const NUMERIC_KPI_AGGS: KpiAgg[] = ['sum', 'average', 'min', 'max', 'median'];

/**
 * One aggregate over a column's raw cells. Blank cells are ignored; numeric
 * aggregations skip anything that isn't a number. null = nothing to aggregate.
 */
export function aggregateValues(values: unknown[], agg: KpiAgg): number | null {
  const present = values.filter(v => v != null && v !== '');
  if (agg === 'count') return present.length;
  if (agg === 'distinct') return new Set(present.map(String)).size;

  /* Filter before coercing: Number(null) and Number('') are 0, not NaN, so a
     blank cell would otherwise be counted as a real zero and drag the mean. */
  const nums = present.map(Number).filter(n => !isNaN(n));
  if (!nums.length) return null;

  switch (agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'average': return nums.reduce((a, b) => a + b, 0) / nums.length;
    /* reduce, not Math.min(...nums): spreading 100k+ values overflows the stack. */
    case 'min': return nums.reduce((a, b) => (b < a ? b : a));
    case 'max': return nums.reduce((a, b) => (b > a ? b : a));
    case 'median': {
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = sorted.length >> 1;
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
  }
}

/**
 * A KPI's headline number, recomputed against the filtered rows on every
 * render pass — same contract as a chart's `data`, never persisted.
 */
export function computeKpiValue(data: Record<string, any>[], spec?: KpiSpec): string {
  if (!spec) return '—';
  const n = spec.column ? aggregateValues(data.map(r => r[spec.column!]), spec.agg) : data.length;
  return n === null ? '—' : compactNumber.format(n);
}

/** Stable card id, so Quick Add can tell an already-placed metric from a new one. */
export function kpiCardId(spec: KpiSpec): string {
  return `kpi:${spec.column ?? '__rows'}:${spec.agg}`;
}
