import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnMeta } from '@/lib/data-analyzer';
import { countActive, distinctValues, filterKindFor, isActive, setFilter, type Filters } from '@/lib/filters';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { FilterControl } from './FilterControl';

interface Props {
  columns: ColumnMeta[];
  /** Rows the filters apply on top of (already page-filtered): the source of `in` candidates. */
  data: Record<string, unknown>[];
  filters: Filters;
  /** `undefined` once no filter is left active. */
  onChange: (filters: Filters | undefined) => void;
}

/** "Filters on this visual": one block per column with a filter, plus an Add filter picker. */
export function VisualFilters({ columns, data, filters, onChange }: Props) {
  const d = useDashboardT();
  // Columns added but not filtered yet; an active filter shows its block on its own.
  const [added, setAdded] = useState<string[]>([]);

  const filterable = useMemo(() => columns.filter(c => filterKindFor(c) !== null), [columns]);
  const shown = filterable.filter(c => added.includes(c.name) || (filters[c.name] && isActive(filters[c.name])));
  const available = filterable.filter(c => !shown.includes(c));

  const commit = (next: Filters) => onChange(countActive(next) ? next : undefined);
  const remove = (name: string) => {
    setAdded(a => a.filter(n => n !== name));
    commit(setFilter(filters, name, null));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-xs font-semibold text-foreground">{d('filtersOnVisual')}</h3>
        {countActive(filters) > 0 && (
          <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={() => { setAdded([]); onChange(undefined); }}>
            {d('clearSelection')}
          </Button>
        )}
      </div>

      {shown.map(col => (
        <div key={col.name} className="flex items-end gap-1">
          <div className="min-w-0 flex-1">
            <FilterControl
              column={col}
              values={filterKindFor(col) === 'in' ? distinctValues(data, col.name) : undefined}
              filter={filters[col.name]}
              onChange={f => commit(setFilter(filters, col.name, f))}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground"
            aria-label={`${d('removeFilter')} ${col.name}`}
            onClick={() => remove(col.name)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {available.length > 0 && (
        // `value` stays '' so the placeholder keeps showing after a pick.
        <Select value="" onValueChange={name => setAdded(a => [...a, name])}>
          <SelectTrigger className="bg-secondary border-border" aria-label={d('addFilter')}>
            <SelectValue placeholder={d('addFilter')} />
          </SelectTrigger>
          <SelectContent>
            {available.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </section>
  );
}
