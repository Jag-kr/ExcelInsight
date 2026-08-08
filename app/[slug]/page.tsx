import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { SeoPageContent } from '@/components/SeoPageContent';
import { seoPageMap, seoPages } from '@/content/seo-pages';

const SITE_URL = 'https://excelinsight.xyz';
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

  const url = `${SITE_URL}/${page.slug}/`;

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

// 3. Landing page header (server component — no i18n needed here)
function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold brand-text">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ExcelInsight" width="24" height="24" className="h-6 w-6" />
          ExcelInsight
        </Link>
        <ThemeLangSwitcher />
      </div>
    </header>
  );
}

// 4. Page — server component wrapper for SSG + JSON-LD
export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPageMap[slug];

  if (!page) {
    notFound();
  }

  const url = `${SITE_URL}/${page.slug}`;

  // JSON-LD structured data (English — for schema.org / crawlers)
  const jsonLd = [
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
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: page.category, item: url },
        { '@type': 'ListItem', position: 3, name: page.h1, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ExcelInsight — ' + page.h1,
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD structured data */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <LandingHeader />

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
