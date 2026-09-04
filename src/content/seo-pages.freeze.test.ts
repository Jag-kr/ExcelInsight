import { describe, expect, it } from 'vitest';
import { seoPages } from './seo-pages';

// P0-R1: publication of new programmatic landing pages is frozen for the 28-week
// programme. Average position fell as page count rose, and nothing downstream can be
// measured against a moving page set.
//
// If this test fails because you added a page, that is the freeze working. Do not edit
// this list to make it pass — raise it at the fortnightly review, and if the freeze is
// genuinely being lifted, record the decision and its date in docs/seo/p0-baseline.md
// before touching the snapshot.
const FROZEN_SLUGS = [
  'excel-dashboard-maker', 'csv-visualization-tool', 'excel-chart-generator',
  'excel-report-builder', 'excel-to-pdf-dashboard', 'excelinsight-vs-tableau',
  'excelinsight-vs-powerbi', 'tableau-alternative', 'best-excel-dashboard-tool',
  'bar-chart-maker', 'line-chart-maker', 'pie-chart-maker', 'scatter-plot-generator',
  'area-chart-maker', 'sales-dashboard-template', 'inventory-dashboard-template',
  'hr-dashboard-template', 'finance-reporting-dashboard', 'ecommerce-analytics-dashboard',
  'startup-kpi-dashboard', 'manufacturing-report-dashboard', 'marketing-analytics-dashboard',
  'analyse-excel-data', 'plot-excel-data', 'make-bar-graph-from-excel', 'excel-chart-maker',
  'csv-dashboard', 'csv-to-line-graph', 'excel-data-insights', 'free-dashboard-software-excel',
  'free-excel-data-analysis-tool', 'excel-statistics-tool', 'learn-excel-data-analysis',
  'line-graph-maker-excel', 'hr-analytics-excel', 'excel-link-analysis', 'radar-chart-maker',
  'excel-data-visualizer',
];

describe('publication freeze (BRD P0-R1)', () => {
  it('publishes exactly the 38 pages frozen on 29 Aug 2026', () => {
    expect(seoPages.map((p) => p.slug)).toEqual(FROZEN_SLUGS);
  });
});
