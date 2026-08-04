"use client";

import { useEffect } from 'react';
import { Upload, Sparkles, LayoutDashboard, FileSpreadsheet, Filter, Lightbulb, Combine, Download, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { FaqAccordion } from '@/components/FaqAccordion';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { seoPagesByCategory, categoryLabel, type SeoCategory } from '@/content/seo-pages';

export function LandingContent() {
  const { t } = useI18n();

  const features = [
    { icon: FileSpreadsheet, title: t('feat1Title'), desc: t('feat1Desc'), color: 'hsl(var(--chart-1))' },
    { icon: Sparkles,        title: t('feat2Title'), desc: t('feat2Desc'), color: 'hsl(var(--chart-2))' },
    { icon: LayoutDashboard, title: t('feat3Title'), desc: t('feat3Desc'), color: 'hsl(var(--chart-8))' },
    { icon: Lightbulb,       title: t('feat4Title'), desc: t('feat4Desc'), color: 'hsl(var(--chart-4))' },
    { icon: Combine,         title: t('feat5Title'), desc: t('feat5Desc'), color: 'hsl(var(--chart-2))' },
    { icon: Filter,          title: t('feat6Title'), desc: t('feat6Desc'), color: 'hsl(var(--chart-1))' },
    { icon: Download,        title: t('feat7Title'), desc: t('feat7Desc'), color: 'hsl(var(--chart-3))' },
    { icon: Upload,          title: t('feat8Title'), desc: t('feat8Desc'), color: 'hsl(var(--chart-5))' },
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

  useEffect(() => {
    // JS Fallback for browsers that don't support animation-timeline: view()
    if (typeof CSS === 'undefined' || !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              // Add a simple fade-in up effect manually
              el.style.opacity = (entry.intersectionRatio).toString();
              el.style.transform = `translateY(${(1 - entry.intersectionRatio) * 20}px)`;
            }
          }
        },
        { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
      );

      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        // Initial setup for JS fallback
        (el as HTMLElement).style.opacity = '0.1';
        (el as HTMLElement).style.transform = 'translateY(20px)';
        (el as HTMLElement).style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-24">
      {/* ── SEO-rich intro ── */}
      <section aria-label="ExcelInsight overview" className="text-center max-w-3xl mx-auto">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          <strong className="text-foreground">ExcelInsight</strong> {t('seoHero1')}{' '}
          <strong className="text-foreground">{t('seoHero2')}</strong>, <strong className="text-foreground">{t('seoHero3')}</strong>,{' '}
          <strong className="text-foreground">{t('seoHero4')}</strong>, <strong className="text-foreground">{t('seoHero5')}</strong>,{' '}
          <strong className="text-foreground">{t('seoHero6')}</strong>. {t('seoHero7')} <strong className="text-foreground">{t('seoHero8')}</strong>{' '}
          <strong className="text-foreground">{t('seoHero9')}</strong> {t('seoHero10')}
        </p>
      </section>

      {/* ── Features ── */}
      <section aria-labelledby="features-heading">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm text-primary font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Everything you need
          </span>
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('featuresTitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('featuresIntro')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <article
              key={title}
              className="elevated-card scroll-reveal p-5 group hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Ad slot ── */}
      <AdSlot slot="" label={t('sponsored')} />

      {/* ── How it works ── */}
      <section aria-labelledby="how-heading">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-sm text-accent font-medium mb-4">
            Get started in minutes
          </span>
          <h2 id="how-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('howTitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('howIntro')}</p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }) => (
              <article key={n} className="scroll-reveal flex flex-col items-center text-center md:items-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                    {n}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section aria-labelledby="usecases-heading">
        <div
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--accent)/0.06))',
            border: '1px solid hsl(var(--border)/0.6)',
          }}
        >
          {/* Decorative */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }} />

          <h2 id="usecases-heading" className="text-2xl md:text-3xl font-bold gradient-text mb-6">
            {t('useCasesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t('useCase1Title'), desc: t('useCase1Desc'), accent: 'hsl(var(--chart-1))' },
              { title: t('useCase2Title'), desc: t('useCase2Desc'), accent: 'hsl(var(--chart-2))' },
              { title: t('useCase3Title'), desc: t('useCase3Desc'), accent: 'hsl(var(--chart-3))' },
            ].map(({ title, desc, accent }) => (
              <div key={title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
                  <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad slot ── */}
      <AdSlot slot="" label={t('sponsored')} />

      {/* ── Tools hub ── */}
      <section aria-labelledby="tools-heading">
        <div className="text-center mb-12">
          <h2 id="tools-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Free Excel & CSV Tools — Chart Makers, Dashboards & Data Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Make bar graphs, line charts, dashboards and get data insights from Excel & CSV files — all free, all private, all browser-based.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(seoPagesByCategory) as SeoCategory[]).map((cat) => (
            <div key={cat} className="elevated-card scroll-reveal p-5">
              <h3 className="font-bold text-foreground mb-3 text-xs uppercase tracking-widest text-primary/80">
                {categoryLabel[cat]}
              </h3>
              <ul className="space-y-1.5">
                {seoPagesByCategory[cat].map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}/`}
                      className="group flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                    >
                      <span>{p.h1}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-heading">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            {t('faqTitle')}
          </h2>
          <p className="text-muted-foreground">{t('faqIntro')}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border pt-10 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold gradient-text">ExcelInsight</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('footerCopy')}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/privacy/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              {t('privacyPolicy')}
            </Link>
            <span className="text-border">•</span>
            <Link href="/terms/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              {t('termsOfService')}
            </Link>
          </nav>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          © {new Date().getFullYear()} ExcelInsight
        </p>
      </footer>

      {/* WebApplication structured data */}
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
            description: 'Free online Excel insights, chart maker & dashboard builder.',
            featureList: [
              'Excel Chart Maker', 'Bar Graph from Excel', 'CSV Dashboard Builder',
              'Excel Data Insights', 'Line Graph Maker', 'Free Dashboard Software for Excel',
              'Excel Data Analysis Tool', 'CSV Visualization', 'PDF Report Export',
            ],
          }),
        }}
      />
      {/* FAQ structured data */}
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
