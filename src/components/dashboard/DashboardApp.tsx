"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Suspense, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { ChartThemeSwitcher } from '@/components/ChartThemeSwitcher';
import { useChartPalette, getChartPalette, getChartColor, getChartColorVar } from '@/lib/chart-themes';
import { hslStringToRgb } from '@/lib/color-utils';
import { AdSlot } from '@/components/AdSlot';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { buildDefaultDashboard } from '@/lib/build-default-dashboard';
import { deriveDashboardItems } from '@/lib/derive-dashboard-item';
import { loadSession, clearStoredSession, STORAGE_KEY, type PersistedSession } from '@/lib/session-storage';
import { useI18n } from '@/lib/i18n';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, Wrench, LayoutDashboard, Database, Filter, Lightbulb, FileDown, Plus,
  Sparkles, RotateCcw, Trash2, X, MoreHorizontal, ChevronRight,
  PanelLeftClose, PanelLeftOpen,
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Served from public/ so logo swaps don't need a rebuild (SiteHeader and the
// landing page use the same path).
const LOGO_SRC = '/logo-64.png';

function ExploreChartCard({ s, onAdd, addLabel }: { s: ChartSuggestion; onAdd: () => void; addLabel: string }) {
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
        onClick={onAdd}
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
 * DynamicChart's PNG export) and @dnd-kit (via DashboardGrid) — stay behind
 * their own boundaries so that mounting the shell doesn't drag in every panel
 * at once; a user who never opens the Build tab never pays for ColumnMerger.
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
const ManualChartBuilder = dynamic(() => import('@/components/ManualChartBuilder').then(m => m.ManualChartBuilder), { ssr: false });
const ColumnMerger = dynamic(() => import('@/components/ColumnMerger').then(m => m.ColumnMerger), { ssr: false });
const DashboardGrid = dynamic(() => import('@/components/DashboardGrid').then(m => m.DashboardGrid), { ssr: false });
const DataFilter = dynamic(() => import('@/components/DataFilter').then(m => m.DataFilter), { ssr: false });
const SmartInsights = dynamic(() => import('@/components/SmartInsights').then(m => m.SmartInsights), { ssr: false });
const QuickAddPanel = dynamic(() => import('@/components/QuickAddPanel').then(m => m.QuickAddPanel), { ssr: false });

/* ─── Sidebar nav items ─── */
const SIDEBAR_ITEMS = [
  { value: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { value: 'explore',   icon: BarChart3,       labelKey: 'explore' },
  { value: 'insights',  icon: Lightbulb,       labelKey: 'insights' },
  { value: 'build',     icon: Wrench,          labelKey: 'build' },
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
  initialUpload: { data: Record<string, any>[]; fileName: string } | null;
  /** Tears down this tree and returns the user to the landing page. */
  onClearFile: () => void;
}

export function DashboardApp({ initialUpload, onClearFile }: DashboardAppProps) {
  const { t } = useI18n();
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
  const [initial] = useState<PersistedSession | null>(() => (initialUpload ? null : loadSession()));
  const [data, setData] = useState<Record<string, any>[]>(() => initialUpload?.data ?? initial?.data ?? []);
  const [fileName, setFileName] = useState(() => initialUpload?.fileName ?? initial?.fileName ?? '');
  const [columns, setColumns] = useState<ColumnMeta[]>(() => initial?.columns ?? []);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>(() => initial?.suggestions ?? []);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>(() => initial?.dashboardItems ?? []);
  const [filters, setFilters] = useState<Record<string, string>>(() => initial?.filters ?? {});
  const [addedChartIds, setAddedChartIds] = useState<Set<string>>(() => new Set(initial?.addedChartIds ?? []));
  const [addedInsightIds, setAddedInsightIds] = useState<Set<string>>(() => new Set(initial?.addedInsightIds ?? []));
  const [activeTab, setActiveTab] = useState<string>(() => initial?.activeTab ?? 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => initial?.sidebarCollapsed ?? false);
  const [exporting, setExporting] = useState(false);
  // A fresh upload arrives underived, so the overlay is up from the first paint.
  const [analyzing, setAnalyzing] = useState(() => Boolean(initialUpload));
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [mobileClearConfirmOpen, setMobileClearConfirmOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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
      setColumns(cols);
      const charts = generateChartSuggestions(newData, cols);
      setSuggestions(charts);
      const { items, usedChartIds } = buildDefaultDashboard(newData, cols, charts, t);
      setDashboardItems(items);
      setAddedChartIds(usedChartIds);
      setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
      setAnalyzing(false);

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
    if (!data.length) { localStorage.removeItem(STORAGE_KEY); return; }
    try {
      const payload: PersistedSession = {
        data, fileName, columns, suggestions, dashboardItems, filters,
        addedChartIds: Array.from(addedChartIds),
        addedInsightIds: Array.from(addedInsightIds),
        activeTab, sidebarCollapsed,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist session', e);
    }
  }, [analyzing, data, fileName, columns, suggestions, dashboardItems, filters, addedChartIds, addedInsightIds, activeTab, sidebarCollapsed]);

  const handleResetLayout = useCallback(() => {
    const { items, usedChartIds } = buildDefaultDashboard(data, columns, suggestions, t);
    setDashboardItems(items);
    setAddedChartIds(usedChartIds);
    setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
    toast.success(t('resetLayout'));
  }, [data, columns, suggestions, t]);

  const handleClearAll = useCallback(() => {
    setDashboardItems([]);
    setAddedChartIds(new Set());
    setAddedInsightIds(new Set());
  }, []);

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
      const copy: DashboardItem = { ...original, id: `${original.id}-copy-${Date.now()}`, title: `${original.title} (copy)` };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  // ── Derived filtered data (declared before any callbacks that use it) ──
  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return data;
    return data.filter(row => Object.entries(filters).every(([col, val]) => String(row[col]) === val));
  }, [data, filters]);

  const filteredColumns = useMemo(() => {
    if (!Object.keys(filters).length) return columns;
    return analyzeColumns(filteredData);
  }, [filteredData, columns, filters]);

  const filteredSuggestions = useMemo(() => {
    if (!Object.keys(filters).length) return suggestions;
    // Depends on filteredColumns (which already includes filteredData) — no double-compute
    return generateChartSuggestions(filteredData, filteredColumns);
  }, [filteredData, filteredColumns, suggestions]);

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
  const liveItems = useMemo(
    () => deriveDashboardItems(dashboardItems, filteredSuggestions, filteredColumns, filteredData, t),
    [dashboardItems, filteredSuggestions, filteredColumns, filteredData, t]
  );

  const handleMerge = useCallback((col1: string, col2: string, newName: string, separator: string) => {
    const merged = mergeColumns(data, col1, col2, newName, separator);
    setData(merged);
    setColumns(analyzeColumns(merged));
  }, [data]);

  const addToDashboard = useCallback((chart: DashboardItem) => {
    setDashboardItems(prev => [...prev, chart]);
    trackEvent('chart_added', { source: 'manual' });
  }, []);

  const addSuggestionToDashboard = useCallback((s: ChartSuggestion) => {
    setDashboardItems(prev => [...prev, {
      id: `${s.id}-${Date.now()}`, title: s.title, description: s.description,
      type: s.type, data: s.data, dataKeys: s.dataKeys, xKey: s.xKey,
      sourceKey: s.key,
    }]);
    setAddedChartIds(prev => new Set(prev).add(s.key));
    trackEvent('chart_added', { source: 'suggestion' });
  }, []);

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
    setAddedInsightIds(prev => new Set(prev).add(card.id));
    trackEvent('chart_added', { source: 'insight' });
  }, []);

  const addTableToDashboard = useCallback((card: { id: string; title: string; data: any[]; columns: string[] }) => {
    setDashboardItems(prev => [...prev, {
      id: card.id, title: card.title, description: '', type: 'bar', data: card.data,
      dataKeys: [], xKey: '', displayAs: 'table', tableColumns: card.columns,
    }]);
    setAddedInsightIds(prev => new Set(prev).add(card.id));
    trackEvent('chart_added', { source: 'table' });
  }, []);

  const handleRemoveFromDashboard = useCallback((id: string) => {
    /* Read up front, not inside an updater: un-marking needs item.sourceKey. */
    const index = dashboardItems.findIndex(i => i.id === id);
    if (index === -1) return;
    const item = dashboardItems[index];
    const chartKey = item.sourceKey && addedChartIds.has(item.sourceKey) ? item.sourceKey : null;
    const insightId = addedInsightIds.has(id) ? id : null;

    setDashboardItems(prev => prev.filter(i => i.id !== id));
    if (chartKey) setAddedChartIds(prev => { const next = new Set(prev); next.delete(chartKey); return next; });
    if (insightId) setAddedInsightIds(prev => { const next = new Set(prev); next.delete(insightId); return next; });

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
          if (chartKey) setAddedChartIds(prev => new Set(prev).add(chartKey));
          if (insightId) setAddedInsightIds(prev => new Set(prev).add(insightId));
        },
      },
    });
  }, [dashboardItems, addedChartIds, addedInsightIds, t]);

  /* ─── DASHBOARD APP SHELL ─── */
  const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
  const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
  const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;

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
                {Object.keys(filters).length > 0 && (
                  <span className="stat-chip" style={{ background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))' }}>
                    {Object.keys(filters).length} {t('activeFilters')}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <Button
                size="sm"
                onClick={() => setQuickAddOpen(true)}
                className="gap-1.5 text-xs h-8 shadow-sm font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('quickAdd')}</span>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={t('moreActions')}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={handleResetLayout} className="text-xs">
                      <RotateCcw className="h-3.5 w-3.5 mr-2" /> {t('resetLayout')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('build')} className="text-xs">
                      <Wrench className="h-3.5 w-3.5 mr-2" /> {t('build')}
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
                  <div className="flex flex-wrap gap-1.5">
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
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="rounded-full border-0 bg-warning/10 px-2.5 py-1 text-[11px] text-warning-foreground font-medium">
                        {Object.keys(filters).length} {t('activeFilters')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div ref={dashboardRef} className="min-h-[400px]">
                <Suspense fallback={<ChartFallback />}>
                  <DashboardGrid
                    items={liveItems}
                    onReorder={(reordered) => setDashboardItems(prev => {
                      const byId = new Map(prev.map(i => [i.id, i]));
                      return reordered.map(i => byId.get(i.id) ?? i);
                    })}
                    onRemove={handleRemoveFromDashboard}
                    onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
                    onDuplicate={handleDuplicate}
                    emptyAction={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button size="sm" onClick={() => setQuickAddOpen(true)} className="gap-1.5 text-sm h-9">
                          <Plus className="h-3.5 w-3.5" /> {t('quickAdd')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleResetLayout} className="gap-1.5 text-sm h-9">
                          <Sparkles className="h-3.5 w-3.5" /> {t('autoGenerate')}
                        </Button>
                      </div>
                    }
                  />
                </Suspense>
              </div>
              <div className="min-h-[100px]">
                <AdSlot slot="" label={t('sponsored')} />
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
                      onAdd={() => addSuggestionToDashboard(s)}
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

            {/* ═══════════════ BUILD TAB ═══════════════ */}
            <TabsContent value="build" className="space-y-4 mt-0">
              <div className="dashboard-surface p-4">
                <h2 className="text-base font-bold text-foreground">{t('build')}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{t('buildTabDesc')}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="elevated-card p-5 min-h-[300px]">
                  <Suspense fallback={<PanelFallback />}>
                    <ManualChartBuilder data={filteredData} columns={filteredColumns} onAddToDashboard={addToDashboard} />
                  </Suspense>
                </Card>
                <Card className="elevated-card p-5 min-h-[300px]">
                  <Suspense fallback={<PanelFallback />}>
                    <ColumnMerger columns={columns} onMerge={handleMerge} />
                  </Suspense>
                </Card>
              </div>
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
              {Object.keys(filters).length > 0 && filteredSuggestions.length > 0 && (
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

      {/* ─── Quick Add Panel ─── */}
      <Suspense fallback={null}>
        <QuickAddPanel
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          suggestions={filteredSuggestions}
          addedChartIds={addedChartIds}
          addedInsightIds={addedInsightIds}
          columns={filteredColumns}
          data={filteredData}
          onAddSuggestion={addSuggestionToDashboard}
          onAddCustomChart={addToDashboard}
          onAddInsight={addInsightToDashboard}
          onAddTable={addTableToDashboard}
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

            {/* More: Build + Filter + Clear file */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('moreTabs')}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                    (activeTab === 'build' || activeTab === 'filter') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {activeTab === 'build' ? t('build') : activeTab === 'filter' ? t('filter') : t('more')}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-44 mb-1">
                <DropdownMenuItem onClick={() => setActiveTab('build')} className="text-xs gap-2">
                  <Wrench className="h-3.5 w-3.5" /> {t('build')}
                  {activeTab === 'build' && <span className="ml-auto text-primary">✓</span>}
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
