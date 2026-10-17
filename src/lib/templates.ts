import type { ColumnMeta } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import type { PivotSpec } from '@/lib/pivot';
import {
  computeNumericInsights, computeRepeatingColumns, computeDataQuality, kpiTitle, specTitle,
  type ChartSpec, type KpiSpec, type TFn,
} from '@/lib/derive-dashboard-item';

export type TemplateId = 'sales' | 'trends' | 'profile';
export const TEMPLATE_IDS: TemplateId[] = ['sales', 'trends', 'profile'];

/** The columns a template is built from: first date, numeric measures (summable first), low-cardinality categories. */
export function templateRoles(cols: ColumnMeta[]) {
  const numeric = cols.filter(c => c.type === 'numeric');
  return {
    date: cols.find(c => c.type === 'date'),
    measures: [...numeric.filter(c => c.stats?.isSummable), ...numeric.filter(c => !c.stats?.isSummable)],
    cats: cols.filter(c => c.type === 'categorical' && c.uniqueCount <= 20),
  };
}

/** null = the template does not fit these columns (the UI shows why it is disabled). */
export function templateIssue(id: TemplateId, cols: ColumnMeta[]): 'needsMeasure' | 'needsDate' | null {
  const { date, measures } = templateRoles(cols);
  if (id !== 'profile' && !measures.length) return 'needsMeasure';
  return id === 'trends' && !date ? 'needsDate' : null;
}

/** A starter board of ordinary recipe cards (ids are positional, so the same columns always give the same board). */
export function buildTemplate(id: TemplateId, cols: ColumnMeta[], data: Record<string, any>[], title: string, t: TFn): DashboardItem[] {
  const { date, measures, cats } = templateRoles(cols);
  const [m1, m2] = measures;
  const items: DashboardItem[] = [];
  const base = { data: [], dataKeys: [], xKey: '' };
  const header = () => items.push({ id: '', title, type: 'bar', ...base, displayAs: 'text', text: title, size: 'lg' });
  const kpi = (spec: KpiSpec) => items.push({ id: '', title: kpiTitle(spec, t), type: 'bar', ...base, displayAs: 'kpi', kpiSpec: spec, size: 'xs' });
  const chart = (type: ChartType, spec: Omit<ChartSpec, 'v'>) =>
    // No xKey: like every recipe chart, it falls back to 'name' (an empty one blanks the category axis).
    items.push({ id: '', title: specTitle(spec, t), type, data: [], dataKeys: [], spec: { v: 2, ...spec }, size: 'md' });
  // The pivot title word lives in the dashboard dictionary, which this t cannot reach: title it like a chart.
  const pivot = (pivotSpec: PivotSpec) => items.push({ id: '', title: specTitle({ measures: [pivotSpec.value], dimension: pivotSpec.rows }, t), type: 'bar', ...base, displayAs: 'pivot', pivotSpec, size: 'md' });
  // Sum where adding up makes sense, otherwise the average.
  const agg = (c: ColumnMeta) => (c.stats?.isSummable ? 'sum' : 'average') as 'sum' | 'average';
  const rows = { column: null, agg: 'count' } as const;

  if (id === 'sales') {
    header();
    [m1, m2].forEach(m => m && kpi({ column: m.name, agg: agg(m) }));
    kpi(rows);
    if (date) {
      chart(m2 ? 'combo' : 'area', { dimension: date.name, grain: 'month', measures: [m1, m2].filter(Boolean).map(m => ({ column: m.name, agg: agg(m) })) });
    }
    if (cats[0]) {
      chart('horizontalBar', { dimension: cats[0].name, measures: [{ column: m1.name, agg: agg(m1) }], sort: 'value-desc', limit: 10 });
      chart('donut', { dimension: cats[0].name, measures: [{ column: m1.name, agg: agg(m1) }], sort: 'value-desc', limit: 8 });
    }
    if (cats[1]) pivot({ rows: cats[0].name, cols: cats[1].name, value: { column: m1.name, agg: agg(m1) }, heat: true });
  } else if (id === 'trends') {
    header();
    measures.slice(0, 3).forEach(m => kpi({ column: m.name, agg: agg(m), compare: { column: date!.name, grain: 'month' } }));
    measures.slice(0, 2).forEach(m => chart('area', { dimension: date!.name, grain: 'month', measures: [{ column: m.name, agg: agg(m) }] }));
    chart('bar', { dimension: date!.name, grain: 'quarter', measures: [rows] });
    // ponytail: pivot row dates are bucketed by month with no cap beyond PIVOT_MAX_ROWS; long histories show the first 50 months
    if (cats[0]) pivot({ rows: date!.name, rowGrain: 'month', cols: cats[0].name, value: { column: m1.name, agg: agg(m1) }, heat: true });
  } else {
    kpi(rows);
    cols.filter(c => c.type === 'categorical' || c.type === 'range').slice(0, 4)
      .forEach(c => chart('bar', { dimension: c.name, measures: [rows], limit: 15 }));
    const numeric = computeNumericInsights(cols);
    if (numeric.length) {
      items.push({ id: 'insight-stats-chart', title: t('columnStats'), description: '', type: 'bar', ...base, displayAs: 'insight', insightType: 'stats', insightContent: numeric, size: 'lg' });
    }
    computeRepeatingColumns(cols, data).slice(0, 2).forEach(col => items.push({
      id: `insight-repeat-chart-${col.name}`, title: `${col.name}${t('repeatingValuesSuffix')}`, description: '',
      type: 'bar', ...base, displayAs: 'insight', insightType: 'repeating', insightContent: col,
    }));
    const quality = computeDataQuality(cols);
    if (quality.length) {
      items.push({ id: 'insight-quality-chart', title: t('dataQuality'), description: '', type: 'bar', ...base, displayAs: 'insight', insightType: 'quality', insightContent: quality });
    }
  }
  // Insight cards keep the ids the default board gives them (repeatColumnOf reads the column from the id).
  return items.map((item, n) => (item.id ? item : { ...item, id: `tpl:${id}:${n}` }));
}
