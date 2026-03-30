import { useMemo } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface DataFilterProps {
  columns: ColumnMeta[];
  data: Record<string, any>[];
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
}

export function DataFilter({ columns, data, filters, onFiltersChange }: DataFilterProps) {
  const { t } = useI18n();

  const filterableColumns = useMemo(() =>
    columns.filter(c => c.type === 'categorical' || c.type === 'range' || (c.type === 'text' && c.uniqueRatio < 0.5)),
    [columns]
  );

  const columnValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    filterableColumns.forEach(col => {
      const vals = new Set<string>();
      data.forEach(row => {
        const v = row[col.name];
        if (v !== null && v !== undefined && v !== '') vals.add(String(v));
      });
      result[col.name] = [...vals].sort();
    });
    return result;
  }, [data, filterableColumns]);

  const activeCount = Object.keys(filters).length;

  if (!filterableColumns.length) {
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
        {filterableColumns.map(col => (
          <div key={col.name}>
            <label className="text-xs text-muted-foreground mb-1 block truncate">{col.name}</label>
            <Select
              value={filters[col.name] || '__all'}
              onValueChange={(v) => {
                const next = { ...filters };
                if (v === '__all') delete next[col.name];
                else next[col.name] = v;
                onFiltersChange(next);
              }}
            >
              <SelectTrigger className="bg-secondary border-border text-sm h-9">
                <SelectValue placeholder={t('selectValue')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t('allValues')}</SelectItem>
                {(columnValues[col.name] || []).map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
