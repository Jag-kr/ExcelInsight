import { describe, it, expect } from 'vitest';
import { seoPages } from './seo-pages';
import { buildSeoJsonLd, seoPageUrl } from './seo-jsonld';
import { SITE_URL } from '@/lib/site';

describe('seo-jsonld', () => {
  it('emits exactly FAQPage and BreadcrumbList — nothing else', () => {
    for (const page of seoPages) {
      const types = buildSeoJsonLd(page).map((n) => n['@type']);
      expect(types, page.slug).toEqual(['FAQPage', 'BreadcrumbList']);
    }
  });

  it('never emits SoftwareApplication (one product, not 22, and we have no honest rating)', () => {
    const all = JSON.stringify(seoPages.map(buildSeoJsonLd));
    expect(all).not.toContain('SoftwareApplication');
    expect(all).not.toContain('aggregateRating');
  });

  it('builds a valid two-level breadcrumb', () => {
    for (const page of seoPages) {
      const crumbs = buildSeoJsonLd(page)[1] as {
        itemListElement: { position: number; name: string; item?: string }[];
      };
      const items = crumbs.itemListElement;

      expect(items, page.slug).toHaveLength(2);
      expect(items.map((i) => i.position)).toEqual([1, 2]);

      // `item` is required on every crumb but the last, which must omit it.
      expect(items[0].item, page.slug).toBe(`${SITE_URL}/`);
      expect(items[1], page.slug).not.toHaveProperty('item');

      // The defect this test exists to catch: two crumbs pointing at one URL.
      const urls = items.map((i) => i.item).filter(Boolean);
      expect(new Set(urls).size, page.slug).toBe(urls.length);

      // And the other one: a raw category enum leaking into the SERP trail.
      expect(items[1].name, page.slug).toBe(page.h1);
    }
  });

  it('uses the trailing-slash canonical everywhere', () => {
    for (const page of seoPages) {
      const url = seoPageUrl(page.slug);
      expect(url, page.slug).toBe(`${SITE_URL}/${page.slug}/`);
      expect(url.endsWith('/'), page.slug).toBe(true);
    }
  });

  it('mirrors the FAQs that are actually rendered on the page', () => {
    for (const page of seoPages) {
      const faq = buildSeoJsonLd(page)[0] as { mainEntity: { name: string }[] };
      expect(faq.mainEntity.map((q) => q.name), page.slug).toEqual(page.faqs.map((f) => f.q));
    }
  });
});
