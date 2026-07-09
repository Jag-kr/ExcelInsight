import { useRef, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import html2canvas from 'html2canvas';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, ScatterChart as ScatterChartIcon, Radar as RadarIcon, MoreHorizontal, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartType, chartTypeOptions, buildChartConfig, buildPieChartConfig, getChartColor, getChartVarColor } from '@/lib/chart-themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-[200px]',
  md: 'h-[250px] sm:h-[300px]',
  lg: 'h-[300px] sm:h-[350px] lg:h-[400px]',
};

/* Quick chart type pills — show the first 4 as icon buttons, rest in overflow */
const CHART_TYPE_ICONS: Record<ChartType, React.ElementType> = {
  bar: BarChart3,
  horizontalBar: AlignLeft,
  line: LineChartIcon,
  area: AreaChartIcon,
  pie: PieChartIcon,
  scatter: ScatterChartIcon,
  radar: RadarIcon,
};

const PRIMARY_CHART_TYPES: ChartType[] = ['bar', 'line', 'area', 'pie'];
const OVERFLOW_CHART_TYPES: ChartType[] = ['horizontalBar', 'scatter', 'radar'];

export function DynamicChart({
  title, description, type, data, dataKeys, xKey = 'name',
  onChangeType, onRenameTitle, showControls = true, size = 'md',
}: DynamicChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [transitioning, setTransitioning] = useState(false);

  const chartConfig = useMemo<ChartConfig>(() => {
    if (type === 'pie' || type === 'scatter') {
      return buildPieChartConfig(data, xKey);
    }
    return buildChartConfig(dataKeys);
  }, [dataKeys, data, xKey, type]);

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
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleTypeChange = (newType: ChartType) => {
    if (newType === type || !onChangeType) return;
    setTransitioning(true);
    // Brief transition effect
    setTimeout(() => {
      onChangeType(newType);
      setTimeout(() => setTransitioning(false), 150);
    }, 100);
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={getChartVarColor(key)} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'horizontalBar':
        return (
          <BarChart data={data} layout="vertical" accessibilityLayer>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={80} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={getChartVarColor(key)} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke={getChartVarColor(key)} strokeWidth={2} dot={{ fill: getChartVarColor(key), r: 3 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} accessibilityLayer>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartVarColor(key)} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={getChartVarColor(key)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke={getChartVarColor(key)} fill={`url(#grad-${key})`} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey={dataKeys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius="75%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, i) => (
                <Cell key={i} fill={getChartColor(i)} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart accessibilityLayer>
            <CartesianGrid />
            <XAxis dataKey={dataKeys[0] || xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} name={xKey} />
            <YAxis dataKey={dataKeys[0]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
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
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card ref={chartRef} className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg animate-fade-in h-full flex flex-col">
      <CardHeader className="p-3 sm:p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
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
              <h3
                className={`text-sm font-semibold text-foreground truncate ${onRenameTitle ? 'cursor-pointer hover:underline decoration-dotted underline-offset-2' : ''}`}
                onClick={() => { if (onRenameTitle) { setDraft(title); setEditing(true); } }}
                title={onRenameTitle ? 'Click to rename' : undefined}
              >
                {title}
              </h3>
            )}
            {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
          </div>
          <div className="flex items-center gap-0.5 shrink-0" data-export-hide data-pdf-hide>
            {showControls && onChangeType && (
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
                            className={`p-1 rounded transition-all ${
                              type === ct
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
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
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom"><span className="text-xs">More types</span></TooltipContent>
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
                                className={`p-1.5 rounded transition-all ${
                                  type === ct
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
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
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
                                className={`p-2 rounded transition-all ${
                                  type === opt.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExport} title="Export PNG">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2 flex-1">
        <div className={`transition-opacity duration-150 ${transitioning ? 'opacity-30' : 'opacity-100'}`}>
          <ChartContainer config={chartConfig} className={`w-full ${SIZE_CLASSES[size]}`}>
            {renderChart() || <div />}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
