import { bucketDate, type ColumnMeta } from '@/lib/data-analyzer';
import type { CardSize } from '@/lib/layout';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import type { PivotSpec } from '@/lib/pivot';
import {
  computeNumericInsights, computeRepeatingColumns, computeDataQuality, kpiTitle, specTitle, sparkGrain,
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
  // Title line + a facts line (a snapshot at build time: it is an ordinary editable text card).
  const header = () => {
    const days = date ? data.map(r => bucketDate(r[date.name], 'day')).filter((d): d is string => !!d).sort() : [];
    const facts = [`${data.length.toLocaleString()} ${t('rows')}`, `${cols.length} ${t('columns').toLowerCase()}`, days.length && `${days[0]} → ${days[days.length - 1]}`].filter(Boolean).join(' · ');
    items.push({ id: '', title, type: 'bar', ...base, displayAs: 'text', text: `${title}\n${facts}`, size: 'lg' });
  };
  // A KPI row fills the 12 columns: 4 tiles of 3, or 3 of 4.
  const kpis = (specs: KpiSpec[]) => specs.forEach(spec =>
    items.push({ id: '', title: kpiTitle(spec, t), type: 'bar', ...base, displayAs: 'kpi', kpiSpec: spec, size: specs.length === 3 ? 'sm' : 'xs' }));
  const chart = (type: ChartType, spec: Omit<ChartSpec, 'v'>, size: CardSize = 'md') =>
    // No xKey: like every recipe chart, it falls back to 'name' (an empty one blanks the category axis).
    items.push({ id: '', title: specTitle(spec, t), type, data: [], dataKeys: [], spec: { v: 2, ...spec }, size });
  // The pivot title word lives in the dashboard dictionary, which this t cannot reach: title it like a chart.
  const pivot = (pivotSpec: PivotSpec, size: CardSize = 'md') => items.push({ id: '', title: specTitle({ measures: [pivotSpec.value], dimension: pivotSpec.rows }, t), type: 'bar', ...base, displayAs: 'pivot', pivotSpec, size });
  // Sum where adding up makes sense, otherwise the average.
  const agg = (c: ColumnMeta) => (c.stats?.isSummable ? 'sum' : 'average') as 'sum' | 'average';
  const rows = { column: null, agg: 'count' } as const;

  if (id === 'sales') {
    header();
    // The headline stays the all-rows total; the sparkline shows how it got there.
    const spark = date && { column: date.name, grain: sparkGrain(data, date.name) };
    kpis([...measures.slice(0, 3).map((m): KpiSpec => ({ column: m.name, agg: agg(m), ...(spark && { spark }) })), { ...rows, ...(spark && { spark }) }].slice(0, 4));
    const [c0, c1, c2] = cats;
    const m = { column: m1.name, agg: agg(m1) };
    const top = (c: ColumnMeta): [ChartType, Omit<ChartSpec, 'v'>] => ['horizontalBar', { dimension: c.name, measures: [m], sort: 'value-desc', limit: 10 }];
    if (date) {
      chart(m2 ? 'combo' : 'area', { dimension: date.name, grain: 'month', measures: [m1, m2].filter(Boolean).map(x => ({ column: x.name, agg: agg(x) })) }, 'lg');
    }
    // Half-width cards in pairs; a lone last one goes full width. A lone first one gets a donut (the share view) beside it.
    const cards: [ChartType, Omit<ChartSpec, 'v'>][] = [];
    if (c0) {
      cards.push(top(c0));
      // One series per category, so only when they all fit the legend (MAX_SERIES).
      if (date && c0.uniqueCount <= 8) cards.push(['bar', { dimension: date.name, grain: 'month', measures: [m], series: c0.name, stacked: true }]);
    }
    if (c1) cards.push(top(c1));
    if (c2) cards.push(['donut', { dimension: c2.name, measures: [m], sort: 'value-desc', limit: 8 }]);
    if (cards.length === 1) cards.push(['donut', { dimension: c0.name, measures: [m], sort: 'value-desc', limit: 8 }]);
    cards.forEach(([type, spec], n) => chart(type, spec, cards.length % 2 && n === cards.length - 1 ? 'lg' : 'md'));
    if (c1) pivot({ rows: c0.name, cols: c1.name, value: m, heat: true }, 'lg');
  } else if (id === 'trends') {
    header();
    kpis(measures.slice(0, 3).map((m): KpiSpec => ({ column: m.name, agg: agg(m), compare: { column: date!.name, grain: 'month' } })));
    measures.slice(0, 2).forEach(m => chart('area', { dimension: date!.name, grain: 'month', measures: [{ column: m.name, agg: agg(m) }] }));
    chart('bar', { dimension: date!.name, grain: 'quarter', measures: [rows] });
    // ponytail: pivot row dates are bucketed by month with no cap beyond PIVOT_MAX_ROWS; long histories show the first 50 months
    if (cats[0]) pivot({ rows: date!.name, rowGrain: 'month', cols: cats[0].name, value: { column: m1.name, agg: agg(m1) }, heat: true }, 'lg');
  } else {
    kpis([rows]);
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
