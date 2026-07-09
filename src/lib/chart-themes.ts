import type { ChartConfig } from '@/components/ui/chart';

export type ChartType = 'bar' | 'horizontalBar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';

export const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'horizontalBar', label: 'Horizontal Bar' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'radar', label: 'Radar Chart' },
];

/** Total number of chart CSS variables available (--chart-1 through --chart-8). */
const CHART_COLOR_COUNT = 8;

/**
 * Get the CSS variable reference for a chart color index.
 * Cycles through --chart-1 to --chart-8.
 */
export function getChartColor(index: number): string {
  return `hsl(var(--chart-${(index % CHART_COLOR_COUNT) + 1}))`;
}

/**
 * Get the CSS variable value (for use in `fill` / `stroke` props via ChartContainer).
 * Returns `var(--color-KEY)` where KEY is the sanitized data key.
 */
export function getChartVarColor(key: string): string {
  return `var(--color-${key})`;
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
