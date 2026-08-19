import { describe, it, expect } from 'vitest';
import { analyzeColumns, generateChartSuggestions } from './data-analyzer';
import { buildDefaultDashboard } from './build-default-dashboard';
import { deriveDashboardItems } from './derive-dashboard-item';

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
  const { items } = buildDefaultDashboard(DATA, base.columns, base.suggestions, t);

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
    const live = deriveDashboardItems([stale], narrowed.suggestions, narrowed.columns, narrowed.data, t);
    expect(live[0].data).toEqual([]);
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

});
