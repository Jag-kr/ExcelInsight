import { useMemo } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { AlertTriangle, BarChart3, CheckCircle2, Repeat2, Plus, TableIcon, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface SmartInsightsProps {
  columns: ColumnMeta[];
  data: Record<string, any>[];
  onAddToDashboard?: (card: { id: string; title: string; content: any; type: 'insight' }) => void;
  onAddTableToDashboard?: (card: { id: string; title: string; data: any[]; columns: string[] }) => void;
  addedInsightIds?: Set<string>;
}

interface RepeatingColumn {
  name: string;
  uniqueCount: number;
  totalCount: number;
  repetitionRatio: number;
  topValues: { value: string; count: number; percentage: number }[];
}

export function SmartInsights({ columns, data, onAddToDashboard, onAddTableToDashboard, addedInsightIds = new Set() }: SmartInsightsProps) {
  const { t } = useI18n();

  const repeatingColumns = useMemo(() => {
    const result: RepeatingColumn[] = [];
    columns.forEach(col => {
      if (col.type === 'id') return;
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const v = row[col.name];
        if (v !== null && v !== undefined && v !== '') {
          counts[String(v)] = (counts[String(v)] || 0) + 1;
        }
      });
      const entries = Object.entries(counts);
      const uniqueCount = entries.length;
      const totalCount = data.length;
      const repetitionRatio = 1 - (uniqueCount / Math.max(totalCount, 1));

      if (repetitionRatio > 0.3 && uniqueCount <= 50 && uniqueCount >= 2) {
        const topValues = entries
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([value, count]) => ({
            value,
            count,
            percentage: Math.round((count / totalCount) * 100),
          }));
        result.push({ name: col.name, uniqueCount, totalCount, repetitionRatio, topValues });
      }
    });
    return result.sort((a, b) => b.repetitionRatio - a.repetitionRatio);
  }, [columns, data]);

  const numericInsights = useMemo(() =>
    columns.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats),
    [columns]
  );

  const dataQuality = useMemo(() =>
    columns.map(col => ({
      name: col.name,
      completeness: Math.round(((col.totalCount - col.nullCount) / col.totalCount) * 100),
      nullCount: col.nullCount,
    })).filter(c => c.nullCount > 0),
    [columns]
  );

  const isAdded = (id: string) => addedInsightIds.has(id);

  const AddedBadge = () => (
    <Badge variant="secondary" className="gap-1 text-[10px] bg-success/20 text-success border-0 px-2 py-0.5 font-normal">
      <Check className="h-3 w-3" /> {t('addToDashboard')}
    </Badge>
  );

  const addRepeatingAsDashboardChart = (col: RepeatingColumn) => {
    const id = `insight-repeat-chart-${col.name}`;
    if (!onAddToDashboard || isAdded(id)) return;
    onAddToDashboard({ id, title: `${col.name} — ${t('repeatingValues')}`, type: 'insight', content: col as any });
  };

  const addRepeatingAsTable = (col: RepeatingColumn) => {
    const id = `insight-repeat-table-${col.name}`;
    if (!onAddTableToDashboard || isAdded(id)) return;
    onAddTableToDashboard({
      id,
      title: `${col.name} — ${t('repeatingValues')}`,
      data: col.topValues.map(v => ({ [t('topValues')]: v.value, Count: v.count, '%': `${v.percentage}%` })),
      columns: [t('topValues'), 'Count', '%'],
    });
  };

  const addStatsAsDashboardChart = () => {
    const id = 'insight-stats-chart';
    if (!onAddToDashboard || isAdded(id)) return;
    onAddToDashboard({ id, title: t('columnStats'), type: 'insight', content: numericInsights as any });
  };

  const addStatsAsTable = () => {
    const id = 'insight-stats-table';
    if (!onAddTableToDashboard || isAdded(id)) return;
    onAddTableToDashboard({
      id,
      title: t('columnStats'),
      data: numericInsights.map(c => ({
        [t('columns')]: c.name,
        [t('min')]: c.stats!.min.toFixed(1),
        [t('max')]: c.stats!.max.toFixed(1),
        [t('mean')]: c.stats!.mean.toFixed(2),
        [t('median')]: c.stats!.median.toFixed(1),
        [t('stdDev')]: c.stats!.stdDev.toFixed(2),
      })),
      columns: [t('columns'), t('min'), t('max'), t('mean'), t('median'), t('stdDev')],
    });
  };

  const addQualityAsDashboardChart = () => {
    const id = 'insight-quality-chart';
    if (!onAddToDashboard || isAdded(id)) return;
    onAddToDashboard({ id, title: t('dataQuality'), type: 'insight', content: dataQuality as any });
  };

  const addQualityAsTable = () => {
    const id = 'insight-quality-table';
    if (!onAddTableToDashboard || isAdded(id)) return;
    onAddTableToDashboard({
      id,
      title: t('dataQuality'),
      data: dataQuality.map(c => ({
        [t('columns')]: c.name,
        [`${t('complete')} %`]: `${c.completeness}%`,
        'Nulls': c.nullCount,
      })),
      columns: [t('columns'), `${t('complete')} %`, 'Nulls'],
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        {t('smartInsights')}
      </h3>

      {/* Repeating Values Detection */}
      {repeatingColumns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-accent flex items-center gap-2">
            <Repeat2 className="h-3.5 w-3.5" />
            {t('repeatingValues')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repeatingColumns.map(col => {
              const chartId = `insight-repeat-chart-${col.name}`;
              const tableId = `insight-repeat-table-${col.name}`;
              return (
                <Card key={col.name} className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg p-3 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{col.name}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent font-normal border-0">
                        {t('highRepetition')} ({Math.round(col.repetitionRatio * 100)}%)
                      </Badge>
                      {isAdded(chartId) ? <AddedBadge /> : onAddToDashboard && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => addRepeatingAsDashboardChart(col)} title={t('addToDashboard')}>
                          <Plus className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                      {isAdded(tableId) ? <AddedBadge /> : onAddTableToDashboard && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => addRepeatingAsTable(col)} title="Add as Table">
                          <TableIcon className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {col.uniqueCount} {t('uniqueValues')} / {col.totalCount} {t('rows')}
                  </p>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-medium">{t('topValues')}:</p>
                    {col.topValues.map(v => (
                      <div key={v.value} className="flex items-center gap-2">
                        <Progress value={v.percentage} className="flex-1 h-1.5 [&>div]:bg-primary/70" />
                        <span className="text-[10px] text-foreground min-w-[60px] truncate">{v.value}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{v.count} ({v.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Numeric Column Stats */}
      {numericInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-info flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              {t('columnStats')}
            </h4>
            <div className="flex items-center gap-1">
              {isAdded('insight-stats-chart') ? <AddedBadge /> : onAddToDashboard && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addStatsAsDashboardChart}>
                  <Plus className="h-3 w-3 mr-1" /> {t('addToDashboard')}
                </Button>
              )}
              {isAdded('insight-stats-table') ? <AddedBadge /> : onAddTableToDashboard && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addStatsAsTable}>
                  <TableIcon className="h-3 w-3 mr-1" /> Table
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <Table className="text-xs min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">{t('columns')}</TableHead>
                  <TableHead className="text-right">{t('min')}</TableHead>
                  <TableHead className="text-right">{t('max')}</TableHead>
                  <TableHead className="text-right">{t('mean')}</TableHead>
                  <TableHead className="text-right">{t('median')}</TableHead>
                  <TableHead className="text-right">{t('stdDev')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numericInsights.map(col => (
                  <TableRow key={col.name}>
                    <TableCell className="font-medium text-foreground">{col.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{col.stats!.min.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{col.stats!.max.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{col.stats!.mean.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{col.stats!.median.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{col.stats!.stdDev.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Data Quality */}
      {dataQuality.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-warning flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t('dataQuality')}
            </h4>
            <div className="flex items-center gap-1">
              {isAdded('insight-quality-chart') ? <AddedBadge /> : onAddToDashboard && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addQualityAsDashboardChart}>
                  <Plus className="h-3 w-3 mr-1" /> {t('addToDashboard')}
                </Button>
              )}
              {isAdded('insight-quality-table') ? <AddedBadge /> : onAddTableToDashboard && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addQualityAsTable}>
                  <TableIcon className="h-3 w-3 mr-1" /> Table
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dataQuality.map(col => (
              <div key={col.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
                <span className="text-xs font-medium text-foreground truncate flex-1">{col.name}</span>
                <Progress 
                  value={col.completeness} 
                  className="w-20 h-1.5" 
                  indicatorClassName={col.completeness > 90 ? 'bg-success' : col.completeness > 70 ? 'bg-warning' : 'bg-destructive'} 
                />
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {col.completeness}% {t('complete')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {repeatingColumns.length === 0 && dataQuality.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mb-2" />
          <p className="text-sm text-muted-foreground">100% {t('complete')} — {t('noFilters')}</p>
        </div>
      )}
    </div>
  );
}
