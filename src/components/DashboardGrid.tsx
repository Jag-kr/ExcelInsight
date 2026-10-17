import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactGridLayout, { useContainerWidth, type Layout, type LayoutItem } from 'react-grid-layout';
// absoluteStrategy (top/left) rather than the default transforms: html2canvas, which the PDF export
// runs per card, mis-offsets an element that carries its own translate().
import { absoluteStrategy } from 'react-grid-layout/core';
import { DynamicChart } from './DynamicChart';
import { ChartType, getChartColor, getChartColorVar } from '@/lib/chart-themes';
import { TopValueBar } from './TopValueBar';
import {
  Trash2, Maximize2, Minimize2, Square, Repeat2, BarChart3, AlertTriangle,
  Copy, Filter as FilterIcon, MoreHorizontal, RectangleHorizontal, Rows3, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import { crossDimensionOf, repeatColumnOf, type ManualChartSpec, type ChartSpec, type KpiSpec } from '@/lib/derive-dashboard-item';
import type { ColumnMeta } from '@/lib/data-analyzer';
import type { ChartFormat } from '@/lib/format';
import { countActive, type Filter, type Filters } from '@/lib/filters';
import { FilterControl } from './dashboard/FilterControl';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  GRID_COLS, layoutChanged, presetLayout, sizeFromWidth, sortByLayout, widthForSize, type CardSize, type GridPos,
} from '@/lib/layout';

export interface DashboardItem {
  id: string;
  title: string;
  description?: string;
  type: ChartType;
  data: any[];
  dataKeys: string[];
  xKey?: string;
  sourceKey?: string;
  spec?: ManualChartSpec | ChartSpec;
  /** Per-card display options; absent = render exactly as before. */
  format?: ChartFormat;
  /** Filters on this visual only, applied on top of the page filters (chart recipes and KPI cards). */
  filters?: Filters;
  displayAs?: 'chart' | 'table' | 'insight' | 'kpi' | 'slicer' | 'text';
  /** Slicer cards: the column whose page filter this card edits. */
  slicerColumn?: string;
  /** Text cards: plain text, at most TEXT_MAX characters. */
  text?: string;
  tableColumns?: string[];
  size?: CardSize;
  /** Free-form grid position. Absent on legacy/new cards: presetLayout packs those from `size` / the bottom. */
  layout?: GridPos;
  kpiSpec?: KpiSpec;
  kpiValue?: string;
  /** Change vs the previous period when the KPI compares; derived with kpiValue, never stored. */
  kpiDelta?: { pct: number; label: string };
  insightType?: 'repeating' | 'stats' | 'quality';
  insightContent?: any;
}

interface DashboardGridProps {
  items: DashboardItem[];
  /** A drag or resize finished and moved something: the full layout, by item id. Never fired for a no-op drop. */
  onLayoutCommit?: (layouts: Record<string, GridPos>) => void;
  onRemove: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<DashboardItem>) => void;
  onDuplicate?: (id: string) => void;
  onEdit?: (id: string) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Cross-filtering: a bar/slice of a card with a cross dimension was clicked. `columns` resolves two-column sourceKeys. */
  onChartSelect?: (itemId: string, label: string) => void;
  columns?: ColumnMeta[];
  /** Slicer cards read and edit these page filters. Removing a slicer does not clear its filter: the Filter tab still shows it. */
  pageFilters?: Filters;
  onPageFilterChange?: (column: string, filter: Filter | null) => void;
  /** Distinct values per column, for the `in` slicers. */
  slicerValues?: Record<string, string[]>;
  emptyAction?: React.ReactNode;
}

function EditableTitle({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const { t } = useI18n();
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
      title={t('clickToRename')}
    >
      {value}
    </button>
  );
}

/* `fill`: the card sits in a fixed-height grid cell, so content scrolls inside it instead of
   growing the card (the mobile list keeps content-sized cards with the old 280px cap). */
const scrollBody = (fill?: boolean) => (fill ? 'flex-1 min-h-0 overflow-auto' : 'flex-1 overflow-auto max-h-[280px]');

function DashboardTable({ item, onRename, fill }: { item: DashboardItem; onRename: (v: string) => void; fill?: boolean }) {
  const { t } = useI18n();
  const cols = item.tableColumns || (item.data.length > 0 ? Object.keys(item.data[0]) : []);
  return (
    <Card className="dashboard-panel animate-fade-in h-full flex flex-col">
      <CardHeader className="p-3 sm:p-4 pb-0">
        <CardTitle className="text-xs sm:text-sm font-semibold truncate">
          <EditableTitle value={item.title} onChange={onRename} />
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-3 sm:p-4 pt-2 ${scrollBody(fill)}`}>
        {item.data.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t('noDataToDisplay')}
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}

function DashboardInsightCard({ item, onRename, fill }: { item: DashboardItem; onRename: (v: string) => void; fill?: boolean }) {
  const { t } = useI18n();
  const content = item.insightContent;

  if (item.insightType === 'repeating' && content) {
    return (
      <Card className={`dashboard-panel animate-fade-in h-full space-y-2 p-4${fill ? ' overflow-auto' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0 flex-1">
            <Repeat2 className="h-4 w-4 shrink-0" style={{ color: getChartColor(0) }} />
            <EditableTitle value={item.title} onChange={onRename} className="min-w-0" />
          </h3>
          <Badge variant="secondary" className="text-[10px]" style={{ background: `hsl(${getChartColorVar(0)} / 0.18)`, color: getChartColor(0) }}>
            {t('highRepetition')} ({Math.round(content.repetitionRatio * 100)}%)
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {content.uniqueCount} {t('uniqueValues')} / {content.totalCount} {t('rows')}
        </p>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('topValues')}:</p>
          {content.topValues?.map((v: any, i: number) => (
            <TopValueBar key={v.value} index={i} value={v.value} count={v.count} percentage={v.percentage} />
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
            <BarChart3 className="h-4 w-4" style={{ color: getChartColor(0) }} />
            <EditableTitle value={item.title} onChange={onRename} />
          </CardTitle>
        </CardHeader>
        <CardContent className={`p-4 pt-2 ${scrollBody(fill)}`}>
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
      <Card className={`dashboard-panel animate-fade-in h-full space-y-2 p-4${fill ? ' overflow-auto' : ''}`}>
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

/** "▲ 12.3% vs 2025-08" (neutral text: up is not always good). */
export function kpiDeltaText(delta: NonNullable<DashboardItem['kpiDelta']>, vs: string): string {
  return `${delta.pct === 0 ? '▬' : delta.pct > 0 ? '▲' : '▼'} ${Math.abs(delta.pct).toFixed(1)}% ${vs} ${delta.label}`;
}

function DashboardKpiCard({ item, index, onRename, fill }: { item: DashboardItem; index: number; onRename: (v: string) => void; fill?: boolean }) {
  const d = useDashboardT();
  return (
    <Card
      className={`dashboard-panel animate-fade-in h-full flex flex-col justify-center gap-1 p-3 sm:p-4 border-0${fill ? ' overflow-hidden' : ''}`}
      style={{ background: `hsl(${getChartColorVar(index)} / 0.12)` }}
    >
      <div className="text-[11px] font-medium" style={{ color: getChartColor(index) }}>
        <EditableTitle value={item.title} onChange={onRename} />
      </div>
      {/* Ellipsis, not a silent clip: a cut-off "$136,6" reads as a different number. */}
      <p className="truncate text-xl sm:text-2xl font-bold text-foreground tabular-nums leading-none" title={item.kpiValue}>
        {item.kpiValue ?? '—'}
      </p>
      {item.kpiDelta && (
        <p className="truncate text-[11px] text-muted-foreground tabular-nums">
          {kpiDeltaText(item.kpiDelta, d('vsPrevious'))}
        </p>
      )}
    </Card>
  );
}

/* ─── Responsive size classes ─── */
/* Base is a 2-column grid so KPI tiles sit two-up on a phone; every other
   tier spans both, which is the full width they had before. */
const sizeClasses: Record<string, string> = {
  xs: 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-3',
  sm: 'col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-4',
  md: 'col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-6',
  lg: 'col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-12',
};

function DashboardSlicerCard({ item, column, values, filter, onChange, fill }: {
  item: DashboardItem;
  fill?: boolean;
  column?: ColumnMeta;
  values?: string[];
  filter?: Filter;
  onChange: (f: Filter | null) => void;
}) {
  const d = useDashboardT();
  return (
    <Card className={`dashboard-panel animate-fade-in h-full flex flex-col gap-2 p-3 sm:p-4${fill ? ' overflow-auto' : ''}`}>
      {/* pr-16 keeps the title clear of the hover action pill. */}
      <div className="flex min-w-0 items-center gap-1.5 pr-16 text-xs sm:text-sm font-semibold text-foreground">
        <FilterIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{item.title}</span>
      </div>
      {column ? (
        // The header already names the column: keep the control's own label for screen readers only.
        // stopPropagation: clicks in the control's portalled popover must not select the card.
        <div onClick={e => e.stopPropagation()} className="[&_legend]:sr-only [&>div>span:first-child]:sr-only">
          <FilterControl column={column} values={values} filter={filter} onChange={onChange} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{d('slicerColumnMissing')}</p>
      )}
    </Card>
  );
}

const TEXT_MAX = 2000;

/* Plain text only (never HTML), so the PDF capture sees ordinary text. Click or Enter/Space edits;
   blur commits once if the text changed (one undo entry per session), Escape reverts. */
function DashboardTextCard({ item, fill, onChange }: { item: DashboardItem; fill?: boolean; onChange: (text: string) => void }) {
  const d = useDashboardT();
  const text = typeof item.text === 'string' ? item.text.slice(0, TEXT_MAX) : '';
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);
  const refocus = useRef(false);
  const viewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editing && refocus.current) { refocus.current = false; viewRef.current?.focus(); }
  }, [editing]);
  const edit = () => { cancelled.current = false; setEditing(true); };
  return (
    <Card className={`dashboard-panel animate-fade-in h-full overflow-auto p-3 sm:p-4${fill ? '' : ' min-h-[72px]'}`}>
      {editing ? (
        <textarea
          autoFocus
          rows={3}
          defaultValue={text}
          maxLength={TEXT_MAX}
          aria-label={d('addText')}
          onClick={e => e.stopPropagation()}
          onBlur={e => {
            setEditing(false);
            if (!cancelled.current && e.currentTarget.value !== text) onChange(e.currentTarget.value);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') { cancelled.current = true; refocus.current = true; setEditing(false); }
          }}
          className="h-full w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none"
        />
      ) : (
        <div
          ref={viewRef}
          role="button"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); edit(); }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); edit(); } }}
          className="min-h-full cursor-text whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          {text || <span className="text-muted-foreground">{d('textPlaceholder')}</span>}
        </div>
      )}
    </Card>
  );
}

/* Scatter suggestions plot raw points, so there is no field-well recipe to edit. */
const isEditableChart = (item: DashboardItem) =>
  (!item.displayAs || item.displayAs === 'chart') &&
  (!!item.spec || (!!item.sourceKey && !item.sourceKey.startsWith('scatter:')));

/* The pane also edits KPI and repeating-value cards. */
const isEditable = (item: DashboardItem) => isEditableChart(item) || item.displayAs === 'kpi' || repeatColumnOf(item) !== null;

/** Stable, id-taking handlers (see DashboardGrid): cards are memoised on these, so they must never change identity. */
interface CardHandlers {
  remove: (id: string) => void;
  update: (id: string, updates: Partial<DashboardItem>) => void;
  duplicate: (id: string) => void;
  edit: (id: string) => void;
  resize: (id: string, size: CardSize) => void;
  chartSelect: (id: string, label: string) => void;
  pageFilter: (column: string, filter: Filter | null) => void;
}

interface CardProps {
  item: DashboardItem;
  index: number;
  size: CardSize;
  /** Grid mode: the card fills a fixed cell and has a drag rail. Off on mobile (content-sized, no rail). */
  fill: boolean;
  canDuplicate: boolean;
  canEdit: boolean;
  canCross: boolean;
  /** Slicer cards only. */
  slicerColumn?: ColumnMeta;
  slicerValues?: string[];
  slicerFilter?: Filter;
  handlers: CardHandlers;
}

/* The card's content and chrome, without its grid wrapper. Memoised: with stable props a drag, resize
   or selection change elsewhere on the board never re-renders (and so never re-lays-out) a chart. */
const DashboardCard = memo(function DashboardCard({
  item, index, size, fill, canDuplicate, canEdit, canCross, slicerColumn, slicerValues, slicerFilter, handlers: h,
}: CardProps) {
  const { t } = useI18n();
  const d = useDashboardT();

  const renameTitle = (v: string) => h.update(item.id, { title: v });

  const filterCount = item.displayAs === 'insight' || item.displayAs === 'table' ? 0 : countActive(item.filters ?? {});

  return (
    <>
      {/* ─── Left-edge drag rail: a 12px grab strip holding the visible 4px bar (grid mode only) ─── */}
      {/* ponytail: pointer-only. the old sortable grid's keyboard reordering is gone; keyboard users keep Resize,
          Duplicate, Remove and the Edit pane. Add Move up/down menu items if that is requested. */}
      {fill && (
        <div
          data-pdf-hide
          title={t('dragToReorder')}
          className="grid-drag-handle absolute left-0 top-2 bottom-2 w-3 z-20 cursor-grab active:cursor-grabbing touch-none"
        >
          <span
            aria-hidden
            className="block h-full w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: `hsl(${getChartColorVar(0)} / 0.6)` }}
          />
        </div>
      )}

      {/* ─── Top-right: filter indicator (always visible) beside the action pill (appears on hover) ─── */}
      <div data-pdf-hide className="absolute top-2 right-2 z-10 flex items-center gap-1 pointer-events-none">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-150">
          {/* Edit: opens the edit window (same action as the menu item below). */}
          {canEdit && isEditable(item) && (
            <Button
              variant="ghost"
              size="sm"
              className="pointer-events-auto h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/60 hover:bg-secondary shadow-sm rounded-lg"
              aria-label={isEditableChart(item) ? d('editChart') : d('editCard')}
              title={isEditableChart(item) ? d('editChart') : d('editCard')}
              onClick={() => h.edit(item.id)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}

          {/* Actions dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="pointer-events-auto h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/60 hover:bg-secondary shadow-sm rounded-lg"
                aria-label={t('moreActions')}
              >
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              {/* Resize presets only where there is no edit window (it has Size); phones cannot drag-resize. */}
              {!(canEdit && isEditable(item)) && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs rounded-lg">
                  <RectangleHorizontal className="h-3.5 w-3.5 mr-2" />
                  {t('resize')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl">
                  {([
                    { v: 'xs' as const, Icon: Rows3, label: t('tile'), fraction: '¼' },
                    { v: 'sm' as const, Icon: Minimize2, label: t('small'), fraction: '⅓' },
                    { v: 'md' as const, Icon: Square, label: t('medium'), fraction: '½' },
                    { v: 'lg' as const, Icon: Maximize2, label: t('large'), fraction: 'Full' },
                  ]).map(({ v, Icon, label, fraction }) => (
                    <DropdownMenuItem
                      key={v}
                      onClick={() => h.resize(item.id, v)}
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
              )}

              {canEdit && isEditable(item) && (
                <DropdownMenuItem onClick={() => h.edit(item.id)} className="text-xs rounded-lg">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  {isEditableChart(item) ? d('editChart') : d('editCard')}
                </DropdownMenuItem>
              )}

              {canDuplicate && (
                <DropdownMenuItem onClick={() => h.duplicate(item.id)} className="text-xs rounded-lg">
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  {t('duplicate')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => h.remove(item.id)}
                className="text-xs text-destructive focus:text-destructive rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {t('remove')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Chart and KPI cards only: other cards never read item.filters. */}
        {filterCount > 0 && (
          <span
            role="img"
            className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-lg bg-background/90 text-primary border border-border/60 shadow-sm"
            title={`${filterCount} ${d('visualFiltered')}`}
            aria-label={`${filterCount} ${d('visualFiltered')}`}
          >
            <FilterIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {item.displayAs === 'text' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardTextCard item={item} fill={fill} onChange={text => h.update(item.id, { text })} />
        </ChartErrorBoundary>
      ) : item.displayAs === 'slicer' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardSlicerCard
            item={item}
            fill={fill}
            column={slicerColumn}
            values={slicerValues}
            filter={slicerFilter}
            onChange={f => h.pageFilter(item.slicerColumn ?? '', f)}
          />
        </ChartErrorBoundary>
      ) : item.displayAs === 'kpi' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardKpiCard item={item} index={index} onRename={renameTitle} fill={fill} />
        </ChartErrorBoundary>
      ) : item.displayAs === 'insight' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardInsightCard item={item} onRename={renameTitle} fill={fill} />
        </ChartErrorBoundary>
      ) : item.displayAs === 'table' ? (
        <ChartErrorBoundary title={item.title}>
          <DashboardTable item={item} onRename={renameTitle} fill={fill} />
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
            onRenameTitle={renameTitle}
            showControls={false}
            showTypeSwitcher={false}
            size={size}
            fill={fill}
            stacked={!!item.spec && 'v' in item.spec && !!item.spec.stacked}
            format={item.format}
            onSelect={canCross ? (label: string) => h.chartSelect(item.id, label) : undefined}
          />
        </ChartErrorBoundary>
      )}
    </>
  );
});

/* Grid geometry. Module-level so RGL sees the same object every render. */
const GRID_CONFIG = { cols: GRID_COLS, rowHeight: 50, margin: [16, 16], containerPadding: [0, 0] } as const;
const DRAG_CONFIG = { enabled: true, handle: '.grid-drag-handle', threshold: 5, bounded: false } as const;
const RESIZE_CONFIG = { enabled: true, handles: ['se'] } as const;

/* The few react-grid-layout / react-resizable rules this grid needs (absolute positioning, corner
   handle only), inlined and themed here instead of importing the two library stylesheets: those
   became an extra async CSS chunk whose entry sits in the webpack runtime of EVERY page (+1.3 kB
   First Load JS on the landing page). Scoped to .ei-grid, and shipped with the lazy dashboard chunk. */
const GRID_CSS = `
.ei-grid .react-grid-layout{position:relative;transition:height 200ms ease}
.ei-grid .react-grid-item{transition:left 200ms ease,top 200ms ease,width 200ms ease,height 200ms ease}
.ei-grid .react-grid-item.resizing{transition:none;z-index:1;will-change:width,height}
.ei-grid .react-grid-item.react-draggable-dragging{transition:none;z-index:3;opacity:.8}
.ei-grid .react-grid-item.react-grid-placeholder{background:hsl(var(--primary));border-radius:.75rem;opacity:.2;transition-duration:100ms;z-index:2;user-select:none}
.ei-grid .react-grid-item.react-grid-placeholder.placeholder-resizing{transition:none}
.ei-grid .react-grid-item>.react-resizable-handle{position:absolute;right:0;bottom:0;width:20px;height:20px;cursor:se-resize;opacity:0}
.ei-grid .react-grid-item:hover>.react-resizable-handle,.ei-grid .react-grid-item>.react-resizable-handle:focus-visible{opacity:1}
.ei-grid .react-grid-item>.react-resizable-handle::after{content:"";position:absolute;right:3px;bottom:3px;width:5px;height:5px;border-right:2px solid hsl(var(--primary)/.7);border-bottom:2px solid hsl(var(--primary)/.7)}
@media (hover:none){.ei-grid .react-grid-item>.react-resizable-handle{opacity:1}}
`;

/* Owns the width measurement: useContainerWidth observes its ref once, on mount, so this must mount
   together with the container (not live in DashboardGrid, whose container comes and goes with the
   empty state and the mobile list). */
function FreeGrid({ layout, onCommit, children }: {
  layout: LayoutItem[];
  onCommit: (layout: Layout) => void;
  children: React.ReactNode;
}) {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true });
  return (
    <div ref={containerRef} className="ei-grid">
      <style>{GRID_CSS}</style>
      {mounted ? (
        // Commit on drag/resize STOP only: onLayoutChange also fires on mount and on width changes.
        <ReactGridLayout
          width={width}
          layout={layout}
          gridConfig={GRID_CONFIG}
          dragConfig={DRAG_CONFIG}
          resizeConfig={RESIZE_CONFIG}
          positionStrategy={absoluteStrategy}
          onDragStop={onCommit}
          onResizeStop={onCommit}
        >
          {children}
        </ReactGridLayout>
      ) : (
        <Skeleton className="h-64 w-full rounded-xl" />
      )}
    </div>
  );
}

const IGNORE_SELECT = 'button, input, textarea, a, [role="menuitem"], [role="menu"], [data-pdf-hide]';
/* A double-click that must not open the edit window: form controls and editors (the text card), the title
   (double-click renames), and chart marks. A click on a mark toggles the cross-filter, so a double-click on
   one has already toggled it twice; `.cursor-pointer` is the class DynamicChart puts on every clickable mark. */
const IGNORE_DBLCLICK = `${IGNORE_SELECT}, select, label, [contenteditable], [role="combobox"], [role="checkbox"], [role="slider"], .cursor-pointer, .recharts-bar-rectangle, .recharts-sector, .recharts-dot, .recharts-active-dot, .recharts-rectangle, .recharts-symbols, .recharts-radar-dot`;

export function DashboardGrid({ items, onLayoutCommit, onRemove, onUpdateItem, onDuplicate, onEdit, selectedId, onSelect, onChartSelect, columns, pageFilters, onPageFilterChange, slicerValues, emptyAction }: DashboardGridProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  // A card added from the pane lands at the end of the board; bring it into view.
  useEffect(() => {
    if (selectedId) document.querySelector('[data-pdf-card][aria-current="true"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  // Esc deselects, unless it was meant for a field, menu or dialog.
  useEffect(() => {
    if (!selectedId || !onSelect) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable], [role="dialog"], [role="menu"], [role="listbox"]')) return;
      onSelect(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, onSelect]);

  /* Effective layout: persisted positions kept, layout-less cards packed from their legacy size / the
     bottom. Keyed on a cheap signature, not on `items` identity: filters and cross-filter rebuild every
     item object, which must not look like a layout change. */
  const sig = items.map(i => `${i.id}|${i.size ?? ''}|${i.displayAs ?? ''}|${i.layout ? `${i.layout.x},${i.layout.y},${i.layout.w},${i.layout.h}` : ''}`).join(';');
  const { effective, rglLayout } = useMemo(() => {
    const effective = presetLayout(items);
    const rglLayout: LayoutItem[] = items.map(i => ({
      i: i.id, ...effective[i.id],
      // KPI tiles may shrink to 2x2; everything else keeps room for its chrome.
      ...(i.displayAs === 'kpi' ? { minW: 2, minH: 2 } : { minW: 3, minH: 3 }),
    }));
    return { effective, rglLayout };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  // Reading order: the DOM (and tab, and PDF) order on desktop, the list order on mobile.
  const ordered = useMemo(() => sortByLayout(items, effective), [items, effective]);

  /* Handlers that take an id and read the latest props through a ref, so their identity never changes
     and parents may pass inline closures freely. */
  const latest = useRef({ onRemove, onUpdateItem, onDuplicate, onEdit, onSelect, onChartSelect, onPageFilterChange, onLayoutCommit, effective });
  latest.current = { onRemove, onUpdateItem, onDuplicate, onEdit, onSelect, onChartSelect, onPageFilterChange, onLayoutCommit, effective };
  const handlers = useMemo<CardHandlers & { select: (id: string) => void }>(() => ({
    remove: id => latest.current.onRemove(id),
    update: (id, updates) => latest.current.onUpdateItem(id, updates),
    duplicate: id => latest.current.onDuplicate?.(id),
    edit: id => latest.current.onEdit?.(id),
    select: id => latest.current.onSelect?.(id),
    chartSelect: (id, label) => latest.current.onChartSelect?.(id, label),
    pageFilter: (column, f) => latest.current.onPageFilterChange?.(column, f),
    // Resize menu preset: commit the whole effective layout, not just this card. A lone layout on a
    // board of layout-less cards would make presetLayout repack all the others below it.
    resize: (id, size) => {
      const eff = latest.current.effective;
      const cur = eff[id];
      if (!cur) return;
      const w = widthForSize(size);
      latest.current.onLayoutCommit?.({ ...eff, [id]: { ...cur, w, x: Math.min(cur.x, GRID_COLS - w) } });
    },
  }), []);

  const commit = useCallback((rgl: Layout) => {
    const next: Record<string, GridPos> = {};
    for (const l of rgl) next[l.i] = { x: l.x, y: l.y, w: l.w, h: l.h };
    // A click or a drop where it started must not create an undo entry.
    if (layoutChanged(latest.current.effective, next)) latest.current.onLayoutCommit?.(next);
  }, []);

  const canSelect = !!onSelect;
  const canDuplicate = !!onDuplicate;
  const canEdit = !!onEdit;
  const hasChartSelect = !!onChartSelect;

  /* One element per card, memoised on the real inputs: RGL compares children by reference, so while a
     card is being dragged or resized (RGL moves it internally, nothing here re-renders) every other
     card, and every chart, is skipped. */
  const nodes = useMemo(() => ordered.map((item, i) => {
    const size = sizeFromWidth(effective[item.id].w);
    const name = item.slicerColumn ?? '';
    const selected = item.id === selectedId;
    return (
      <div
        key={item.id}
        data-pdf-card
        aria-current={selected || undefined}
        onClick={canSelect ? (e) => {
          if (!(e.target as HTMLElement).closest(IGNORE_SELECT)) handlers.select(item.id);
        } : undefined}
        onDoubleClick={canEdit && !isMobile && isEditable(item) ? (e) => {
          if (!(e.target as HTMLElement).closest(IGNORE_DBLCLICK)) handlers.edit(item.id);
        } : undefined}
        // Grid mode: RGL positions and sizes this element itself (inline style).
        className={isMobile ? `relative group ${sizeClasses[size]}` : 'group'}
      >
        <DashboardCard
          item={item}
          index={i}
          size={size}
          fill={!isMobile}
          canDuplicate={canDuplicate}
          canEdit={canEdit}
          canCross={hasChartSelect && !!crossDimensionOf(item, columns)}
          slicerColumn={item.displayAs === 'slicer' ? columns?.find(c => c.name === name) : undefined}
          slicerValues={item.displayAs === 'slicer' ? slicerValues?.[name] : undefined}
          slicerFilter={item.displayAs === 'slicer' ? pageFilters?.[name] : undefined}
          handlers={handlers}
        />
        {selected && <div data-pdf-hide aria-hidden className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary" />}
      </div>
    );
  }), [ordered, effective, selectedId, isMobile, canSelect, canDuplicate, canEdit, hasChartSelect, columns, slicerValues, pageFilters, handlers]);

  if (!items.length) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed border-primary/15 p-8 sm:p-14 text-center animate-[fade-in_0.4s_ease-out] relative overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
        }}
      >
        <div
          className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-5 relative"
          style={{
            background: 'hsl(var(--primary) / 0.1)',
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

  // Phones get the old responsive list (no drag, no resize), in reading order of the desktop layout.
  if (isMobile) {
    return <div className="grid grid-cols-2 gap-3 sm:gap-4 auto-rows-[minmax(0,auto)]">{nodes}</div>;
  }

  return <FreeGrid layout={rglLayout} onCommit={commit}>{nodes}</FreeGrid>;
}
