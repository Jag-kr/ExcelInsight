import { useState } from 'react';
import { ColumnMeta } from '@/lib/data-analyzer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Merge } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ColumnMergerProps {
  columns: ColumnMeta[];
  onMerge: (col1: string, col2: string, newName: string, separator: string) => void;
}

export function ColumnMerger({ columns, onMerge }: ColumnMergerProps) {
  const { t } = useI18n();
  const [col1, setCol1] = useState('');
  const [col2, setCol2] = useState('');
  const [newName, setNewName] = useState('');
  const [separator, setSeparator] = useState(' ');

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Merge className="h-4 w-4 text-primary" /> {t('mergeColumns')}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Select value={col1} onValueChange={setCol1}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={t('column1')} /></SelectTrigger>
          <SelectContent>{columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={col2} onValueChange={setCol2}>
          <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder={t('column2')} /></SelectTrigger>
          <SelectContent>{columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input placeholder={t('newColumnName')} value={newName} onChange={e => setNewName(e.target.value)} className="bg-secondary border-border" />
        <Input placeholder={t('separator')} value={separator} onChange={e => setSeparator(e.target.value)} className="bg-secondary border-border" />
      </div>

      <Button
        onClick={() => { if (col1 && col2 && newName) onMerge(col1, col2, newName, separator); }}
        disabled={!col1 || !col2 || !newName}
        size="sm"
        className="w-full"
      >
        <Merge className="h-4 w-4 mr-1" /> {t('merge')}
      </Button>
    </div>
  );
}
