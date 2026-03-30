import { ColumnMeta } from '@/lib/data-analyzer';
import { Hash, Type, Calendar, List, Fingerprint, BarChart3 } from 'lucide-react';

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

const typeLabels: Record<string, string> = {
  numeric: 'Summable Numeric',
  categorical: 'Categorical',
  date: 'Date',
  text: 'Text',
  range: 'Range / Discrete',
  id: 'Identifier',
};

export function DataSummary({ columns, rowCount }: DataSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="glass-card rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-primary">{rowCount}</p>
          <p className="text-xs text-muted-foreground">Rows</p>
        </div>
        <div className="glass-card rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-accent">{columns.length}</p>
          <p className="text-xs text-muted-foreground">Columns</p>
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
                {typeLabels[col.type]}
              </span>
              {col.nullCount > 0 && (
                <span className="shrink-0 text-xs text-warning">{col.nullCount} null</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
