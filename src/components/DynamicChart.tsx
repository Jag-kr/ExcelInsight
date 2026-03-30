import { useRef, useMemo } from 'react';
import { useTheme } from '@/lib/theme';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { toPng } from 'html-to-image';
import { Download, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartTheme, chartThemes, ChartType, chartTypeOptions } from '@/lib/chart-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DynamicChartProps {
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
  theme?: ChartTheme;
  onChangeType?: (type: ChartType) => void;
  onChangeTheme?: (theme: ChartTheme) => void;
  showControls?: boolean;
}

export function DynamicChart({
  title, description, type, data, dataKeys, xKey = 'name',
  theme = chartThemes[0], onChangeType, onChangeTheme, showControls = true,
}: DynamicChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme: appTheme } = useTheme();

  const adaptedTheme = useMemo(() => {
    if (appTheme === 'light') {
      return {
        ...theme,
        textColor: '#475569',
        gridColor: '#e2e8f0',
        tooltipBg: '#ffffff',
        tooltipText: '#1e293b',
      };
    }
    return theme;
  }, [theme, appTheme]);

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const url = await toPng(chartRef.current, { backgroundColor: '#0f172a', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const tooltipStyle = {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.gridColor}`,
    borderRadius: '8px',
    color: theme.tooltipText,
    fontSize: '12px',
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey={xKey} stroke={theme.textColor} tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.textColor, fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={theme.colors[i % theme.colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey={xKey} stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <YAxis stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.textColor, fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={theme.colors[i % theme.colors.length]} strokeWidth={2} dot={{ fill: theme.colors[i % theme.colors.length], r: 3 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.colors[i % theme.colors.length]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={theme.colors[i % theme.colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey={xKey} stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <YAxis stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.textColor, fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={theme.colors[i % theme.colors.length]} fill={`url(#grad-${key})`} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey={dataKeys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius="75%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: theme.textColor }}>
              {data.map((_, i) => (
                <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.textColor, fontSize: 12 }} />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
            <XAxis dataKey={dataKeys[0] || xKey} stroke={theme.textColor} tick={{ fontSize: 11 }} name={xKey} />
            <YAxis dataKey={dataKeys[0]} stroke={theme.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Scatter data={data} fill={theme.colors[0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke={theme.gridColor} />
            <PolarAngleAxis dataKey={xKey} stroke={theme.textColor} tick={{ fontSize: 10 }} />
            <PolarRadiusAxis stroke={theme.gridColor} />
            {dataKeys.map((key, i) => (
              <Radar key={key} dataKey={key} stroke={theme.colors[i % theme.colors.length]} fill={theme.colors[i % theme.colors.length]} fillOpacity={0.25} />
            ))}
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: theme.textColor, fontSize: 12 }} />
          </RadarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={chartRef} className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showControls && onChangeType && (
            <Select value={type} onValueChange={(v) => onChangeType(v as ChartType)}>
              <SelectTrigger className="h-7 w-[110px] text-xs bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {showControls && onChangeTheme && (
            <Select value={theme.id} onValueChange={(v) => onChangeTheme(chartThemes.find(t => t.id === v)!)}>
              <SelectTrigger className="h-7 w-[110px] text-xs bg-secondary border-border">
                <Settings2 className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartThemes.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExport} title="Export PNG">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
