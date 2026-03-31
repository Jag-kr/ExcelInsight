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
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DashboardItem {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
  theme?: ChartTheme;
  displayAs?: 'chart' | 'table';
  tableColumns?: string[];
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
    <div className="glass-card rounded-xl p-4 animate-fade-in">
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

function SortableCard({ item, onRemove, onUpdateItem }: {
  item: DashboardItem;
  onRemove: () => void;
  onUpdateItem: (updates: Partial<DashboardItem>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing rounded bg-secondary/80 p-1 hover:bg-secondary">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/20" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      {item.displayAs === 'table' ? (
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
