export interface ChartFormat {
  number?: 'auto' | 'compact' | 'percent' | 'currency';
  decimals?: number;
  currency?: string;
  dataLabels?: boolean;
  legend?: 'top' | 'bottom' | 'none';
  xTitle?: string;
  yTitle?: string;
  gridlines?: boolean;
  seriesColors?: Record<string, string>;
  /** A short single-series bar chart colours each bar by default; true = one colour (the series colour) instead. */
  oneColor?: boolean;
}

/** True when nothing is set, so callers can skip formatting and keep today's output. */
export function isDefaultFormat(format?: ChartFormat): boolean {
  return !format || Object.values(format).every(v => v === undefined);
}

/**
 * 'auto' is `n.toLocaleString(locale)`: DynamicChart's tooltip (ChartTooltipContent)
 * already renders values that way, and axis ticks are recharts' raw default.
 * 'percent' treats the value as a fraction (0.256 -> 25.6%), so a sum like 45
 * shows 4,500%; the user picks that mode deliberately.
 */
export function numberFormatter(format?: ChartFormat, locale?: string): (n: number) => string {
  const d = format?.decimals;
  const decimals = typeof d === 'number' && !Number.isNaN(d) ? Math.min(6, Math.max(0, Math.floor(d))) : undefined;
  const fixed = decimals === undefined ? {} : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  const build = (o: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, o);
  let nf: Intl.NumberFormat;
  switch (format?.number) {
    case 'compact':
      nf = build({ notation: 'compact', maximumFractionDigits: decimals ?? 2 });
      break;
    case 'percent':
      nf = build({ style: 'percent', ...fixed });
      break;
    case 'currency':
      try {
        nf = build({ style: 'currency', currency: format.currency || 'USD', ...fixed });
      } catch {
        nf = build({ style: 'currency', currency: 'USD', ...fixed });
      }
      break;
    default:
      nf = build(fixed);
  }
  return n => (typeof n === 'number' && Number.isFinite(n) ? nf.format(n) : '—');
}

/** Merge `patch` into `format`, dropping keys set back to undefined/'' so nothing but real choices is stored; undefined when empty. */
export function patchFormat(format: ChartFormat | undefined, patch: Partial<ChartFormat>): ChartFormat | undefined {
  const next: Record<string, unknown> = { ...format, ...patch };
  for (const k of Object.keys(next)) if (next[k] === undefined || next[k] === '') delete next[k];
  return isDefaultFormat(next as ChartFormat) ? undefined : (next as ChartFormat);
}
