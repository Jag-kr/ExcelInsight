import { MetadataRoute } from 'next';
import { seoPages } from '@/content/seo-pages';

export const dynamic = 'force-static';

const SITE_URL = 'https://excelinsight.xyz';
const LAST_MODIFIED = new Date('2026-05-27');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  const seoRoutes = seoPages.map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...routes, ...seoRoutes];
}
