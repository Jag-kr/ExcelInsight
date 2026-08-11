"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Upload, Sparkles, LayoutDashboard, FileSpreadsheet, Filter, Lightbulb,
  Combine, Download, ArrowRight, CheckCircle2, AlertCircle, Clock, RefreshCw,
  BarChart3, TrendingUp, ShieldCheck, Zap,
} from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useFallbackReveal } from '@/hooks/use-reveal';
import { useGlowCards } from '@/hooks/use-glow-cards';
import { seoPagesByCategory, categoryLabel, type SeoCategory } from '@/content/seo-pages';

const ChartShowcase = dynamic(
  () => import('@/components/chart-showcase/ChartShowcase').then((m) => m.ChartShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/60" style={{ background: 'hsl(var(--card))' }}>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40" style={{ background: 'hsl(var(--surface-2))' }}>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />)}
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40" style={{ background: 'hsl(var(--surface-2))' }}>
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-16 rounded-full" />)}
        </div>
        <div className="p-3">
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </div>
    ),
  }
);

/* ─────────────────────────────────────────────────────────────
   Stat counter hook — counts up once when element enters view
───────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return value;
}

/* ─────────────────────────────────────────────────────────────
   Proof section — one column of the scroll-scrubbed bar chart.
   The bar itself (.chart-bar-rise) tracks scroll position directly;
   the number keeps its own count-up, triggered the moment the row
   enters view, so the two motions read as one construction moment
   rather than two competing timers.
───────────────────────────────────────────────────────────── */
function ProofColumn({
  target, suffix, label, icon: Icon, color,
  inView, delay, index,
}: {
  target: number; suffix: string; label: string;
  icon: React.ElementType; color: string;
  inView: boolean; delay: number; index: number;
}) {
  const value = useCountUp(target, 1400, inView);
  return (
    <div className="relative z-10 flex flex-col items-center text-center gap-3">
      <p
        className="text-2xl md:text-3xl font-bold tabular-nums"
        style={{ color, transitionDelay: inView ? `${delay}ms` : '0ms' }}
      >
        {value.toLocaleString()}{suffix}
      </p>
      <div className="w-full h-20 md:h-24 flex items-end justify-center" aria-hidden="true">
        <div
          className={`chart-bar-rise narrative-stagger-${index + 1} w-8 md:w-10 h-full rounded-t-md`}
          style={{ background: color, transitionDelay: `${delay}ms` }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <p className="text-sm text-muted-foreground font-medium text-left">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Zone-2 fallback observer for browsers without scroll-driven
   animations (primarily Firefox). Fires once on entry.
───────────────────────────────────────────────────────────── */
/* Moved to src/hooks/use-reveal.ts so LegalPage — which also uses reveal
   classes — gets the same Firefox back-fill instead of rendering blank. */

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export function LandingContent() {
  const { t } = useI18n();
  const zone2Ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  // Zone-2 fallback reveal for Firefox
  useFallbackReveal(zone2Ref);

  // Pointer-tracked border light on .glow-card elements in this section
  useGlowCards(zone2Ref);

  // Stats in-view trigger
  useEffect(() => {
    if (statsInView) return;
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsInView]);

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

  // Pain points for the problem section
  const painPoints = [
    {
      icon: Clock,
      label: t('painPoint1Label'),
      desc: t('painPoint1Desc'),
      color: 'hsl(var(--chart-7))',
    },
    {
      icon: AlertCircle,
      label: t('painPoint2Label'),
      desc: t('painPoint2Desc'),
      color: 'hsl(var(--chart-5))',
    },
    {
      icon: RefreshCw,
      label: t('painPoint3Label'),
      desc: t('painPoint3Desc'),
      color: 'hsl(var(--chart-4))',
    },
  ];

  return (
    <div ref={zone2Ref} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pb-20 space-y-28">

      {/* ── SEO-rich intro ── */}
      <section aria-label={t('overviewAriaLabel')} className="text-center max-w-3xl mx-auto">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {t('seoHeroPara')}
        </p>
      </section>

      {/* ══════════════════════════════════════════
          ZONE 2 — SCROLL-DRIVEN NARRATIVE
      ══════════════════════════════════════════ */}

      {/* ── Section 1: Problem — pins briefly, pain points stagger in ── */}
      <section aria-labelledby="problem-heading" className="relative">

        {/* Section heading — scrolls normally, never sits behind the cards */}
        <div className="text-center mb-10">
          <span className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/8 px-4 py-1.5 text-sm text-destructive font-medium mb-4">
            <AlertCircle className="h-3.5 w-3.5" />
            {t('soundFamiliar')}
          </span>
          <h2
            id="problem-heading"
            className="display-heading mb-3"
          >
            {t('problemHeading')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-xl mx-auto">
            {t('problemDesc')}
          </p>
        </div>

        {/* Pain point cards with growing connector line */}
        <div className="relative mt-8">
          {/* Vertical connector line — grows as section scrolls in */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="problem-pin-line w-full h-full"
              style={{
                background: 'hsl(var(--border))',
                transformOrigin: 'top center',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {painPoints.map(({ icon: Icon, label, desc, color }, i) => (
              <article
                key={label}
                className={`narrative-reveal elevated-card p-6 group hover:scale-[1.02] transition-transform duration-200 narrative-stagger-${i + 1}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Solution — reveals progressively ── */}
      <section aria-labelledby="features-heading">
        <div className="text-center mb-12">
          <span className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm text-primary font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t('everythingYouNeedBadge')}
          </span>
          <h2 id="features-heading" className="display-heading mb-3">
            {t('featuresTitle')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-2xl mx-auto">{t('featuresIntro')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <article
              key={title}
              /* scroll-reveal removed: it and narrative-reveal both set the
                 `animation` shorthand, so one was silently overriding the other. */
              className={`narrative-reveal elevated-card glow-card p-5 group hover:-translate-y-1 transition-transform duration-base ease-smooth narrative-stagger-${(i % 4) + 1}`}
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

      {/* ── Section: See it in action — the demo now lives below the fold instead of competing with the upload zone in the hero ── */}
      <section aria-labelledby="demo-section-heading">
        <div className="text-center mb-8">
          <span className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm text-primary font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t('seeItInAction')}
          </span>
          <h2
            id="demo-section-heading"
            className="display-heading mb-3"
          >
            {t('demoSectionTitle')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-xl mx-auto">
            {t('demoSectionDesc')}
          </p>
        </div>
        <div className="max-w-4xl mx-auto narrative-reveal">
          <ChartShowcase />
        </div>
      </section>

      {/* ── Ad slot ── */}
      <AdSlot slot="" label={t('sponsored')} />

      {/* ── Section 3: Proof — stats count up on entry ── */}
      <section aria-labelledby="proof-heading" ref={statsRef}>
        <div className="text-center mb-12">
          <span className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-sm text-accent font-medium mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            {t('builtForSpeedBadge')}
          </span>
          <h2 id="proof-heading" className="display-heading mb-3">
            {t('proofHeading')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-2xl mx-auto">
            {t('proofDesc')}
          </p>
        </div>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'hsl(var(--surface-1))', border: '1px solid hsl(var(--border)/0.5)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Gridlines — chart atmosphere, echoes the mini chart cards used in the demo showcase */}
          <div className="absolute inset-x-6 md:inset-x-10 top-8 md:top-10 bottom-[4.75rem] pointer-events-none hidden sm:block" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="absolute inset-x-0 h-px" style={{ top: `${i * 32}%`, background: 'hsl(var(--border)/0.15)' }} />
            ))}
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-6 md:px-10 pt-8 md:pt-10 pb-6 md:pb-8">
            <ProofColumn index={0} target={100} suffix="%" label={t('statBrowserOnly')} icon={ShieldCheck} color="hsl(var(--chart-3))" inView={statsInView} delay={0} />
            <ProofColumn index={1} target={0} suffix="" label={t('statFilesUploaded')} icon={Zap} color="hsl(var(--chart-1))" inView={statsInView} delay={120} />
            <ProofColumn index={2} target={30} suffix="s" label={t('statTimeToChart')} icon={Clock} color="hsl(var(--chart-4))" inView={statsInView} delay={240} />
            <ProofColumn index={3} target={8} suffix="+" label={t('statChartTypesGenerated')} icon={BarChart3} color="hsl(var(--chart-2))" inView={statsInView} delay={360} />
          </div>
        </div>
      </section>

      {/* ── Section 4: How it works ── */}
      <section aria-labelledby="how-heading">
        <div className="text-center mb-12">
          <span className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-sm text-accent font-medium mb-4">
            {t('getStartedMinutesBadge')}
          </span>
          <h2 id="how-heading" className="display-heading mb-3">
            {t('howTitle')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-2xl mx-auto">{t('howIntro')}</p>
        </div>

        {/* Steps with connecting line — .how-steps-scope is the shared scroll timeline
            source; the line fill and each badge's highlight are slices of that one
            timeline, so they visibly track the same scroll position. */}
        <div className="relative how-steps-scope">
          {/* Desktop connector line — track + scroll-scrubbed fill drawing left to right through the steps */}
          <div className="hidden md:block absolute top-8 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-primary/15" />
            <div className="chart-line-progress absolute inset-0 bg-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }, i) => (
              <article
                key={n}
                className={`narrative-reveal flex flex-col items-center text-center md:items-center narrative-stagger-${i + 1}`}
              >
                <div className="relative mb-4">
                  <div className={`how-step-badge how-step-badge-${i + 1} w-16 h-16 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20`}>
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
          className="narrative-reveal rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: 'hsl(var(--primary) / 0.05)',
            border: '1px solid hsl(var(--border)/0.6)',
          }}
        >
          <h2 id="usecases-heading" className="text-2xl md:text-3xl font-bold brand-text mb-6">
            {t('useCasesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t('useCase1Title'), desc: t('useCase1Desc'), accent: 'hsl(var(--chart-1))' },
              { title: t('useCase2Title'), desc: t('useCase2Desc'), accent: 'hsl(var(--chart-2))' },
              { title: t('useCase3Title'), desc: t('useCase3Desc'), accent: 'hsl(var(--chart-3))' },
            ].map(({ title, desc, accent }, i) => (
              <div key={title} className={`space-y-2 narrative-reveal narrative-stagger-${i + 1}`}>
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
          <h2 id="tools-heading" className="display-heading mb-3">
            {t('toolsHeading')}
          </h2>
          <p className="narrative-reveal text-muted-foreground max-w-2xl mx-auto">
            {t('toolsDesc')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(seoPagesByCategory) as SeoCategory[]).map((cat, i) => (
            <div
              key={cat}
              className={`narrative-reveal elevated-card p-5 narrative-stagger-${(i % 4) + 1}`}
            >
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
          <h2 id="faq-heading" className="display-heading mb-3">
            {t('faqTitle')}
          </h2>
          <p className="narrative-reveal text-muted-foreground">{t('faqIntro')}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          Zone 2 CTA — the closing statement.

          Rebuilt from a small rounded card to a full-height stage. The old
          version boxed everything into a max-w-2xl pill with a green radial
          wash behind it, which at wide viewports read as a smudge floating in
          empty space. What actually gives a closing section presence is room
          and structure, not a container: a tall stage, a ruled plane receding
          into a vignette, chamfered rules bracketing the content, and one lit
          control at the centre.
      ══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cta-heading"
        className="cta-stage relative -mx-4 sm:-mx-6 flex min-h-[70vh] items-center justify-center overflow-hidden px-4 text-center md:min-h-[80vh]"
      >
        {/* Ruled plane + vignette. Scale and fade in together so the grid
            reads as settling into place rather than switching on. */}
        <div className="cta-grid" aria-hidden="true">
          <div className="cta-grid-lines" />
        </div>

        {/* Chamfered rules. They draw themselves top-to-bottom as the section
            enters — stroke-dasharray on a pathLength of 1, scrubbed by the
            same view timeline everything else in Zone 2 uses. */}
        <svg className="cta-rule cta-rule-left" width="89" height="568" viewBox="0 0 89 568" fill="none" aria-hidden="true">
          <path d="M1 0.24V207.65L88 285.7C88 285.7 87.5 493.95 88 567.81" stroke="url(#cta-rule-gradient)" strokeWidth="1" pathLength={1} />
          <defs>
            <linearGradient id="cta-rule-gradient" x1="0" y1="0" x2="0" y2="568" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--foreground))" stopOpacity="0" />
              <stop offset="0.5" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
              <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="cta-rule cta-rule-right" width="89" height="568" viewBox="0 0 89 568" fill="none" aria-hidden="true">
          <path d="M88 0.24V207.65L1 285.7C1 285.7 1.5 493.95 1 567.81" stroke="url(#cta-rule-gradient)" strokeWidth="1" pathLength={1} />
        </svg>

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
          <div className="narrative-reveal inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t('noAccountNeededBadge')}
          </div>

          <h2 id="cta-heading" className="cta-heading">
            {t('ctaHeading')}
          </h2>

          <p className="narrative-reveal max-w-md text-muted-foreground">
            {t('ctaDesc')}
          </p>

          <div className="narrative-reveal flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cta-lit-btn font-mono"
              aria-label={t('uploadFileFreeAriaLabel')}
            >
              <Upload className="h-4 w-4" />
              {t('uploadFileFreeCta')}
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              {t('neverLeavesBrowser')}
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border pt-10 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold brand-mark">ExcelInsight</p>
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
