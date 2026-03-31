import { useMemo } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { AlertTriangle, BarChart3, CheckCircle2, Repeat2, Plus, TableIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface SmartInsightsProps {
  columns: ColumnMeta[];
  data: Record<string, any>[];
  onAddToDashboard?: (card: { title: string; content: any; type: 'insight' }) => void;
  onAddTableToDashboard?: (card: { title: string; data: any[]; columns: string[] }) => void;
}

interface RepeatingColumn {
  name: string;
  uniqueCount: number;
  totalCount: number;
  repetitionRatio: number;
  topValues: { value: string; count: number; percentage: number }[];
}

export function SmartInsights({ columns, data, onAddToDashboard, onAddTableToDashboard }: SmartInsightsProps) {
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

  const handleAddRepeatingCard = (col: RepeatingColumn) => {
    if (!onAddToDashboard) return;
    // Convert repeating values to a bar chart for the dashboard
    onAddToDashboard({
      title: `${col.name} — ${t('repeatingValues')}`,
      content: undefined as any, // We'll pass chart-compatible data instead
      type: 'insight',
    });
  };

  const addRepeatingAsDashboardChart = (col: RepeatingColumn) => {
    if (!onAddToDashboard) return;
    onAddToDashboard({
      title: `${col.name} — ${t('repeatingValues')}`,
      type: 'insight',
      content: col as any,
    });
  };

  const addStatsAsDashboardChart = () => {
    if (!onAddToDashboard) return;
    onAddToDashboard({
      title: t('columnStats'),
      type: 'insight',
      content: numericInsights as any,
    });
  };

  const addStatsAsTable = () => {
    if (!onAddTableToDashboard) return;
    onAddTableToDashboard({
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
    if (!onAddToDashboard) return;
    onAddToDashboard({
      title: t('dataQuality'),
      type: 'insight',
      content: dataQuality as any,
    });
  };

  const addQualityAsTable = () => {
    if (!onAddTableToDashboard) return;
    onAddTableToDashboard({
      title: t('dataQuality'),
      data: dataQuality.map(c => ({
        [t('columns')]: c.name,
        [`${t('complete')} %`]: `${c.completeness}%`,
        'Nulls': c.nullCount,
      })),
      columns: [t('columns'), `${t('complete')} %`, 'Nulls'],
    });
  };

  const addRepeatingAsTable = (col: RepeatingColumn) => {
    if (!onAddTableToDashboard) return;
    onAddTableToDashboard({
      title: `${col.name} — ${t('repeatingValues')}`,
      data: col.topValues.map(v => ({
        [t('topValues')]: v.value,
        Count: v.count,
        '%': `${v.percentage}%`,
      })),
      columns: [t('topValues'), 'Count', '%'],
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
            {repeatingColumns.map(col => (
              <div key={col.name} className="glass-card rounded-lg p-3 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{col.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      {t('highRepetition')} ({Math.round(col.repetitionRatio * 100)}%)
                    </span>
                    {onAddToDashboard && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => addRepeatingAsDashboardChart(col)}
                        title={t('addToDashboard')}
                      >
                        <Plus className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    {onAddTableToDashboard && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => addRepeatingAsTable(col)}
                        title="Add as Table"
                      >
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
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${v.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-foreground min-w-[60px] truncate">{v.value}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{v.count} ({v.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            {onAddToDashboard && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addStatsAsDashboardChart}>
                <Plus className="h-3 w-3 mr-1" /> {t('addToDashboard')}
              </Button>
            )}
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">{t('columns')}</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">{t('min')}</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">{t('max')}</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">{t('mean')}</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">{t('median')}</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">{t('stdDev')}</th>
                </tr>
              </thead>
              <tbody>
                {numericInsights.map(col => (
                  <tr key={col.name} className="border-b border-border/30 hover:bg-secondary/30">
                    <td className="p-2 font-medium text-foreground">{col.name}</td>
                    <td className="p-2 text-right text-muted-foreground">{col.stats!.min.toFixed(1)}</td>
                    <td className="p-2 text-right text-muted-foreground">{col.stats!.max.toFixed(1)}</td>
                    <td className="p-2 text-right text-muted-foreground">{col.stats!.mean.toFixed(2)}</td>
                    <td className="p-2 text-right text-muted-foreground">{col.stats!.median.toFixed(1)}</td>
                    <td className="p-2 text-right text-muted-foreground">{col.stats!.stdDev.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {onAddToDashboard && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addQualityAsDashboardChart}>
                <Plus className="h-3 w-3 mr-1" /> {t('addToDashboard')}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dataQuality.map(col => (
              <div key={col.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
                <span className="text-xs font-medium text-foreground truncate flex-1">{col.name}</span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${col.completeness > 90 ? 'bg-success' : col.completeness > 70 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${col.completeness}%` }}
                  />
                </div>
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
