"use client";

import { Upload, Sparkles, LayoutDashboard, FileSpreadsheet, Filter, Lightbulb, Combine, Download, ArrowRight } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { FaqAccordion } from '@/components/FaqAccordion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { seoPagesByCategory, categoryLabel, type SeoCategory } from '@/content/seo-pages';

export function LandingContent() {
  const { t } = useI18n();

  const features = [
    { icon: FileSpreadsheet, title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: Sparkles, title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: LayoutDashboard, title: t('feat3Title'), desc: t('feat3Desc') },
    { icon: Lightbulb, title: t('feat4Title'), desc: t('feat4Desc') },
    { icon: Combine, title: t('feat5Title'), desc: t('feat5Desc') },
    { icon: Filter, title: t('feat6Title'), desc: t('feat6Desc') },
    { icon: Download, title: t('feat7Title'), desc: t('feat7Desc') },
    { icon: Upload, title: t('feat8Title'), desc: t('feat8Desc') },
  ];

  const steps = [
    { n: '01', title: t('step1Title'), desc: t('step1Desc') },
    { n: '02', title: t('step2Title'), desc: t('step2Desc') },
    { n: '03', title: t('step3Title'), desc: t('step3Desc') },
    { n: '04', title: t('step4Title'), desc: t('step4Desc') },
  ];

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
    { q: t('faq7Q'), a: t('faq7A') },
    { q: t('faq8Q'), a: t('faq8A') },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-20">
      {/* SEO-rich intro */}
      <section aria-label="ExcelInsight overview" className="text-center max-w-3xl mx-auto pt-4">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          <strong className="text-foreground">ExcelInsight</strong> {t('seoHero1')}{' '}
          <strong className="text-foreground">{t('seoHero2')}</strong>, <strong className="text-foreground">{t('seoHero3')}</strong>,{' '}
          <strong className="text-foreground">{t('seoHero4')}</strong>, <strong className="text-foreground">{t('seoHero5')}</strong>,{' '}
          <strong className="text-foreground">{t('seoHero6')}</strong>. {t('seoHero7')} <strong className="text-foreground">{t('seoHero8')}</strong>{' '}
          <strong className="text-foreground">{t('seoHero9')}</strong> {t('seoHero10')}
        </p>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading">
        <div className="text-center mb-10">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('featuresTitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('featuresIntro')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Ad slot — between Features and How it works */}
      <AdSlot slot="" label={t('sponsored')} />

      {/* How it works */}
      <section aria-labelledby="how-heading">
        <div className="text-center mb-10">
          <h2 id="how-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('howTitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('howIntro')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map(({ n, title, desc }) => (
            <article key={n} className="glass-card rounded-xl p-6 flex gap-4">
              <div className="text-3xl font-bold text-primary/40 shrink-0">{n}</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Use cases / SEO content */}
      <section aria-labelledby="usecases-heading" className="glass-card rounded-2xl p-8 md:p-10">
        <h2 id="usecases-heading" className="text-2xl md:text-3xl font-bold gradient-text mb-4">
          {t('useCasesTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t('useCase1Title')}</h3>
            <p>{t('useCase1Desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t('useCase2Title')}</h3>
            <p>{t('useCase2Desc')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t('useCase3Title')}</h3>
            <p>{t('useCase3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Ad slot — between Use Cases and FAQ */}
      <AdSlot slot="" label={t('sponsored')} />

      {/* Tools & resources — internal linking hub for programmatic SEO landing pages */}
      <section aria-labelledby="tools-heading">
        <div className="text-center mb-10">
          <h2 id="tools-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Free Excel & CSV Tools — Chart Makers, Dashboards & Data Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Make bar graphs, line charts, dashboards and get data insights from Excel & CSV files — all free, all private, all browser-based.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(seoPagesByCategory) as SeoCategory[]).map((cat) => (
            <div key={cat} className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide text-primary/80">
                {categoryLabel[cat]}
              </h3>
              <ul className="space-y-2">
                {seoPagesByCategory[cat].map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}/`}
                      className="group flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>{p.h1}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('faqTitle')}
          </h2>
          <p className="text-muted-foreground">{t('faqIntro')}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pt-10 border-t border-border space-y-3">
        <nav className="flex items-center justify-center gap-4 text-sm">
          <Link href="/privacy/" className="text-muted-foreground hover:text-primary transition-colors">{t('privacyPolicy')}</Link>
          <span className="text-border">•</span>
          <Link href="/terms/" className="text-muted-foreground hover:text-primary transition-colors">{t('termsOfService')}</Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ExcelInsight — {t('footerCopy')}
        </p>
      </footer>

      {/* WebApplication structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'ExcelInsight',
            url: 'https://excelinsight.xyz',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Free online Excel insights, chart maker & dashboard builder. Analyse Excel data, make bar graphs, line charts & CSV dashboards instantly.',
            featureList: [
              'Excel Chart Maker',
              'Bar Graph from Excel',
              'CSV Dashboard Builder',
              'Excel Data Insights',
              'Line Graph Maker',
              'Free Dashboard Software for Excel',
              'Excel Data Analysis Tool',
              'CSV Visualization',
              'PDF Report Export',
              'Excel Statistics Tool',
              'HR Analytics Excel Template',
              'Scatter Plot Generator',
              'Radar Chart Maker',
            ],
          }),
        }}
      />

      {/* FAQ structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
