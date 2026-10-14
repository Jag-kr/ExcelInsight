import { useState } from 'react';
import { Calendar, Hash, KeyRound, Tag, Type, X, type LucideIcon } from 'lucide-react';
import type { ColumnMeta, ColumnType } from '@/lib/data-analyzer';
import { addFieldToSpec, aggKey, aggsForColumn, normalizeAgg, repeatColumnOf, specForField, specTitle, type ChartSpec, type KpiSpec } from '@/lib/derive-dashboard-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { ManualChartBuilder } from '../ManualChartBuilder';
import type { DashboardItem } from '../DashboardGrid';

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
  onDeselect: () => void;
}

export function EditorPane({ columns, data, selected, onChange, onAddField, onChangeKpi, onChangeRepeatColumn, onDeselect }: EditorPaneProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const [query, setQuery] = useState('');

  const item = selected?.item;
  const spec = selected?.spec ?? null;
  const q = query.trim().toLowerCase();
  const fields = q ? columns.filter(c => c.name.toLowerCase().includes(q)) : columns;

  const kpi = item?.displayAs === 'kpi' ? item.kpiSpec : undefined;
  const repeatCol = item ? repeatColumnOf(item) : null;

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

      {item && spec && (
        <ManualChartBuilder
          key={item.id}
          data={data}
          columns={columns}
          initial={{ type: item.type, spec, title: item.title }}
          onChange={onChange}
        />
      )}
      {kpi && onChangeKpi && (
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
      {repeatCol && onChangeRepeatColumn && (
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
        <p className="text-xs text-muted-foreground">{d('noEditableSettings')}</p>
      )}
      {!item && <p className="text-xs text-muted-foreground">{d('clickFieldToAdd')}</p>}

      <section className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d('fields')}</h3>
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
              <li key={col.name}>
                <button
                  type="button"
                  title={col.name}
                  disabled={disabled}
                  onClick={() => onField(col)}
                  className="flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{col.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
