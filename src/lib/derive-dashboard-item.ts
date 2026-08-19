import type { ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';

/**
 * Card data is derived from a recipe + the currently filtered dataset, never
 * stored. Also the single home for the insight tallies and table shapes that
 * SmartInsights, QuickAddPanel and buildDefaultDashboard all render.
 */

/** How a custom-built chart was specified, so it can be rebuilt later. */
export interface ManualChartSpec {
  xCol: string;
  /** null means "count rows per category" rather than aggregate a value column. */
  yCol: string | null;
  aggregation: 'sum' | 'average' | 'count';
}

export type TFn = (key: any) => string;

/** Aggregate a custom chart's series. */
export function buildManualChartData(
  data: Record<string, any>[],
  spec: ManualChartSpec,
  chartType: string
): { data: any[]; dataKeys: string[] } {
  const { xCol, yCol, aggregation } = spec;
  if (!xCol) return { data: [], dataKeys: [] };

  if (chartType === 'pie' || !yCol) {
    const counts: Record<string, number> = {};
    data.forEach(row => {
      const key = String(row[xCol] ?? 'Unknown');
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      data: Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      dataKeys: ['count'],
    };
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

  return {
    data: Object.entries(grouped)
      .map(([name, g]) => ({
        name,
        value: aggregation === 'sum' ? Math.round(g.sum * 100) / 100
          : aggregation === 'average' ? Math.round((g.sum / g.count) * 100) / 100
          : g.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20),
    dataKeys: ['value'],
  };
}

export interface RepeatingColumn {
  name: string;
  uniqueCount: number;
  totalCount: number;
  repetitionRatio: number;
  topValues: { value: string; count: number; percentage: number }[];
}

/** Tally one column's value distribution, regardless of any threshold. */
export function computeColumnRepetition(
  colName: string,
  data: Record<string, any>[]
): RepeatingColumn {
  const counts: Record<string, number> = {};
  data.forEach(row => {
    const v = row[colName];
    if (v !== null && v !== undefined && v !== '') counts[String(v)] = (counts[String(v)] || 0) + 1;
  });
  const entries = Object.entries(counts);
  const uniqueCount = entries.length;
  const totalCount = data.length;
  return {
    name: colName,
    uniqueCount,
    totalCount,
    repetitionRatio: 1 - (uniqueCount / Math.max(totalCount, 1)),
    topValues: entries.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({
      value, count, percentage: Math.round((count / totalCount) * 100),
    })),
  };
}

/** Columns whose values repeat enough to be worth surfacing unprompted. */
export function computeRepeatingColumns(
  columns: ColumnMeta[],
  data: Record<string, any>[]
): RepeatingColumn[] {
  return columns
    .filter(col => col.type !== 'id')
    .map(col => computeColumnRepetition(col.name, data))
    .filter(c => c.repetitionRatio > 0.3 && c.uniqueCount <= 50 && c.uniqueCount >= 2)
    .sort((a, b) => b.repetitionRatio - a.repetitionRatio);
}

export function computeNumericInsights(columns: ColumnMeta[]): ColumnMeta[] {
  return columns.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats);
}

export function computeDataQuality(columns: ColumnMeta[]) {
  return columns
    .map(col => ({
      name: col.name,
      completeness: Math.round(((col.totalCount - col.nullCount) / col.totalCount) * 100),
      nullCount: col.nullCount,
    }))
    .filter(c => c.nullCount > 0);
}

/* ─── Insight table shapes: rendered by SmartInsights, rebuilt by deriveDashboardItem ─── */

export function statsTable(columns: ColumnMeta[], t: TFn) {
  return {
    data: computeNumericInsights(columns).map(c => ({
      [t('columns')]: c.name,
      [t('min')]: c.stats!.min.toFixed(1),
      [t('max')]: c.stats!.max.toFixed(1),
      [t('mean')]: c.stats!.mean.toFixed(2),
      [t('median')]: c.stats!.median.toFixed(1),
      [t('stdDev')]: c.stats!.stdDev.toFixed(2),
    })),
    columns: [t('columns'), t('min'), t('max'), t('mean'), t('median'), t('stdDev')],
  };
}

export function qualityTable(columns: ColumnMeta[], t: TFn) {
  return {
    data: computeDataQuality(columns).map(c => ({
      [t('columns')]: c.name,
      [`${t('complete')} %`]: `${c.completeness}%`,
      [t('nullValues')]: c.nullCount,
    })),
    columns: [t('columns'), `${t('complete')} %`, t('nullValues')],
  };
}

export function repeatTable(col: RepeatingColumn, t: TFn) {
  return {
    data: col.topValues.map(v => ({ [t('topValues')]: v.value, [t('count')]: v.count, '%': `${v.percentage}%` })),
    columns: [t('topValues'), t('count'), '%'],
  };
}

/** Insight tables carry stable ids assigned in SmartInsights. */
function rebuildTable(id: string, columns: ColumnMeta[], data: Record<string, any>[], t: TFn) {
  if (id === 'insight-stats-table') return statsTable(columns, t);
  if (id === 'insight-quality-table') return qualityTable(columns, t);
  if (id.startsWith('insight-repeat-table-')) {
    return repeatTable(computeColumnRepetition(id.slice('insight-repeat-table-'.length), data), t);
  }
  return null;
}

/**
 * Rebuild one card against the filtered dataset. No recipe (a session saved
 * before recipes existed) → keep the stored snapshot. Recipe that no longer
 * resolves → empty, which renders the existing "no data" state.
 */
function deriveDashboardItem(
  item: DashboardItem,
  suggestions: ChartSuggestion[],
  columns: ColumnMeta[],
  data: Record<string, any>[],
  t: TFn
): DashboardItem {
  if (item.displayAs === 'insight') {
    if (item.insightType === 'stats') return { ...item, insightContent: computeNumericInsights(columns) };
    if (item.insightType === 'quality') return { ...item, insightContent: computeDataQuality(columns) };
    if (item.insightType === 'repeating') {
      const colName = item.insightContent?.name;
      /* Recomputed directly, not looked up in computeRepeatingColumns(): a filter
         can push a column below the "repeating" threshold while its distribution
         is still real, and the card was placed deliberately. */
      return colName ? { ...item, insightContent: computeColumnRepetition(colName, data) } : item;
    }
    return item;
  }

  if (item.displayAs === 'table') {
    const rebuilt = rebuildTable(item.id, columns, data, t);
    return rebuilt ? { ...item, data: rebuilt.data, tableColumns: rebuilt.columns } : item;
  }

  if (item.spec) {
    const { data: d, dataKeys } = buildManualChartData(data, item.spec, item.type);
    return { ...item, data: d, dataKeys };
  }

  if (item.sourceKey) {
    const match = suggestions.find(s => s.key === item.sourceKey);
    if (!match) return { ...item, data: [] };
    return { ...item, data: match.data, dataKeys: match.dataKeys, xKey: match.xKey };
  }

  return item;
}

/** Map a whole dashboard onto the filtered dataset, preserving order. */
export function deriveDashboardItems(
  items: DashboardItem[],
  suggestions: ChartSuggestion[],
  columns: ColumnMeta[],
  data: Record<string, any>[],
  t: TFn
): DashboardItem[] {
  return items.map(item => deriveDashboardItem(item, suggestions, columns, data, t));
}
