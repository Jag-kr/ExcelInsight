import type { ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';
import { computeRepeatingColumns, computeNumericInsights, computeDataQuality, kpiCardId, type KpiSpec } from '@/lib/derive-dashboard-item';

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

  /* Headline tiles lead the board. They are ordinary cards — the user can
     rename, resize, duplicate or delete any of them. */
  const numericCols = computeNumericInsights(cols);
  const kpiSpecs: KpiSpec[] = [
    { column: null, agg: 'count' },
    ...numericCols.slice(0, 3).map((c): KpiSpec => ({
      column: c.name,
      agg: c.stats!.isSummable ? 'sum' : 'average',
    })),
  ];
  kpiSpecs.forEach(spec => {
    items.push({
      id: kpiCardId(spec),
      title: spec.column ? `${t(spec.agg)} · ${spec.column}` : t('rowCount'),
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'kpi', kpiSpec: spec, size: 'xs',
    });
  });

  charts.slice(0, 6).forEach(c => {
    items.push({
      id: c.id,
      title: c.title,
      description: c.description,
      /* The suggestion's own type, not a rotation: data-analyzer already knows
         a distribution is bars and a breakdown is a donut, and rotating over
         that was drawing category counts as lines. */
      type: c.type,
      data: c.data,
      dataKeys: c.dataKeys,
      xKey: c.xKey,
      sourceKey: c.key,
      size: 'md',
    });
    usedChartIds.add(c.key);
  });

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

  return { items, usedChartIds };
}
