import { useMemo, useState } from 'react';
import { Calendar, Hash, KeyRound, Merge, SlidersHorizontal, Tag, Type, X, type LucideIcon } from 'lucide-react';
import type { ColumnMeta, ColumnType } from '@/lib/data-analyzer';
import { addFieldToSpec, aggKey, aggregateChart, aggsForColumn, normalizeAgg, repeatColumnOf, specForField, specTitle, type ChartSpec, type KpiSpec } from '@/lib/derive-dashboard-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChartFormat } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { ManualChartBuilder } from '../ManualChartBuilder';
import type { DashboardItem } from '../DashboardGrid';
import { filterKindFor, type Filters } from '@/lib/filters';
import { FormatTab } from './FormatTab';
import { VisualFilters } from './VisualFilters';

const FIELD_ICONS: Record<ColumnType, LucideIcon> = {
  date: Calendar, numeric: Hash, range: Hash, categorical: Tag, text: Type, id: KeyRound,
};

const ROWS = '__rows';
const LABEL = 'mb-1 block text-xs text-muted-foreground';
const TRIGGER = 'bg-secondary border-border';

export interface EditorPaneProps {
  /** Filtered columns, for the builder and the field list. */
  columns: ColumnMeta[];
  /** Filtered rows, for the builder preview. */
  data: Record<string, unknown>[];
  /** `spec` null means the card is not a chart recipe (KPI, table, insight, scatter). */
  selected: { item: DashboardItem; spec: ChartSpec | null } | null;
  /** Live edits for the selected chart. */
  onChange: (updates: Pick<DashboardItem, 'type' | 'spec' | 'title'>) => void;
  /** Nothing selected: the parent creates a card from specForField(col). */
  onAddField: (col: ColumnMeta) => void;
  /** Live edits for a selected KPI card. */
  onChangeKpi?: (spec: KpiSpec) => void;
  /** Live edits for a selected repeating-values card: the column to tally. */
  onChangeRepeatColumn?: (column: string) => void;
  /** Live edits to the selected chart or KPI card's formatting; undefined clears it. */
  onChangeFormat?: (format: ChartFormat | undefined) => void;
  /** Live edits to the selected chart or KPI card's own filters; undefined clears them. */
  onChangeFilters?: (filters: Filters | undefined) => void;
  onDeselect: () => void;
  /** Opens the column merger; the button is hidden when omitted. */
  onMergeColumns?: () => void;
  /** Adds (or selects) a slicer card for the column; the per-field button is hidden when omitted. */
  onAddSlicer?: (col: ColumnMeta) => void;
}

export function EditorPane({ columns, data, selected, onChange, onAddField, onChangeKpi, onChangeRepeatColumn, onChangeFormat, onChangeFilters, onDeselect, onMergeColumns, onAddSlicer }: EditorPaneProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'data' | 'format' | 'filters'>('data');

  const item = selected?.item;
  const spec = selected?.spec ?? null;
  const q = query.trim().toLowerCase();
  const fields = q ? columns.filter(c => c.name.toLowerCase().includes(q)) : columns;

  const kpi = item?.displayAs === 'kpi' ? item.kpiSpec : undefined;
  const repeatCol = item ? repeatColumnOf(item) : null;
  // Only chart recipes and KPI cards have formatting; any other selection falls back to Data.
  // The stored item has no series list: re-derive it from the spec, as the chart does.
  const agg = useMemo(() => (spec ? aggregateChart(data, spec) : undefined), [data, spec]);
  const editable = !!item && (!!spec || !!kpi);
  const canFormat = editable && !!onChangeFormat;
  const canFilter = editable && !!onChangeFilters;
  const showFormat = canFormat && tab === 'format';
  const showFilters = canFilter && tab === 'filters';
  const showData = !showFormat && !showFilters;

  const onField = (col: ColumnMeta) => {
    if (!item) return onAddField(col);
    if (kpi) return onChangeKpi?.({ column: col.name, agg: normalizeAgg(columns, col.name, kpi.agg, true) });
    if (!spec) return;
    const next = addFieldToSpec(spec, col);
    if (next === spec) return;
    // Follow the recipe while the title is still the generated one; keep a user-written title.
    const title = item.title === specTitle(spec, t) ? specTitle(next, t) : item.title;
    onChange({ type: item.type, spec: next, title });
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-sm font-semibold text-foreground">{item ? item.title : d('fields')}</h2>
        {item && (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={d('closeEditor')} onClick={onDeselect}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(canFormat || canFilter) && (
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList className={`grid h-8 w-full ${canFormat && canFilter ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="data" className="px-1 py-1 text-xs">{t('data')}</TabsTrigger>
            {canFormat && <TabsTrigger value="format" className="px-1 py-1 text-xs">{d('format')}</TabsTrigger>}
            {canFilter && <TabsTrigger value="filters" className="px-1 py-1 text-xs">{d('filtersTab')}</TabsTrigger>}
          </TabsList>
        </Tabs>
      )}

      {showFormat && item && onChangeFormat && <FormatTab item={item} dataKeys={agg?.dataKeys} rowCount={agg?.data.length} onChange={onChangeFormat} />}
      {showFilters && item && onChangeFilters && (
        <VisualFilters key={item.id} columns={columns} data={data} filters={item.filters ?? {}} onChange={onChangeFilters} />
      )}
      {showData && item && spec && (
        <ManualChartBuilder
          key={item.id}
          data={data}
          columns={columns}
          initial={{ type: item.type, spec, title: item.title }}
          onChange={onChange}
        />
      )}
      {showData && kpi && onChangeKpi && (
        <div className="space-y-3">
          <div>
            <label className={LABEL}>{d('column')}</label>
            <Select value={kpi.column ?? ROWS} onValueChange={v => {
              const column = v === ROWS ? null : v;
              onChangeKpi({ column, agg: normalizeAgg(columns, column, kpi.agg, true) });
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
      {item && !spec && !(kpi && onChangeKpi) && !(repeatCol && onChangeRepeatColumn) && (
        <p className="text-xs text-muted-foreground">{item.displayAs === 'slicer' ? d('slicerHint') : d('noEditableSettings')}</p>
      )}
      {!item && <p className="text-xs text-muted-foreground">{d('clickFieldToAdd')}</p>}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d('fields')}</h3>
          {onMergeColumns && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" aria-label={t('mergeColumns')} onClick={onMergeColumns}>
              <Merge className="h-3.5 w-3.5" /> {t('mergeColumns')}
            </Button>
          )}
        </div>
        <Input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={d('searchFields')}
          aria-label={d('searchFields')}
          className="h-8 bg-secondary border-border text-xs"
        />
        <ul className="space-y-0.5">
          {fields.map(col => {
            const Icon = FIELD_ICONS[col.type];
            const disabled = !item && !specForField(col);
            return (
              <li key={col.name} className="flex items-center gap-0.5">
                <button
                  type="button"
                  title={col.name}
                  disabled={disabled}
                  onClick={() => onField(col)}
                  className="flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-xs text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{col.name}</span>
                </button>
                {onAddSlicer && filterKindFor(col) !== null && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    aria-label={`${d('addSlicer')}: ${col.name}`}
                    title={`${d('addSlicer')}: ${col.name}`}
                    onClick={() => onAddSlicer(col)}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
