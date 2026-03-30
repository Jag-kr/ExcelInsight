import { useState } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { ChartType, chartTypeOptions, chartThemes, ChartTheme } from '@/lib/chart-themes';
import { DynamicChart } from './DynamicChart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface ManualChartBuilderProps {
  data: Record<string, any>[];
  columns: ColumnMeta[];
  onAddToDashboard: (chart: any) => void;
}

export function ManualChartBuilder({ data, columns, onAddToDashboard }: ManualChartBuilderProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [aggregation, setAggregation] = useState<'sum' | 'average' | 'count'>('sum');
  const [theme, setTheme] = useState<ChartTheme>(chartThemes[0]);

  const buildChartData = () => {
    if (!xCol) return [];
    if (chartType === 'pie' || !yCol) {
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const key = String(row[xCol] ?? 'Unknown');
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }

    const grouped: Record<string, { sum: number; count: number }> = {};
    data.forEach(row => {
      const key = String(row[xCol] ?? 'Unknown');
      const val = Number(row[yCol]);
      if (!isNaN(val)) {
        if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
        grouped[key].sum += val;
        grouped[key].count++;
      }
    });

    return Object.entries(grouped)
      .map(([name, g]) => ({
        name,
        value: aggregation === 'sum' ? Math.round(g.sum * 100) / 100
          : aggregation === 'average' ? Math.round((g.sum / g.count) * 100) / 100
          : g.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  };

  const chartData = buildChartData();
  const dataKey = !yCol ? 'count' : 'value';

  const handleAdd = () => {
    if (!chartData.length) return;
    onAddToDashboard({
      id: `manual-${Date.now()}`,
      title: yCol ? `${yCol} by ${xCol} (${aggregation})` : `${xCol} Count`,
      type: chartType,
      data: chartData,
      dataKeys: [dataKey],
      theme,
    });
  };

  const numericCols = columns.filter(c => c.type === 'numeric' || c.type === 'range');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Build Custom Chart</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Chart Type</label>
          <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">X-Axis / Category</label>
          <Select value={xCol} onValueChange={setXCol}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>
              {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Y-Axis / Value (optional)</label>
          <Select value={yCol} onValueChange={setYCol}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Count only" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Count only</SelectItem>
              {numericCols.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {yCol && yCol !== '__none' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Aggregation</label>
            <Select value={aggregation} onValueChange={(v) => setAggregation(v as any)}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="count">Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <>
          <DynamicChart
            title={yCol && yCol !== '__none' ? `${yCol} by ${xCol}` : `${xCol} Distribution`}
            type={chartType}
            data={chartData}
            dataKeys={[dataKey]}
            theme={theme}
            onChangeType={setChartType}
            onChangeTheme={setTheme}
          />
          <Button onClick={handleAdd} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add to Dashboard
          </Button>
        </>
      )}
    </div>
  );
}
