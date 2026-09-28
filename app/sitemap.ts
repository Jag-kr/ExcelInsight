import { MetadataRoute } from 'next';
import { indexableSeoPages } from '@/content/seo-pages';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Bumped 28 Sep 2026: copy corrections landed across every page (see the
// AdSense remediation record), and About/Contact were published.
const LAST_MODIFIED = new Date('2026-09-28T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/example/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const seoRoutes: MetadataRoute.Sitemap = indexableSeoPages.map((page) => ({
    url: `${SITE_URL}/${page.slug}/`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}
