import { useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DynamicChart } from './DynamicChart';
import { ChartTheme, chartThemes, ChartType } from '@/lib/chart-themes';
import { GripVertical, Trash2, Maximize2, Minimize2, Square, Repeat2, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

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
}

function DashboardTable({ item }: { item: DashboardItem }) {
  const cols = item.tableColumns || (item.data.length > 0 ? Object.keys(item.data[0]) : []);
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in h-full">
      <h3 className="text-sm font-semibold text-foreground mb-3 truncate">{item.title}</h3>
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

function DashboardInsightCard({ item }: { item: DashboardItem }) {
  const { t } = useI18n();
  const content = item.insightContent;

  if (item.insightType === 'repeating' && content) {
    return (
      <div className="glass-card rounded-xl p-4 animate-fade-in h-full space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-accent" />
            {item.title}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent">
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
          {item.title}
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
          {item.title}
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
  sm: 'col-span-1',
  md: 'col-span-1',
  lg: 'col-span-1 lg:col-span-2',
};

function SortableCard({ item, onRemove, onUpdateItem }: {
  item: DashboardItem;
  onRemove: () => void;
  onUpdateItem: (updates: Partial<DashboardItem>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const size = item.size || 'md';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  const cycleSize = () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    const next = sizes[(sizes.indexOf(size) + 1) % sizes.length];
    onUpdateItem({ size: next });
  };

  const SizeIcon = size === 'lg' ? Maximize2 : size === 'sm' ? Minimize2 : Square;

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${sizeClasses[size]}`}>
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing rounded bg-secondary/80 p-1 hover:bg-secondary">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/20" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={cycleSize} title={`Size: ${size}`}>
          <SizeIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
      {item.displayAs === 'insight' ? (
        <DashboardInsightCard item={item} />
      ) : item.displayAs === 'table' ? (
        <DashboardTable item={item} />
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
        />
      )}
    </div>
  );
}

export function DashboardGrid({ items, onReorder, onRemove, onUpdateItem }: DashboardGridProps) {
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">No charts on dashboard yet</p>
        <p className="text-muted-foreground text-xs mt-1">Auto-generated charts and manual charts will appear here</p>
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
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
