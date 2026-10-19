import { describe, it, expect } from 'vitest';
import { analyzeColumns, generateChartSuggestions, bucketDate, type ColumnMeta } from './data-analyzer';
import { buildDefaultDashboard } from './build-default-dashboard';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartFormat } from './format';
import {
  deriveDashboardItems, crossDimensionOf, drillBaseOf, computeKpiValue, computeKpiCompare, kpiSparkPoints, sparkGrain, aggregateChart, toChartSpec, specFromSourceKey, MAX_SERIES, MAX_MEASURES,
  specForField, addFieldToSpec, specTitle, kpiTitle, kpiCardId, aggsForColumn, normalizeAgg,
  retargetKpi, retargetRepeat, repeatColumnOf, type ChartSpec, type DateGrain, type KpiAgg, type KpiSpec,
} from './derive-dashboard-item';

const t = ((k: string) => k) as any;

const DATA = [
  { Region: 'North', Rep: 'Ann', Sales: 100 },
  { Region: 'North', Rep: 'Bob', Sales: 80 },
  { Region: 'South', Rep: 'Ann', Sales: 250 },
  { Region: 'South', Rep: 'Cy',  Sales: 300 },
  { Region: 'East',  Rep: 'Bob', Sales: 50 },
  { Region: 'East',  Rep: 'Cy',  Sales: 70 },
];

/** Mirrors DashboardApp's filter + re-analyse pipeline. */
function applyFilter(filters: Record<string, string>) {
  const data = DATA.filter(r => Object.entries(filters).every(([c, v]) => String((r as any)[c]) === v));
  const columns = analyzeColumns(data);
  return { data, columns, suggestions: generateChartSuggestions(data, columns) };
}

describe('dashboard cards follow the active filters', () => {
  const base = applyFilter({});
  // Suggestion cards (sourceKey recipes) are what a legacy session or the Add panel holds; the default board now starts from a template.
  const suggestionCards: DashboardItem[] = base.suggestions.slice(0, 6).map(c => ({
    id: c.id, title: c.title, type: c.type, data: c.data, dataKeys: c.dataKeys, xKey: c.xKey, sourceKey: c.key, size: 'md',
  }));
  const items = [...suggestionCards, ...buildDefaultDashboard(DATA, base.columns, base.suggestions, t).items.filter(i => i.displayAs === 'insight')];

  it('seeds every suggestion-derived card with a rebuildable recipe', () => {
    const charts = items.filter(i => !i.displayAs);
    expect(charts.length).toBeGreaterThan(0);
    expect(charts.every(c => typeof c.sourceKey === 'string' && c.sourceKey.length > 0)).toBe(true);
  });

  it('re-derives card data when a filter narrows the dataset', () => {
    const narrowed = applyFilter({ Region: 'North' });
    const live = deriveDashboardItems(items, narrowed.suggestions, narrowed.columns, narrowed.data, t);

    const before = items.find(i => i.sourceKey?.startsWith('dist:Rep'));
    const after = live.find(i => i.sourceKey?.startsWith('dist:Rep'));
    expect(before).toBeDefined();
    expect(after).toBeDefined();

    // Unfiltered: 3 reps. Filtered to North: only Ann and Bob remain.
    const total = (rows: any[]) => rows.reduce((n, r) => n + (r.count ?? 0), 0);
    expect(total(before!.data)).toBe(DATA.length);
    expect(total(after!.data)).toBe(narrowed.data.length);
    expect(after!.data.map((r: any) => r.name).sort()).toEqual(['Ann', 'Bob']);
  });

  it('keeps user-owned fields while replacing the numbers', () => {
    const edited = items.map(i => ({ ...i, title: 'My title', size: 'lg' as const }));
    const narrowed = applyFilter({ Region: 'South' });
    const live = deriveDashboardItems(edited, narrowed.suggestions, narrowed.columns, narrowed.data, t);
    expect(live.every(i => i.title === 'My title' && i.size === 'lg')).toBe(true);
    expect(live.map(i => i.id)).toEqual(edited.map(i => i.id));
  });

  it('empties a card whose chart no longer exists rather than showing stale numbers', () => {
    // Filtering to a single region leaves Region with one category, so the
    // Region distribution chart is no longer generated at all.
    const narrowed = applyFilter({ Region: 'North' });
    expect(narrowed.suggestions.some(s => s.key === 'dist:Region')).toBe(false);
    const stale = items.find(i => i.sourceKey === 'dist:Region')!;
    expect(stale).toBeDefined();
    // dist:Region has a recipe, so it is re-aggregated (one bar) rather than looked up.
    const live = deriveDashboardItems([stale], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    expect(live[0].data).toEqual([{ name: 'North', count: 2 }]);
    // A key with no recipe (scatter) is still looked up in the suggestions, and empties when absent.
    const scatter = { ...stale, sourceKey: 'scatter:Sales:Gone' };
    expect(deriveDashboardItems([scatter], narrowed.suggestions, narrowed.columns, narrowed.data, t)[0].data).toEqual([]);
  });

  it('rebuilds custom charts from their spec', () => {
    const custom = {
      id: 'manual-1', title: 'Sales by Region', type: 'bar' as const,
      data: [], dataKeys: ['value'],
      spec: { xCol: 'Region', yCol: 'Sales', aggregation: 'sum' as const },
    };
    const all = deriveDashboardItems([custom], base.suggestions, base.columns, DATA, t);
    expect(all[0].data).toEqual([
      { name: 'South', value: 550 }, { name: 'East', value: 120 }, { name: 'North', value: 180 },
    ].sort((a, b) => b.value - a.value));

    const narrowed = applyFilter({ Region: 'South' });
    const live = deriveDashboardItems([custom], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    expect(live[0].data).toEqual([{ name: 'South', value: 550 }]);
  });

  it('rebuilds insight cards against the filtered data', () => {
    const card = items.find(i => i.insightType === 'stats')!;
    expect(card).toBeDefined();
    const narrowed = applyFilter({ Region: 'South' });
    const live = deriveDashboardItems([card], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    const stats = (live[0].insightContent as any[]).find(c => c.name === 'Sales');
    expect(stats.stats.max).toBe(300);
    expect(stats.stats.min).toBe(250);
  });

  it('keeps reporting real numbers when a column stops qualifying as repeating', () => {
    const card = {
      id: 'insight-repeat-chart-Region', title: 'Region', type: 'bar' as const,
      data: [], dataKeys: [], xKey: '',
      displayAs: 'insight' as const, insightType: 'repeating' as const,
      insightContent: { name: 'Region', uniqueCount: 3, totalCount: 6, repetitionRatio: 0.5, topValues: [] },
    };
    // Filtering to one region drops Region below the "repeating" threshold. The
    // card must show that column's actual filtered tally, not zeros and not the
    // pre-filter counts it was built with.
    const narrowed = applyFilter({ Region: 'North' });
    const live = deriveDashboardItems([card], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    const c = live[0].insightContent as any;
    expect(c.totalCount).toBe(2);
    expect(c.uniqueCount).toBe(1);
    expect(c.topValues).toEqual([{ value: 'North', count: 2, percentage: 100 }]);
  });

  it('rebuilds insight tables against the filtered data', () => {
    const card = {
      id: 'insight-repeat-table-Rep', title: 'Rep', type: 'bar' as const,
      data: [], dataKeys: [], xKey: '', displayAs: 'table' as const,
      tableColumns: ['topValues', 'count', '%'],
    };
    const narrowed = applyFilter({ Region: 'South' });
    const live = deriveDashboardItems([card], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    // South has Ann and Cy, one row each.
    expect(live[0].data.map((r: any) => r['topValues']).sort()).toEqual(['Ann', 'Cy']);
    expect(live[0].data.every((r: any) => r['count'] === 1)).toBe(true);
  });

  it('rebuilds a duplicated insight table like its original', () => {
    const narrowed = applyFilter({ Region: 'South' });
    const table = { title: '', type: 'bar' as const, data: [], dataKeys: [], xKey: '', displayAs: 'table' as const };
    const [repeat, stats] = deriveDashboardItems([
      { ...table, id: 'insight-repeat-table-Rep-copy-1700000000000' },
      { ...table, id: 'insight-stats-table-copy-1700000000000-copy-1700000000001' },
    ], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    expect(repeat.data.map((r: any) => r['topValues']).sort()).toEqual(['Ann', 'Cy']);
    expect(stats.data.length).toBeGreaterThan(0);
  });

});

describe('computeKpiValue', () => {
  const rows = [{ v: 10 }, { v: 20 }, { v: 30 }, { v: 40 }, { v: null }];

  it('counts rows when no column is given', () => {
    expect(computeKpiValue(rows, { column: null, agg: 'count' })).toBe('5');
  });

  it('counts only non-empty cells for a column', () => {
    expect(computeKpiValue(rows, { column: 'v', agg: 'count' })).toBe('4');
  });

  it('aggregates a numeric column', () => {
    expect(computeKpiValue(rows, { column: 'v', agg: 'sum' })).toBe('100');
    expect(computeKpiValue(rows, { column: 'v', agg: 'average' })).toBe('25');
    expect(computeKpiValue(rows, { column: 'v', agg: 'min' })).toBe('10');
    expect(computeKpiValue(rows, { column: 'v', agg: 'max' })).toBe('40');
    // even count -> mean of the two middle values
    expect(computeKpiValue(rows, { column: 'v', agg: 'median' })).toBe('25');
  });

  it('handles min/max over columns too large to spread into Math.min', () => {
    const big = Array.from({ length: 300_000 }, (_, i) => ({ v: i }));
    expect(computeKpiValue(big, { column: 'v', agg: 'min' })).toBe('0');
    expect(computeKpiValue(big, { column: 'v', agg: 'max' })).toBe(computeKpiValue([{ v: 299_999 }], { column: 'v', agg: 'max' }));
    expect(() => analyzeColumns(big)).not.toThrow();
  });

  it('counts distinct values', () => {
    expect(computeKpiValue([{ c: 'a' }, { c: 'a' }, { c: 'b' }, { c: '' }], { column: 'c', agg: 'distinct' })).toBe('2');
  });

  it('renders a dash rather than NaN when nothing is numeric', () => {
    expect(computeKpiValue([{ c: 'x' }], { column: 'c', agg: 'sum' })).toBe('—');
    expect(computeKpiValue([], { column: 'v', agg: 'average' })).toBe('—');
    expect(computeKpiValue([{ c: 'x' }], { column: 'c', agg: 'sum' }, { number: 'currency' })).toBe('—');
  });

  describe('with a card format', () => {
    const kpi = (rows: Record<string, unknown>[], f?: ChartFormat, agg: KpiSpec['agg'] = 'sum') =>
      computeKpiValue(rows, { column: 'v', agg }, f);
    const big = [{ v: 1_234_567 }];

    it('is identical to no format when number and decimals are unset', () => {
      expect(kpi(big)).toBe(computeKpiValue(big, { column: 'v', agg: 'sum' }));
      expect(kpi(big, {})).toBe(kpi(big));
      expect(kpi(big, { number: undefined, decimals: undefined, legend: 'none' })).toBe(kpi(big));
    });

    it('decimals alone sets the compact precision', () => {
      expect(kpi(big, { decimals: 0 })).toBe(new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 0 }).format(1_234_567));
      expect(kpi(big, { decimals: 0 })).not.toBe(kpi(big));
    });

    it('auto shows the full locale number', () => {
      expect(kpi(big, { number: 'auto' })).toBe((1_234_567).toLocaleString());
    });

    it('percent treats a fraction column as a ratio', () => {
      expect(kpi([{ v: 0.25 }, { v: 0.5 }], { number: 'percent', decimals: 1 }, 'average')).toBe(
        new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(0.375),
      );
    });

    it('currency uses the chosen code', () => {
      expect(kpi([{ v: 1234.5 }], { number: 'currency', currency: 'EUR', decimals: 2 })).toBe(
        new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(1234.5),
      );
    });
  });
});

describe('KPI cards follow filters', () => {
  it('recomputes the headline number against the filtered rows', () => {
    const all = applyFilter({});
    const seeded = buildDefaultDashboard(DATA, all.columns, all.suggestions, t).items;

    const live = deriveDashboardItems(seeded, all.suggestions, all.columns, all.data, t);
    const kpi = live.find(i => i.displayAs === 'kpi' && i.kpiSpec?.column === null);
    expect(kpi?.kpiValue).toBe('6');

    const north = applyFilter({ Region: 'North' });
    const narrowed = deriveDashboardItems(seeded, north.suggestions, north.columns, north.data, t);
    expect(narrowed.find(i => i.id === kpi!.id)?.kpiValue).toBe('2');
  });
});

describe('default board', () => {
  it('starts from the Sales template and keeps the insight tail', () => {
    const { items } = buildDefaultDashboard(DATA, analyzeColumns(DATA), [], t);
    expect(items.some(i => i.displayAs === 'text')).toBe(false); // the workspace banner is the header
    expect(items.some(i => i.id.startsWith('tpl:sales:'))).toBe(true);
    expect(items.find(i => i.insightType === 'stats')).toBeDefined();
  });
  it('falls back to suggestion charts with no usable category or date', () => {
    const nums = Array.from({ length: 20 }, (_, i) => ({ A: i * 3.7, B: (i * 11) % 17 + 0.5 }));
    const cols = analyzeColumns(nums);
    const { items } = buildDefaultDashboard(nums, cols, generateChartSuggestions(nums, cols), t);
    expect(items.some(i => i.id.startsWith('tpl:'))).toBe(false);
    expect(items.some(i => i.displayAs === 'kpi')).toBe(true);
  });
});

describe('time trends', () => {
  const dated = Array.from({ length: 12 }, (_, i) => ({
    OrderDate: `2025-${String(i + 1).padStart(2, '0')}-05`,
    Revenue: (i + 1) * 100,
  }));

  it('emits a trend suggestion for a date column', () => {
    const cols = analyzeColumns(dated);
    expect(cols.find(c => c.name === 'OrderDate')?.type).toBe('date');

    const trend = generateChartSuggestions(dated, cols).find(s => s.key.startsWith('trend:'));
    expect(trend).toBeDefined();
    expect(trend!.data).toHaveLength(12);
    expect(trend!.data[0]).toEqual({ name: '2025-01', value: 100 });
  });
});

describe('aggregateChart', () => {
  const rows = [
    { Region: 'North', Rep: 'Ann', Sales: 100, Date: '2025-01-15' },
    { Region: 'North', Rep: 'Bob', Sales: 80, Date: '2025-01-31' },
    { Region: 'South', Rep: 'Ann', Sales: 250, Date: '2025-02-01' },
    { Region: 'South', Rep: 'Cy', Sales: 300, Date: '2025-04-10' },
    { Region: 'East', Rep: 'Bob', Sales: 50, Date: '2026-01-05' },
    { Region: 'East', Rep: 'Cy', Sales: null, Date: 'not a date' },
  ];
  const spec = (s: Partial<ChartSpec>): ChartSpec => ({ v: 2, dimension: 'Region', measures: [{ column: 'Sales', agg: 'sum' }], ...s });

  it('aggregates several measures side by side', () => {
    const { data, dataKeys } = aggregateChart(rows, spec({
      measures: [{ column: 'Sales', agg: 'sum' }, { column: 'Sales', agg: 'max' }, { column: null, agg: 'count' }],
    }));
    expect(dataKeys).toEqual(['Sales (sum)', 'Sales (max)', 'Rows (count)']);
    expect(data[0]).toEqual({ name: 'South', 'Sales (sum)': 550, 'Sales (max)': 300, 'Rows (count)': 2 });
  });

  it('pivots a legend column into one series per value', () => {
    const { data, dataKeys } = aggregateChart(rows, spec({ series: 'Rep' }));
    expect(dataKeys.sort()).toEqual(['Ann', 'Bob', 'Cy']);
    expect(data.find(r => r.name === 'North')).toEqual({ name: 'North', Ann: 100, Bob: 80, Cy: null });
  });

  it('caps the legend at the biggest series', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ Region: 'X', Rep: `R${i}`, Sales: i }));
    const { dataKeys } = aggregateChart(many, spec({ series: 'Rep' }));
    expect(dataKeys).toHaveLength(MAX_SERIES);
    expect(dataKeys[0]).toBe('R11');
  });

  it('buckets dates by grain, in time order, skipping non-dates', () => {
    const names = (grain: DateGrain) => aggregateChart(rows, spec({ dimension: 'Date', grain })).data.map(r => r.name);
    expect(names('month')).toEqual(['2025-01', '2025-02', '2025-04', '2026-01']);
    expect(names('quarter')).toEqual(['2025-Q1', '2025-Q2', '2026-Q1']);
    expect(names('year')).toEqual(['2025', '2026']);
    expect(names('day')).toHaveLength(5);
    // 2025-01-31 is a Friday → its week starts Monday 27 Jan.
    expect(names('week')).toContain('2025-01-27');
  });

  it('sorts and limits', () => {
    const names = (s: Partial<ChartSpec>) => aggregateChart(rows, spec(s)).data.map(r => r.name);
    expect(names({})).toEqual(['South', 'North', 'East']);
    expect(names({ sort: 'value-asc' })).toEqual(['East', 'North', 'South']);
    expect(names({ sort: 'label' })).toEqual(['East', 'North', 'South']);
    expect(names({ limit: 2 })).toEqual(['South', 'North']);
  });

  it('supports min, max, median and distinct', () => {
    const one = (agg: KpiAgg, column = 'Sales') => aggregateChart(rows, spec({ measures: [{ column, agg }], sort: 'label' })).data;
    expect(one('min').map(r => r.value)).toEqual([50, 80, 250]);
    expect(one('median').map(r => r.value)).toEqual([50, 90, 275]);
    expect(one('distinct', 'Rep').map(r => r.value)).toEqual([2, 2, 2]);
  });

  it('reads a legacy {xCol, yCol, aggregation} spec unchanged', () => {
    expect(toChartSpec({ xCol: 'Region', yCol: 'Sales', aggregation: 'average' }, 'bar'))
      .toEqual({ v: 2, dimension: 'Region', measures: [{ column: 'Sales', agg: 'average' }] });
    // The old builder always counted for pies.
    expect(toChartSpec({ xCol: 'Region', yCol: 'Sales', aggregation: 'sum' }, 'pie').measures)
      .toEqual([{ column: null, agg: 'count' }]);
  });
});

describe('bucketDate', () => {
  it('reads ISO dates without a timezone shift', () => {
    expect(bucketDate('2025-01-01', 'day')).toBe('2025-01-01');
    expect(bucketDate('2025-03-31 23:30', 'quarter')).toBe('2025-Q1');
    expect(bucketDate('', 'month')).toBeNull();
    expect(bucketDate('nope', 'month')).toBeNull();
  });
});

describe('specFromSourceKey', () => {
  it('rebuilds every aggregate suggestion with the same numbers', async () => {
    const { sampleDataset } = await import('@/content/sample-dataset');
    const data = sampleDataset as unknown as Record<string, any>[];
    const columns = analyzeColumns(data);
    const suggestions = generateChartSuggestions(data, columns);
    const checked = suggestions.filter(s => !s.key.startsWith('scatter:'));
    expect(checked.length).toBeGreaterThan(5);

    for (const s of checked) {
      const spec = specFromSourceKey(s.key, columns);
      expect(spec, s.key).not.toBeNull();
      const rebuilt = aggregateChart(data, spec!);
      const values = (rows: any[], key: string) => rows.map(r => [r.name, r[key]]);
      // Suggestions name their value column variously (count/total/average/value).
      expect(values(rebuilt.data, rebuilt.dataKeys[0]), s.key)
        .toEqual(expect.arrayContaining(values(s.data, s.dataKeys[0])));
    }
  });

  it('has no recipe for scatter plots', () => {
    expect(specFromSourceKey('scatter:a:b', [])).toBeNull();
  });
});

describe('click-a-field helpers', () => {
  const col = (name: string, type: ColumnMeta['type'], isSummable?: boolean): ColumnMeta => ({
    name, type, uniqueCount: 3, totalCount: 10, nullCount: 0, uniqueRatio: 0.3, sampleValues: [],
    ...(isSummable === undefined ? {} : { stats: { min: 0, max: 1, mean: 1, median: 1, sum: 1, stdDev: 0, isSummable } }),
  });
  const count = { column: null, agg: 'count' } as const;
  const base: ChartSpec = { v: 2, dimension: 'Region', measures: [count] };

  it('specForField: date -> monthly line of row counts', () => {
    expect(specForField(col('When', 'date'))).toEqual({
      displayAs: 'chart', type: 'line',
      spec: { v: 2, dimension: 'When', grain: 'month', measures: [count] },
    });
  });

  it.each(['categorical', 'range', 'text'] as const)('specForField: %s -> top-20 bar of row counts', type => {
    expect(specForField(col('X', type))).toEqual({
      displayAs: 'chart', type: 'bar',
      spec: { v: 2, dimension: 'X', measures: [count], limit: 20 },
    });
  });

  it('specForField: numeric -> KPI, sum when summable else average', () => {
    expect(specForField(col('Sales', 'numeric', true))).toEqual({ displayAs: 'kpi', kpiSpec: { column: 'Sales', agg: 'sum' } });
    expect(specForField(col('Rate', 'numeric', false))).toEqual({ displayAs: 'kpi', kpiSpec: { column: 'Rate', agg: 'average' } });
  });

  it('specForField: id -> null', () => {
    expect(specForField(col('Id', 'id'))).toBeNull();
  });

  it('addFieldToSpec: replaces a lone row-count measure', () => {
    expect(addFieldToSpec(base, col('Sales', 'numeric', true)).measures).toEqual([{ column: 'Sales', agg: 'sum' }]);
  });

  it('addFieldToSpec: appends a second measure and drops series', () => {
    const one: ChartSpec = { ...base, measures: [{ column: 'Sales', agg: 'sum' }], series: 'Rep' };
    const next = addFieldToSpec(one, col('Rate', 'numeric', false));
    expect(next.measures).toEqual([{ column: 'Sales', agg: 'sum' }, { column: 'Rate', agg: 'average' }]);
    expect(next.series).toBeUndefined();
  });

  it('addFieldToSpec: respects MAX_MEASURES and never duplicates a measure', () => {
    const full: ChartSpec = {
      ...base, measures: Array.from({ length: MAX_MEASURES }, (_, i) => ({ column: `M${i}`, agg: 'sum' as const })),
    };
    expect(addFieldToSpec(full, col('Extra', 'numeric', true))).toBe(full);
    expect(addFieldToSpec(full, col('M0', 'numeric', true))).toBe(full);
  });

  it('addFieldToSpec: categorical sets series only with a single measure', () => {
    expect(addFieldToSpec(base, col('Rep', 'categorical')).series).toBe('Rep');
    const two: ChartSpec = { ...base, measures: [{ column: 'A', agg: 'sum' }, { column: 'B', agg: 'sum' }] };
    expect(addFieldToSpec(two, col('Rep', 'categorical'))).toBe(two);
  });

  it('addFieldToSpec: unchanged for the axis column, dates and ids', () => {
    expect(addFieldToSpec(base, col('Region', 'categorical'))).toBe(base);
    expect(addFieldToSpec(base, col('When', 'date'))).toBe(base);
    expect(addFieldToSpec(base, col('Id', 'id'))).toBe(base);
  });

  it('specTitle: joins measures and names the dimension', () => {
    expect(specTitle({ dimension: 'Region', measures: [{ column: null, agg: 'count' }, { column: 'Sales', agg: 'sum' }] }, t))
      .toBe('rowCount, sum Sales by Region');
  });
});

describe('KPI and repeating-value card editing', () => {
  const cols = analyzeColumns(DATA);
  const rep = (id: string, extra: Partial<DashboardItem> = {}): DashboardItem => ({ id, title: '', type: 'bar', data: [], dataKeys: [], xKey: '', ...extra });

  it('aggsForColumn / normalizeAgg follow the builder rules', () => {
    expect(aggsForColumn(cols, null)).toEqual(['count']);
    expect(aggsForColumn(cols, 'Rep')).toEqual(['count', 'distinct']);
    expect(aggsForColumn(cols, 'Sales')).toContain('median');
    expect(normalizeAgg(cols, null, 'sum')).toBe('count');
    expect(normalizeAgg(cols, 'Rep', 'sum', true)).toBe('count');
    expect(normalizeAgg(cols, 'Sales', 'count', true)).toBe('sum');
    expect(normalizeAgg(cols, 'Sales', 'count')).toBe('count');
    expect(normalizeAgg(cols, 'Sales', 'max', true)).toBe('max');
  });

  it('retargetKpi renames a generated title and canonical id, but keeps renamed titles, copies and taken ids', () => {
    const old = { column: 'Sales', agg: 'sum' as KpiAgg };
    const next = { column: null, agg: 'count' as KpiAgg };
    const card = rep(kpiCardId(old), { title: kpiTitle(old, t), kpiSpec: old });
    expect(retargetKpi(card, next, [card.id], t)).toEqual({
      patch: { kpiSpec: next, title: 'rowCount' }, newId: kpiCardId(next),
    });
    expect(retargetKpi({ ...card, title: 'Mine' }, next, [card.id], t).patch.title).toBe('Mine');
    expect(retargetKpi({ ...card, id: `${card.id}-copy-1` }, next, [], t).newId).toBeUndefined();
    expect(retargetKpi(card, next, [card.id, kpiCardId(next)], t).newId).toBeUndefined();
  });

  it('retargetRepeat handles chart insights and id-encoded tables', () => {
    const chart = rep('insight-repeat-chart-Region', {
      displayAs: 'insight', insightType: 'repeating', insightContent: { name: 'Region', topValues: [] },
      title: 'Region — repeatingValues',
    });
    expect(repeatColumnOf(chart)).toBe('Region');
    expect(retargetRepeat(chart, 'Rep', [chart.id], t)).toEqual({
      patch: { title: 'Rep — repeatingValues', insightContent: { name: 'Rep', topValues: [] } },
      newId: 'insight-repeat-chart-Rep',
    });
    // Taken target / duplicate / renamed: chart keeps its id (and a user title).
    expect(retargetRepeat(chart, 'Rep', [chart.id, 'insight-repeat-chart-Rep'], t)!.newId).toBeUndefined();
    expect(retargetRepeat({ ...chart, id: `${chart.id}-copy-5`, title: 'Mine' }, 'Rep', [], t)).toMatchObject({ patch: { insightContent: { name: 'Rep' } } });
    expect(retargetRepeat({ ...chart, title: 'Mine' }, 'Rep', [], t)!.patch.title).toBeUndefined();

    const table = rep('insight-repeat-table-Region-copy-9', { displayAs: 'table', title: 'RegionrepeatingValuesSuffix' });
    expect(repeatColumnOf(table)).toBe('Region');
    expect(retargetRepeat(table, 'Rep', [], t)).toEqual({ patch: { title: 'ReprepeatingValuesSuffix' }, newId: 'insight-repeat-table-Rep-copy-9' });
    expect(retargetRepeat(table, 'Rep', ['insight-repeat-table-Rep-copy-9'], t)).toBeNull();
    expect(repeatColumnOf(rep('insight-stats-table', { displayAs: 'table' }))).toBeNull();
  });
});

describe('sourceKey cards derive from their recipe, not the suggestion list', () => {
  // Deterministic pseudo-random, so failures are reproducible.
  let seed = 7;
  const rnd = (n: number) => (seed = (seed * 48271) % 2147483647) % n;
  const regions = ['North', 'South', 'East', 'West'];
  const channels = ['Web', 'Email', 'Phone', 'Retail', 'Partner', 'Fax', 'Chat', 'Mail', 'Kiosk', 'Event', 'Print', 'Radio'];
  const stores = Array.from({ length: 18 }, (_, i) => `Store ${String.fromCharCode(65 + i)}`); // > 15: dist is cut to 15, agg is skipped
  const ROWS = Array.from({ length: 90 }, (_, i) => ({
    OrderId: 1000 + i,
    Region: regions[rnd(4)],
    Channel: channels[rnd(12)],
    Store: stores[rnd(18)],
    Revenue: rnd(100000) / 100,
    Units: 1 + rnd(40),
    Rating: 1 + rnd(5),
    OrderDate: `2025-${String(1 + (i % 8)).padStart(2, '0')}-${String(1 + rnd(27)).padStart(2, '0')}`,
  }));

  const asCard = (s: ReturnType<typeof generateChartSuggestions>[number]): DashboardItem =>
    ({ id: s.id, title: s.title, type: s.type, data: s.data, dataKeys: s.dataKeys, xKey: s.xKey, sourceKey: s.key });

  /** Derive every sourceKey card from `rows` and compare with the suggestions regenerated from the same rows. */
  const check = (rows: typeof ROWS) => {
    const columns = analyzeColumns(rows);
    const suggestions = generateChartSuggestions(rows, columns);
    const kinds = new Set(suggestions.map(s => s.key.split(':')[0]));
    for (const s of suggestions) {
      // A card built from the unfiltered suggestion, stale data and all.
      const [live] = deriveDashboardItems([{ ...asCard(s), data: [] }], [], columns, rows, t);
      if (s.key.startsWith('scatter:')) {
        expect(live.data, s.key).toEqual([]); // no recipe: still looked up in the (empty) list
        continue;
      }
      expect(live.dataKeys, s.key).toEqual(s.dataKeys);
      // Suggestions may carry extra columns (agg has both total and average); only the plotted keys count.
      const plotted = (r: Record<string, unknown>) => ({ name: r.name, ...Object.fromEntries(s.dataKeys.map(k => [k, r[k]])) });
      /* Equal counts: the analyzer builds categories in a plain object, so integer-like labels
         ("1".."5") come out ascending, while aggregateChart keeps first-seen order. Only that
         tie order differs, so bar order is normalised for rdist; the values and the labels must match. */
      const byValue = (rows: Record<string, unknown>[]) => !s.key.startsWith('rdist:') ? rows
        : [...rows].sort((a, b) => Number(b[s.dataKeys[0]]) - Number(a[s.dataKeys[0]]) || String(a.name).localeCompare(String(b.name)));
      expect(byValue(live.data), s.key).toEqual(byValue(s.data.map(plotted)));
      expect(live.xKey, s.key).toBe(s.xKey);
    }
    return kinds;
  };

  it('matches the suggestion for every key kind', () => {
    const kinds = check(ROWS);
    expect([...kinds].sort()).toEqual(['agg', 'dist', 'pie', 'rdist', 'scatter', 'top', 'trend']);
  });

  it('keeps matching when the rows are a filtered subset', () => {
    check(ROWS.filter(r => r.Region !== 'West'));
    check(ROWS.filter(r => r.Units > 20));
  });

  it('ignores blank category cells, as the suggestions do', () => {
    const blanky = ROWS.map((r, i) => (i % 9 === 0 ? { ...r, Region: null, Channel: '' } : r)) as unknown as typeof ROWS;
    check(blanky);
  });

  it('recomputes from the rows it is given, not from the suggestions', () => {
    const columns = analyzeColumns(ROWS);
    const s = generateChartSuggestions(ROWS, columns).find(x => x.key === 'dist:Region')!;
    const subset = ROWS.filter(r => r.Region === 'North');
    const [live] = deriveDashboardItems([asCard(s)], [], columns, subset, t);
    expect(live.data).toEqual([{ name: 'North', count: subset.length }]);
  });
});

describe('filters on a single visual', () => {
  const columns = analyzeColumns(DATA);
  const derive = (items: DashboardItem[], rows = DATA) => deriveDashboardItems(items, [], columns, rows, t);
  const chart = (extra: Partial<DashboardItem> = {}): DashboardItem => ({
    id: 'c', title: 'Sales by Region', type: 'bar', data: [], dataKeys: ['value'],
    spec: { xCol: 'Region', yCol: 'Sales', aggregation: 'sum' }, ...extra,
  });
  const kpi = (extra: Partial<DashboardItem> = {}): DashboardItem => ({
    id: 'k', title: 'Sales', type: 'bar', data: [], dataKeys: [], displayAs: 'kpi', kpiSpec: { column: 'Sales', agg: 'sum' }, ...extra,
  });
  const names = (i: DashboardItem) => i.data.map((r: { name: string }) => r.name).sort();
  const rep = (...values: string[]) => ({ Rep: { kind: 'in' as const, values } });

  it('a chart spec card aggregates only the rows its filters match', () => {
    const [c] = derive([chart({ filters: rep('Ann') })]);
    expect(c.data).toEqual([{ name: 'South', value: 250 }, { name: 'North', value: 100 }]);
  });

  it('a KPI card recomputes over its own filters', () => {
    const [all, some] = derive([kpi(), kpi({ id: 'k2', filters: { Sales: { kind: 'range', min: 100 } } })]);
    expect(all.kpiValue).toBe(computeKpiValue(DATA, { column: 'Sales', agg: 'sum' }));
    expect(some.kpiValue).toBe(computeKpiValue(DATA.filter(r => r.Sales >= 100), { column: 'Sales', agg: 'sum' }));
    expect(some.kpiValue).not.toBe(all.kpiValue);
  });

  it('a sourceKey recipe card honours its filters', () => {
    const card: DashboardItem = { id: 'd', title: 'Rep', type: 'bar', data: [], dataKeys: ['count'], sourceKey: 'dist:Rep' };
    const [plain, filtered] = derive([card, { ...card, id: 'd2', filters: { Region: { kind: 'in', values: ['East'] } } }]);
    expect(names(plain)).toEqual(['Ann', 'Bob', 'Cy']);
    expect(names(filtered)).toEqual(['Bob', 'Cy']);
    expect(filtered.data.every((r: { count: number }) => r.count === 1)).toBe(true);
  });

  it('does not leak between cards', () => {
    const [a, b] = derive([chart({ filters: rep('Cy') }), chart({ id: 'c2' })]);
    expect(names(a)).toEqual(['East', 'South']);
    expect(names(b)).toEqual(['East', 'North', 'South']);
  });

  it('combines with the page-filtered rows (AND)', () => {
    const page = DATA.filter(r => r.Region !== 'East');
    const [c] = derive([chart({ filters: rep('Bob', 'Cy') })], page);
    expect(c.data).toEqual([{ name: 'South', value: 300 }, { name: 'North', value: 80 }]);
  });

  it('is unchanged without filters, and ignores an inactive one', () => {
    const [plain, inactive] = derive([chart(), chart({ filters: rep() })]);
    expect(inactive.data).toEqual(plain.data);
    expect(plain.data).toHaveLength(3);
    expect(derive([kpi({ filters: rep() })])[0].kpiValue).toBe(derive([kpi()])[0].kpiValue);
  });
});

describe('pivot cards', () => {
  const columns = analyzeColumns(DATA);
  const pivot = (extra: Partial<DashboardItem> = {}): DashboardItem => ({
    id: 'p', title: 'Pivot', type: 'bar', data: [], dataKeys: [], displayAs: 'pivot',
    pivotSpec: { rows: 'Region', cols: 'Rep', value: { column: 'Sales', agg: 'sum' } }, ...extra,
  });
  const kpi: DashboardItem = { id: 'k', title: 'k', type: 'bar', data: [], dataKeys: [], displayAs: 'kpi', kpiSpec: { column: 'Sales', agg: 'sum' } };

  it('computes the pivot from the rows, honouring the visual\'s own filters', () => {
    const [all, ann] = deriveDashboardItems([pivot(), pivot({ id: 'p2', filters: { Rep: { kind: 'in', values: ['Ann'] } } })], [], columns, DATA, t);
    expect(all.pivot!.grand).toBe(850);
    expect(all.pivot!.rowLabels).toEqual(['South', 'North', 'East']);
    expect(ann.pivot!.grand).toBe(350);
    expect(ann.pivot!.colLabels).toEqual(['Ann']);
  });

  it('leaves other cards, and a pivot without a recipe, without a pivot key', () => {
    const out = deriveDashboardItems([kpi, pivot({ pivotSpec: undefined })], [], columns, DATA, t);
    expect(out.every(i => !('pivot' in i))).toBe(true);
  });

  it('shows no pivot when its row column no longer exists', () => {
    const [gone] = deriveDashboardItems([pivot({ pivotSpec: { rows: 'Deleted', value: { column: null, agg: 'count' } } })], [], columns, DATA, t);
    expect('pivot' in gone).toBe(false);
  });
});

describe('cross-filtering', () => {
  const columns = analyzeColumns(DATA);
  const chart = (id: string, extra: Partial<DashboardItem> = {}): DashboardItem => ({
    id, title: id, type: 'bar', data: [], dataKeys: ['value'],
    spec: { v: 2, dimension: 'Region', measures: [{ column: 'Sales', agg: 'sum' }] }, ...extra,
  });
  const byRep = chart('rep', { spec: { v: 2, dimension: 'Rep', measures: [{ column: 'Sales', agg: 'sum' }] } });
  const kpi: DashboardItem = { id: 'k', title: 'k', type: 'bar', data: [], dataKeys: [], displayAs: 'kpi', kpiSpec: { column: 'Sales', agg: 'sum' } };
  const north = { itemId: 'region', filters: { Region: { kind: 'in' as const, values: ['North'] } } };
  const derive = (items: DashboardItem[], cross?: typeof north, rows = DATA) => deriveDashboardItems(items, [], columns, rows, t, cross);
  const names = (i: DashboardItem) => i.data.map((r: { name: string }) => r.name).sort();

  it('narrows every other card but not the source', () => {
    const [src, other, k] = derive([chart('region'), byRep, kpi], north);
    expect(names(src)).toEqual(['East', 'North', 'South']);
    expect(names(other)).toEqual(['Ann', 'Bob']);
    expect(k.kpiValue).toBe(computeKpiValue(DATA.filter(r => r.Region === 'North'), { column: 'Sales', agg: 'sum' }));
  });

  it('without cross is identical to today', () => {
    const items = [chart('region'), byRep, kpi];
    expect(derive(items, undefined)).toEqual(deriveDashboardItems(items, [], columns, DATA, t));
    expect(names(derive(items)[1])).toEqual(['Ann', 'Bob', 'Cy']);
  });

  it('ANDs with page rows and item filters', () => {
    const page = DATA.filter(r => r.Rep !== 'Ann');
    const [, other] = derive([chart('region'), { ...byRep, filters: { Sales: { kind: 'range', min: 80 } } }], north, page);
    expect(other.data).toEqual([{ name: 'Bob', value: 80 }]);
  });

  describe('crossDimensionOf', () => {
    it('reads the dimension of a spec, legacy spec and sourceKey card', () => {
      expect(crossDimensionOf(chart('a'))).toBe('Region');
      expect(crossDimensionOf(chart('a', { spec: { xCol: 'Rep', yCol: 'Sales', aggregation: 'sum' } }))).toBe('Rep');
      expect(crossDimensionOf({ ...chart('a'), spec: undefined, sourceKey: 'dist:Rep' })).toBe('Rep');
      expect(crossDimensionOf({ ...chart('a'), spec: undefined, sourceKey: 'top:Region:Sales' }, columns)).toBe('Region');
    });
    it('is null for date grains, scatter, KPI and other card kinds', () => {
      expect(crossDimensionOf(chart('a', { spec: { v: 2, dimension: 'Region', grain: 'month', measures: [{ column: null, agg: 'count' }] } }))).toBeNull();
      expect(crossDimensionOf({ ...chart('a'), spec: undefined, sourceKey: 'scatter:Sales:Sales' })).toBeNull();
      expect(crossDimensionOf(kpi)).toBeNull();
      expect(crossDimensionOf({ ...chart('a'), displayAs: 'table' })).toBeNull();
      expect(crossDimensionOf({ ...chart('a'), displayAs: 'insight' })).toBeNull();
    });
  });
});

describe('computeKpiCompare', () => {
  const rows = [
    { d: '2025-07-03', v: 10 }, { d: '2025-08-02', v: 100 }, { d: '2025-08-20', v: 50 }, { d: '2025-09-05', v: 168.75 },
  ];
  const sum: KpiSpec = { column: 'v', agg: 'sum', compare: { column: 'd', grain: 'month' } };

  it('is null without compare or without dated rows', () => {
    expect(computeKpiCompare(rows, { column: 'v', agg: 'sum' })).toBeNull();
    expect(computeKpiCompare([{ d: 'n/a', v: 1 }], sum)).toBeNull();
  });
  it('shows the latest month and its change from the one before', () => {
    const r = computeKpiCompare(rows, sum)!;
    expect(r.value).toBe(computeKpiValue([rows[3]], sum));
    expect(r.delta!.label).toBe('2025-08');
    expect(r.delta!.pct).toBeCloseTo(12.5);
  });
  it('counts rows when column is null', () => {
    const r = computeKpiCompare(rows, { column: null, agg: 'count', compare: sum.compare })!;
    expect(r.value).toBe('1');
    expect(r.delta!.pct).toBe(-50);
  });
  it('divides by the absolute previous value', () => {
    const r = computeKpiCompare([{ d: '2025-01-01', v: -100 }, { d: '2025-02-01', v: -50 }], sum)!;
    expect(r.delta!.pct).toBe(50);
  });
  it('omits the delta with no previous bucket or a zero previous', () => {
    expect(computeKpiCompare([rows[1], rows[2]], sum)).toEqual({ value: computeKpiValue([rows[1], rows[2]], sum), trend: expect.any(Array) });
    expect(computeKpiCompare([{ d: '2025-01-01', v: 0 }, { d: '2025-02-01', v: 5 }], sum)!.delta).toBeUndefined();
  });
  it('skips undated rows', () => {
    const r = computeKpiCompare([...rows, { d: '', v: 1e6 }, { d: 'x', v: 1e6 }], sum)!;
    expect(r.delta!.pct).toBeCloseTo(12.5);
  });
  it('applies the card format to the value', () => {
    const f: ChartFormat = { number: 'currency', decimals: 0 };
    expect(computeKpiCompare(rows, sum, f)!.value).toBe(computeKpiValue([rows[3]], sum, f));
    expect(computeKpiCompare(rows, sum, f)!.value).not.toBe(computeKpiCompare(rows, sum)!.value);
  });
  it('picks the grain', () => {
    const r = computeKpiCompare(rows, { ...sum, compare: { column: 'd', grain: 'year' } })!;
    expect(r.delta).toBeUndefined();
    expect(r.value).toBe(computeKpiValue(rows, sum));
  });

  const card = (kpiSpec: KpiSpec): DashboardItem => ({ id: 'k', title: 'k', type: 'bar', data: [], dataKeys: [], displayAs: 'kpi', kpiSpec });
  it('deriveDashboardItems sets kpiDelta only when comparing', () => {
    const [on, off] = deriveDashboardItems([card(sum), card({ column: 'v', agg: 'sum' })], [], [], rows, t);
    expect(on.kpiValue).toBe(computeKpiValue([rows[3]], sum));
    expect(on.kpiDelta!.label).toBe('2025-08');
    expect(off.kpiValue).toBe(computeKpiValue(rows, sum));
    expect('kpiDelta' in off).toBe(false);
  });
  it('does not change the card id', () => {
    expect(kpiCardId(sum)).toBe(kpiCardId({ column: 'v', agg: 'sum' }));
  });
});

describe('drill-down on date-grain charts', () => {
  const ROWS = [
    { Date: '2024-12-20', Region: 'N', Sales: 10 },
    { Date: '2025-01-05', Region: 'N', Sales: 20 },
    { Date: '2025-01-06', Region: 'S', Sales: 30 },
    { Date: '2025-02-10', Region: 'S', Sales: 40 },
    { Date: '2025-05-01', Region: 'N', Sales: 50 },
    { Date: '2026-03-03', Region: 'S', Sales: 60 },
    { Date: '', Region: 'S', Sales: 70 },
  ];
  const columns = analyzeColumns(ROWS);
  const chart = (grain: DateGrain, extra: Partial<DashboardItem> = {}): DashboardItem => ({
    id: 'c', title: 'c', type: 'bar', data: [], dataKeys: ['value'],
    spec: { v: 2, dimension: 'Date', grain, measures: [{ column: 'Sales', agg: 'sum' }] }, ...extra,
  });
  const derive = (items: DashboardItem[], drill?: Record<string, { base: DateGrain; path: string[] }>) =>
    deriveDashboardItems(items, [], columns, ROWS, t, undefined, drill);
  const names = (i: DashboardItem) => i.data.map((r: { name: string }) => r.name);

  it('a year chart drilled into a year shows that year by quarter', () => {
    const [plain] = derive([chart('year')]);
    expect(names(plain)).toEqual(['2024', '2025', '2026']);
    expect(plain).not.toHaveProperty('drilled');
    const [c] = derive([chart('year')], { c: { base: 'year', path: ['2025'] } });
    expect(names(c)).toEqual(['2025-Q1', '2025-Q2']);
    expect(c.data[0].value).toBe(90);
    expect(c.drilled).toEqual({ path: ['2025'], label: '2025' });
  });

  it('two steps down reach the month, then the day', () => {
    const [m] = derive([chart('year')], { c: { base: 'year', path: ['2025', '2025-Q1'] } });
    expect(names(m)).toEqual(['2025-01', '2025-02']);
    expect(m.drilled?.label).toBe('2025 › 2025-Q1');
    const [d] = derive([chart('year')], { c: { base: 'year', path: ['2025', '2025-Q1', '2025-01'] } });
    expect(names(d)).toEqual(['2025-01-05', '2025-01-06']);
  });

  it('a sourceKey trend card (month) drilled into a month shows days', () => {
    const trend: DashboardItem = { id: 't', title: 't', type: 'line', data: [], dataKeys: ['total'], sourceKey: 'trend:Date:Sales' };
    expect(drillBaseOf(trend, columns)).toBe('month');
    const [t0] = deriveDashboardItems([trend], [], columns, ROWS, t, undefined, { t: { base: 'month', path: ['2025-01'] } });
    expect(names(t0)).toEqual(['2025-01-05', '2025-01-06']);
    expect(t0.drilled?.label).toBe('2025-01');
  });

  it('a stale drill (grain edited since) is ignored', () => {
    const [c] = derive([chart('month')], { c: { base: 'year', path: ['2025'] } });
    expect(names(c)).toContain('2024-12');
    expect(c).not.toHaveProperty('drilled');
  });

  it('a drill that has run past the chain end is ignored', () => {
    const [c] = derive([chart('day')], { c: { base: 'day', path: ['2025-01-05'] } });
    expect(c).not.toHaveProperty('drilled');
  });

  it('per-visual filters still apply inside the drill', () => {
    const [c] = derive([chart('year', { filters: { Region: { kind: 'in', values: ['N'] } } })], { c: { base: 'year', path: ['2025'] } });
    expect(c.data).toEqual([{ name: '2025-Q1', value: 20 }, { name: '2025-Q2', value: 50 }]);
  });

  it('drillBaseOf: the grain for a date chart, null for ungrained charts and other cards', () => {
    expect(drillBaseOf(chart('quarter'), columns)).toBe('quarter');
    expect(drillBaseOf({ ...chart('year'), spec: { v: 2, dimension: 'Region', measures: [{ column: null, agg: 'count' }] } }, columns)).toBeNull();
    expect(drillBaseOf({ ...chart('year'), displayAs: 'kpi' }, columns)).toBeNull();
  });
});

describe('KPI sparkline', () => {
  const months = Array.from({ length: 15 }, (_, i) => ({ d: `${2024 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-10`, v: i + 1 }));
  const sum: KpiSpec = { column: 'v', agg: 'sum' };
  const spark = { column: 'd', grain: 'month' as DateGrain };

  it('gives one point per period, oldest first, capped at the last 12', () => {
    expect(kpiSparkPoints(months, sum, spark)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('skips undated rows and empty buckets instead of drawing zeros', () => {
    const gap = [months[0], months[2], { d: '', v: 99 }];
    expect(kpiSparkPoints(gap, sum, spark)).toEqual([1, 3]);
  });
  it('picks month, then week, then day by how many points each gives', () => {
    expect(sparkGrain(months, 'd')).toBe('month');
    const weeks = Array.from({ length: 10 }, (_, i) => ({ d: new Date(Date.UTC(2025, 2, 3 + i * 7)).toISOString().slice(0, 10), v: 1 }));
    expect(sparkGrain(weeks, 'd')).toBe('week');
    const days = Array.from({ length: 5 }, (_, i) => ({ d: `2025-03-0${i + 1}`, v: 1 }));
    expect(sparkGrain(days, 'd')).toBe('day');
  });
  it('keeps the all-rows headline and follows filters', () => {
    const item: DashboardItem = { id: 'k', title: 'k', type: 'bar', data: [], dataKeys: [], displayAs: 'kpi', kpiSpec: { ...sum, spark } };
    const cols = analyzeColumns(months);
    const [live] = deriveDashboardItems([item], [], cols, months, t);
    expect(live.kpiValue).toBe(computeKpiValue(months, sum));
    expect(live.kpiTrend).toHaveLength(12);
    const [few] = deriveDashboardItems([{ ...item, filters: { d: { kind: 'date', from: '2024-01-01', to: '2024-03-31' } } as any }], [], cols, months, t);
    expect(few.kpiTrend).toEqual([1, 2, 3]);
  });
});
