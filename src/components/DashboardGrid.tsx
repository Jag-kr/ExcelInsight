import { useState, useEffect, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DynamicChart } from './DynamicChart';
import { ChartTheme, chartThemes, ChartType } from '@/lib/chart-themes';
import {
  GripVertical, Trash2, Maximize2, Minimize2, Square, Repeat2, BarChart3, AlertTriangle,
  Copy, Pencil, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DashboardItem {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
  theme?: ChartTheme;
  displayAs?: 'chart' | 'table' | 'insight';
  tableColumns?: string[];
  size?: 'sm' | 'md' | 'lg';
  insightType?: 'repeating' | 'stats' | 'quality';
  insightContent?: any;
}

interface DashboardGridProps {
  items: DashboardItem[];
  onReorder: (items: DashboardItem[]) => void;
  onRemove: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<DashboardItem>) => void;
  onDuplicate?: (id: string) => void;
  emptyAction?: React.ReactNode;
}

function EditableTitle({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== value) onChange(v);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className="h-7 text-sm font-semibold"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-left truncate hover:underline decoration-dotted underline-offset-2 ${className || ''}`}
      title="Click to rename"
    >
      {value}
    </button>
  );
}

function DashboardTable({ item, onRename }: { item: DashboardItem; onRename: (v: string) => void }) {
  const cols = item.tableColumns || (item.data.length > 0 ? Object.keys(item.data[0]) : []);
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in h-full">
      <h3 className="text-sm font-semibold text-foreground mb-3 truncate">
        <EditableTitle value={item.title} onChange={onRename} />
      </h3>
      <div className="overflow-auto max-h-[280px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {cols.map(c => (
                <th key={c} className="text-left p-2 text-muted-foreground font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.data.map((row, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                {cols.map(c => (
                  <td key={c} className="p-2 text-foreground truncate max-w-[150px]">{String(row[c] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardInsightCard({ item, onRename }: { item: DashboardItem; onRename: (v: string) => void }) {
  const { t } = useI18n();
  const content = item.insightContent;

  if (item.insightType === 'repeating' && content) {
    return (
      <div className="glass-card rounded-xl p-4 animate-fade-in h-full space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
            <Repeat2 className="h-4 w-4 text-accent shrink-0" />
            <EditableTitle value={item.title} onChange={onRename} className="min-w-0" />
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent shrink-0">
            {t('highRepetition')} ({Math.round(content.repetitionRatio * 100)}%)
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {content.uniqueCount} {t('uniqueValues')} / {content.totalCount} {t('rows')}
        </p>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('topValues')}:</p>
          {content.topValues?.map((v: any) => (
            <div key={v.value} className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${v.percentage}%` }} />
              </div>
              <span className="text-[10px] text-foreground min-w-[60px] truncate">{v.value}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{v.count} ({v.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.insightType === 'stats' && Array.isArray(content)) {
    return (
      <div className="glass-card rounded-xl p-4 animate-fade-in h-full space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <EditableTitle value={item.title} onChange={onRename} />
        </h3>
        <div className="overflow-auto max-h-[280px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium">{t('columns')}</th>
                <th className="text-right p-2 text-muted-foreground font-medium">{t('min')}</th>
                <th className="text-right p-2 text-muted-foreground font-medium">{t('max')}</th>
                <th className="text-right p-2 text-muted-foreground font-medium">{t('mean')}</th>
                <th className="text-right p-2 text-muted-foreground font-medium">{t('median')}</th>
                <th className="text-right p-2 text-muted-foreground font-medium">{t('stdDev')}</th>
              </tr>
            </thead>
            <tbody>
              {content.map((col: any) => (
                <tr key={col.name} className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="p-2 font-medium text-foreground">{col.name}</td>
                  <td className="p-2 text-right text-muted-foreground">{col.stats?.min?.toFixed(1)}</td>
                  <td className="p-2 text-right text-muted-foreground">{col.stats?.max?.toFixed(1)}</td>
                  <td className="p-2 text-right text-muted-foreground">{col.stats?.mean?.toFixed(2)}</td>
                  <td className="p-2 text-right text-muted-foreground">{col.stats?.median?.toFixed(1)}</td>
                  <td className="p-2 text-right text-muted-foreground">{col.stats?.stdDev?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (item.insightType === 'quality' && Array.isArray(content)) {
    return (
      <div className="glass-card rounded-xl p-4 animate-fade-in h-full space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <EditableTitle value={item.title} onChange={onRename} />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.map((col: any) => (
            <div key={col.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs font-medium text-foreground truncate flex-1">{col.name}</span>
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${col.completeness > 90 ? 'bg-success' : col.completeness > 70 ? 'bg-warning' : 'bg-destructive'}`}
                  style={{ width: `${col.completeness}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {col.completeness}% {t('complete')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const sizeClasses: Record<string, string> = {
  sm: 'col-span-1 md:col-span-1 lg:col-span-2',
  md: 'col-span-1 md:col-span-2 lg:col-span-3',
  lg: 'col-span-1 md:col-span-2 lg:col-span-6',
};

const sizeMinHeights: Record<string, string> = {
  sm: 'min-h-[260px]',
  md: 'min-h-[340px]',
  lg: 'min-h-[440px]',
};

const sizeFractionLabel: Record<'sm' | 'md' | 'lg', string> = {
  sm: '⅓',
  md: '½',
  lg: 'full',
};

function SortableCard({ item, onRemove, onUpdateItem, onDuplicate }: {
  item: DashboardItem;
  onRemove: () => void;
  onUpdateItem: (updates: Partial<DashboardItem>) => void;
  onDuplicate?: () => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const size = (item.size || 'md') as 'sm' | 'md' | 'lg';
  const [confirmRemove, setConfirmRemove] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  useEffect(() => () => { if (confirmTimer.current) window.clearTimeout(confirmTimer.current); }, []);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
      setConfirmRemove(false);
      onRemove();
      return;
    }
    setConfirmRemove(true);
    confirmTimer.current = window.setTimeout(() => setConfirmRemove(false), 2000);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  const setSize = (s: 'sm' | 'md' | 'lg') => onUpdateItem({ size: s });
  const renameTitle = (v: string) => onUpdateItem({ title: v });

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-pdf-card
      className={`relative group ${sizeClasses[size]} ${isDragging ? 'scale-[1.02] shadow-2xl' : ''} transition-transform`}
    >
      <div
        data-pdf-hide
        className="absolute top-2 left-2 z-10 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity"
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                {...attributes}
                {...listeners}
                aria-label={t('dragToReorder')}
                className="cursor-grab active:cursor-grabbing rounded bg-secondary/90 backdrop-blur p-1.5 hover:bg-secondary border border-border/50"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span className="text-xs">{t('dragToReorder')}</span></TooltipContent>
          </Tooltip>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('resize')}
                    className="h-7 w-7 p-0 bg-secondary/90 backdrop-blur border border-border/50 hover:bg-secondary"
                  >
                    {size === 'lg' ? <Maximize2 className="h-3.5 w-3.5" /> : size === 'sm' ? <Minimize2 className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('resize')}</span></TooltipContent>
            </Tooltip>
            <PopoverContent side="bottom" align="start" className="w-auto p-1.5 flex gap-1">
              {([
                { v: 'sm' as const, Icon: Minimize2, label: t('small') },
                { v: 'md' as const, Icon: Square, label: t('medium') },
                { v: 'lg' as const, Icon: Maximize2, label: t('large') },
              ]).map(({ v, Icon, label }) => (
                <Button
                  key={v}
                  variant={size === v ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2 gap-1.5"
                  onClick={() => setSize(v)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{label}</span>
                  {size === v && <Check className="h-3 w-3" />}
                </Button>
              ))}
            </PopoverContent>
          </Popover>

          {onDuplicate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('duplicate')}
                  className="h-7 w-7 p-0 bg-secondary/90 backdrop-blur border border-border/50 hover:bg-secondary"
                  onClick={onDuplicate}
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><span className="text-xs">{t('duplicate')}</span></TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t('remove')}
                className="h-7 w-7 p-0 bg-secondary/90 backdrop-blur border border-border/50 hover:bg-destructive/20"
                onClick={onRemove}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span className="text-xs">{t('remove')}</span></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {item.displayAs === 'insight' ? (
        <DashboardInsightCard item={item} onRename={renameTitle} />
      ) : item.displayAs === 'table' ? (
        <DashboardTable item={item} onRename={renameTitle} />
      ) : (
        <DynamicChart
          title={item.title}
          description={item.description}
          type={item.type}
          data={item.data}
          dataKeys={item.dataKeys}
          xKey={item.xKey}
          theme={item.theme || chartThemes[0]}
          onChangeType={(type) => onUpdateItem({ type })}
          onChangeTheme={(theme) => onUpdateItem({ theme })}
          onRenameTitle={renameTitle}
        />
      )}
    </div>
  );
}

export function DashboardGrid({ items, onReorder, onRemove, onUpdateItem, onDuplicate, emptyAction }: DashboardGridProps) {
  const { t } = useI18n();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  if (!items.length) {
    return (
      <div className="glass-card rounded-2xl border-2 border-dashed border-border p-10 text-center animate-fade-in">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{t('emptyDashboardTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{t('emptyDashboardDesc')}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(item => (
            <SortableCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onUpdateItem={(updates) => onUpdateItem(item.id, updates)}
              onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
