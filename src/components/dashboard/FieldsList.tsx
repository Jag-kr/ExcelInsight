import { useState } from 'react';
import { Calendar, FunctionSquare, Hash, KeyRound, Merge, SlidersHorizontal, Tag, Type, type LucideIcon } from 'lucide-react';
import type { ColumnMeta, ColumnType } from '@/lib/data-analyzer';
import { specForField } from '@/lib/derive-dashboard-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { filterKindFor } from '@/lib/filters';

const FIELD_ICONS: Record<ColumnType, LucideIcon> = {
  date: Calendar, numeric: Hash, range: Hash, categorical: Tag, text: Type, id: KeyRound,
};

export interface FieldsListProps {
  columns: ColumnMeta[];
  /** Names of calculated fields: they show the fx icon instead of their type icon. */
  calculated?: Set<string>;
  /** A click on a field: the parent creates a card from specForField(col). */
  onAddField: (col: ColumnMeta) => void;
  /** Adds (or selects) a slicer card for the column; the per-field button is hidden when omitted. */
  onAddSlicer?: (col: ColumnMeta) => void;
  onNewField?: () => void;
  /** Opens the column merger; the button is hidden when omitted. */
  onMergeColumns?: () => void;
}

/** Searchable field list with the New field / Merge columns / slicer actions. Owns its search text. */
export function FieldsList({ columns, calculated, onAddField, onAddSlicer, onNewField, onMergeColumns }: FieldsListProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const fields = q ? columns.filter(c => c.name.toLowerCase().includes(q)) : columns;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d('fields')}</h3>
        <div className="flex min-w-0 items-center">
          {onNewField && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" title={d('newField')} aria-label={d('newField')} onClick={onNewField}>
              <FunctionSquare className="h-3.5 w-3.5" /> {d('newField')}
            </Button>
          )}
          {onMergeColumns && (
            <Button variant="ghost" size="sm" className="h-7 w-7 shrink-0 p-0" title={t('mergeColumns')} aria-label={t('mergeColumns')} onClick={onMergeColumns}>
              <Merge className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
          const Icon = calculated?.has(col.name) ? FunctionSquare : FIELD_ICONS[col.type];
          const disabled = !specForField(col);
          return (
            <li key={col.name} className="flex items-center gap-0.5">
              <button
                type="button"
                title={col.name}
                disabled={disabled}
                onClick={() => onAddField(col)}
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
  );
}
