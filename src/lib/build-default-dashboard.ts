import type { ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';
import { computeRepeatingColumns, computeNumericInsights, computeDataQuality } from '@/lib/derive-dashboard-item';

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
  // usedChartIds holds ChartSuggestion.key, not .id.
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
      sourceKey: c.key,
      size: i === 0 ? 'lg' : 'md',
    });
    usedChartIds.add(c.key);
  });

  const numericCols = computeNumericInsights(cols);
  if (numericCols.length > 0) {
    items.push({
      id: 'insight-stats-chart',
      title: t('columnStats'),
      description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'stats', insightContent: numericCols, size: 'lg',
    });
  }

  const repeating = computeRepeatingColumns(cols, newData);
  repeating.slice(0, 2).forEach(col => {
    items.push({
      id: `insight-repeat-chart-${col.name}`,
      title: `${col.name}${t('repeatingValuesSuffix')}`, description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'repeating', insightContent: col,
    });
  });

  const quality = computeDataQuality(cols);
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
      data: c.data, dataKeys: c.dataKeys, xKey: c.xKey, sourceKey: c.key,
    });
    usedChartIds.add(c.key);
  }

  return { items, usedChartIds };
}
