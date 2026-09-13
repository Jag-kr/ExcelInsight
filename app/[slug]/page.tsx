import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SeoPageContent } from '@/components/SeoPageContent';
import { AdsenseScript } from '@/components/AdsenseScript';
import { seoPageMap, seoPages } from '@/content/seo-pages';
import { buildSeoJsonLd, seoPageUrl } from '@/content/seo-jsonld';

const OG_IMAGE =
  'https://storage.googleapis.com/gpt-engineer-file-uploads/neEqO6MCG2bHfGf0v6pME35dIMA2/social-images/social-1774898677243-ExcelInsight.webp';

// 1. Generate Static Params — Tells Next.js to pre-render all SEO pages
export async function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

// 2. Generate Metadata — English metadata is kept for SEO indexing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPageMap[slug];
  if (!page) return {};

  const url = seoPageUrl(page.slug);

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      title: page.title,
      description: page.description,
      images: [OG_IMAGE],
    },
  };
}

// 3. Header now comes from the shared <SiteHeader> client component, which all
//    three public surfaces (landing, legal, SEO pages) use.

// 4. Page — server component wrapper for SSG + JSON-LD
export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPageMap[slug];

  if (!page) {
    notFound();
  }

  const jsonLd = buildSeoJsonLd(page);

  return (
    <div className="min-h-screen bg-background">
      <AdsenseScript />

      {/* JSON-LD structured data */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <SiteHeader />

      {/*
        SeoPageContent is a "use client" component.
        It receives the English base page from the server and then resolves the
        translated version on the client based on I18nContext (localStorage lang).
        English is server-rendered for crawlers; translations swap in on hydration.
      */}
      <SeoPageContent basePage={page} />
    </div>
  );
}
