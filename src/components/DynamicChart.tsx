import { useRef, useMemo, useState } from 'react';
import {
  BarChart, Bar, ComposedChart, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import type { LabelProps } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import html2canvas from 'html2canvas';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, ScatterChart as ScatterChartIcon, Radar as RadarIcon, ChartNoAxesCombined, MoreHorizontal, AlignLeft, Donut as DonutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartType, chartTypeOptions, buildChartConfig, buildPieChartConfig, getChartColor, getChartVarColor, getChartColorVar, colorsByCategory } from '@/lib/chart-themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/lib/i18n';
import { trackEvent } from '@/lib/analytics';
import { numberFormatter, type ChartFormat } from '@/lib/format';

interface DynamicChartProps {
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
  onChangeType?: (type: ChartType) => void;
  onRenameTitle?: (title: string) => void;
  showControls?: boolean;
  /** Header chart-type switcher; the title, description and download button are unaffected. */
  showTypeSwitcher?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Stack series on one bar/area instead of grouping them side by side. */
  stacked?: boolean;
  /** Optional presentation overrides; undefined/empty renders exactly as before. */
  format?: ChartFormat;
  /**
   * Cross-filtering: called with the category label of a clicked bar, column,
   * slice or line/area point. Absent = marks are not interactive.
   * Pointer-only: keyboard users have page filters and per-visual filters.
   */
  onSelect?: (label: string) => void;
  /** Fill the height of the parent (grid cell) instead of using `size`. Default: content-sized. */
  fill?: boolean;
}

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg', string> = {
  xs: 'h-[130px] xs:h-[140px] sm:h-[150px] lg:h-[160px]',
  sm: 'h-[160px] xs:h-[170px] sm:h-[180px] lg:h-[190px]',
  md: 'h-[180px] xs:h-[200px] sm:h-[220px] lg:h-[240px]',
  lg: 'h-[200px] xs:h-[220px] sm:h-[250px] lg:h-[300px]',
};

/* Quick chart type pills — show the first 4 as icon buttons, rest in overflow */
const CHART_TYPE_ICONS: Record<ChartType, React.ElementType> = {
  bar: BarChart3,
  horizontalBar: AlignLeft,
  line: LineChartIcon,
  area: AreaChartIcon,
  pie: PieChartIcon,
  donut: DonutIcon,
  scatter: ScatterChartIcon,
  radar: RadarIcon,
  combo: ChartNoAxesCombined,
};

/* Series keys can be any column value ("Sales (sum)", "North / East"), which
   breaks an unescaped url(#id) reference — same sanitising as getChartVarColor. */
const gradientId = (key: string) => `grad-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

/* Axis title as displayed: horizontal = under the x axis, vertical = beside the y axis. */
const axisTitle = (value?: string, vertical = false): LabelProps | undefined => value
  ? { value, className: 'fill-muted-foreground', fontSize: 11, ...(vertical ? { angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } } : { position: 'insideBottom' }) }
  : undefined;

const PRIMARY_CHART_TYPES: ChartType[] = ['bar', 'line', 'area', 'donut'];
const OVERFLOW_CHART_TYPES: ChartType[] = ['horizontalBar', 'pie', 'scatter', 'radar', 'combo'];

export function DynamicChart({
  title, description, type, data, dataKeys, xKey = 'name',
  onChangeType, onRenameTitle, showControls = true, showTypeSwitcher = true, size = 'md', stacked = false, format, onSelect, fill = false,
}: DynamicChartProps) {
  const { t } = useI18n();
  const chartRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [transitioning, setTransitioning] = useState(false);

  const chartConfig = useMemo<ChartConfig>(() => {
    if (type === 'pie' || type === 'donut' || type === 'scatter') {
      return buildPieChartConfig(data, xKey);
    }
    const config = buildChartConfig(dataKeys);
    /* Per-series overrides; ignore anything but #rrggbb (storage can be hand-edited). */
    for (const [key, color] of Object.entries(format?.seriesColors ?? {})) {
      if (dataKeys.includes(key) && /^#[0-9a-f]{6}$/i.test(color)) config[key] = { label: key, color };
    }
    return config;
  }, [dataKeys, data, xKey, type, format?.seriesColors]);

  /**
   * Whether bars should be coloured per category rather than per series.
   *
   * A bar chart with one series was drawing every bar in the same colour while
   * a pie of the identical data got eight — so the two views of one dataset
   * looked unrelated. Colouring by category fixes that, but only under two
   * conditions:
   *
   *  - Single series only. With several dataKeys the bars are grouped and
   *    colour has to encode *which series*, or the legend stops being true.
   *  - Categories must fit the palette. It wraps at CHART_COLOR_COUNT, so a
   *    20-bar chart would hand bar 1 and bar 9 the same colour and imply a
   *    grouping that does not exist. Past the cap, one colour is the honest
   *    answer.
   */
  const colorByCategory = colorsByCategory(dataKeys.length, data.length);

  /* Printed values only stay legible on a short, single-series bar chart —
     past that they collide with each other and with the axis. */
  const showValueLabels = format?.dataLabels ?? (dataKeys.length === 1 && data.length <= 8 && size !== 'xs');

  /* Only built when a number mode or decimals is chosen; otherwise recharts' defaults apply. */
  const fmt = useMemo(
    () => (format?.number || format?.decimals !== undefined ? numberFormatter(format) : undefined),
    [format],
  );
  const labelFmt = fmt && ((v: unknown) => fmt(Number(v)));
  const tooltip = <ChartTooltip content={<ChartTooltipContent valueFormatter={fmt} />} />;
  /* A lone series named by an internal key ("value", "count") makes a legend that just says "value":
     noise. Pie/donut legends name the slices, so they stay; an explicit legend choice always wins. */
  const hideGenericLegend = !format?.legend && type !== 'pie' && type !== 'donut'
    && dataKeys.length === 1 && (dataKeys[0] === 'value' || dataKeys[0] === 'count');
  const legend = format?.legend === 'none' || hideGenericLegend ? null : (
    <ChartLegend {...(format?.legend === 'top' ? { verticalAlign: 'top' as const } : {})} content={<ChartLegendContent />} />
  );
  const xLabel = axisTitle(format?.xTitle);
  const yLabel = axisTitle(format?.yTitle, true);
  /* Props are spread only when set: recharts merges axis props over its defaults, so an
     explicit `undefined` (width, height, verticalAlign) would override them and blank the chart. */
  const xTitleProps = (height: number) => (format?.xTitle ? { height, label: xLabel } : {});
  const yTitleProps = (width: number) => (format?.yTitle ? { width, label: yLabel } : {});
  /* A formatted value axis ("$13,500.00") is wider than recharts' default 60px; size it from
     the longest tick we can expect (the data max, nudged up for the nice-number round-up). */
  const tickWidth = useMemo(() => {
    if (!fmt) return 0;
    let max = 0;
    for (const row of data) for (const k of dataKeys) { const v = Math.abs(Number(row[k])); if (Number.isFinite(v) && v > max) max = v; }
    return fmt(max * 1.2).length * 7 + 16;
  }, [fmt, data, dataKeys]);
  const valueAxisProps = () => ({
    ...(fmt ? { tickFormatter: fmt, width: Math.max(60, tickWidth) + (format?.yTitle ? 20 : 0) } : {}),
    ...(format?.yTitle ? { label: yLabel, ...(fmt ? {} : { width: 80 }) } : {}),
  });
  const grid = format?.gridlines !== false;

  /**
   * Recharts reads the tooltip's swatch colour from `payload.fill` (see
   * ChartTooltipContent's `item.payload.fill || item.color`), which the <Cell>
   * elements below do not reach. Writing the colour onto the row as well keeps
   * the swatch matched to the bar the cursor is over.
   */
  const barData = useMemo(() => {
    if (!colorByCategory) return data;
    return data.map((row, i) => ({ ...row, fill: getChartColor(i) }));
  }, [data, colorByCategory]);

  /* Handlers are spread only when onSelect is set (never `onClick={cond ? fn : undefined}`:
     recharts merges props over its defaults, so an explicit undefined would override them). */
  const pick = (row?: Record<string, unknown>) => {
    const label = row?.[xKey] ?? row?.name;
    if (label != null) onSelect!(String(label));
  };
  const markProps = onSelect ? { className: 'cursor-pointer', onClick: (d: { payload?: Record<string, unknown> }) => pick(d.payload) } : {};
  const plotProps = onSelect
    ? { style: { cursor: 'pointer' }, onClick: (s: { activeLabel?: string | number }) => { if (s?.activeLabel != null) onSelect(String(s.activeLabel)); } }
    : {};

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const controls = chartRef.current.querySelectorAll('[data-export-hide]');
      controls.forEach(el => (el as HTMLElement).style.display = 'none');
      const bgColor = getComputedStyle(document.body).backgroundColor || '#ffffff';
      const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: bgColor, useCORS: true });
      const url = canvas.toDataURL('image/png');
      controls.forEach(el => (el as HTMLElement).style.display = '');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
      trackEvent('export_png', { status: 'success', chartType: type });
    } catch (e) {
      console.error('Export failed', e);
      trackEvent('export_png', { status: 'failed', chartType: type });
    }
  };

  const handleTypeChange = (newType: ChartType) => {
    if (newType === type || !onChangeType) return;
    setTransitioning(true);
    setTimeout(() => {
      onChangeType(newType);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitioning(false));
      });
    }, 120);
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={barData} accessibilityLayer>
            {grid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} {...xTitleProps(80)} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...valueAxisProps()} />
            {tooltip}
            {/* One series means one legend entry — which, once the bars are
                coloured per category, describes none of them. The axis already
                names every bar, so the legend is dropped rather than left
                showing a swatch that matches nothing on screen. */}
            {!colorByCategory && legend}
            {dataKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={getChartVarColor(key)} radius={stacked ? 0 : [4, 4, 0, 0]} stackId={stacked ? 'stack' : undefined} {...markProps}>
                {colorByCategory && barData.map((_, i) => (
                  <Cell key={i} fill={getChartColor(i)} />
                ))}
                {showValueLabels && <LabelList dataKey={key} position="top" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Bar>
            ))}
          </BarChart>
        );
      case 'horizontalBar':
        return (
          <BarChart data={barData} layout="vertical" accessibilityLayer>
            {grid && <CartesianGrid horizontal={false} />}
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...(fmt ? { tickFormatter: fmt } : {})} {...xTitleProps(50)} />
            <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={80} {...yTitleProps(100)} />
            {tooltip}
            {!colorByCategory && legend}
            {dataKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={getChartVarColor(key)} radius={stacked ? 0 : [0, 4, 4, 0]} stackId={stacked ? 'stack' : undefined} {...markProps}>
                {colorByCategory && barData.map((_, i) => (
                  <Cell key={i} fill={getChartColor(i)} />
                ))}
                {showValueLabels && <LabelList dataKey={key} position="right" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Bar>
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} accessibilityLayer {...plotProps}>
            {grid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...xTitleProps(50)} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...valueAxisProps()} />
            {tooltip}
            {legend}
            {dataKeys.map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke={getChartVarColor(key)} strokeWidth={2} dot={{ fill: getChartVarColor(key), r: 3 }}>
                {format?.dataLabels && <LabelList dataKey={key} position="top" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Line>
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} accessibilityLayer {...plotProps}>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={gradientId(key)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartVarColor(key)} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={getChartVarColor(key)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {grid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...xTitleProps(50)} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...valueAxisProps()} />
            {tooltip}
            {legend}
            {dataKeys.map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke={getChartVarColor(key)} fill={`url(#${gradientId(key)})`} strokeWidth={2} stackId={stacked ? 'stack' : undefined}>
                {format?.dataLabels && <LabelList dataKey={key} position="top" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Area>
            ))}
          </AreaChart>
        );
      case 'combo': // first measure = bars on the left axis, the rest = lines on the right axis; `stacked` is ignored
        return (
          <ComposedChart data={data} accessibilityLayer {...plotProps}>
            {grid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...xTitleProps(50)} />
            <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...valueAxisProps()} />
            {dataKeys.length > 1 && <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} {...(fmt ? { tickFormatter: fmt, width: Math.max(60, tickWidth) } : {})} />}
            {tooltip}
            {legend}
            {dataKeys.map((key, i) => i === 0 ? (
              <Bar key={key} yAxisId="left" dataKey={key} fill={getChartVarColor(key)} radius={[4, 4, 0, 0]} {...markProps}>
                {format?.dataLabels && <LabelList dataKey={key} position="top" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Bar>
            ) : (
              <Line key={key} yAxisId="right" type="monotone" dataKey={key} stroke={getChartVarColor(key)} strokeWidth={2} dot={{ fill: getChartVarColor(key), r: 3 }}>
                {format?.dataLabels && <LabelList dataKey={key} position="top" fontSize={10} className="fill-muted-foreground" formatter={labelFmt} />}
              </Line>
            ))}
          </ComposedChart>
        );
      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={type === 'donut' ? '52%' : 0}
              outerRadius="75%"
              paddingAngle={type === 'donut' ? 2 : 0}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              {...markProps}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={getChartColor(i)} stroke="hsl(var(--card))" />
              ))}
            </Pie>
            {tooltip}
            {legend}
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart accessibilityLayer>
            {grid && <CartesianGrid />}
            <XAxis dataKey={xKey} type={typeof data[0]?.[xKey] === 'number' ? 'number' : 'category'} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} name={xKey} {...xTitleProps(50)} />
            <YAxis dataKey={dataKeys[0]} type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} name={dataKeys[0]} {...valueAxisProps()} />
            {tooltip}
            <Scatter data={data} fill={getChartColor(0)}>
              {data.map((_, i) => (
                <Cell key={i} fill={getChartColor(i)} />
              ))}
            </Scatter>
          </ScatterChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <PolarRadiusAxis />
            {dataKeys.map((key) => (
              <Radar key={key} dataKey={key} stroke={getChartVarColor(key)} fill={getChartVarColor(key)} fillOpacity={0.25} />
            ))}
            {tooltip}
            {legend}
          </RadarChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card ref={chartRef} className={`bg-card/80 backdrop-blur-xl border-border/50 shadow-lg animate-fade-in h-full flex flex-col${fill ? ' min-h-0' : ''}`}>
      <CardHeader className="p-2 sm:p-3 lg:p-4 pb-0">
        <div className="flex flex-col xs:flex-row items-start justify-between gap-1.5 xs:gap-2">
          <div className="min-w-0 flex-1">
            {editing && onRenameTitle ? (
              <Input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  const v = draft.trim();
                  if (v && v !== title) onRenameTitle(v); else setDraft(title);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') { setDraft(title); setEditing(false); }
                }}
                className="h-7 text-sm font-semibold"
              />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      className={`text-xs sm:text-sm lg:text-base font-semibold text-foreground truncate ${onRenameTitle ? 'cursor-pointer hover:underline decoration-dotted underline-offset-2' : ''}`}
                      onClick={() => { if (onRenameTitle) { setDraft(title); setEditing(true); } }}
                      title={onRenameTitle ? t('clickToRename') : undefined}
                    >
                      {title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">{title}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {description && size !== 'xs' && size !== 'sm' && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0" data-export-hide data-pdf-hide>
            {showControls && showTypeSwitcher && onChangeType && (
              <TooltipProvider delayDuration={300}>
                {/* Primary chart type pills */}
                <div className="hidden sm:flex items-center gap-0.5 bg-secondary/50 rounded-md p-0.5">
                    {PRIMARY_CHART_TYPES.map(ct => {
                    const Icon = CHART_TYPE_ICONS[ct];
                    const label = chartTypeOptions.find(o => o.value === ct)?.label || ct;
                    return (
                      <Tooltip key={ct}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleTypeChange(ct)}
                            aria-label={`Switch to ${label} chart`}
                            aria-pressed={type === ct}
                            className={`p-1 rounded transition-all ${
                              type === ct
                                ? 'shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                            style={type === ct ? { background: `hsl(${getChartColorVar(0)} / 0.18)`, color: getChartColor(0) } : undefined}
                          >
                            <Icon className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><span className="text-xs">{label}</span></TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {/* Overflow for remaining types */}
                  <Popover>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={`p-1 rounded transition-all ${
                              OVERFLOW_CHART_TYPES.includes(type)
                                ? 'shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                            style={OVERFLOW_CHART_TYPES.includes(type) ? { background: `hsl(${getChartColorVar(0)} / 0.18)`, color: getChartColor(0) } : undefined}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom"><span className="text-xs">{t('moreTypes')}</span></TooltipContent>
                    </Tooltip>
                    <PopoverContent side="bottom" align="end" className="w-auto p-1 flex gap-0.5">
                      {OVERFLOW_CHART_TYPES.map(ct => {
                        const Icon = CHART_TYPE_ICONS[ct];
                        const label = chartTypeOptions.find(o => o.value === ct)?.label || ct;
                        return (
                          <Tooltip key={ct}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleTypeChange(ct)}
                                aria-label={`Switch to ${label} chart`}
                                aria-pressed={type === ct}
                                className={`p-1.5 rounded transition-all ${
                                  type === ct
                                    ? 'shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                                style={type === ct ? { background: `hsl(${getChartColorVar(0)} / 0.18)`, color: getChartColor(0) } : undefined}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"><span className="text-xs">{label}</span></TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Mobile: compact select-style dropdown */}
                <div className="flex sm:hidden">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={t('moreActions')}>
                        {(() => {
                          const Icon = CHART_TYPE_ICONS[type];
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="w-auto p-1.5 grid grid-cols-4 gap-1">
                      {chartTypeOptions.map(opt => {
                        const Icon = CHART_TYPE_ICONS[opt.value];
                        return (
                          <Tooltip key={opt.value}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleTypeChange(opt.value)}
                                aria-label={`Switch to ${opt.label} chart`}
                                aria-pressed={type === opt.value}
                                className={`p-2 rounded transition-all ${
                                  type === opt.value
                                    ? 'shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                                style={type === opt.value ? { background: `hsl(${getChartColorVar(0)} / 0.18)`, color: getChartColor(0) } : undefined}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent><span className="text-xs">{opt.label}</span></TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </div>
              </TooltipProvider>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExport} title={t('exportPng')} aria-label={t('exportPng')}>
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-3 sm:p-4 pt-2 flex-1${fill ? ' min-h-[120px] flex flex-col' : ''}`}>
        {data.length === 0 ? (
          <div className={`flex items-center justify-center text-sm text-muted-foreground ${fill ? 'flex-1' : SIZE_CLASSES[size]}`}>
            {t('noDataToDisplay')}
          </div>
        ) : (
          <div
            className={`transition-opacity duration-200${fill ? ' flex-1 min-h-0' : ''}`}
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            <ChartContainer config={chartConfig} className={`w-full ${fill ? 'h-full' : SIZE_CLASSES[size]}`}>
              {renderChart() || <div />}
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
