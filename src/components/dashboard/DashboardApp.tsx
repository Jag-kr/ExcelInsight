"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Suspense, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { ChartThemeSwitcher } from '@/components/ChartThemeSwitcher';
import { useChartPalette, getChartPalette, getChartColor, getChartColorVar } from '@/lib/chart-themes';
import { hslStringToRgb } from '@/lib/color-utils';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { buildDefaultDashboard } from '@/lib/build-default-dashboard';
import { GRID_COLS, presetLayout, sizeFromWidth, sortByLayout, widthForSize, type CardSize, type GridPos } from '@/lib/layout';
import { crossDimensionOf, deriveDashboardItems, kpiCardId, kpiTitle, repeatColumnOf, retargetKpi, retargetRepeat, toChartSpec, specFromSourceKey, specForField, specTitle, type KpiSpec } from '@/lib/derive-dashboard-item';
import type { PivotSpec } from '@/lib/pivot';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { applyFilters, countActive, distinctValues, filterKindFor, normalizeFilters, setFilter, type Filters } from '@/lib/filters';
import { healSession, ANALYSIS_VERSION } from '@/lib/heal-session';
import { loadSession, clearStoredSession, STORAGE_KEY, type PersistedSession } from '@/lib/session-storage';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import type { DateNote } from '@/lib/date-columns';
import { useUndoableState } from '@/hooks/use-undoable-state';
import { applyCalcFields, dependentsOf, removeFieldFromItems, validateEditedField, validateNewField, type CalcField } from '@/lib/calc-fields';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, Merge, FunctionSquare, LayoutDashboard, Database, Filter, Lightbulb, FileDown, Plus,
  Sparkles, RotateCcw, Trash2, X, MoreHorizontal, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Undo2, Redo2, Type,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { trackEvent, getFileExt } from '@/lib/analytics';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import type { ChartFormat } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile, useIsDesktop } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Served from public/ so logo swaps don't need a rebuild (SiteHeader and the
// landing page use the same path).
const LOGO_SRC = '/logo-64.png';

function ExploreChartCard({ s, onAdd, addLabel }: { s: ChartSuggestion; onAdd: (type: ChartType) => void; addLabel: string }) {
  const [type, setType] = useState<ChartType>(s.type);
  return (
    <div className="relative group min-h-[300px]">
      <Suspense fallback={<ChartFallback />}>
        <DynamicChart
          title={s.title}
          description={s.description}
          type={type}
          data={s.data}
          dataKeys={s.dataKeys}
          xKey={s.xKey}
          onChangeType={setType}
        />
      </Suspense>
      <button
        onClick={() => onAdd(type)}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 shadow-lg font-medium"
      >
        {addLabel}
      </button>
    </div>
  );
}

const ChartFallback = () => (
  <Card className="elevated-card p-5 min-h-[300px]">
    <Skeleton className="h-5 w-1/3 mb-3" />
    <Skeleton className="h-[240px] w-full" />
  </Card>
);

const PanelFallback = () => (
  <Card className="elevated-card p-5 min-h-[300px] space-y-3">
    <Skeleton className="h-5 w-1/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-32 w-full" />
  </Card>
);

/**
 * A second tier of splitting, inside the already-lazy dashboard.
 *
 * The heavy leaves — recharts (via DynamicChart), html2canvas (via
 * DynamicChart's PNG export) and react-grid-layout (via DashboardGrid) — stay behind
 * their own boundaries so that mounting the shell doesn't drag in every panel
 * at once; a user who never opens the merge dialog never pays for ColumnMerger.
 *
 * Every call site below was already wrapped in <Suspense> with a skeleton, so
 * no `loading` option is passed here: the existing boundaries do the work.
 * `ssr: false` matches how the page loads this whole module.
 *
 * FileUpload warms this chunk the moment a file is picked, so the download
 * overlaps workbook parsing rather than following it. See prefetchDashboard().
 */
const DataSummary = dynamic(() => import('@/components/DataSummary').then(m => m.DataSummary), { ssr: false });
const DynamicChart = dynamic(() => import('@/components/DynamicChart').then(m => m.DynamicChart), { ssr: false });
const CalcFieldDialog = dynamic(() => import('@/components/dashboard/CalcFieldDialog').then(m => m.CalcFieldDialog), { ssr: false });
const ColumnMerger = dynamic(() => import('@/components/ColumnMerger').then(m => m.ColumnMerger), { ssr: false });
const DashboardGrid = dynamic(() => import('@/components/DashboardGrid').then(m => m.DashboardGrid), { ssr: false });
const DataFilter = dynamic(() => import('@/components/DataFilter').then(m => m.DataFilter), { ssr: false });
const SmartInsights = dynamic(() => import('@/components/SmartInsights').then(m => m.SmartInsights), { ssr: false });
const EditCardDialog = dynamic(() => import('@/components/dashboard/EditCardDialog').then(m => m.EditCardDialog), { ssr: false });
const AddPanel = dynamic(() => import('@/components/dashboard/AddPanel').then(m => m.AddPanel), { ssr: false });

/* ─── Sidebar nav items ─── */
const SIDEBAR_ITEMS = [
  { value: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { value: 'explore',   icon: BarChart3,       labelKey: 'explore' },
  { value: 'insights',  icon: Lightbulb,       labelKey: 'insights' },
  { value: 'filter',    icon: Filter,          labelKey: 'filter' },
  { value: 'data',      icon: Database,        labelKey: 'data' },
] as const;

/* ─── Mobile bottom nav (subset) ─── */
const MOBILE_TABS = [
  { value: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { value: 'explore',   icon: BarChart3,       labelKey: 'explore' },
  { value: 'insights',  icon: Lightbulb,       labelKey: 'insights' },
  { value: 'data',      icon: Database,        labelKey: 'data' },
] as const;

export interface DashboardAppProps {
  /**
   * Raw parse result when the user has just uploaded a file. `null` means
   * "restore whatever is in storage" — the landing page mounts this component
   * on a saved session too.
   */
  initialUpload: {
    data: Record<string, any>[];
    fileName: string;
    /** Demo data: render it, never persist it. */
    ephemeral?: boolean;
    /** Date columns repaired while reading the file: announced once, below. */
    notes?: DateNote[];
  } | null;
  /** Tears down this tree and returns the user to the landing page. */
  onClearFile: () => void;
}

type Board = { items: DashboardItem[]; calc: CalcField[] };

/** calcFields is absent in older sessions and untrusted in a hand-edited one: keep it only if well-formed. */
const validCalcFields = (v: unknown): CalcField[] =>
  Array.isArray(v) && v.every(f => f && typeof f.name === 'string' && typeof f.formula === 'string') ? v : [];

export function DashboardApp({ initialUpload, onClearFile }: DashboardAppProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const { paletteId } = useChartPalette();

  /**
   * Two ways in: a fresh upload passed down as a prop, or a session read back
   * from localStorage. A fresh upload wins — the user just picked a new file,
   * so a stale session must not shadow it.
   *
   * Reading storage in a state initializer is safe here where it would not be
   * in a server-rendered component: the landing page loads this with
   * `ssr: false`, so there is no server HTML to mismatch against.
   */
  const [{ initial, healed }] = useState<{ initial: PersistedSession | null; healed: number }>(() => {
    const saved = initialUpload ? null : loadSession();
    if (!saved) return { initial: null, healed: 0 };
    const { session, removed } = healSession(saved);
    return { initial: session, healed: removed };
  });
  useEffect(() => {
    if (healed) toast.info(d('staleChartsRemoved').replace('{n}', String(healed)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- once, on restore
  // Uploaded/merged rows and their analysis. Calculated fields are layered on top below (never stored in these).
  const [baseData, setBaseData] = useState<Record<string, any>[]>(() => initialUpload?.data ?? initial?.data ?? []);
  const [fileName, setFileName] = useState(() => initialUpload?.fileName ?? initial?.fileName ?? '');
  const [baseColumns, setBaseColumns] = useState<ColumnMeta[]>(() => initial?.columns ?? []);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>(() => initial?.suggestions ?? []);
  // Cards and calculated-field definitions share one history, so a single Ctrl+Z walks back chronologically.
  const [board, setBoard, { undo, redo, canUndo, canRedo }] = useUndoableState<Board>(
    () => ({ items: initial?.dashboardItems ?? [], calc: validCalcFields(initial?.calcFields) })
  );
  const dashboardItems = board.items;
  const calcFields = board.calc;
  // Stable; same signature as the old items-only setter. Unchanged items keep the board identity (hook no-op check).
  const setDashboardItems = useCallback(
    (next: DashboardItem[] | ((prev: DashboardItem[]) => DashboardItem[]), opts?: { record?: boolean }) =>
      setBoard(b => {
        const items = typeof next === 'function' ? next(b.items) : next;
        return items === b.items ? b : { ...b, items };
      }, opts),
    [setBoard]
  );
  // Derived, never stored: recomputed only when the rows or the field definitions change.
  const data = useMemo(() => applyCalcFields(baseData, calcFields), [baseData, calcFields]);
  const columns = useMemo(() => (calcFields.length === 0 ? baseColumns : analyzeColumns(data)), [calcFields, baseColumns, data]);
  const [filters, setFilters] = useState<Filters>(() => normalizeFilters(initial?.filters));
  const [activeTab, setActiveTab] = useState<string>(() => (SIDEBAR_ITEMS.find(i => i.value === initial?.activeTab)?.value ?? 'dashboard'));
  const [mergeOpen, setMergeOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => initial?.sidebarCollapsed ?? false);
  const [exporting, setExporting] = useState(false);
  // A fresh upload arrives underived, so the overlay is up from the first paint.
  const [analyzing, setAnalyzing] = useState(() => Boolean(initialUpload));
  const [addOpen, setAddOpen] = useState(false);
  // Not persisted: a reload starts with nothing selected.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The card whose edit window is open (also selected). Resolves to nothing when the card is removed.
  const [editId, setEditId] = useState<string | null>(null);
  // Transient cross-filter from a chart click: not persisted, not in undo history.
  const [cross, setCross] = useState<{ itemId: string; column: string; value: string } | null>(null);
  const [mobileClearConfirmOpen, setMobileClearConfirmOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  /* "Already placed" markers, derived from the board so they can never drift from it
     (and so undo/redo only has to snapshot dashboardItems). Chart suggestions are
     keyed by sourceKey; insight, KPI and table cards by their own id. */
  const addedChartIds = useMemo(
    () => new Set(dashboardItems.flatMap(i => (i.sourceKey ? [i.sourceKey] : []))),
    [dashboardItems]
  );
  const addedInsightIds = useMemo(
    () => new Set(dashboardItems.filter(i => i.displayAs === 'insight' || i.displayAs === 'kpi' || i.displayAs === 'table').map(i => i.id)),
    [dashboardItems]
  );
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  /**
   * The upload the landing page handed over is raw rows and nothing else — it
   * deliberately does no analysis, so that data-analyzer and
   * build-default-dashboard stay off the landing bundle. Derive the columns,
   * suggestions and starter layout here, on mount, behind the overlay.
   */
  useEffect(() => {
    if (!initialUpload) return;
    const { data: newData, fileName: name } = initialUpload;
    // Yield to browser before running heavy synchronous analysis
    startTransition(() => {
      const cols = analyzeColumns(newData);
      setBaseColumns(cols);
      const charts = generateChartSuggestions(newData, cols);
      setSuggestions(charts);
      const { items } = buildDefaultDashboard(newData, cols, charts, t);
      setDashboardItems(items, { record: false }); // starter board is not undoable
      setAnalyzing(false);

      for (const note of initialUpload.notes ?? []) {
        const names = [...note.columns.slice(0, 3), ...(note.columns.length > 3 ? ['…'] : [])].join(', ');
        toast.info(`${d(note.kind === 'serial' ? 'datesFromSerial' : 'datesDayFirst')}: ${names}`);
      }

      const fileExt = getFileExt(name);
      trackEvent('file_parsed', { fileExt, rowCount: newData.length, colCount: cols.length });
      if (items.length === 0) {
        trackEvent('file_analysis_empty', { fileExt, colCount: cols.length });
      }
    });
    // Mount-only: this component is keyed to the one upload it was created with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Mid-analysis the derived half of the session is still empty. Skip the
    // write rather than persisting a torn snapshot — and rather than paying to
    // stringify a multi-megabyte dataset twice for one upload.
    if (analyzing) return;
    // The sample dataset is a demo, not the visitor's file. Writing it would
    // make every subsequent visit restore a spreadsheet they never uploaded.
    if (initialUpload?.ephemeral) { localStorage.removeItem(STORAGE_KEY); return; }
    if (!baseData.length) { localStorage.removeItem(STORAGE_KEY); return; }
    // Live pane edits fire per keystroke; debounce so a large dataset isn't
    // re-stringified each time. Unmount cancels the pending write, so clearing
    // the file can't resurrect it.
    const timer = setTimeout(() => {
      try {
        const payload: PersistedSession = {
          data: baseData, fileName, columns: baseColumns, suggestions, dashboardItems, calcFields, filters,
          addedChartIds: Array.from(addedChartIds),
          addedInsightIds: Array.from(addedInsightIds),
          activeTab, sidebarCollapsed, analysisVersion: ANALYSIS_VERSION,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Could not persist session', e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [analyzing, initialUpload, baseData, fileName, baseColumns, suggestions, dashboardItems, calcFields, filters, addedChartIds, addedInsightIds, activeTab, sidebarCollapsed]);

  const handleResetLayout = useCallback(() => {
    // Toast Undo restores this snapshot rather than calling global undo(): the toast can outlive other edits.
    const before = dashboardItems;
    setDashboardItems(buildDefaultDashboard(data, columns, suggestions, t).items);
    // Reset reuses card ids; a surviving selection would write its stale spec back.
    setSelectedId(null);
    setEditId(null);
    setCross(null);
    toast.success(t('resetLayout'), { action: { label: t('undo'), onClick: () => setDashboardItems(() => before) } });
  }, [dashboardItems, data, columns, suggestions, t, setDashboardItems]);

  const handleClearAll = useCallback(() => {
    const before = dashboardItems;
    setSelectedId(null);
    setEditId(null);
    setCross(null);
    setDashboardItems([]);
    toast.success(t('clearAll'), { action: { label: t('undo'), onClick: () => setDashboardItems(() => before) } });
  }, [dashboardItems, t, setDashboardItems]);

  const handleClearFile = useCallback(() => {
    // No local resets needed: onClearFile unmounts this whole tree. Storage is
    // cleared explicitly because the persistence effect above unmounts with it
    // and never gets to see the emptied state.
    clearStoredSession();
    toast.success(t('clearFile'));
    onClearFile();
  }, [t, onClearFile]);

  const handleDuplicate = useCallback((id: string) => {
    setDashboardItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx < 0) return prev;
      const original = prev[idx];
      // No layout on the copy: it is placed at the bottom of the board (presetLayout) instead of
      // stacking on the original's cell, where the grid would have to shove the original aside.
      const copy: DashboardItem = { ...original, id: `${original.id}-copy-${Date.now()}`, title: `${original.title} (copy)`, layout: undefined };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, [setDashboardItems]);

  /* A drag or resize (or the Resize menu) finished: one undo entry. Items stay sorted by (y, x) so PDF
     export, Quick Add and the mobile list follow reading order. `size` follows the width so the badge,
     the menu check mark and the mobile list agree with the grid. A layout left stale by a removal is
     fine: the grid re-compacts it on render, and the next commit stores the compacted one. */
  const handleLayoutCommit = useCallback((layouts: Record<string, GridPos>) => {
    setDashboardItems(prev => sortByLayout(
      prev.map(i => (layouts[i.id] ? { ...i, layout: layouts[i.id], size: sizeFromWidth(layouts[i.id].w) } : i)),
      layouts,
    ));
  }, [setDashboardItems]);

  // ── Derived filtered data (declared before any callbacks that use it) ──
  const filteredData = useMemo(() => {
    return applyFilters(data, filters);
  }, [data, filters]);

  const filteredColumns = useMemo(() => {
    if (countActive(filters) === 0) return columns;
    return analyzeColumns(filteredData);
  }, [filteredData, columns, filters]);

  const hasScatterCard = useMemo(() => dashboardItems.some(i => i.sourceKey?.startsWith('scatter:')), [dashboardItems]);
  const filteredSuggestions = useMemo(() => {
    if (countActive(filters) === 0) return suggestions;
    // Only the Explore tab, the Filter tab preview, the Add panel and scatter cards read these;
    // elsewhere the (stale) unfiltered list is never consumed, so skip the work.
    if (!(activeTab === 'explore' || activeTab === 'filter' || addOpen || hasScatterCard)) return suggestions;
    // Depends on filteredColumns (which already includes filteredData) — no double-compute
    return generateChartSuggestions(filteredData, filteredColumns);
  }, [filteredData, filteredColumns, suggestions, filters, activeTab, addOpen, hasScatterCard]);

  // ── PDF export (must come after filteredData is declared) ──
  const handleExportPdf = useCallback(async () => {
    if (!dashboardRef.current || !dashboardItems.length) { toast.error(t('nothingToExport')); return; }
    setExporting(true);
    const toastId = toast.loading(t('generatingPdf'));
    const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
    const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
    const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;
    try {
      const { exportDashboardToPDF } = await import('@/lib/pdf-export');
      const palette = getChartPalette(paletteId);
      const accentColor = paletteId === 'default' ? undefined : hslStringToRgb(palette.pdfAccent);
      await exportDashboardToPDF(dashboardRef.current, {
        appName: 'ExcelInsight', fileName,
        rowCount: filteredData.length, colCount: columns.length,
        chartCount, tableCount, insightCount, logoUrl: LOGO_SRC,
        accentColor,
      });
      toast.success(t('pdfReady'), { id: toastId });
      trackEvent('export_pdf', { status: 'success', chartCount, tableCount, insightCount });
    } catch (e) {
      console.error(e);
      toast.error(t('pdfFailed'), { id: toastId });
      trackEvent('export_pdf', { status: 'failed', chartCount, tableCount, insightCount });
    } finally {
      setExporting(false);
    }
  }, [dashboardItems, fileName, columns.length, filteredData, t, paletteId]);

  const availableSuggestions = useMemo(() =>
    filteredSuggestions.filter(s => !addedChartIds.has(s.key)),
    [filteredSuggestions, addedChartIds]
  );

  /* Render/export view: user-owned fields from dashboardItems, numbers re-derived
     for the active filters. dashboardItems stays the source of truth for edits. */
  const handleChartSelect = useCallback((itemId: string, label: string) => {
    const item = dashboardItems.find(i => i.id === itemId);
    const column = item && crossDimensionOf(item, columns);
    // 'Unknown' is the blank bucket, which an `in` filter can never match.
    if (!column || label === 'Unknown') return;
    setCross(c => (c?.itemId === itemId && c.value === label ? null : { itemId, column, value: label }));
  }, [dashboardItems, columns]);

  // Dropped automatically once its source card is removed or re-pointed at another axis.
  const activeCross = useMemo(() => {
    const item = cross && dashboardItems.find(i => i.id === cross.itemId);
    return cross && item && crossDimensionOf(item, columns) === cross.column ? cross : null;
  }, [cross, dashboardItems, columns]);

  const liveItems = useMemo(
    () => deriveDashboardItems(dashboardItems, filteredSuggestions, filteredColumns, filteredData, t, activeCross
      ? { itemId: activeCross.itemId, filters: { [activeCross.column]: { kind: 'in', values: [activeCross.value] } } }
      : undefined),
    [dashboardItems, filteredSuggestions, filteredColumns, filteredData, t, activeCross]
  );

  const handleMerge = useCallback((col1: string, col2: string, newName: string, separator: string) => {
    // A calculated field of the same name would silently overwrite the merged column when values are derived.
    if (calcFields.some(f => f.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast.error(`${newName.trim()}: a calculated field with this name already exists`);
      return;
    }
    const merged = mergeColumns(baseData, col1, col2, newName, separator);
    setBaseData(merged);
    setBaseColumns(analyzeColumns(merged));
    setMergeOpen(false);
    toast.success(`${d('fieldAdded')}: ${newName.trim()}`);
  }, [baseData, calcFields, d]);

  // One undo entry; the values are derived from the stored definition.
  const handleAddCalculated = useCallback((name: string, formula: string): { ok: true } | { ok: false; error: string } => {
    const error = validateNewField(baseColumns.map(c => c.name), calcFields, name, formula);
    if (error) return { ok: false, error };
    const field = { name: name.trim(), formula };
    setBoard(b => ({ ...b, calc: [...b.calc, field] }));
    toast.success(`${d('fieldAdded')}: ${field.name}`);
    return { ok: true };
  }, [baseColumns, calcFields, setBoard, d]);

  // The name is fixed (renaming would break references), only the formula changes. One undo entry.
  const handleEditCalculated = useCallback((name: string, formula: string): { ok: true } | { ok: false; error: string } => {
    const error = validateEditedField(baseColumns.map(c => c.name), calcFields, name, formula);
    if (error) return { ok: false, error };
    setBoard(b => ({ ...b, calc: b.calc.map(f => (f.name === name ? { ...f, formula } : f)) }));
    toast.success(`${d('fieldUpdated')}: ${name}`);
    return { ok: true };
  }, [baseColumns, calcFields, setBoard, d]);

  const handleDeleteCalculated = useCallback((name: string): { ok: true } | { ok: false; error: string } => {
    const used = dependentsOf(baseColumns.map(c => c.name), calcFields, name);
    if (used.length > 0) return { ok: false, error: `${d('usedBy')}: ${used.join(', ')}` };
    // Toast Undo restores this snapshot (field, slicers and card filters in one step), like Reset layout.
    const before = board;
    setBoard(b => ({ calc: b.calc.filter(f => f.name !== name), items: removeFieldFromItems(b.items, name) }));
    // Outside the history: the page filter on the column is dropped and is not restored by Undo.
    setFilters(prev => setFilter(prev, name, null));
    setCross(c => (c?.column === name ? null : c));
    toast.success(`${d('fieldDeleted')}: ${name}`, { action: { label: t('undo'), onClick: () => setBoard(() => before) } });
    return { ok: true };
  }, [baseColumns, calcFields, board, setBoard, d, t]);

  const addToDashboard = useCallback((chart: DashboardItem) => {
    setDashboardItems(prev => [...prev, chart]);
    trackEvent('chart_added', { source: 'manual' });
  }, [setDashboardItems]);

  const addSuggestionToDashboard = useCallback((s: ChartSuggestion, type: ChartType = s.type) => {
    setDashboardItems(prev => [...prev, {
      id: `${s.id}-${Date.now()}`, title: s.title, description: s.description,
      type, data: s.data, dataKeys: s.dataKeys, xKey: s.xKey,
      sourceKey: s.key,
    }]);
    trackEvent('chart_added', { source: 'suggestion' });
  }, [setDashboardItems]);

  const addInsightToDashboard = useCallback((card: { id: string; title: string; content: any; type: 'insight' }) => {
    const content = card.content;
    let insightType: 'repeating' | 'stats' | 'quality' = 'stats';
    if (content && content.topValues && content.repetitionRatio !== undefined) insightType = 'repeating';
    else if (Array.isArray(content) && content.length > 0) {
      if (content[0]?.completeness !== undefined) insightType = 'quality';
      else if (content[0]?.stats) insightType = 'stats';
    }
    setDashboardItems(prev => [...prev, {
      id: card.id, title: card.title, description: '', type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType, insightContent: content,
    }]);
    trackEvent('chart_added', { source: 'insight' });
  }, [setDashboardItems]);

  const addKpiToDashboard = useCallback((spec: KpiSpec, title: string) => {
    const id = kpiCardId(spec);
    setDashboardItems(prev => (
      prev.some(i => i.id === id) ? prev : [...prev, {
        id, title, type: 'bar' as const, data: [], dataKeys: [], xKey: '',
        displayAs: 'kpi' as const, kpiSpec: spec, size: 'xs' as const,
      }]
    ));
    trackEvent('chart_added', { source: 'kpi' });
  }, [setDashboardItems]);

  const addTableToDashboard = useCallback((card: { id: string; title: string; data: any[]; columns: string[] }) => {
    setDashboardItems(prev => [...prev, {
      id: card.id, title: card.title, description: '', type: 'bar', data: card.data,
      dataKeys: [], xKey: '', displayAs: 'table', tableColumns: card.columns,
    }]);
    trackEvent('chart_added', { source: 'table' });
  }, [setDashboardItems]);

  /* The card the edit window is editing, with its recipe in ChartSpec form when it is a chart.
     Suggestion cards are converted from their sourceKey, so any chart on the
     board opens. Removing the card makes this null: the window closes. */
  const selected = useMemo(() => {
    const item = dashboardItems.find(i => i.id === editId);
    if (!item) return null;
    const isChart = !item.displayAs || item.displayAs === 'chart';
    const spec = !isChart ? null
      : item.spec ? toChartSpec(item.spec, item.type)
      : item.sourceKey ? specFromSourceKey(item.sourceKey, columns) : null;
    return { item, spec };
  }, [editId, dashboardItems, columns]);

  // Chart recipes, KPI, pivot and repeating-value cards have settings; slicers, text, tables, scatter plots do not.
  const editing = selected && (selected.spec || (selected.item.displayAs === 'kpi' && selected.item.kpiSpec) || (selected.item.displayAs === 'pivot' && selected.item.pivotSpec) || repeatColumnOf(selected.item)) ? selected : null;
  // Undo of a card's creation (or its removal) drops the id, so a redo or an Undo toast cannot re-open the window by itself.
  useEffect(() => { if (editId && !editing) setEditId(null); }, [editId, editing]);

  const selectCard = useCallback((id: string | null) => setSelectedId(id), []);
  const openEdit = useCallback((id: string) => { setSelectedId(id); setEditId(id); }, []);

  const handleChangeSelected = useCallback((updates: Pick<DashboardItem, 'type' | 'spec' | 'title'>) => {
    if (!selected) return;
    const { item } = selected;
    // An edited suggestion is now a custom chart: drop the suggestion link
    // (which also frees it in Quick Add unless another card still shows it).
    // Idempotent: after the first call the item's sourceKey is already gone.
    // A suggestion's own title and description describe the old recipe: regenerate the title
    // (unless the user renamed it) and drop the description.
    const generated = item.sourceKey && item.title === suggestions.find(s => s.key === item.sourceKey)?.title;
    const patch = item.sourceKey ? { ...updates, title: generated ? specTitle(toChartSpec(updates.spec, updates.type), t) : updates.title, description: undefined } : updates;
    // ponytail: one history entry per pane edit; coalesce by card id+time if it feels noisy
    setDashboardItems(prev => prev.map(i => (i.id === item.id ? { ...i, ...patch, sourceKey: undefined } : i)));
  }, [selected, suggestions, t, setDashboardItems]);

  /* Apply a recipe edit that may rename the card. The id doubles as the
     "already placed" key (derived), so only the selection needs to follow it. */
  const retargetCard = useCallback((oldId: string, patch: Partial<DashboardItem>, newId?: string) => {
    // ponytail: one history entry per pane edit; coalesce by card id+time if it feels noisy
    setDashboardItems(prev => prev.map(i => (i.id === oldId ? { ...i, ...patch, id: newId ?? i.id } : i)));
    if (newId) { selectCard(newId); setEditId(newId); }
  }, [selectCard, setDashboardItems]);

  const handleChangeTitle = useCallback((title: string) => {
    if (!selected) return;
    const id = selected.item.id;
    setDashboardItems(prev => prev.map(i => (i.id === id ? { ...i, title } : i)));
  }, [selected, setDashboardItems]);

  const handleChangeKpi = useCallback((spec: KpiSpec) => {
    if (!selected) return;
    const r = retargetKpi(selected.item, spec, dashboardItems.map(i => i.id), t);
    retargetCard(selected.item.id, r.patch, r.newId);
  }, [selected, dashboardItems, retargetCard, t]);

  const handleChangePivot = useCallback((pivotSpec: PivotSpec) => {
    if (!selected) return;
    const id = selected.item.id;
    setDashboardItems(prev => prev.map(i => (i.id === id ? { ...i, pivotSpec } : i)));
  }, [selected, setDashboardItems]);

  const handleChangeFormat = useCallback((format: ChartFormat | undefined) => {
    if (!selected) return;
    const id = selected.item.id;
    setDashboardItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const next = { ...i };
      if (format) next.format = format; else delete next.format;
      return next;
    }));
  }, [selected, setDashboardItems]);

  const handleChangeFilters = useCallback((filters: Filters | undefined) => {
    if (!selected) return;
    const id = selected.item.id;
    setDashboardItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const next = { ...i };
      if (filters && countActive(filters)) next.filters = filters; else delete next.filters;
      return next;
    }));
  }, [selected, setDashboardItems]);

  const handleChangeRepeat = useCallback((column: string) => {
    if (!selected) return;
    const r = retargetRepeat(selected.item, column, dashboardItems.map(i => i.id), t);
    if (r) retargetCard(selected.item.id, r.patch, r.newId);
  }, [selected, dashboardItems, retargetCard, t]);

  /* Returns the new card's id (undefined when the field cannot start a card). */
  const handleAddField = useCallback((col: ColumnMeta): string | undefined => {
    const r = specForField(col);
    if (!r) return;
    if (r.displayAs === 'kpi') {
      const spec = r.kpiSpec;
      addKpiToDashboard(spec, kpiTitle(spec, t));
      const kpiId = kpiCardId(spec);
      selectCard(kpiId);
      return kpiId;
    }
    const id = `manual-${Date.now()}`;
    // data/dataKeys are re-derived from the spec by liveItems.
    setDashboardItems(prev => [...prev, { id, title: specTitle(r.spec, t), type: r.type, spec: r.spec, data: [], dataKeys: [] }]);
    trackEvent('chart_added', { source: 'field' });
    selectCard(id);
    return id;
  }, [addKpiToDashboard, selectCard, t, setDashboardItems]);

  /* The "Custom chart" action of the Add panel: a starter recipe from the first usable column,
     created exactly like a click on that field, then opened in the edit window to refine. */
  const handleCustomChart = useCallback(() => {
    const col = filteredColumns.find(c => c.type === 'categorical' || c.type === 'text' || c.type === 'range')
      ?? filteredColumns.find(c => c.type === 'date');
    if (!col) { toast.info(d('noChartableField')); return; }
    const id = handleAddField(col);
    if (id) setEditId(id);
    toast.success(`${d('addedToBoard')}: ${col.name}`);
  }, [filteredColumns, handleAddField, d]);

  /* A slicer edits the page filters (the same state as the Filter tab), so removing the
     card leaves its filter in place; the Filter tab still shows and clears it. */
  const handleAddSlicer = useCallback((col: ColumnMeta) => {
    const id = `slicer:${col.name}`;
    if (!dashboardItems.some(i => i.id === id)) {
      setDashboardItems(prev => (prev.some(i => i.id === id) ? prev : [...prev, {
        id, title: col.name, type: 'bar' as const, data: [], dataKeys: [], xKey: '',
        displayAs: 'slicer' as const, slicerColumn: col.name, size: 'sm' as const,
      }]));
      trackEvent('chart_added', { source: 'slicer' });
    }
    selectCard(id);
  }, [dashboardItems, selectCard, setDashboardItems]);

  /* A starter pivot: row counts per first category (or first non-id column), refined in the edit window. */
  const handleAddPivot = useCallback(() => {
    const col = filteredColumns.find(c => c.type === 'categorical') ?? filteredColumns.find(c => c.type !== 'id');
    if (!col) { toast.info(d('noChartableField')); return; }
    const id = `pivot:${Date.now()}`;
    setDashboardItems(prev => [...prev, {
      id, title: d('pivotTitle'), type: 'bar' as const, data: [], dataKeys: [], xKey: '',
      displayAs: 'pivot' as const, size: 'md' as const,
      pivotSpec: { rows: col.name, value: { column: null, agg: 'count' as const }, ...(col.type === 'date' && { rowGrain: 'month' as const }) },
    }]);
    trackEvent('chart_added', { source: 'pivot' });
    selectCard(id);
    toast.success(`${d('addedToBoard')}: ${d('pivotTitle')}`);
  }, [filteredColumns, d, selectCard, setDashboardItems]);

  const handleAddText = useCallback(() => {
    const id = `text:${Date.now()}`;
    setDashboardItems(prev => [...prev, {
      id, title: d('addText'), type: 'bar' as const, data: [], dataKeys: [], xKey: '',
      displayAs: 'text' as const, text: '', size: 'md' as const,
    }]);
    trackEvent('chart_added', { source: 'text' });
    selectCard(id);
  }, [d, selectCard, setDashboardItems]);

  // Candidates for `in` slicers, from the unfiltered rows (like DataFilter) so a pick never hides its siblings.
  const slicerValues = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const { slicerColumn: c } of dashboardItems) {
      if (c && !out[c] && columns.some(m => m.name === c && filterKindFor(m) === 'in')) out[c] = distinctValues(data, c);
    }
    return out;
  }, [dashboardItems, columns, data]);

  const handleRemoveFromDashboard = useCallback((id: string) => {
    /* Read up front, not inside an updater: Undo needs the item and its index. */
    const index = dashboardItems.findIndex(i => i.id === id);
    if (index === -1) return;
    const item = dashboardItems[index];

    // Otherwise Undo would re-select the card (and re-open its edit window).
    setSelectedId(cur => (cur === id ? null : cur));
    setEditId(cur => (cur === id ? null : cur));
    setDashboardItems(prev => prev.filter(i => i.id !== id));

    toast.success(t('chartRemoved'), {
      action: {
        label: t('undo'),
        onClick: () => {
          setDashboardItems(prev => {
            if (prev.some(i => i.id === item.id)) return prev;
            const next = [...prev];
            next.splice(Math.min(index, next.length), 0, item);
            return next;
          });
        },
      },
    });
  }, [dashboardItems, t, setDashboardItems]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      // Leave native text undo and Radix widgets alone.
      if ((e.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="menu"], [role="listbox"]')) return;
      const k = e.key.toLowerCase();
      const isRedo = (k === 'z' && e.shiftKey) || (k === 'y' && e.ctrlKey && !e.shiftKey);
      const isUndo = k === 'z' && !e.shiftKey;
      if (isUndo && canUndo) { e.preventDefault(); undo(); }
      else if (isRedo && canRedo) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, canUndo, canRedo, undo, redo]);

  /* ─── DASHBOARD APP SHELL ─── */
  const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
  const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
  const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;

  const calculatedNames = useMemo(() => new Set(calcFields.map(f => f.name)), [calcFields]);

  /* Size preset matching the edited card's current grid width. */
  const editSize = useMemo<CardSize>(() => {
    const w = editId ? presetLayout(dashboardItems)[editId]?.w : undefined;
    return w ? sizeFromWidth(w) : 'md';
  }, [editId, dashboardItems]);

  /* The Size select of the edit window: the same commit as a drag, so one undo entry. */
  const resizeCard = useCallback((id: string, size: CardSize) => {
    const layouts = presetLayout(dashboardItems);
    const cur = layouts[id];
    if (!cur) return;
    const w = widthForSize(size);
    layouts[id] = { ...cur, w, x: Math.min(cur.x, GRID_COLS - w) };
    handleLayoutCommit(layouts);
  }, [dashboardItems, handleLayoutCommit]);

  const activeItem = SIDEBAR_ITEMS.find(i => i.value === activeTab);

  return (
    <>
      {/* ─── ANALYZING SKELETON OVERLAY ─── */}
      <div className={`fixed inset-0 z-50 bg-background flex items-center justify-center discrete-transition ${analyzing ? '' : 'hidden'}`}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <p className="text-base font-semibold text-foreground">{t('analyzingData')}</p>
          <p className="text-sm text-muted-foreground">{t('buildingChartsInsights')}</p>
          <div className="flex items-center justify-center gap-1 pt-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`min-h-screen bg-background flex discrete-transition ${analyzing ? 'hidden' : ''}`}>

      {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
      {!isMobile && (
        <aside
          className="sidebar-surface fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out"
          style={{ width: sidebarCollapsed ? '56px' : '240px' }}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-border/50 min-h-[57px]">
            <img
              src={LOGO_SRC}
              alt="ExcelInsight"
              width="28"
              height="28"
              decoding="async"
              className="h-7 w-7 flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="font-bold brand-mark text-sm leading-none truncate animate-[fade-in_0.2s_ease-out]">
                {t('appName')}
              </span>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {SIDEBAR_ITEMS.map(({ value, icon: Icon, labelKey }) => {
              const isActive = activeTab === value;
              const label = t(labelKey);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  title={sidebarCollapsed ? label : undefined}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="animate-[fade-in_0.15s_ease-out]">{label}</span>
                  )}
                  {!sidebarCollapsed && isActive && value === 'dashboard' && dashboardItems.length > 0 && (
                    <span className="ml-auto text-[10px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full animate-[fade-in_0.15s_ease-out]">
                      {dashboardItems.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(c => !c)}
              title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
              className={`sidebar-nav-item ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              {sidebarCollapsed
                ? <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
                : <><PanelLeftClose className="h-4 w-4 flex-shrink-0" /><span className="text-xs">{t('collapseSection')}</span></>
              }
            </button>
          </div>
        </aside>
      )}

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out pb-16 md:pb-0"
        style={!isMobile ? { marginLeft: sidebarCollapsed ? '56px' : '240px' } : {}}
      >
        {/* ─── Sticky App Header ─── */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between h-[57px] px-4 gap-4">

            {/* Left: breadcrumb + file badge */}
            <div className="flex items-center gap-2 min-w-0">
              {isMobile && (
                <img src={LOGO_SRC} alt="ExcelInsight" width="22" height="22" decoding="async" className="h-5 w-5 flex-shrink-0" />
              )}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold brand-mark hidden sm:inline">{t('appName')}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block" />
                <span className="text-xs font-medium text-foreground truncate max-w-[120px] sm:max-w-[260px]">
                  {activeItem ? t(activeItem.labelKey) : t('dashboard')}
                </span>
              </div>

              {/* File badge with clear button */}
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary border border-border/50 pl-2 pr-0.5 py-0.5 rounded-lg ml-1">
                <span className="truncate max-w-[180px]">{fileName}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={t('clearFile')}
                      title={t('clearFile')}
                      className="inline-flex items-center justify-center h-4 w-4 rounded-md hover:bg-destructive/15 hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('clearFileConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('clearFileConfirmDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearFile}>{t('clearFile')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </span>
            </div>

            {/* Right: stats + actions */}
            <div className="flex items-center gap-2">
              {/* Stat chips (desktop only) */}
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="stat-chip">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {filteredData.length} {t('rows')}
                </span>
                <span className="stat-chip">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  {columns.length} {t('cols')}
                </span>
                {countActive(filters) > 0 && (
                  <span className="stat-chip" style={{ background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))' }}>
                    {countActive(filters)} {t('activeFilters')}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                className="gap-1.5 text-xs h-8 shadow-sm font-medium"
                aria-label={d('add')}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{d('add')}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPdf}
                disabled={exporting || !dashboardItems.length}
                className="gap-1.5 text-xs h-8 font-medium"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{exporting ? t('generatingPdf') : t('exportPdf')}</span>
                <span className="sm:hidden">PDF</span>
              </Button>

              <ChartThemeSwitcher />

              {/* Dashboard overflow menu */}
              {activeTab === 'dashboard' && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={t('moreActions')}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={handleResetLayout} className="text-xs">
                      <RotateCcw className="h-3.5 w-3.5 mr-2" /> {t('resetLayout')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMergeOpen(true)} className="text-xs">
                      <Merge className="h-3.5 w-3.5 mr-2" /> {t('mergeColumns')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalcOpen(true)} className="text-xs">
                      <FunctionSquare className="h-3.5 w-3.5 mr-2" /> {d('newField')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('insights')} className="text-xs">
                      <Lightbulb className="h-3.5 w-3.5 mr-2" /> {t('insights')}
                    </DropdownMenuItem>
                    {dashboardItems.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClearAll} className="text-xs text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> {t('clearAll')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <ThemeLangSwitcher />
            </div>
          </div>
        </header>

        {/* ─── Tab content ─── */}
        <main className="flex-1 px-4 sm:px-5 py-5 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>

            {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
            <TabsContent value="dashboard" className="space-y-4 mt-0">
              {/* Workspace header card */}
              <div className="dashboard-surface p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: getChartColor(0) }}>
                      {t('workspace')}
                    </p>
                    <h2 className="text-lg font-bold text-foreground">{fileName || t('dashboard')}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {filteredData.length} {t('rows')} · {columns.length} {t('cols')} · {dashboardItems.length} {t('cards')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="rounded-full border-0 px-2.5 py-1 text-[11px] font-medium" style={{ background: `hsl(${getChartColorVar(0)} / 0.1)`, color: getChartColor(0) }}>
                      {filteredData.length} {t('rows')}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full border-0 px-2.5 py-1 text-[11px] font-medium" style={{ background: `hsl(${getChartColorVar(1)} / 0.1)`, color: getChartColor(1) }}>
                      {columns.length} {t('cols')}
                    </Badge>
                    {dashboardItems.length > 0 && (
                      <Badge variant="secondary" className="rounded-full border-0 px-2.5 py-1 text-[11px] font-medium" style={{ background: `hsl(${getChartColorVar(2)} / 0.1)`, color: getChartColor(2) }}>
                        {dashboardItems.length} {t('cards')}
                      </Badge>
                    )}
                    {countActive(filters) > 0 && (
                      <Badge variant="secondary" className="rounded-full border-0 bg-warning/10 px-2.5 py-1 text-[11px] text-warning-foreground font-medium">
                        {countActive(filters)} {t('activeFilters')}
                      </Badge>
                    )}
                    {activeCross && (
                      <Badge variant="secondary" className="rounded-full border-0 py-1 pl-2.5 pr-1 text-[11px] font-medium gap-1" style={{ background: `hsl(${getChartColorVar(0)} / 0.1)`, color: getChartColor(0) }}>
                        <span className="max-w-[16rem] truncate">{activeCross.column} = {activeCross.value}</span>
                        <button
                          type="button" onClick={() => setCross(null)}
                          aria-label={d('clearCrossFilter')} title={d('clearCrossFilter')}
                          className="rounded-full p-0.5 hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddText}
                      aria-label={d('addText')} title={d('addText')}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7" disabled={!canUndo} onClick={undo}
                      aria-label={t('undo')} title={`${t('undo')} (Ctrl+Z)`}
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7" disabled={!canRedo} onClick={redo}
                      aria-label={d('redo')} title={`${d('redo')} (Ctrl+Shift+Z)`}
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={dashboardRef} className="min-h-[400px] min-w-0">
                <Suspense fallback={<ChartFallback />}>
                  <DashboardGrid
                    items={liveItems}
                    onLayoutCommit={handleLayoutCommit}
                    onRemove={handleRemoveFromDashboard}
                    onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
                    onDuplicate={handleDuplicate}
                    selectedId={selectedId}
                    // Selection is only a ring and a scroll target; on touch layouts body taps (tooltips) must not select.
                    onSelect={isDesktop ? selectCard : undefined}
                    onEdit={openEdit}
                    onChartSelect={handleChartSelect}
                    columns={columns}
                    pageFilters={filters}
                    onPageFilterChange={(c, f) => setFilters(prev => setFilter(prev, c, f))}
                    slicerValues={slicerValues}
                    emptyAction={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 text-sm h-9">
                          <Plus className="h-3.5 w-3.5" /> {d('add')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleResetLayout} className="gap-1.5 text-sm h-9">
                          <Sparkles className="h-3.5 w-3.5" /> {t('autoGenerate')}
                        </Button>
                      </div>
                    }
                  />
                </Suspense>
              </div>
            </TabsContent>

            {/* ═══════════════ EXPLORE TAB ═══════════════ */}
            <TabsContent value="explore" className="space-y-4 mt-0">
              <div className="dashboard-surface p-4">
                <h2 className="text-base font-bold text-foreground">{t('explore')}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t('exploreTabDesc')}</p>
              </div>
              {availableSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center min-h-[300px]">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{t('allChartsAdded')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {availableSuggestions.map(s => (
                    <ExploreChartCard
                      key={s.id}
                      s={s}
                      onAdd={type => addSuggestionToDashboard(s, type)}
                      addLabel={t('addToDashboard')}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ═══════════════ INSIGHTS TAB ═══════════════ */}
            <TabsContent value="insights" className="space-y-4 mt-0">
              <div className="dashboard-surface p-4">
                <h2 className="text-base font-bold text-foreground">{t('insights')}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t('insightsTabDesc')}</p>
              </div>
              <Card className="elevated-card p-5 min-h-[300px]">
                <Suspense fallback={<PanelFallback />}>
                  <SmartInsights columns={filteredColumns} data={filteredData} onAddToDashboard={addInsightToDashboard} onAddTableToDashboard={addTableToDashboard} addedInsightIds={addedInsightIds} />
                </Suspense>
              </Card>
            </TabsContent>

            {/* ═══════════════ FILTER TAB ═══════════════ */}
            <TabsContent value="filter" className="space-y-4 mt-0">
              <div className="dashboard-surface p-4">
                <h2 className="text-base font-bold text-foreground">{t('filter')}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t('filterTabDesc')}</p>
              </div>
              <Card className="elevated-card p-5 min-h-[250px]">
                <Suspense fallback={<PanelFallback />}>
                  <DataFilter columns={columns} data={data} filters={filters} onFiltersChange={setFilters} />
                </Suspense>
              </Card>
              {countActive(filters) > 0 && filteredSuggestions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredSuggestions.slice(0, 4).map(s => (
                    <div key={s.id} className="min-h-[300px]">
                      <Suspense fallback={<ChartFallback />}>
                        <DynamicChart title={s.title} description={s.description} type={s.type}
                          data={s.data} dataKeys={s.dataKeys} xKey={s.xKey} showControls={false} />
                      </Suspense>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ═══════════════ DATA TAB ═══════════════ */}
            <TabsContent value="data" className="space-y-4 mt-0">
              <div className="dashboard-surface p-4">
                <h2 className="text-base font-bold text-foreground">{t('data')}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t('dataTabDesc')}</p>
              </div>
              <Card className="elevated-card p-5 min-h-[200px]">
                <Suspense fallback={<PanelFallback />}>
                  <DataSummary columns={filteredColumns} rowCount={filteredData.length} />
                </Suspense>
              </Card>
              {/* The scroll container is an inner div, not the Card itself:
                  .elevated-card sets `overflow: hidden` to clip its rounded
                  corners, which silently defeated the `overflow-auto` that used
                  to live here — the table was capped at ~20 visible rows with no
                  way to reach the rest.
                  edge-fade-b then dissolves the bottom edge as a truthful signal
                  that more rows follow. Bottom only: a top fade would dim the
                  column headings. */}
              <Card className="elevated-card p-4 min-h-[300px]">
                <div className="overflow-auto max-h-96 edge-fade-b">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        {columns.slice(0, 10).map(c => (
                          <TableHead key={c.name} className="font-semibold">{c.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.slice(0, 50).map((row, i) => (
                        <TableRow key={i} className="hover:bg-secondary/30">
                          {columns.slice(0, 10).map(c => (
                            <TableCell key={c.name} className="truncate max-w-[150px]">{String(row[c.name] ?? '')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* ─── Edit window: preview + every setting of one card (full screen on phones). Mounted only while open. ─── */}
      {editing && (
        <Suspense fallback={null}>
          <EditCardDialog
            open
            onOpenChange={open => { if (!open) setEditId(null); }}
            columns={filteredColumns}
            data={filteredData}
            selected={editing}
            size={editSize}
            previewItem={liveItems.find(i => i.id === editing.item.id)}
            previewIndex={Math.max(0, liveItems.findIndex(i => i.id === editing.item.id))}
            onChange={handleChangeSelected}
            onChangeTitle={handleChangeTitle}
            onChangeSize={size => resizeCard(editing.item.id, size)}
            onChangeKpi={handleChangeKpi}
            onChangePivot={handleChangePivot}
            onChangeRepeatColumn={handleChangeRepeat}
            onChangeFormat={handleChangeFormat}
            onChangeFilters={handleChangeFilters}
          />
        </Suspense>
      )}

      <Sheet open={mergeOpen} onOpenChange={setMergeOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('mergeColumns')}</SheetTitle>
            <SheetDescription>{t('mergeColumns')}</SheetDescription>
          </SheetHeader>
          <Suspense fallback={<PanelFallback />}>
            <ColumnMerger columns={baseColumns} onMerge={handleMerge} />
          </Suspense>
        </SheetContent>
      </Sheet>

      <Sheet open={calcOpen} onOpenChange={setCalcOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>{d('newField')}</SheetTitle>
            <SheetDescription>{d('formulaHint')}</SheetDescription>
          </SheetHeader>
          <Suspense fallback={<PanelFallback />}>
            <CalcFieldDialog
              columns={columns} data={data} fields={calcFields}
              onAdd={handleAddCalculated} onEdit={handleEditCalculated} onDelete={handleDeleteCalculated}
              onDone={() => setCalcOpen(false)} />
          </Suspense>
        </SheetContent>
      </Sheet>

      {/* ─── Add panel (fields, suggestions, metrics, insights, text) ─── */}
      <Suspense fallback={null}>
        <AddPanel
          open={addOpen}
          onOpenChange={setAddOpen}
          suggestions={filteredSuggestions}
          addedChartIds={addedChartIds}
          addedInsightIds={addedInsightIds}
          columns={filteredColumns}
          data={filteredData}
          calculated={calculatedNames}
          onAddSuggestion={addSuggestionToDashboard}
          onAddInsight={addInsightToDashboard}
          onAddKpi={addKpiToDashboard}
          onAddField={handleAddField}
          onAddSlicer={handleAddSlicer}
          onNewField={() => setCalcOpen(true)}
          onMergeColumns={() => setMergeOpen(true)}
          onCustomChart={handleCustomChart}
          onAddText={handleAddText}
          onAddPivot={handleAddPivot}
        />
      </Suspense>

      {/* ─── Mobile Bottom Navigation ─── */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom"
          aria-label={t('mainNavigation')}
        >
          <div className="flex items-center justify-around h-14">
            {MOBILE_TABS.map(({ value, icon: Icon, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                aria-label={t(labelKey)}
                aria-current={activeTab === value ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t(labelKey)}</span>
              </button>
            ))}

            {/* More: Merge columns + Filter + Clear file */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('moreTabs')}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                    activeTab === 'filter' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {activeTab === 'filter' ? t('filter') : t('more')}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-44 mb-1">
                <DropdownMenuItem onClick={() => setMergeOpen(true)} className="text-xs gap-2">
                  <Merge className="h-3.5 w-3.5" /> {t('mergeColumns')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCalcOpen(true)} className="text-xs gap-2">
                  <FunctionSquare className="h-3.5 w-3.5" /> {d('newField')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('filter')} className="text-xs gap-2">
                  <Filter className="h-3.5 w-3.5" /> {t('filter')}
                  {activeTab === 'filter' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); setMobileClearConfirmOpen(true); }}
                  className="text-xs gap-2 text-destructive focus:text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> {t('clearFile')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      )}

      {/* ─── Mobile Clear-File Confirmation ─── */}
      <AlertDialog open={mobileClearConfirmOpen} onOpenChange={setMobileClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearFileConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('clearFileConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearFile}>{t('clearFile')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
