import { describe, it, expect } from 'vitest';
import { analyzeColumns } from './data-analyzer';
import { specTitle, kpiTitle, type ChartSpec } from './derive-dashboard-item';
import { TEMPLATE_IDS, buildTemplate, templateIssue, templateRoles } from './templates';

const t = ((k: string) => k) as any;
const REGIONS = ['North', 'South', 'East', 'West'];
const CHANNELS = ['Web', 'Store', 'Phone'];

const DATA = Array.from({ length: 60 }, (_, i) => ({
  OrderID: `ORD-${1000 + i}`,
  Date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  Revenue: 100 + ((i * 37) % 400),
  Cost: 5 + ((i * 53) % 700) / 7,
  Region: REGIONS[i % 4],
  Channel: CHANNELS[i % 3],
}));
const COLS = analyzeColumns(DATA);
const names = new Set(COLS.map(c => c.name));
const build = (id: any, cols = COLS, data: any[] = DATA) => buildTemplate(id, cols, data, 'My board', t);

const SEL = (cols: string[]) => analyzeColumns(DATA.map(r => Object.fromEntries(cols.map(c => [c, (r as any)[c]]))));

describe('templateIssue', () => {
  it('fixture has the expected roles', () => {
    const r = templateRoles(COLS);
    expect(r.date?.name).toBe('Date');
    expect(r.measures.map(c => c.name)).toEqual(['Revenue', 'Cost']);
    expect(r.cats.map(c => c.name)).toEqual(['Region', 'Channel']);
  });
  it('all fit a full dataset', () => TEMPLATE_IDS.forEach(id => expect(templateIssue(id, COLS)).toBeNull()));
  it('needs a measure for sales and trends, never for profile', () => {
    const cols = SEL(['Region', 'Channel']);
    expect(templateIssue('sales', cols)).toBe('needsMeasure');
    expect(templateIssue('trends', cols)).toBe('needsMeasure');
    expect(templateIssue('profile', cols)).toBeNull();
  });
  it('trends needs a date', () => {
    const cols = SEL(['Revenue', 'Region']);
    expect(templateIssue('sales', cols)).toBeNull();
    expect(templateIssue('trends', cols)).toBe('needsDate');
  });
});

describe('buildTemplate', () => {
  it('sales: header, KPIs, date chart, category charts, pivot', () => {
    const items = build('sales');
    expect(items.map(i => i.id)).toEqual(items.map((_, n) => `tpl:sales:${n}`));
    expect(items.map(i => i.displayAs ?? 'chart')).toEqual(['text', 'kpi', 'kpi', 'kpi', 'chart', 'chart', 'chart', 'pivot']);
    expect(items[0]).toMatchObject({ text: 'My board', title: 'My board', size: 'lg' });
    expect(items.slice(1, 4).map(i => i.kpiSpec)).toEqual([
      { column: 'Revenue', agg: 'sum' }, { column: 'Cost', agg: 'sum' }, { column: null, agg: 'count' },
    ]);
    expect(items.slice(1, 4).every(i => i.size === 'xs')).toBe(true);
    expect(items[4]).toMatchObject({ type: 'combo', spec: { dimension: 'Date', grain: 'month', measures: [{ column: 'Revenue' }, { column: 'Cost' }] } });
    expect(items[5]).toMatchObject({ type: 'horizontalBar', spec: { dimension: 'Region', sort: 'value-desc', limit: 10 } });
    expect(items[6]).toMatchObject({ type: 'donut', spec: { dimension: 'Region', limit: 8 } });
    expect(items[7].pivotSpec).toMatchObject({ rows: 'Region', cols: 'Channel', value: { column: 'Revenue', agg: 'sum' }, heat: true });
    expect(items[7].size).toBe('md');
  });

  it('sales with one measure and no date or categories is just header + KPIs', () => {
    const items = build('sales', SEL(['Revenue', 'OrderID']));
    expect(items.map(i => i.displayAs)).toEqual(['text', 'kpi', 'kpi']);
  });

  it('sales: single measure with a date draws an area chart', () => {
    const items = build('sales', SEL(['Revenue', 'Date']));
    expect(items.find(i => i.spec)).toMatchObject({ type: 'area' });
  });

  it('trends: compare KPIs, monthly areas, quarterly rows, pivot', () => {
    const items = build('trends');
    expect(items.map(i => i.id)).toEqual(items.map((_, n) => `tpl:trends:${n}`));
    expect(items.map(i => i.displayAs ?? 'chart')).toEqual(['text', 'kpi', 'kpi', 'chart', 'chart', 'chart', 'pivot']);
    expect(items[1].kpiSpec).toEqual({ column: 'Revenue', agg: 'sum', compare: { column: 'Date', grain: 'month' } });
    expect(items[3]).toMatchObject({ type: 'area', spec: { grain: 'month' } });
    expect(items[5]).toMatchObject({ type: 'bar', spec: { grain: 'quarter', measures: [{ column: null, agg: 'count' }] } });
    expect(items[6].pivotSpec).toMatchObject({ rows: 'Date', rowGrain: 'month', cols: 'Region' });
    expect(items[6].pivotSpec!.colGrain).toBeUndefined();
  });

  it('profile: row count, distributions, insights', () => {
    const items = build('profile');
    expect(items[0].kpiSpec).toEqual({ column: null, agg: 'count' });
    const charts = items.filter(i => i.spec);
    expect(charts.length).toBeGreaterThan(0);
    expect(charts.length).toBeLessThanOrEqual(4);
    charts.forEach(c => expect(c).toMatchObject({ type: 'bar', spec: { limit: 15, measures: [{ column: null, agg: 'count' }] } }));
    expect(items.some(i => i.insightType === 'stats')).toBe(true);
    expect(items.filter(i => i.insightType === 'repeating').length).toBeLessThanOrEqual(2);
  });

  it('every spec points at existing columns and ids are unique', () => {
    TEMPLATE_IDS.forEach(id => {
      const items = build(id);
      expect(new Set(items.map(i => i.id)).size).toBe(items.length);
      items.forEach(i => {
        const s = i.spec as ChartSpec | undefined;
        if (s) {
          expect(names.has(s.dimension)).toBe(true);
          s.measures.forEach(m => m.column && expect(names.has(m.column)).toBe(true));
          expect(i.title).toBe(specTitle(s, t));
        }
        if (i.kpiSpec) {
          if (i.kpiSpec.column) expect(names.has(i.kpiSpec.column)).toBe(true);
          if (i.kpiSpec.compare) expect(names.has(i.kpiSpec.compare.column)).toBe(true);
          expect(i.title).toBe(kpiTitle(i.kpiSpec, t));
        }
        const p = i.pivotSpec;
        if (p) [p.rows, p.cols, p.value.column].forEach(c => c && expect(names.has(c)).toBe(true));
        expect(i.data).toEqual([]);
      });
    });
  });

  it('leaves xKey unset on recipe charts so the category axis keeps its default', () => {
    for (const id of TEMPLATE_IDS) {
      const charts = buildTemplate(id, COLS, DATA, 'T', t).filter(i => i.spec);
      expect(charts.every(c => c.xKey === undefined)).toBe(true);
    }
  });
});
