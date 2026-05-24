import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { seoPageMap, seoPages, seoPagesByCategory, categoryLabel, type SeoPage } from '@/content/seo-pages';

const SITE_URL = 'https://excelinsight.xyz';
const OG_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/neEqO6MCG2bHfGf0v6pME35dIMA2/social-images/social-1774898677243-ExcelInsight.webp';

// 1. Generate Static Params — Tells Next.js to pre-render all 22 pages
export async function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

// 2. Generate Metadata — Replaces Helmet
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = seoPageMap[params.slug];
  if (!page) return {};
  
  const url = `${SITE_URL}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
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

function CategoryNav() {
  return (
    <nav aria-label="Explore" className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
        {(Object.keys(seoPagesByCategory) as Array<keyof typeof seoPagesByCategory>).map((cat) => (
          <div key={cat}>
            <h3 className="font-semibold text-foreground mb-3">{categoryLabel[cat]}</h3>
            <ul className="space-y-2">
              {seoPagesByCategory[cat].map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {p.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold gradient-text">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ExcelInsight" width="24" height="24" className="h-6 w-6" />
          ExcelInsight
        </Link>
        <ThemeLangSwitcher />
      </div>
    </header>
  );
}

function Breadcrumbs({ page }: { page: SeoPage }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary">Home</Link>
        </li>
        <li><ChevronRight className="h-3.5 w-3.5" /></li>
        <li>{categoryLabel[page.category]}</li>
        <li><ChevronRight className="h-3.5 w-3.5" /></li>
        <li className="text-foreground" aria-current="page">{page.h1}</li>
      </ol>
    </nav>
  );
}

function Cta({ label }: { label: string }) {
  return (
    <Button asChild size="lg" className="gap-2">
      <Link href="/">
        {label} <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export default function SeoLandingPage({ params }: { params: { slug: string } }) {
  const page = seoPageMap[params.slug];

  if (!page) {
    notFound();
  }

  const ctaLabel = page.primaryCta ?? 'Upload your spreadsheet — free';
  const url = `${SITE_URL}/${page.slug}`;

  // JSON-LD
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
        { '@type': 'ListItem', position: 2, name: categoryLabel[page.category], item: url },
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
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '247',
        bestRating: '5',
        worstRating: '1',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Inject JSON-LD directly into the HTML */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative" style={{ background: 'var(--gradient-glow)' }}>
          <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 space-y-6">
            <Breadcrumbs page={page} />
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {categoryLabel[page.category]}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight">
              {page.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {page.intro}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Cta label={ctaLabel} />
              <Button asChild variant="outline" size="lg">
                <Link href="/">See it in action</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-14">
          {page.sections.map((s) => (
            <article key={s.heading} className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{s.body}</p>
              {s.bullets && (
                <ul className="grid sm:grid-cols-2 gap-3 pt-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        {/* Comparison table */}
        {page.comparison && (
          <section className="max-w-4xl mx-auto px-6 pb-16">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-left p-4 font-semibold text-primary">ExcelInsight</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">{page.comparison.competitor}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.comparison.rows.map((row) => (
                      <tr key={row.feature} className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">{row.feature}</td>
                        <td className="p-4 text-foreground">{row.excelinsight}</td>
                        <td className="p-4 text-muted-foreground">{row.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Mid-page CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="glass-card rounded-2xl p-8 md:p-10 text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">Try it with your own file</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No signup, no upload to a server. Open ExcelInsight, drop your Excel or CSV file,
              and get a dashboard in seconds.
            </p>
            <div className="pt-2"><Cta label={ctaLabel} /></div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {page.faqs.map((f, i) => (
              <article key={i} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{f.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related */}
        {page.related.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 pb-20">
            <h2 className="text-xl font-bold text-foreground mb-5">Related tools</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {page.related.map((s) => {
                const rel = seoPageMap[s];
                if (!rel) return null;
                return (
                  <Link
                    key={s}
                    href={`/${rel.slug}`}
                    className="glass-card rounded-xl p-4 hover:scale-[1.01] transition-transform flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{categoryLabel[rel.category]}</div>
                      <div className="font-semibold text-foreground">{rel.h1}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <CategoryNav />

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground space-y-2">
          <nav className="flex items-center justify-center gap-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="text-border">•</span>
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <span className="text-border">•</span>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
          </nav>
          <p>© {new Date().getFullYear()} ExcelInsight — free Excel & CSV analytics, charts, dashboards and reports.</p>
        </div>
      </footer>
    </div>
  );
}
