import { MetadataRoute } from 'next';
import { seoPages } from '@/content/seo-pages';

export const dynamic = 'force-static';

const SITE_URL = 'https://excelinsight.xyz';
const LAST_MODIFIED = new Date('2026-07-23T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
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

  const seoRoutes: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${SITE_URL}/${page.slug}/`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}
