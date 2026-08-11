"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { FileSpreadsheet, Shield } from 'lucide-react';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { MiniBarChart, MiniLineChart, MiniAreaChart, MiniDonut, RankedList, ScatterPlot, RadarChart } from './panels';

type TabKey = 'overview' | 'bar' | 'horizontalBar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar';

const TAB_KEYS: TabKey[] = ['overview', 'bar', 'horizontalBar', 'line', 'area', 'pie', 'scatter', 'radar'];

const TAB_META: Record<TabKey, { labelKey: TranslationKey; ariaKey: TranslationKey }> = {
  overview: { labelKey: 'demoShowcaseTabOverview', ariaKey: 'demoShowcasePanelAriaOverview' },
  bar: { labelKey: 'demoShowcaseTabBar', ariaKey: 'demoShowcasePanelAriaBar' },
  horizontalBar: { labelKey: 'demoShowcaseTabHorizontalBar', ariaKey: 'demoShowcasePanelAriaHorizontalBar' },
  line: { labelKey: 'demoShowcaseTabLine', ariaKey: 'demoShowcasePanelAriaLine' },
  area: { labelKey: 'demoShowcaseTabArea', ariaKey: 'demoShowcasePanelAriaArea' },
  pie: { labelKey: 'demoShowcaseTabPie', ariaKey: 'demoShowcasePanelAriaPie' },
  scatter: { labelKey: 'demoShowcaseTabScatter', ariaKey: 'demoShowcasePanelAriaScatter' },
  radar: { labelKey: 'demoShowcaseTabRadar', ariaKey: 'demoShowcasePanelAriaRadar' },
};

const AUTO_ADVANCE_MS = 4400;

function OverviewPanel({ t }: { t: (key: TranslationKey) => string }) {
  const STATS = [
    { label: t('demoDashboardStat1Label'), value: t('demoDashboardStat1Value'), delay: '0.24s', color: 'hsl(var(--chart-3))' },
    { label: t('demoDashboardStat2Label'), value: t('demoDashboardStat2Value'), delay: '0.34s', color: 'hsl(var(--chart-4))' },
    { label: t('demoDashboardStat3Label'), value: t('demoDashboardStat3Value'), delay: '0.44s', color: 'hsl(var(--chart-1))' },
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-5 gap-2.5">
        <div className="col-span-3">
          <MiniBarChart size="sm" title={t('demoDashboardChartTitle')} subtitle={t('demoDashboardChartSubtitle')} fill />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: 'hsl(var(--surface-1))',
                border: '1px solid hsl(var(--border)/0.5)',
                animation: `demo-fade-up 0.4s ease-out ${stat.delay} both`,
              }}
            >
              <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{stat.label}</p>
              <p className="text-sm font-bold leading-tight" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
          <MiniLineChart size="sm" title={t('demoDashboardTrendLabel')} className="flex-1 flex flex-col" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        <div className="col-span-2">
          <MiniDonut size="sm" title={t('demoDashboardDonutTitle')} subtitle={t('demoDashboardDonutSubtitle')} />
        </div>
        <div className="col-span-3">
          <RankedList size="sm" title={t('demoDashboardRankedTitle')} subtitle={t('demoDashboardRankedSubtitle')} />
        </div>
      </div>
    </div>
  );
}

function renderPanel(tab: TabKey, t: (key: TranslationKey) => string) {
  switch (tab) {
    case 'overview':
      return <OverviewPanel t={t} />;
    case 'bar':
      return <MiniBarChart size="lg" title={t('demoDashboardChartTitle')} subtitle={t('demoDashboardChartSubtitle')} />;
    case 'horizontalBar':
      return <RankedList size="lg" title={t('demoDashboardRankedTitle')} subtitle={t('demoDashboardRankedSubtitle')} />;
    case 'line':
      return <MiniLineChart size="lg" title={t('demoDashboardTrendLabel')} />;
    case 'area':
      return <MiniAreaChart title={t('demoShowcaseAreaTitle')} subtitle={t('demoShowcaseAreaSubtitle')} />;
    case 'pie':
      return <MiniDonut size="lg" title={t('demoDashboardDonutTitle')} subtitle={t('demoDashboardDonutSubtitle')} />;
    case 'scatter':
      return (
        <ScatterPlot
          title={t('demoShowcaseScatterTitle')}
          subtitle={t('demoShowcaseScatterSubtitle')}
          xLabel={t('demoShowcaseScatterXLabel')}
          yLabel={t('demoShowcaseScatterYLabel')}
        />
      );
    case 'radar':
      return (
        <RadarChart
          title={t('demoShowcaseRadarTitle')}
          subtitle={t('demoShowcaseRadarSubtitle')}
          axisLabels={[
            t('demoShowcaseRadarAxisSpeed'),
            t('demoShowcaseRadarAxisQuality'),
            t('demoShowcaseRadarAxisSupport'),
            t('demoShowcaseRadarAxisPrice'),
            t('demoShowcaseRadarAxisReach'),
          ]}
        />
      );
  }
}

export function ChartShowcase({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const [active, setActive] = useState<TabKey>('overview');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /**
   * True only while the showcase is actually on screen.
   *
   * Panels have different natural heights and the container animates to fit,
   * so every advance nudges the page below it. Advancing while the reader is
   * somewhere else entirely means the layout moves under them for no reason —
   * the demo should only play while it is being watched.
   */
  const [inView, setInView] = useState(false);
  // Stopped for good once the reader takes manual control of the tabs.
  const [userTookOver, setUserTookOver] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // A good slice of it has to be showing, not just one edge clipping in.
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !inView || userTookOver) return;

    // Background tabs get throttled timers and no paint, so an advance there
    // would just queue up work and land as a jump on return.
    const onVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (!intervalRef.current) {
        start();
      }
    };

    const start = () => {
      intervalRef.current = setInterval(() => {
        setActive((cur) => TAB_KEYS[(TAB_KEYS.indexOf(cur) + 1) % TAB_KEYS.length]);
      }, AUTO_ADVANCE_MS);
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [prefersReducedMotion, inView, userTookOver]);

  const stopAutoAdvance = () => {
    setUserTookOver(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTabClick = (tab: TabKey) => {
    stopAutoAdvance();
    setActive(tab);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIdx = e.key === 'ArrowRight'
        ? (idx + 1) % TAB_KEYS.length
        : (idx - 1 + TAB_KEYS.length) % TAB_KEYS.length;
      handleTabClick(TAB_KEYS[nextIdx]);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`demo-anim-wrapper rounded-2xl overflow-hidden shadow-2xl border border-border/60 select-none ${className}`}
      style={{ background: 'hsl(var(--card))' }}
      aria-label={t('demoShowcaseRegionLabel')}
    >
      {/* ── Browser-chrome header ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40"
        style={{ background: 'hsl(var(--surface-2))' }}
      >
        <div className="flex gap-1.5 flex-shrink-0">
          {(['hsl(0 80% 65%)', 'hsl(40 90% 58%)', 'hsl(145 65% 52%)'] as const).map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
          <FileSpreadsheet className="h-3 w-3 text-primary flex-shrink-0" />
          {/* Filename is illustrative — kept as a recognisable example, no translation needed */}
          <span className="font-medium truncate">sales_data.xlsx</span>
          <span className="text-border flex-shrink-0">·</span>
          <span className="flex-shrink-0 whitespace-nowrap">{t('demoDashboardMeta')}</span>
        </div>

        <div className="ml-auto flex-shrink-0">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: 'hsl(var(--primary)/0.12)', color: 'hsl(var(--primary))' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: 'hsl(var(--primary))', animation: 'pulse 1.5s ease-in-out infinite' }}
            />
            {t('demoDashboardAnalyzed')}
          </span>
        </div>
      </div>

      {/* ── Tab strip ── */}
      <div
        role="tablist"
        aria-label={t('demoShowcaseTablistLabel')}
        className="flex items-center gap-1 px-3 py-2 border-b border-border/40 overflow-x-auto"
        style={{ background: 'hsl(var(--surface-2))' }}
      >
        {TAB_KEYS.map((tab, idx) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[idx] = el; }}
              type="button"
              role="tab"
              id={`chart-tab-${tab}`}
              aria-selected={isActive}
              aria-controls={`chart-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(tab)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="relative px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
            >
              {isActive && (
                <motion.span
                  layoutId="chart-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                  transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {t(TAB_META[tab].labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Chart panel ── */}
      {/* w-full is what stops the horizontal breathing: without it the box was
          sized by panel content, so layout="size" measured a different width
          per panel and animated between them. Pinned to the card width, the
          measured width is now constant and only height settles — which is a
          real difference between panels, and worth easing rather than snapping. */}
      <motion.div
        layout="size"
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
        className="w-full p-3"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            role="tabpanel"
            id={`chart-panel-${active}`}
            aria-labelledby={`chart-tab-${active}`}
            aria-label={t(TAB_META[active].ariaKey)}
            tabIndex={0}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          >
            {renderPanel(active, t)}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Privacy footer ── */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-t border-border/40 text-[10px] text-muted-foreground"
        style={{ background: 'hsl(var(--surface-2))' }}
      >
        <Shield className="h-2.5 w-2.5 flex-shrink-0" style={{ color: 'hsl(var(--chart-3))' }} />
        {t('demoDashboardPrivacy')}
      </div>
    </div>
  );
}
