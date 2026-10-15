import { useMemo } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { Button } from '@/components/ui/button';
import { FilterControl } from '@/components/dashboard/FilterControl';
import { countActive, distinctValues, filterKindFor, setFilter, type Filters } from '@/lib/filters';
import { Filter, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface DataFilterProps {
  columns: ColumnMeta[];
  data: Record<string, unknown>[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function DataFilter({ columns, data, filters, onFiltersChange }: DataFilterProps) {
  const { t } = useI18n();

  const filterable = useMemo(() => columns.filter(c => filterKindFor(c) !== null), [columns]);

  // Candidates come from the unfiltered data, so picking one value doesn't hide the others.
  const columnValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    filterable.forEach(col => {
      if (filterKindFor(col) !== 'in') return;
      result[col.name] = distinctValues(data, col.name);
    });
    return result;
  }, [data, filterable]);

  const activeCount = countActive(filters);

  if (!filterable.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t('noFilters')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          {t('filterData')}
          {activeCount > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {activeCount} {t('activeFilters')}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})} className="text-xs h-7">
            <X className="h-3 w-3 mr-1" /> {t('clearAll')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filterable.map(col => (
          <FilterControl
            key={col.name}
            column={col}
            values={columnValues[col.name]}
            filter={filters[col.name]}
            onChange={f => onFiltersChange(setFilter(filters, col.name, f))}
          />
        ))}
      </div>
    </div>
  );
}
