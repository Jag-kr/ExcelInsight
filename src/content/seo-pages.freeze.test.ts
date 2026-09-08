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
// Amended 8 Sep 2026: 16 pages retired, 38 → 22. Every one earned zero clicks over 12
// months — ten never registered a single impression, six sat at position 46–71. The
// freeze is unchanged in intent; the snapshot shrank because pages left, never because
// pages were added. Decision record: docs/seo/p0-baseline.md → "Page retirement".
const FROZEN_SLUGS = [
  'excel-dashboard-maker', 'csv-visualization-tool', 'excel-report-builder',
  'excel-to-pdf-dashboard', 'excelinsight-vs-tableau', 'excelinsight-vs-powerbi',
  'tableau-alternative', 'best-excel-dashboard-tool', 'line-chart-maker',
  'area-chart-maker', 'inventory-dashboard-template', 'hr-dashboard-template',
  'finance-reporting-dashboard', 'ecommerce-analytics-dashboard',
  'marketing-analytics-dashboard', 'analyse-excel-data', 'csv-dashboard',
  'excel-data-insights', 'free-excel-data-analysis-tool', 'excel-statistics-tool',
  'excel-link-analysis', 'excel-data-visualizer',
];

describe('publication freeze (BRD P0-R1)', () => {
  it('publishes exactly the 22 pages frozen on 8 Sep 2026', () => {
    expect(seoPages.map((p) => p.slug)).toEqual(FROZEN_SLUGS);
  });
});
