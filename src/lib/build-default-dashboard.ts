import type { ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';

const CHART_TYPE_ROTATION = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'horizontalBar'] as const;

/**
 * Seeds the dashboard the user lands on straight after an upload: the first
 * few suggested charts, then stats / repeating-value / data-quality insight
 * cards where the columns support them.
 *
 * Lives here rather than in the page so the landing bundle doesn't have to
 * carry it — it pulls in data-analyzer's types and runs only post-upload.
 */
export function buildDefaultDashboard(
  newData: Record<string, any>[],
  cols: ColumnMeta[],
  charts: ChartSuggestion[],
  t: (key: any) => string
): { items: DashboardItem[]; usedChartIds: Set<string> } {
  const items: DashboardItem[] = [];
  const usedChartIds = new Set<string>();

  charts.slice(0, 3).forEach((c, i) => {
    items.push({
      id: c.id,
      title: c.title,
      description: c.description,
      type: CHART_TYPE_ROTATION[i % CHART_TYPE_ROTATION.length],
      data: c.data,
      dataKeys: c.dataKeys,
      xKey: c.xKey,
      size: i === 0 ? 'lg' : 'md',
    });
    usedChartIds.add(c.id);
  });

  const numericCols = cols.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats);
  if (numericCols.length > 0) {
    items.push({
      id: 'insight-stats-chart',
      title: t('columnStats'),
      description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'stats', insightContent: numericCols, size: 'lg',
    });
  }

  const repeating: any[] = [];
  cols.forEach(col => {
    if (col.type === 'id') return;
    const counts: Record<string, number> = {};
    newData.forEach(row => {
      const v = row[col.name];
      if (v !== null && v !== undefined && v !== '') counts[String(v)] = (counts[String(v)] || 0) + 1;
    });
    const entries = Object.entries(counts);
    const uniqueCount = entries.length;
    const totalCount = newData.length;
    const repetitionRatio = 1 - (uniqueCount / Math.max(totalCount, 1));
    if (repetitionRatio > 0.3 && uniqueCount <= 50 && uniqueCount >= 2) {
      repeating.push({
        name: col.name, uniqueCount, totalCount, repetitionRatio,
        topValues: entries.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({
          value, count, percentage: Math.round((count / totalCount) * 100),
        })),
      });
    }
  });
  repeating.sort((a, b) => b.repetitionRatio - a.repetitionRatio);
  repeating.slice(0, 2).forEach(col => {
    items.push({
      id: `insight-repeat-chart-${col.name}`,
      title: `${col.name}${t('repeatingValuesSuffix')}`, description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'repeating', insightContent: col,
    });
  });

  const quality = cols.map(c => ({
    name: c.name,
    completeness: Math.round(((c.totalCount - c.nullCount) / c.totalCount) * 100),
    nullCount: c.nullCount,
  })).filter(c => c.nullCount > 0);
  if (quality.length > 0) {
    items.push({
      id: 'insight-quality-chart', title: t('dataQuality'), description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'quality', insightContent: quality,
    });
  }

  if (charts.length > 3) {
    const c = charts[3];
    items.push({
      id: c.id, title: c.title, description: c.description,
      type: CHART_TYPE_ROTATION[3 % CHART_TYPE_ROTATION.length],
      data: c.data, dataKeys: c.dataKeys, xKey: c.xKey,
    });
    usedChartIds.add(c.id);
  }

  return { items, usedChartIds };
}
