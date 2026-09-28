import { describe, expect, it } from 'vitest';
import {
  seoPages,
  indexableSeoPages,
  seoPagesByCategory,
  NOINDEX_SLUGS,
  isIndexable,
} from './seo-pages';
import sitemap from '../../app/sitemap';

// 28 Sep 2026 — AdSense "low-value content", second rejection.
//
// Thirteen pages earned zero clicks on 26 combined impressions over the 28 days
// to 25 Sep. They are withheld from the index rather than deleted, because a
// page at zero is unproven rather than dead: free-excel-data-analysis-tool went
// from zero clicks to eleven inside one month.
//
// `noindex` on its own is not the whole job — a page Google is told to skip but
// which the sitemap still advertises and the nav still links is a mixed signal.
// These assertions are what keeps the two halves in step.
describe('withheld pages (AdSense remediation, 28 Sep 2026)', () => {
  it('withholds exactly the 13 zero-click slugs', () => {
    expect([...NOINDEX_SLUGS].sort()).toEqual(
      [
        'area-chart-maker',
        'csv-dashboard',
        'csv-visualization-tool',
        'ecommerce-analytics-dashboard',
        'excel-link-analysis',
        'excel-to-pdf-dashboard',
        'excelinsight-vs-powerbi',
        'excelinsight-vs-tableau',
        'finance-reporting-dashboard',
        'inventory-dashboard-template',
        'line-chart-maker',
        'marketing-analytics-dashboard',
        'tableau-alternative',
      ].sort(),
    );
  });

  it('every withheld slug is still a published page', () => {
    // The whole point of noindex over deletion is that the URLs keep working.
    const published = new Set(seoPages.map((p) => p.slug));
    const missing = [...NOINDEX_SLUGS].filter((s) => !published.has(s));
    expect(missing).toEqual([]);
  });

  it('leaves 9 pages indexable', () => {
    expect(indexableSeoPages).toHaveLength(9);
    expect(indexableSeoPages.every((p) => isIndexable(p.slug))).toBe(true);
  });

  it('keeps withheld pages out of the sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    const leaked = [...NOINDEX_SLUGS].filter((s) => urls.some((u) => u.endsWith(`/${s}/`)));
    expect(leaked).toEqual([]);
  });

  it('publishes the About, Contact and Example pages in the sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    for (const path of ['/about/', '/contact/', '/example/']) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }
  });

  it('keeps withheld pages out of the category nav', () => {
    const linked = Object.values(seoPagesByCategory).flat().map((p) => p.slug);
    expect(linked.filter((s) => NOINDEX_SLUGS.has(s))).toEqual([]);
  });

  it('leaves every indexable page with at least one indexable related link', () => {
    // SeoPageContent filters `related` through isIndexable at render. If that
    // strips a page's list down to nothing, the internal link graph has a hole.
    const orphans = indexableSeoPages
      .filter((p) => p.related.filter(isIndexable).length === 0)
      .map((p) => p.slug);
    expect(orphans).toEqual([]);
  });
});
