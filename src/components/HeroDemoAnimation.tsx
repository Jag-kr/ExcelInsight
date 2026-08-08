"use client";

import { useState, useEffect, useId } from 'react';
import { FileSpreadsheet, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const BARS = [
  { label: 'Q1', pct: 52 },
  { label: 'Q2', pct: 81 },
  { label: 'Q3', pct: 64 },
  { label: 'Q4', pct: 97 },
];

// Q1–Q4 labels are internationally understood abbreviations; pct values are illustrative data.
// Region codes (NA/EU/APAC/LATAM) and "Product A–D" are illustrative placeholders, same as
// sales_data.xlsx above — no translation needed.
// All human-readable text is sourced from useI18n below.

// Smooth upward-trending SVG path (viewBox 0 0 100 44)
const LINE_D = 'M 2,38 C 10,34 18,26 28,22 S 46,9 58,13 S 74,19 86,11 L 98,5';

// Donut segments — sum to 100
const REGIONS = [
  { label: 'NA', pct: 42, color: 'hsl(var(--chart-1))' },
  { label: 'EU', pct: 28, color: 'hsl(var(--chart-2))' },
  { label: 'APAC', pct: 19, color: 'hsl(var(--chart-5))' },
  { label: 'LATAM', pct: 11, color: 'hsl(var(--chart-6))' },
];

// Horizontal ranked bars — widths relative to the top row
const RANKED = [
  { label: 'Product A', value: '312', pct: 100 },
  { label: 'Product B', value: '289', pct: 87 },
  { label: 'Product C', value: '204', pct: 61 },
  { label: 'Product D', value: '167', pct: 48 },
];

const DONUT_R = 15.915; // circumference ≈ 100, so pct maps directly to dash length

export function HeroDemoAnimation({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const [cycle, setCycle] = useState(0);
  // useId gives each instance a stable unique prefix — prevents SVG gradient ID collisions
  // when the component is rendered both in the hero and in the below-fold section.
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    const timer = setInterval(() => setCycle((c) => c + 1), 4400);
    return () => clearInterval(timer);
  }, []);

  const STATS = [
    { label: t('demoDashboardStat1Label'), value: t('demoDashboardStat1Value'), delay: '0.24s', color: 'hsl(var(--chart-3))' },
    { label: t('demoDashboardStat2Label'), value: t('demoDashboardStat2Value'), delay: '0.34s', color: 'hsl(var(--chart-4))' },
    { label: t('demoDashboardStat3Label'), value: t('demoDashboardStat3Value'), delay: '0.44s', color: 'hsl(var(--chart-1))' },
  ];

  return (
    <div
      key={cycle}
      className={`demo-anim-wrapper rounded-2xl overflow-hidden shadow-2xl border border-border/60 select-none ${className}`}
      style={{ background: 'hsl(var(--card))' }}
      role="img"
      aria-label="ExcelInsight demo: a spreadsheet transforms into bar, line, and donut charts, a ranked list, statistics, and a full interactive dashboard"
    >
      {/* ── Browser-chrome header ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40"
        style={{ background: 'hsl(var(--surface-2))' }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0">
          {(['hsl(0 80% 65%)', 'hsl(40 90% 58%)', 'hsl(145 65% 52%)'] as const).map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>

        {/* Filename chip */}
        <div
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0"
          style={{ animation: 'demo-fade-up 0.4s ease-out 0.05s both' }}
        >
          <FileSpreadsheet className="h-3 w-3 text-primary flex-shrink-0" />
          {/* Filename is illustrative — kept as a recognisable example, no translation needed */}
          <span className="font-medium truncate">sales_data.xlsx</span>
          <span className="text-border flex-shrink-0">·</span>
          <span className="flex-shrink-0 whitespace-nowrap">{t('demoDashboardMeta')}</span>
        </div>

        {/* "Analyzed" badge */}
        <div
          className="ml-auto flex-shrink-0"
          style={{ animation: 'demo-fade-up 0.4s ease-out 0.15s both' }}
        >
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

      {/* ── Dashboard content ── */}
      <div className="p-3 grid grid-cols-5 gap-2.5">

        {/* Bar chart — occupies 3 of 5 columns */}
        <div
          className="col-span-3 rounded-xl p-3"
          style={{
            background: 'hsl(var(--surface-1))',
            border: '1px solid hsl(var(--border)/0.5)',
            animation: 'demo-fade-up 0.35s ease-out 0.08s both',
          }}
        >
          <p className="text-[11px] font-semibold text-foreground leading-tight">
            {t('demoDashboardChartTitle')}
          </p>
          <p className="text-[10px] text-muted-foreground mb-3">{t('demoDashboardChartSubtitle')}</p>

          {/* Bars */}
          <div className="flex items-end gap-2" style={{ height: '82px' }}>
            {BARS.map((bar, i) => (
              <div key={bar.label} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${bar.pct}%`,
                    background: i % 2 === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
                    transformOrigin: 'bottom',
                    animation: `demo-bar-grow 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.18 + i * 0.09}s both`,
                  }}
                />
                {/* Q1–Q4 are universally understood abbreviations */}
                <span className="text-[9px] text-muted-foreground leading-none">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — 2 of 5 columns */}
        <div className="col-span-2 flex flex-col gap-2">

          {/* Stat cards */}
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
              <p className="text-sm font-bold leading-tight" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}

          {/* Mini line chart */}
          <div
            className="rounded-lg p-2 flex-1 flex flex-col"
            style={{
              background: 'hsl(var(--surface-1))',
              border: '1px solid hsl(var(--border)/0.5)',
              animation: 'demo-fade-up 0.4s ease-out 0.55s both',
            }}
          >
            <p className="text-[9px] text-muted-foreground mb-1.5">{t('demoDashboardTrendLabel')}</p>
            <svg viewBox="0 0 100 44" className="w-full flex-1" aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`${LINE_D} L 98,44 L 2,44 Z`}
                fill={`url(#${uid}g)`}
                style={{ opacity: 0, animation: 'demo-fade-up 0.3s ease-out 0.78s both' }}
              />
              {/* Trend line — draws itself via stroke-dashoffset */}
              <path
                d={LINE_D}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: 200,
                  animation: 'demo-line-draw 0.9s ease-out 0.65s both',
                }}
              />
              {/* End-point dot */}
              <circle
                cx="98" cy="5" r="2.5"
                fill="hsl(var(--primary))"
                style={{ opacity: 0, animation: 'demo-fade-up 0.2s ease-out 1.5s both' }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Second dashboard row — donut + ranked list, both real ExcelInsight chart types ── */}
      <div className="px-3 pb-3 grid grid-cols-5 gap-2.5">

        {/* Donut chart — col-span-2 */}
        <div
          className="col-span-2 rounded-xl p-3"
          style={{
            background: 'hsl(var(--surface-1))',
            border: '1px solid hsl(var(--border)/0.5)',
            animation: 'demo-fade-up 0.35s ease-out 0.5s both',
          }}
        >
          <p className="text-[11px] font-semibold text-foreground leading-tight">
            {t('demoDashboardDonutTitle')}
          </p>
          <p className="text-[10px] text-muted-foreground mb-2">{t('demoDashboardDonutSubtitle')}</p>

          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg
                viewBox="0 0 36 36"
                className="w-full h-full"
                style={{ animation: 'demo-donut-reveal 0.6s ease-out 0.65s both' }}
                aria-hidden="true"
              >
                <g transform="rotate(-90 18 18)">
                  {(() => {
                    let cumulative = 0;
                    return REGIONS.map((r) => {
                      const offset = -cumulative;
                      cumulative += r.pct;
                      return (
                        <circle
                          key={r.label}
                          cx="18" cy="18" r={DONUT_R}
                          fill="transparent"
                          stroke={r.color}
                          strokeWidth="4"
                          strokeDasharray={`${r.pct} ${100 - r.pct}`}
                          strokeDashoffset={offset}
                        />
                      );
                    });
                  })()}
                </g>
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: 0, animation: 'demo-fade-up 0.3s ease-out 1.15s both' }}
              >
                <span className="text-[11px] font-bold" style={{ color: REGIONS[0].color }}>
                  {REGIONS[0].pct}%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 min-w-0 space-y-1">
              {REGIONS.map((r, i) => (
                <div
                  key={r.label}
                  className="flex items-center gap-1.5"
                  style={{ opacity: 0, animation: `demo-fade-up 0.3s ease-out ${0.9 + i * 0.08}s both` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-[9px] text-muted-foreground flex-1 truncate">{r.label}</span>
                  <span className="text-[9px] font-semibold text-foreground tabular-nums">{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranked bar list — col-span-3 */}
        <div
          className="col-span-3 rounded-xl p-3"
          style={{
            background: 'hsl(var(--surface-1))',
            border: '1px solid hsl(var(--border)/0.5)',
            animation: 'demo-fade-up 0.35s ease-out 0.55s both',
          }}
        >
          <p className="text-[11px] font-semibold text-foreground leading-tight">
            {t('demoDashboardRankedTitle')}
          </p>
          <p className="text-[10px] text-muted-foreground mb-2.5">{t('demoDashboardRankedSubtitle')}</p>

          <div className="space-y-2">
            {RANKED.map((row, i) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground w-14 flex-shrink-0 truncate">{row.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--border)/0.3)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.pct}%`,
                      background: 'hsl(var(--chart-2))',
                      opacity: 1 - i * 0.18,
                      transformOrigin: 'left',
                      animation: `demo-bar-grow-x 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.75 + i * 0.09}s both`,
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-semibold text-foreground tabular-nums w-7 text-right flex-shrink-0"
                  style={{ opacity: 0, animation: `demo-fade-up 0.25s ease-out ${1.0 + i * 0.09}s both` }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Privacy footer ── */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-t border-border/40 text-[10px] text-muted-foreground"
        style={{
          background: 'hsl(var(--surface-2))',
          animation: 'demo-fade-up 0.35s ease-out 0.1s both',
        }}
      >
        <Shield className="h-2.5 w-2.5 flex-shrink-0" style={{ color: 'hsl(var(--chart-3))' }} />
        {t('demoDashboardPrivacy')}
      </div>
    </div>
  );
}
