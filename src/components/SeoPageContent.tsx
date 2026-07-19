"use client";

import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaqAccordion } from '@/components/FaqAccordion';
import { useI18n } from '@/lib/i18n';
import { type SeoPage, seoPageMap, seoPagesByCategory } from '@/content/seo-pages';
import { getSeoPageTranslated, getSeoUiStrings } from '@/content/seo-i18n';

// ─── Sub-components ──────────────────────────────────────────────────────────

function Cta({ label }: { label: string }) {
  return (
    <Button asChild size="lg" className="gap-2">
      <Link href="/">
        {label} <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

function Breadcrumbs({
  page,
  categoryLabel,
}: {
  page: SeoPage;
  categoryLabel: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
        </li>
        <li>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>{categoryLabel}</li>
        <li>
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li className="text-foreground" aria-current="page">
          {page.h1}
        </li>
      </ol>
    </nav>
  );
}

function CategoryNav({ ui }: { ui: ReturnType<typeof getSeoUiStrings> }) {
  const categoryLabels: Record<string, string> = {
    feature: ui.categoryFeature,
    comparison: ui.categoryComparison,
    chart: ui.categoryChart,
    template: ui.categoryTemplate,
    usecase: ui.categoryUsecase,
  };

  return (
    <nav aria-label="Explore" className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
        {(Object.keys(seoPagesByCategory) as Array<keyof typeof seoPagesByCategory>).map((cat) => (
          <div key={cat}>
            <h3 className="font-semibold text-foreground mb-3">{categoryLabels[cat]}</h3>
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

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Client component that renders the full SEO page content.
 * Reads the current language from I18nContext and applies translations.
 * The parent server component passes the base (English) page as a prop so
 * the server can still statically generate the HTML for crawlers.
 */
export function SeoPageContent({ basePage }: { basePage: SeoPage }) {
  const { lang } = useI18n();

  // Resolve translated page content + UI strings for the current language
  const page = getSeoPageTranslated(basePage.slug, lang);
  const ui = getSeoUiStrings(lang);

  const categoryLabel: Record<string, string> = {
    feature: ui.categoryFeature,
    comparison: ui.categoryComparison,
    chart: ui.categoryChart,
    template: ui.categoryTemplate,
    usecase: ui.categoryUsecase,
  };

  const ctaLabel = page.primaryCta ?? ui.uploadSpreadsheetFree;
  const currentCategoryLabel = categoryLabel[page.category] ?? page.category;

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative" style={{ background: 'var(--gradient-glow)' }}>
          <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 space-y-6">
            <Breadcrumbs page={page} categoryLabel={currentCategoryLabel} />
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {currentCategoryLabel}
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
                <Link href="/">{ui.seeItInAction}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content sections */}
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

        {/* Comparison table — stays in English (factual data) */}
        {basePage.comparison && (
          <section className="max-w-4xl mx-auto px-6 pb-16">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-left p-4 font-semibold text-primary">ExcelInsight</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">
                        {basePage.comparison.competitor}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {basePage.comparison.rows.map((row) => (
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
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">{ui.tryWithYourOwnFile}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{ui.tryItDesc}</p>
            <div className="pt-2">
              <Cta label={ctaLabel} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            {ui.frequentlyAskedQuestions}
          </h2>
          <FaqAccordion faqs={page.faqs} />
        </section>

        {/* Related tools */}
        {basePage.related.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 pb-20">
            <h2 className="text-xl font-bold text-foreground mb-5">{ui.relatedTools}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {basePage.related.map((s) => {
                const rel = seoPageMap[s];
                if (!rel) return null;
                // Related link titles are always shown in English (they are slugs linking to other pages)
                return (
                  <Link
                    key={s}
                    href={`/${rel.slug}`}
                    className="glass-card rounded-xl p-4 hover:scale-[1.01] transition-transform flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {categoryLabel[rel.category] ?? rel.category}
                      </div>
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

      <CategoryNav ui={ui} />

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground space-y-2">
          <nav className="flex items-center justify-center gap-4">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="text-border">•</span>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <span className="text-border">•</span>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
          </nav>
          <p>
            © {new Date().getFullYear()} ExcelInsight — free Excel &amp; CSV analytics, charts,
            dashboards and reports.
          </p>
        </div>
      </footer>
    </>
  );
}
