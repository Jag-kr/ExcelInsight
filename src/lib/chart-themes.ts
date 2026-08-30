"use client";

import { createContext, useContext } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import type { TranslationKey } from '@/lib/i18n';

export type ChartType = 'bar' | 'horizontalBar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';

export const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'horizontalBar', label: 'Horizontal Bar' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'donut', label: 'Donut Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'radar', label: 'Radar Chart' },
];

/**
 * Total number of chart CSS variables available (--chart-1 through --chart-8).
 *
 * Exported because it is also a cap on how many categories can be coloured
 * distinctly: past this count the palette wraps, and two unrelated categories
 * would share a colour.
 */
export const CHART_COLOR_COUNT = 8;

/**
 * Get the CSS variable reference for a chart color index.
 * Cycles through --chart-1 to --chart-8.
 */
export function getChartColor(index: number): string {
  return `hsl(var(--chart-${(index % CHART_COLOR_COUNT) + 1}))`;
}

/**
 * Get the bare CSS variable reference (no hsl() wrapper) for a chart color
 * index, for composing into `hsl(var(--chart-N) / alpha)` expressions.
 * Cycles through --chart-1 to --chart-8.
 */
export function getChartColorVar(index: number): string {
  return `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`;
}

/**
 * Get the CSS variable value (for use in `fill` / `stroke` props via ChartContainer).
 * Returns `var(--color-KEY)` where KEY is the sanitized data key.
 */
export function getChartVarColor(key: string): string {
  const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `var(--color-${sanitizedKey})`;
}

/**
 * Build a shadcn ChartConfig from an array of data keys.
 * Each key is mapped to a --chart-N CSS variable color.
 */
export function buildChartConfig(dataKeys: string[]): ChartConfig {
  const config: ChartConfig = {};
  dataKeys.forEach((key, i) => {
    config[key] = {
      label: key,
      color: getChartColor(i),
    };
  });
  return config;
}

/**
 * Build a ChartConfig for pie/scatter charts where each data entry gets a color.
 * Useful when coloring by data point (e.g., pie slices).
 */
export function buildPieChartConfig(data: Record<string, any>[], nameKey: string): ChartConfig {
  const config: ChartConfig = {};
  data.forEach((item, i) => {
    const label = String(item[nameKey] ?? `Item ${i + 1}`);
    config[label] = {
      label,
      color: getChartColor(i),
    };
  });
  return config;
}

/* ══════════════════════════════════════════
   CHART COLOR PALETTES
   Independent of the app's light/dark UI mode — selectable per user,
   drives both on-screen chart colors (via CSS vars) and the PDF export
   accent color.
══════════════════════════════════════════ */

export type ChartPaletteId = 'default' | 'professional' | 'vibrant' | 'colorblind-safe' | 'pastel';

/** Exactly 8 "H S% L%" strings, matching CHART_COLOR_COUNT. */
type EightHsl = readonly [string, string, string, string, string, string, string, string];

export interface ChartPalette {
  id: ChartPaletteId;
  labelKey: TranslationKey;
  colors: { light: EightHsl; dark: EightHsl };
  /** Accent color for the PDF cover page / header stripe (jsPDF can't read CSS vars). */
  pdfAccent: string;
}

export const CHART_PALETTES: ChartPalette[] = [
  {
    id: 'default',
    labelKey: 'chartPaletteDefault',
    colors: {
      light: ['38 60% 34%', '176 42% 32%', '8 58% 46%', '90 35% 33%', '15 62% 43%', '200 20% 41%', '48 68% 29%', '35 12% 40%'],
      dark: ['40 80% 55%', '176 40% 48%', '8 55% 55%', '90 35% 48%', '15 60% 55%', '200 20% 55%', '48 65% 55%', '35 12% 58%'],
    },
    pdfAccent: '239 84% 67%',
  },
  {
    id: 'professional',
    labelKey: 'chartPaletteProfessional',
    colors: {
      light: ['217 55% 38%', '190 45% 35%', '230 25% 48%', '40 45% 42%', '150 25% 38%', '350 40% 40%', '210 12% 50%', '260 18% 52%'],
      dark: ['217 60% 62%', '190 50% 55%', '230 35% 68%', '40 55% 60%', '150 30% 55%', '350 45% 62%', '210 12% 68%', '260 25% 70%'],
    },
    pdfAccent: '217 55% 50%',
  },
  {
    id: 'vibrant',
    labelKey: 'chartPaletteVibrant',
    colors: {
      light: ['335 85% 48%', '210 90% 44%', '95 70% 30%', '25 95% 42%', '270 80% 55%', '175 75% 30%', '45 95% 32%', '355 80% 46%'],
      dark: ['335 90% 68%', '210 95% 65%', '95 75% 55%', '25 95% 62%', '270 85% 68%', '175 80% 52%', '45 95% 58%', '355 85% 62%'],
    },
    pdfAccent: '335 85% 58%',
  },
  {
    id: 'colorblind-safe',
    labelKey: 'chartPaletteColorblindSafe',
    colors: {
      light: ['41 100% 32%', '202 70% 48%', '164 100% 28%', '56 82% 24%', '202 100% 30%', '26 100% 40%', '327 45% 45%', '0 0% 42%'],
      dark: ['41 100% 60%', '202 80% 68%', '164 85% 50%', '56 85% 65%', '202 100% 55%', '26 100% 58%', '327 50% 68%', '0 0% 68%'],
    },
    pdfAccent: '32 100% 35%',
  },
  {
    id: 'pastel',
    labelKey: 'chartPalettePastel',
    colors: {
      light: ['350 55% 52%', '205 55% 44%', '155 45% 32%', '25 65% 46%', '270 42% 52%', '48 60% 30%', '175 40% 32%', '320 32% 48%'],
      dark: ['350 60% 75%', '205 65% 72%', '155 50% 65%', '25 75% 72%', '270 50% 75%', '48 70% 68%', '175 45% 65%', '320 40% 70%'],
    },
    pdfAccent: '350 55% 55%',
  },
];

export function getChartPalette(id: string): ChartPalette {
  return CHART_PALETTES.find((p) => p.id === id) ?? CHART_PALETTES[0];
}

export interface ChartPaletteContextType {
  paletteId: ChartPaletteId;
  setPaletteId: (id: ChartPaletteId) => void;
}

export const ChartPaletteContext = createContext<ChartPaletteContextType>({
  paletteId: 'default',
  setPaletteId: () => {},
});

export function useChartPalette() {
  return useContext(ChartPaletteContext);
}
