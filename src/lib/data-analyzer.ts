export type ColumnType = 'numeric' | 'categorical' | 'date' | 'text' | 'range' | 'id';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  totalCount: number;
  nullCount: number;
  uniqueRatio: number;
  sampleValues: any[];
  stats?: NumericStats;
  categories?: { value: string; count: number }[];
}

export interface NumericStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
  stdDev: number;
  isSummable: boolean;
}

export interface ChartSuggestion {
  id: string;
  /** Stable semantic id. `id` is positional and shifts when suggestions are
      regenerated, so anything surviving a re-run must match on `key`. */
  key: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';
  xKey?: string;
  yKey?: string;
  dataKeys: string[];
  data: any[];
  description: string;
}

function detectColumnType(values: any[], colName: string): ColumnType {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'text';

  const numericCount = nonNull.filter(v => !isNaN(Number(v)) && v !== '').length;
  const numericRatio = numericCount / nonNull.length;

  if (numericRatio > 0.85) {
    const nums = nonNull.map(Number).filter(n => !isNaN(n));
    const uniqueNums = new Set(nums);
    const range = Math.max(...nums) - Math.min(...nums);
    const lowerName = colName.toLowerCase();

    // Detect ID columns
    if (lowerName.includes('id') || lowerName.includes('code') || lowerName.includes('number')) {
      if (uniqueNums.size / nums.length > 0.9) return 'id';
    }

    // Detect range-type numerics (age, score, rating, year, rank)
    const rangeKeywords = ['age', 'score', 'rating', 'rank', 'grade', 'level', 'year', 'month', 'day', 'hour', 'minute', 'percentage', 'percent', 'rate'];
    if (rangeKeywords.some(k => lowerName.includes(k))) return 'range';

    // If few unique values relative to total, treat as categorical
    if (uniqueNums.size <= 10 && nums.length > 20) return 'range';

    return 'numeric';
  }

  // Date detection
  const dateCount = nonNull.filter(v => {
    const d = new Date(v);
    return d instanceof Date && !isNaN(d.getTime()) && String(v).length > 5;
  }).length;
  if (dateCount / nonNull.length > 0.7) return 'date';

  // Categorical vs text
  const uniqueValues = new Set(nonNull.map(String));
  const uniqueRatio = uniqueValues.size / nonNull.length;
  if (uniqueRatio < 0.3 || uniqueValues.size <= 20) return 'categorical';

  return 'text';
}

function computeNumericStats(values: number[], colType: ColumnType): NumericStats {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
    sum,
    stdDev: Math.sqrt(variance),
    isSummable: colType === 'numeric',
  };
}

export function analyzeColumns(data: Record<string, any>[]): ColumnMeta[] {
  if (!data.length) return [];
  const columns = Object.keys(data[0]);

  return columns.map(col => {
    const values = data.map(row => row[col]);
    const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
    const type = detectColumnType(values, col);
    const uniqueValues = new Set(nonNull.map(String));

    const meta: ColumnMeta = {
      name: col,
      type,
      uniqueCount: uniqueValues.size,
      totalCount: values.length,
      nullCount: values.length - nonNull.length,
      uniqueRatio: uniqueValues.size / Math.max(nonNull.length, 1),
      sampleValues: [...uniqueValues].slice(0, 10),
    };

    if (type === 'numeric' || type === 'range') {
      const nums = nonNull.map(Number).filter(n => !isNaN(n));
      if (nums.length) meta.stats = computeNumericStats(nums, type);
    }

    if (type === 'categorical' || type === 'range') {
      const counts: Record<string, number> = {};
      nonNull.forEach(v => { counts[String(v)] = (counts[String(v)] || 0) + 1; });
      meta.categories = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);
    }

    return meta;
  });
}

export function generateChartSuggestions(data: Record<string, any>[], columns: ColumnMeta[]): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  let id = 0;

  const categoricalCols = columns.filter(c => c.type === 'categorical');
  const numericCols = columns.filter(c => c.type === 'numeric');
  const rangeCols = columns.filter(c => c.type === 'range');

  // 1. Time trends — a numeric column bucketed by month over each date column.
  //    Date columns are detected but were otherwise unused, so a dataset with a
  //    timeline produced no chart that actually showed the timeline.
  const dateCols = columns.filter(c => c.type === 'date');
  dateCols.slice(0, 2).forEach(dateCol => {
    numericCols.slice(0, 2).forEach(num => {
      const buckets = new Map<string, { sum: number; count: number }>();
      data.forEach(row => {
        const d = new Date(row[dateCol.name]);
        if (isNaN(d.getTime())) return;
        const val = Number(row[num.name]);
        if (isNaN(val)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const b = buckets.get(key) ?? { sum: 0, count: 0 };
        b.sum += val;
        b.count++;
        buckets.set(key, b);
      });

      const summable = num.stats?.isSummable;
      const trendData = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, b]) => ({
          name: month,
          value: Math.round((summable ? b.sum : b.sum / b.count) * 100) / 100,
        }));

      // Two points is a line segment, not a trend.
      if (trendData.length >= 3) {
        suggestions.push({
          id: `auto-${id++}`,
          key: `trend:${dateCol.name}:${num.name}`,
          title: `${num.name} over ${dateCol.name}`,
          type: 'area',
          xKey: 'name',
          yKey: 'value',
          dataKeys: ['value'],
          data: trendData,
          description: `${summable ? 'Total' : 'Average'} ${num.name} by month`,
        });
      }
    });
  });

  // 2. Categorical distribution charts (bar + pie)
  categoricalCols.forEach(cat => {
    if (cat.categories && cat.categories.length >= 2) {
      suggestions.push({
        id: `auto-${id++}`,
        key: `dist:${cat.name}`,
        title: `${cat.name} Distribution`,
        type: 'bar',
        dataKeys: ['count'],
        data: cat.categories.slice(0, 15).map(c => ({ name: c.value, count: c.count })),
        description: `Distribution of ${cat.name} values`,
      });

      if (cat.categories.length <= 10) {
        suggestions.push({
          id: `auto-${id++}`,
          key: `pie:${cat.name}`,
          title: `${cat.name} Breakdown`,
          type: 'donut',
          dataKeys: ['count'],
          data: cat.categories.map(c => ({ name: c.value, count: c.count })),
          description: `Proportional breakdown of ${cat.name}`,
        });
      }
    }
  });

  // 3. Range column distributions (histogram-like bar)
  rangeCols.forEach(col => {
    if (col.categories && col.categories.length >= 2) {
      suggestions.push({
        id: `auto-${id++}`,
        key: `rdist:${col.name}`,
        title: `${col.name} Distribution`,
        type: 'bar',
        dataKeys: ['count'],
        data: col.categories.slice(0, 20).map(c => ({ name: c.value, count: c.count })),
        description: `Frequency distribution of ${col.name} (range values)`,
      });
    }
  });

  // 4. Numeric by categorical (aggregated bars)
  categoricalCols.forEach(cat => {
    numericCols.slice(0, 3).forEach(num => {
      if (cat.categories && cat.categories.length >= 2 && cat.categories.length <= 15) {
        const grouped: Record<string, { sum: number; count: number }> = {};
        data.forEach(row => {
          const key = String(row[cat.name] ?? 'Unknown');
          const val = Number(row[num.name]);
          if (!isNaN(val)) {
            if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
            grouped[key].sum += val;
            grouped[key].count++;
          }
        });

        const aggData = Object.entries(grouped)
          .map(([name, g]) => ({
            name,
            total: Math.round(g.sum * 100) / 100,
            average: Math.round((g.sum / g.count) * 100) / 100,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 15);

        if (aggData.length >= 2) {
          suggestions.push({
            id: `auto-${id++}`,
            key: `agg:${num.name}:${cat.name}`,
            title: `${num.name} by ${cat.name}`,
            type: 'bar',
            xKey: 'name',
            yKey: num.stats?.isSummable ? 'total' : 'average',
            dataKeys: num.stats?.isSummable ? ['total'] : ['average'],
            data: aggData,
            description: `${num.stats?.isSummable ? 'Total' : 'Average'} ${num.name} grouped by ${cat.name}`,
          });
        }
      }
    });
  });

  // 5. Numeric scatter plots
  if (numericCols.length >= 2) {
    for (let i = 0; i < Math.min(numericCols.length - 1, 3); i++) {
      const xCol = numericCols[i];
      const yCol = numericCols[i + 1];
      const scatterData = data
        .filter(row => !isNaN(Number(row[xCol.name])) && !isNaN(Number(row[yCol.name])))
        .slice(0, 200)
        .map(row => ({
          [xCol.name]: Number(row[xCol.name]),
          [yCol.name]: Number(row[yCol.name]),
        }));

      if (scatterData.length >= 5) {
        suggestions.push({
          id: `auto-${id++}`,
          key: `scatter:${xCol.name}:${yCol.name}`,
          title: `${xCol.name} vs ${yCol.name}`,
          type: 'scatter',
          xKey: xCol.name,
          yKey: yCol.name,
          dataKeys: [yCol.name],
          data: scatterData,
          description: `Correlation between ${xCol.name} and ${yCol.name}`,
        });
      }
    }
  }

  // 6. Top N summaries for numeric + categorical
  if (categoricalCols.length && numericCols.length) {
    const cat = categoricalCols[0];
    const num = numericCols[0];
    const grouped: Record<string, number> = {};
    data.forEach(row => {
      const key = String(row[cat.name] ?? '');
      const val = Number(row[num.name]);
      if (!isNaN(val) && key) grouped[key] = (grouped[key] || 0) + val;
    });
    const topData = Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    if (topData.length >= 2) {
      suggestions.push({
        id: `auto-${id++}`,
        key: `top:${cat.name}:${num.name}`,
        title: `Top ${cat.name} by ${num.name}`,
        type: 'area',
        dataKeys: ['value'],
        data: topData,
        description: `Top performers ranked by total ${num.name}`,
      });
    }
  }

  return suggestions;
}

export function mergeColumns(
  data: Record<string, any>[],
  col1: string,
  col2: string,
  newName: string,
  separator: string = ' '
): Record<string, any>[] {
  return data.map(row => ({
    ...row,
    [newName]: `${row[col1] ?? ''}${separator}${row[col2] ?? ''}`,
  }));
}
