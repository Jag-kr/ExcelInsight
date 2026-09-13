import { SITE_URL } from '@/lib/site';
import type { SeoPage } from './seo-pages';

/**
 * Canonical URL for an SEO landing page.
 *
 * The trailing slash is load-bearing: `generateMetadata` in `app/[slug]/page.tsx`
 * sets the canonical to the slashed form and production 308s to it. Any URL we
 * emit in JSON-LD has to agree, or we hand Google two URLs for one page.
 */
export function seoPageUrl(slug: string): string {
  return `${SITE_URL}/${slug}/`;
}

/**
 * JSON-LD emitted on every SEO landing page.
 *
 * Only two nodes, and deliberately so — see `docs/seo/p0-baseline.md` ("P1 — findings"):
 *
 * - `FAQPage` earns nothing from Google (the FAQ rich result was removed 7 May 2026),
 *   but it is still read by Bing and by AI answer engines, and it costs nothing to keep.
 * - `BreadcrumbList` is the only markup here Google still renders — desktop only, which
 *   is ~90% of this site's impressions.
 *
 * There is no `SoftwareApplication` node. One product does not become 22 applications
 * because it has 22 landing pages, and the type needs a rating we do not honestly have.
 */
export function buildSeoJsonLd(page: SeoPage) {
  const url = seoPageUrl(page.slug);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        // Last item carries no `item`, per Google's canonical example. Two levels,
        // not three: the visible trail shows a category crumb, but no category index
        // route exists to point it at, and P0-R1 forbids publishing one.
        { '@type': 'ListItem', position: 2, name: page.h1 },
      ],
    },
  ];
}
