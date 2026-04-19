import { ColumnMeta } from '@/lib/data-analyzer';
import { Hash, Type, Calendar, List, Fingerprint, BarChart3 } from 'lucide-react';
import { useI18n, TranslationKey } from '@/lib/i18n';

interface DataSummaryProps {
  columns: ColumnMeta[];
  rowCount: number;
}

const typeIcons: Record<string, any> = {
  numeric: Hash,
  categorical: List,
  date: Calendar,
  text: Type,
  range: BarChart3,
  id: Fingerprint,
};

const typeLabelKeys: Record<string, TranslationKey> = {
  numeric: 'summableNumeric',
  categorical: 'categorical',
  date: 'date',
  text: 'text',
  range: 'rangeDiscrete',
  id: 'identifier',
};

export function DataSummary({ columns, rowCount }: DataSummaryProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="glass-card rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-primary">{rowCount}</p>
          <p className="text-xs text-muted-foreground">{t('rows')}</p>
        </div>
        <div className="glass-card rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-accent">{columns.length}</p>
          <p className="text-xs text-muted-foreground">{t('columns')}</p>
        </div>
      </div>

      <div className="grid gap-2">
        {columns.map(col => {
          const Icon = typeIcons[col.type] || Type;
          return (
            <div key={col.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium text-foreground truncate">{col.name}</span>
              <span className="ml-auto shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t(typeLabelKeys[col.type] || 'text')}
              </span>
              {col.nullCount > 0 && (
                <span className="shrink-0 text-xs text-warning">{col.nullCount} {t('nullValues')}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
