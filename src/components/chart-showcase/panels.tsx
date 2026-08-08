"use client";

import { useId, type ReactNode } from 'react';
import { BARS, LINE_D, LINE_POINTS, AREA_D, REGIONS, RANKED, DONUT_R, SCATTER_POINTS, RADAR_VALUES } from './data';

export type ChartSize = 'sm' | 'lg';

function ChartCard({
  size, title, subtitle, className = '', children,
}: {
  size: ChartSize; title: string; subtitle: string; className?: string; children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl ${size === 'lg' ? 'p-4' : 'p-3'} ${className}`}
      style={{ background: 'hsl(var(--surface-1))', border: '1px solid hsl(var(--border)/0.5)' }}
    >
      <p className={`${size === 'lg' ? 'text-sm' : 'text-[11px]'} font-semibold text-foreground leading-tight ${subtitle ? '' : size === 'lg' ? 'mb-3' : 'mb-1.5'}`}>
        {title}
      </p>
      {subtitle && (
        <p className={size === 'lg' ? 'text-xs text-muted-foreground mb-4' : 'text-[10px] text-muted-foreground mb-3'}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export function MiniBarChart({
  size, title, subtitle, fill = false,
}: { size: ChartSize; title: string; subtitle: string; fill?: boolean }) {
  return (
    <ChartCard size={size} title={title} subtitle={subtitle} className={fill ? 'h-full flex flex-col' : ''}>
      <div
        className="flex items-end gap-2"
        style={fill ? { flex: 1, minHeight: 0 } : { height: size === 'lg' ? 220 : 82 }}
      >
        {BARS.map((bar, i) => (
          <div key={bar.label} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${bar.pct}%`,
                background: i % 2 === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
                transformOrigin: 'bottom',
                animation: `demo-bar-grow 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.15 + i * 0.09}s both`,
              }}
            />
            <span className={size === 'lg' ? 'text-xs text-muted-foreground leading-none' : 'text-[9px] text-muted-foreground leading-none'}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function MiniLineChart({
  size, title, subtitle = '', className = '',
}: { size: ChartSize; title: string; subtitle?: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const isLg = size === 'lg';
  return (
    <ChartCard size={size} title={title} subtitle={subtitle} className={className}>
      <svg viewBox="0 0 100 44" className="w-full" style={{ height: isLg ? 220 : undefined, flex: isLg ? undefined : 1 }} aria-hidden="true">
        {/* Standalone "lg" view stays a pure line — no area fill — so it doesn't
            read as the same chart type as the Area tab */}
        {!isLg && (
          <>
            <defs>
              <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${LINE_D} L 98,44 L 2,44 Z`}
              fill={`url(#${uid}g)`}
              style={{ opacity: 0, animation: 'demo-fade-up 0.3s ease-out 0.5s both' }}
            />
          </>
        )}
        {/* Trend line — draws itself via stroke-dashoffset */}
        <path
          d={LINE_D}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={isLg ? 2.2 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'demo-line-draw 0.9s ease-out 0.35s both' }}
        />
        {/* Data-point markers — only on the standalone view, reinforcing "line chart" over "area chart" */}
        {isLg && LINE_POINTS.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="2.2"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="1.6"
            style={{
              transformOrigin: `${p.x}px ${p.y}px`,
              transform: 'scale(0)',
              opacity: 0,
              animation: `demo-scatter-pop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.4 + i * 0.12}s both`,
            }}
          />
        ))}
        {!isLg && (
          <circle cx="98" cy="5" r="2.5" fill="hsl(var(--primary))" style={{ opacity: 0, animation: 'demo-fade-up 0.2s ease-out 1.2s both' }} />
        )}
      </svg>
    </ChartCard>
  );
}

function DonutRing({ boxSize, strokeWidth, centerTextClass }: { boxSize: number; strokeWidth: number; centerTextClass: string }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: boxSize, height: boxSize }}>
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full"
        style={{ animation: 'demo-donut-reveal 0.6s ease-out 0.15s both' }}
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
                  strokeWidth={strokeWidth}
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
        style={{ opacity: 0, animation: 'demo-fade-up 0.3s ease-out 0.65s both' }}
      >
        <span className={centerTextClass} style={{ color: REGIONS[0].color }}>{REGIONS[0].pct}%</span>
      </div>
    </div>
  );
}

export function MiniDonut({ size, title, subtitle }: { size: ChartSize; title: string; subtitle: string }) {
  if (size === 'lg') {
    // Stacked + centered: a side-by-side legend stretched across a wide card leaves
    // the label and its value far apart, reading as scattered rather than grouped.
    return (
      <ChartCard size={size} title={title} subtitle={subtitle}>
        <div className="flex flex-col items-center">
          <DonutRing boxSize={176} strokeWidth={3.5} centerTextClass="text-2xl font-bold" />
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5">
            {REGIONS.map((r, i) => (
              <div
                key={r.label}
                className="inline-flex items-center gap-1.5"
                style={{ opacity: 0, animation: `demo-fade-up 0.3s ease-out ${0.4 + i * 0.08}s both` }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard size={size} title={title} subtitle={subtitle}>
      <div className="flex items-center gap-3">
        <DonutRing boxSize={64} strokeWidth={4} centerTextClass="text-[11px] font-bold" />
        <div className="flex-1 min-w-0 space-y-1.5">
          {REGIONS.map((r, i) => (
            <div
              key={r.label}
              className="flex items-center gap-1.5"
              style={{ opacity: 0, animation: `demo-fade-up 0.3s ease-out ${0.4 + i * 0.08}s both` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-[9px] text-muted-foreground flex-1 truncate">{r.label}</span>
              <span className="text-[9px] font-semibold text-foreground tabular-nums">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

export function RankedList({ size, title, subtitle }: { size: ChartSize; title: string; subtitle: string }) {
  const isLg = size === 'lg';
  return (
    <ChartCard size={size} title={title} subtitle={subtitle}>
      <div className={isLg ? 'space-y-3.5' : 'space-y-2'}>
        {RANKED.map((row, i) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className={`${isLg ? 'text-xs w-24' : 'text-[9px] w-14'} text-muted-foreground flex-shrink-0 truncate`}>{row.label}</span>
            <div className={`flex-1 ${isLg ? 'h-3' : 'h-2'} rounded-full overflow-hidden`} style={{ background: 'hsl(var(--border)/0.3)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.pct}%`,
                  background: 'hsl(var(--chart-2))',
                  opacity: 1 - i * 0.18,
                  transformOrigin: 'left',
                  animation: `demo-bar-grow-x 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.25 + i * 0.09}s both`,
                }}
              />
            </div>
            <span
              className={`${isLg ? 'text-xs w-10' : 'text-[9px] w-7'} font-semibold text-foreground tabular-nums text-right flex-shrink-0`}
              style={{ opacity: 0, animation: `demo-fade-up 0.25s ease-out ${0.5 + i * 0.09}s both` }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function MiniAreaChart({ title, subtitle }: { title: string; subtitle: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <ChartCard size="lg" title={title} subtitle={subtitle}>
      <svg viewBox="0 0 100 44" className="w-full" style={{ height: 220 }} aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}ag`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Baseline */}
        <line x1="0" y1="44" x2="100" y2="44" stroke="hsl(var(--border)/0.6)" strokeWidth="0.5" />
        {/* Solid filled region, no separate stroke line — reads as "area" rather than "line" */}
        <path
          d={`${AREA_D} L 98,44 L 2,44 Z`}
          fill={`url(#${uid}ag)`}
          stroke="hsl(var(--chart-2))"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ transformOrigin: '50px 44px', transform: 'scaleY(0)', opacity: 0, animation: 'demo-area-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both' }}
        />
      </svg>
    </ChartCard>
  );
}

const RADAR_AXIS_COUNT = RADAR_VALUES.length;
const RADAR_CENTER = 50;
const RADAR_MAX_R = 38;

function radarPoint(fraction: number, index: number) {
  const angle = (-90 + index * (360 / RADAR_AXIS_COUNT)) * (Math.PI / 180);
  const r = RADAR_MAX_R * fraction;
  return { x: RADAR_CENTER + r * Math.cos(angle), y: RADAR_CENTER + r * Math.sin(angle) };
}

function radarPolygon(fractions: number[]) {
  return fractions.map((f, i) => { const p = radarPoint(f, i); return `${p.x},${p.y}`; }).join(' ');
}

export function RadarChart({ title, subtitle, axisLabels }: { title: string; subtitle: string; axisLabels: string[] }) {
  const dataFractions = RADAR_VALUES.map((v) => v / 100);
  return (
    <ChartCard size="lg" title={title} subtitle={subtitle}>
      <svg viewBox="0 0 100 100" className="w-full" style={{ height: 240 }} aria-hidden="true">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={radarPolygon(Array(RADAR_AXIS_COUNT).fill(ring))}
            fill="none"
            stroke="hsl(var(--border)/0.5)"
            strokeWidth="0.4"
          />
        ))}
        {/* Axis lines */}
        {axisLabels.map((_, i) => {
          const p = radarPoint(1, i);
          return <line key={i} x1={RADAR_CENTER} y1={RADAR_CENTER} x2={p.x} y2={p.y} stroke="hsl(var(--border)/0.5)" strokeWidth="0.4" />;
        })}
        {/* Data polygon */}
        <polygon
          points={radarPolygon(dataFractions)}
          fill="hsl(var(--chart-1)/0.35)"
          stroke="hsl(var(--chart-1))"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{
            transformOrigin: `${RADAR_CENTER}px ${RADAR_CENTER}px`,
            transform: 'scale(0)',
            opacity: 0,
            animation: 'demo-scatter-pop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) 0.15s both',
          }}
        />
        {/* Axis labels */}
        {axisLabels.map((label, i) => {
          const p = radarPoint(1.22, i);
          return (
            <text
              key={label}
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="5"
              fill="hsl(var(--muted-foreground))"
              style={{ opacity: 0, animation: `demo-fade-up 0.3s ease-out ${0.5 + i * 0.06}s both` }}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </ChartCard>
  );
}

export function ScatterPlot({
  title, subtitle, xLabel, yLabel,
}: { title: string; subtitle: string; xLabel: string; yLabel: string }) {
  return (
    <ChartCard size="lg" title={title} subtitle={subtitle}>
      <svg viewBox="0 0 100 60" className="w-full" style={{ height: 220 }} aria-hidden="true">
        {[15, 30, 45].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border)/0.4)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}
        {SCATTER_POINTS.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r="2.6"
            fill={`hsl(var(--chart-${(i % 6) + 1}))`}
            style={{
              transformOrigin: `${p.x}px ${p.y}px`,
              transform: 'scale(0)',
              opacity: 0,
              animation: `demo-scatter-pop 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) ${0.1 + i * 0.06}s both`,
            }}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">{xLabel} →</span>
        <span className="text-[10px] text-muted-foreground">↑ {yLabel}</span>
      </div>
    </ChartCard>
  );
}
