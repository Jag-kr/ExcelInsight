import { useId, useMemo, useState } from 'react';
import type { ColumnMeta } from '@/lib/data-analyzer';
import { aggKey, aggregateChart, aggsForColumn, normalizeAgg, repeatColumnOf, type ChartSpec, type DateGrain, type KpiSpec } from '@/lib/derive-dashboard-item';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChartFormat } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { ManualChartBuilder } from '../ManualChartBuilder';
import type { DashboardItem } from '../DashboardGrid';
import type { Filters } from '@/lib/filters';
import { CommitInput, FormatTab, Pick as PickField } from './FormatTab';
import { VisualFilters } from './VisualFilters';
import type { CardSize } from '@/lib/layout';

const ROWS = '__rows';
const LABEL = 'mb-1 block text-xs text-muted-foreground';
const TRIGGER = 'bg-secondary border-border';
const GRAINS = ['week', 'month', 'quarter', 'year'] as const;
const GRAIN_KEY = { week: 'grainWeek', month: 'grainMonth', quarter: 'grainQuarter', year: 'grainYear' } as const;

export interface CardSettingsProps {
  /** Filtered columns, for the builder and the pickers. */
  columns: ColumnMeta[];
  /** Filtered rows, for the builder and the series list. */
  data: Record<string, unknown>[];
  /** `spec` null means the card is not a chart recipe (KPI, repeating values). */
  selected: { item: DashboardItem; spec: ChartSpec | null };
  /** The size preset matching the card's current grid width (sizeFromWidth). */
  size: CardSize;
  /** Live edits for the chart. */
  onChange: (updates: Pick<DashboardItem, 'type' | 'spec' | 'title'>) => void;
  /** Title edit, committed on blur/Enter: one undo entry. */
  onChangeTitle: (title: string) => void;
  /** Resize preset: one undo entry. */
  onChangeSize: (size: CardSize) => void;
  /** Live edits for a KPI card. */
  onChangeKpi?: (spec: KpiSpec) => void;
  /** Live edits for a repeating-values card: the column to tally. */
  onChangeRepeatColumn?: (column: string) => void;
  /** Live edits to the chart or KPI card's formatting; undefined clears it. */
  onChangeFormat?: (format: ChartFormat | undefined) => void;
  /** Live edits to the chart or KPI card's own filters; undefined clears them. */
  onChangeFilters?: (filters: Filters | undefined) => void;
}

/** Every setting of one card (title, size, data, format, filters), without chrome: the edit window supplies that. */
export function CardSettings({ columns, data, selected, size, onChange, onChangeTitle, onChangeSize, onChangeKpi, onChangeRepeatColumn, onChangeFormat, onChangeFilters }: CardSettingsProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const [tab, setTab] = useState<'data' | 'format' | 'filters'>('data');

  const { item, spec } = selected;

  const kpi = item.displayAs === 'kpi' ? item.kpiSpec : undefined;
  const compareId = useId();
  const dateCols = columns.filter(c => c.type === 'date');
  const repeatCol = repeatColumnOf(item);
  // Only chart recipes and KPI cards have formatting; any other card falls back to Data.
  // The stored item has no series list: re-derive it from the spec, as the chart does.
  const agg = useMemo(() => (spec ? aggregateChart(data, spec) : undefined), [data, spec]);
  const editable = !!spec || !!kpi;
  const canFormat = editable && !!onChangeFormat;
  const canFilter = editable && !!onChangeFilters;
  const showFormat = canFormat && tab === 'format';
  const showFilters = canFilter && tab === 'filters';
  const showData = !showFormat && !showFilters;

  const sizeOptions: [CardSize, string][] = [
    ['xs', `${t('tile')} (¼)`],
    ['sm', `${t('small')} (⅓)`],
    ['md', `${t('medium')} (½)`],
    ['lg', `${t('large')} (${d('fullWidth')})`],
  ];

  return (
    <div className="flex flex-col gap-4">
      {(canFormat || canFilter) && (
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList className={`grid h-8 w-full ${canFormat && canFilter ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="data" className="px-1 py-1 text-xs">{t('data')}</TabsTrigger>
            {canFormat && <TabsTrigger value="format" className="px-1 py-1 text-xs">{d('format')}</TabsTrigger>}
            {canFilter && <TabsTrigger value="filters" className="px-1 py-1 text-xs">{d('filtersTab')}</TabsTrigger>}
          </TabsList>
        </Tabs>
      )}

      {showData && (
        <div className="grid gap-3">
          <CommitInput
            label={d('titleLabel')}
            value={item.title}
            normalize={s => s.trim() || item.title}
            maxLength={120}
            className="bg-secondary"
            onCommit={onChangeTitle}
          />
          <PickField label={d('sizeLabel')} value={size} options={sizeOptions} onChange={onChangeSize} />
        </div>
      )}

      {showFormat && onChangeFormat && <FormatTab item={item} dataKeys={agg?.dataKeys} rowCount={agg?.data.length} onChange={onChangeFormat} />}
      {showFilters && onChangeFilters && (
        <VisualFilters key={item.id} columns={columns} data={data} filters={item.filters ?? {}} onChange={onChangeFilters} />
      )}
      {showData && spec && (
        <ManualChartBuilder
          key={item.id}
          data={data}
          columns={columns}
          initial={{ type: item.type, spec, title: item.title }}
          onChange={onChange}
          hidePreview
        />
      )}
      {showData && kpi && onChangeKpi && (
        <div className="space-y-3">
          <div>
            <label className={LABEL}>{d('column')}</label>
            <Select value={kpi.column ?? ROWS} onValueChange={v => {
              const column = v === ROWS ? null : v;
              onChangeKpi({ ...kpi, column, agg: normalizeAgg(columns, column, kpi.agg, true) });
            }}>
              <SelectTrigger className={TRIGGER}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ROWS}>{t('rowCount')}</SelectItem>
                {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={LABEL}>{t('aggregation')}</label>
            <Select value={kpi.agg} disabled={!kpi.column} onValueChange={v => onChangeKpi({ ...kpi, agg: v as KpiSpec['agg'] })}>
              <SelectTrigger className={TRIGGER}><SelectValue /></SelectTrigger>
              <SelectContent>
                {aggsForColumn(columns, kpi.column).map(a => <SelectItem key={a} value={a}>{t(aggKey(a))}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {dateCols.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <input
                  id={compareId}
                  type="checkbox"
                  checked={!!kpi.compare}
                  onChange={e => {
                    const { compare: _, ...rest } = kpi;
                    onChangeKpi(e.target.checked ? { ...rest, compare: { column: dateCols[0].name, grain: 'month' } } : rest);
                  }}
                  className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <label htmlFor={compareId} className="text-xs text-foreground">{d('compareLabel')}</label>
              </div>
              {kpi.compare && (
                <>
                  <div>
                    <label className={LABEL}>{d('compareDateColumn')}</label>
                    <Select value={kpi.compare.column} onValueChange={v => onChangeKpi({ ...kpi, compare: { ...kpi.compare!, column: v } })}>
                      <SelectTrigger className={TRIGGER}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dateCols.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={LABEL}>{d('comparePeriod')}</label>
                    <Select value={kpi.compare.grain} onValueChange={v => onChangeKpi({ ...kpi, compare: { ...kpi.compare!, grain: v as DateGrain } })}>
                      <SelectTrigger className={TRIGGER}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GRAINS.map(g => <SelectItem key={g} value={g}>{d(GRAIN_KEY[g])}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
      {showData && repeatCol && onChangeRepeatColumn && (
        <div>
          <label className={LABEL}>{d('column')}</label>
          <Select value={repeatCol} onValueChange={onChangeRepeatColumn}>
            <SelectTrigger className={TRIGGER}><SelectValue /></SelectTrigger>
            <SelectContent>
              {columns.filter(c => c.type !== 'id').map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {!spec && !(kpi && onChangeKpi) && !(repeatCol && onChangeRepeatColumn) && (
        <p className="text-xs text-muted-foreground">{item.displayAs === 'slicer' ? d('slicerHint') : item.displayAs === 'text' ? d('textHint') : d('noEditableSettings')}</p>
      )}
    </div>
  );
}
