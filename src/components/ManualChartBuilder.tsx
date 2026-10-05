import { useMemo, useState } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import {
  aggregateChart, aggKey, MAX_MEASURES, NUMERIC_KPI_AGGS,
  type ChartSpec, type ChartMeasure, type DateGrain, type KpiAgg,
} from '@/lib/derive-dashboard-item';
import { ChartType, chartTypeOptions } from '@/lib/chart-themes';
import { DynamicChart } from './DynamicChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import type { DashboardItem } from './DashboardGrid';

const ROWS = '__rows';
const NONE = '__none';
const AUTO = '__auto';
const GRAINS: DateGrain[] = ['day', 'week', 'month', 'quarter', 'year'];
const GRAIN_KEYS = { day: 'grainDay', week: 'grainWeek', month: 'grainMonth', quarter: 'grainQuarter', year: 'grainYear' } as const;
const STACKABLE: ChartType[] = ['bar', 'horizontalBar', 'area'];

interface ManualChartBuilderProps {
  data: Record<string, any>[];
  columns: ColumnMeta[];
  /** Build mode: adds a new card. */
  onAddToDashboard?: (chart: DashboardItem) => void;
  /** Edit mode: prefills from an existing card and saves back onto it. */
  initial?: { type: ChartType; spec: ChartSpec; title: string };
  onSave?: (updates: Pick<DashboardItem, 'type' | 'spec' | 'title'>) => void;
}

/**
 * Field-well chart builder (axis / values / legend), the same mental model as
 * Power BI's visual pane or Looker Studio's chart setup. Produces a ChartSpec
 * recipe; the card's data is always re-derived from it, never stored.
 */
export function ManualChartBuilder({ data, columns, onAddToDashboard, initial, onSave }: ManualChartBuilderProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const [chartType, setChartType] = useState<ChartType>(initial?.type ?? 'bar');
  const [dimension, setDimension] = useState(initial?.spec.dimension ?? '');
  const [grain, setGrain] = useState<DateGrain | ''>(initial?.spec.grain ?? '');
  const [measures, setMeasures] = useState<ChartMeasure[]>(initial?.spec.measures ?? [{ column: null, agg: 'count' }]);
  const [series, setSeries] = useState(initial?.spec.series ?? '');
  const [sort, setSort] = useState<ChartSpec['sort'] | ''>(initial?.spec.sort ?? '');
  const [limit, setLimit] = useState(initial?.spec.limit != null ? String(initial.spec.limit) : '');
  const [stacked, setStacked] = useState(initial?.spec.stacked ?? false);

  const byName = useMemo(() => new Map(columns.map(c => [c.name, c])), [columns]);
  const isNumeric = (name: string | null) => !!name && ['numeric', 'range'].includes(byName.get(name)?.type ?? '');
  const isDate = byName.get(dimension)?.type === 'date';
  const legendCols = columns.filter(c => c.name !== dimension && (c.type === 'categorical' || c.type === 'range'));

  const spec = useMemo<ChartSpec>(() => ({
    v: 2,
    dimension,
    measures,
    ...(isDate && grain ? { grain } : {}),
    ...(series && measures.length === 1 ? { series } : {}),
    ...(sort ? { sort } : {}),
    ...(limit !== '' && !isNaN(Number(limit)) ? { limit: Math.max(0, Math.floor(Number(limit))) } : {}),
    ...(stacked && STACKABLE.includes(chartType) ? { stacked: true } : {}),
  }), [dimension, measures, isDate, grain, series, sort, limit, stacked, chartType]);
  const { data: chartData, dataKeys } = useMemo(() => aggregateChart(data, spec), [data, spec]);

  const measureLabel = (m: ChartMeasure) => (m.column ? `${t(aggKey(m.agg))} ${m.column}` : t('rowCount'));
  const titleFor = (s: Pick<ChartSpec, 'measures' | 'dimension'>) => `${s.measures.map(measureLabel).join(', ')} ${t('by')} ${s.dimension}`;
  // Keep a title the user wrote; regenerate one that was generated.
  const title = initial && initial.title !== titleFor(initial.spec) ? initial.title : titleFor(spec);

  const setDimensionAndGrain = (name: string) => {
    setDimension(name);
    // A date axis almost always wants buckets; raw dates are one bar per day at best.
    setGrain(byName.get(name)?.type === 'date' ? 'month' : '');
  };

  const updateMeasure = (i: number, patch: Partial<ChartMeasure>) =>
    setMeasures(ms => ms.map((m, j) => {
      if (j !== i) return m;
      const next = { ...m, ...patch };
      // Rows can only be counted; a text column can't be summed.
      if (!next.column) next.agg = 'count';
      else if (!isNumeric(next.column) && NUMERIC_KPI_AGGS.includes(next.agg)) next.agg = 'count';
      else if (patch.column && isNumeric(patch.column) && m.agg === 'count') next.agg = 'sum';
      return next;
    }));

  const aggsFor = (column: string | null): KpiAgg[] =>
    !column ? ['count'] : isNumeric(column) ? [...NUMERIC_KPI_AGGS, 'count', 'distinct'] : ['count', 'distinct'];

  const handleAdd = () => {
    if (!chartData.length) return;
    if (onSave) return onSave({ type: chartType, spec, title });
    onAddToDashboard?.({ id: `manual-${Date.now()}`, title, type: chartType, data: chartData, dataKeys, spec });
  };

  const label = 'text-xs text-muted-foreground mb-1 block';
  const trigger = 'bg-secondary border-border';

  return (
    <div className="space-y-4">
      {!initial && <h3 className="text-sm font-semibold text-foreground">{t('buildCustomChart')}</h3>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>{t('chartType')}</label>
          <Select value={chartType} onValueChange={v => setChartType(v as ChartType)}>
            <SelectTrigger className={trigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              {chartTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={label}>{t('xAxisCategory')}</label>
          <Select value={dimension} onValueChange={setDimensionAndGrain}>
            <SelectTrigger className={trigger}><SelectValue placeholder={t('selectColumn')} /></SelectTrigger>
            <SelectContent>
              {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isDate && (
          <div>
            <label className={label}>{d('groupDatesBy')}</label>
            <Select value={grain || NONE} onValueChange={v => setGrain(v === NONE ? '' : (v as DateGrain))}>
              <SelectTrigger className={trigger}><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRAINS.map(g => <SelectItem key={g} value={g}>{d(GRAIN_KEYS[g])}</SelectItem>)}
                <SelectItem value={NONE}>{d('rawValues')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <label className={label}>{d('values')}</label>
        <div className="space-y-2">
          {measures.map((m, i) => (
            <div key={i} className="flex gap-2">
              <Select value={m.column ?? ROWS} onValueChange={v => updateMeasure(i, { column: v === ROWS ? null : v })}>
                <SelectTrigger className={`${trigger} flex-1 min-w-0`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROWS}>{t('rowCount')}</SelectItem>
                  {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={m.agg} onValueChange={v => updateMeasure(i, { agg: v as KpiAgg })} disabled={!m.column}>
                <SelectTrigger className={`${trigger} w-32 shrink-0`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {aggsFor(m.column).map(a => <SelectItem key={a} value={a}>{t(aggKey(a))}</SelectItem>)}
                </SelectContent>
              </Select>
              {measures.length > 1 && (
                <Button variant="ghost" size="icon" className="shrink-0" aria-label={d('removeValue')}
                  onClick={() => setMeasures(ms => ms.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {measures.length < MAX_MEASURES && (
            <Button variant="outline" size="sm" className="h-8 text-xs"
              onClick={() => setMeasures(ms => [...ms, { column: null, agg: 'count' }])}>
              <Plus className="h-3 w-3 mr-1" /> {d('addValue')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {measures.length === 1 && (
          <div>
            <label className={label}>{d('legendSplit')}</label>
            <Select value={series || NONE} onValueChange={v => setSeries(v === NONE ? '' : v)}>
              <SelectTrigger className={trigger}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{d('none')}</SelectItem>
                {legendCols.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className={label}>{d('sortOrder')}</label>
          <Select value={sort || AUTO} onValueChange={v => setSort(v === AUTO ? '' : (v as ChartSpec['sort']))}>
            <SelectTrigger className={trigger}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={AUTO}>{isDate && grain ? d('sortLabel') : d('sortLargest')}</SelectItem>
              <SelectItem value="value-desc">{d('sortLargest')}</SelectItem>
              <SelectItem value="value-asc">{d('sortSmallest')}</SelectItem>
              <SelectItem value="label">{d('sortLabel')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={label} htmlFor="chart-limit">{d('maxCategories')}</label>
          <Input id="chart-limit" type="number" min={0} inputMode="numeric" className={trigger}
            placeholder={isDate && grain ? '0' : '20'} value={limit} onChange={e => setLimit(e.target.value)} />
        </div>

        {STACKABLE.includes(chartType) && dataKeys.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-foreground self-end pb-2">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={stacked} onChange={e => setStacked(e.target.checked)} />
            {d('stacked')}
          </label>
        )}
      </div>

      {chartData.length > 0 && (
        <>
          <DynamicChart
            title={title}
            type={chartType}
            data={chartData}
            dataKeys={dataKeys}
            stacked={spec.stacked}
            onChangeType={setChartType}
          />
          <Button onClick={handleAdd} className="w-full" size="sm">
            {onSave ? d('saveChanges') : <><Plus className="h-4 w-4 mr-1" /> {t('addDashboard')}</>}
          </Button>
        </>
      )}
    </div>
  );
}
