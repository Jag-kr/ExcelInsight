import { useState, useEffect, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DynamicChart } from './DynamicChart';
import { ChartType } from '@/lib/chart-themes';
import {
  Trash2, Maximize2, Minimize2, Square, Repeat2, BarChart3, AlertTriangle,
  Copy, MoreHorizontal, RectangleHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartErrorBoundary } from './ChartErrorBoundary';

export interface DashboardItem {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
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
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        maxLength={100}
        className="h-6 sm:h-7 text-xs sm:text-sm font-semibold w-full px-1.5 py-0.5 border rounded"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-left truncate hover:underline decoration-dotted underline-offset-2 text-xs sm:text-sm w-full ${className || ''}`}
      title="Click to rename"
    >
      {value}
    </button>
  );
}

function DashboardTable({ item, onRename }: { item: DashboardItem; onRename: (v: string) => void }) {
  const cols = item.tableColumns || (item.data.length > 0 ? Object.keys(item.data[0]) : []);
  return (
    <Card className="dashboard-panel animate-fade-in h-full flex flex-col">
      <CardHeader className="p-3 sm:p-4 pb-0">
        <CardTitle className="text-xs sm:text-sm font-semibold truncate">
          <EditableTitle value={item.title} onChange={onRename} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2 flex-1 overflow-auto max-h-[280px]">
        <div className="overflow-x-auto w-full">
        <Table className="text-xs sm:text-sm min-w-[500px] sm:min-w-0">
          <TableHeader>
            <TableRow>
              {cols.map(c => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {item.data.map((row, i) => (
              <TableRow key={i}>
                {cols.map(c => (
                  <TableCell key={c} className="px-2 sm:px-4 py-1 sm:py-2 truncate max-w-[100px] sm:max-w-none">{String(row[c] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardInsightCard({ item, onRename }: { item: DashboardItem; onRename: (v: string) => void }) {
  const { t } = useI18n();
  const content = item.insightContent;

  if (item.insightType === 'repeating' && content) {
    return (
      <Card className="dashboard-panel animate-fade-in h-full space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
            <Repeat2 className="h-4 w-4 text-accent shrink-0" />
            <EditableTitle value={item.title} onChange={onRename} className="min-w-0" />
          </h3>
          <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent">
            {t('highRepetition')} ({Math.round(content.repetitionRatio * 100)}%)
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {content.uniqueCount} {t('uniqueValues')} / {content.totalCount} {t('rows')}
        </p>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('topValues')}:</p>
          {content.topValues?.map((v: any) => (
            <div key={v.value} className="flex items-center gap-2">
              <Progress value={v.percentage} className="flex-1 h-1.5 [&>div]:bg-primary/70" />
              <span className="text-[10px] text-foreground min-w-[60px] truncate">{v.value}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{v.count} ({v.percentage}%)</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (item.insightType === 'stats' && Array.isArray(content)) {
    return (
      <Card className="dashboard-panel animate-fade-in h-full flex flex-col">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <EditableTitle value={item.title} onChange={onRename} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-1 overflow-auto max-h-[280px]">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns')}</TableHead>
                <TableHead className="text-right">{t('min')}</TableHead>
                <TableHead className="text-right">{t('max')}</TableHead>
                <TableHead className="text-right">{t('mean')}</TableHead>
                <TableHead className="text-right">{t('median')}</TableHead>
                <TableHead className="text-right">{t('stdDev')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((col: any) => (
                <TableRow key={col.name}>
                  <TableCell className="font-medium">{col.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{col.stats?.min?.toFixed(1)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{col.stats?.max?.toFixed(1)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{col.stats?.mean?.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{col.stats?.median?.toFixed(1)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{col.stats?.stdDev?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (item.insightType === 'quality' && Array.isArray(content)) {
    return (
      <Card className="dashboard-panel animate-fade-in h-full space-y-2 p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <EditableTitle value={item.title} onChange={onRename} />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.map((col: any) => (
            <div key={col.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs font-medium text-foreground truncate flex-1">{col.name}</span>
              <Progress 
                value={col.completeness} 
                className="w-20 h-1.5" 
                indicatorClassName={col.completeness > 90 ? 'bg-success' : col.completeness > 70 ? 'bg-warning' : 'bg-destructive'}
              />
              <span className="text-[10px] text-muted-foreground shrink-0">
                {col.completeness}% {t('complete')}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return null;
}

/* ─── Responsive size classes ─── */
const sizeClasses: Record<string, string> = {
  sm: 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2',
  md: 'col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3',
  lg: 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-6',
};

const sizeFractionLabel: Record<'sm' | 'md' | 'lg', string> = {
  sm: '⅓',
  md: '½',
  lg: 'Full',
};

const sizeIcons = {
  sm: Minimize2,
  md: Square,
  lg: Maximize2,
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
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  const setSize = (s: 'sm' | 'md' | 'lg') => onUpdateItem({ size: s });
  const renameTitle = (v: string) => onUpdateItem({ title: v });

  const SizeIcon = sizeIcons[size];

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-pdf-card
      className={`relative group ${sizeClasses[size]} ${
        isDragging ? 'scale-[1.02] shadow-2xl ring-2 ring-primary/30 z-50' : ''
      } transition-all duration-200`}
    >
      {/* ─── Left-edge drag rail (always visible on hover) ─── */}
      <div
        data-pdf-hide
        {...attributes}
        {...listeners}
        aria-label={t('dragToReorder')}
        title={t('dragToReorder')}
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full z-20 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-150 cursor-grab active:cursor-grabbing touch-none"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--primary)/0.6), hsl(var(--accent)/0.6))',
        }}
      />

      {/* ─── Action pill (top-right, appears on hover) ─── */}
      <div
        data-pdf-hide
        className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 pointer-events-none"
      >
        {/* Size badge */}
        <span className="pointer-events-auto inline-flex items-center gap-0.5 rounded-lg bg-background/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/60 shadow-sm">
          <SizeIcon className="h-2.5 w-2.5" />
          {sizeFractionLabel[size]}
        </span>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="pointer-events-auto h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/60 hover:bg-secondary shadow-sm rounded-lg"
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            {/* Resize submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs rounded-lg">
                <RectangleHorizontal className="h-3.5 w-3.5 mr-2" />
                {t('resize')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-xl">
                {([
                  { v: 'sm' as const, Icon: Minimize2, label: t('small'), fraction: '⅓' },
                  { v: 'md' as const, Icon: Square, label: t('medium'), fraction: '½' },
                  { v: 'lg' as const, Icon: Maximize2, label: t('large'), fraction: 'Full' },
                ]).map(({ v, Icon, label, fraction }) => (
                  <DropdownMenuItem
                    key={v}
                    onClick={() => setSize(v)}
                    className="text-xs rounded-lg"
                  >
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {label}
                    <span className="ml-auto text-[10px] text-muted-foreground">{fraction}</span>
                    {size === v && <span className="ml-1 text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {onDuplicate && (
              <DropdownMenuItem onClick={onDuplicate} className="text-xs rounded-lg">
                <Copy className="h-3.5 w-3.5 mr-2" />
                {t('duplicate')}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleRemoveClick}
              className="text-xs text-destructive focus:text-destructive rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              {confirmRemove ? t('clickAgainToRemove') : t('remove')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {item.displayAs === 'insight' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardInsightCard item={item} onRename={renameTitle} />
        </ChartErrorBoundary>
      ) : item.displayAs === 'table' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardTable item={item} onRename={renameTitle} />
        </ChartErrorBoundary>
      ) : (
        <ChartErrorBoundary title={item.title}>
          <DynamicChart
            title={item.title}
            description={item.description}
            type={item.type}
            data={item.data}
            dataKeys={item.dataKeys}
            xKey={item.xKey}
            onChangeType={(type) => onUpdateItem({ type })}
            onRenameTitle={renameTitle}
            size={size}
          />
        </ChartErrorBoundary>
      )}
    </div>
  );
}

export function DashboardGrid({ items, onReorder, onRemove, onUpdateItem, onDuplicate, emptyAction }: DashboardGridProps) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (!items.length) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-primary/15 p-8 sm:p-14 text-center animate-[fade-in_0.4s_ease-out] relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(var(--card)), hsl(var(--muted)/0.3))',
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--primary)), transparent 70%)' }}
        />
        <div
          className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-5 relative"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.12), hsl(var(--accent)/0.08))',
            border: '1px solid hsl(var(--primary)/0.15)',
          }}
        >
          <BarChart3 className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-2">{t('emptyDashboardTitle')}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">{t('emptyDashboardDesc')}</p>
        {emptyAction}
      </div>
    );
  }

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[minmax(0,auto)]">
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

      {/* Drag overlay for visual feedback */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      }}>
        {activeItem ? (
          <div className="dashboard-panel opacity-80 scale-[1.02] pointer-events-none">
            {activeItem.displayAs === 'insight' ? (
              <DashboardInsightCard item={activeItem} onRename={() => {}} />
            ) : activeItem.displayAs === 'table' ? (
              <DashboardTable item={activeItem} onRename={() => {}} />
            ) : (
              <DynamicChart
                title={activeItem.title}
                description={activeItem.description}
                type={activeItem.type}
                data={activeItem.data}
                dataKeys={activeItem.dataKeys}
                xKey={activeItem.xKey}
                showControls={false}
                size={(activeItem.size || 'md') as 'sm' | 'md' | 'lg'}
              />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
