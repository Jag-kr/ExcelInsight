"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Suspense, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { FileUpload } from '@/components/FileUpload';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { LandingContent } from '@/components/LandingContent';
import { AdSlot } from '@/components/AdSlot';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { useI18n } from '@/lib/i18n';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, Wrench, LayoutDashboard, Database, Filter, Lightbulb, FileDown, Plus,
  Sparkles, RotateCcw, Trash2, X, MoreHorizontal, ChevronLeft, ChevronRight,
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
import logo from '@/assets/ExcelInsight_Logo.png';
import { toast } from 'sonner';
import { trackEvent, getFileExt } from '@/lib/analytics';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

import { DataSummary } from '@/components/DataSummary';
import { DynamicChart } from '@/components/DynamicChart';
import { ManualChartBuilder } from '@/components/ManualChartBuilder';
import { ColumnMerger } from '@/components/ColumnMerger';
import { DashboardGrid } from '@/components/DashboardGrid';
import { DataFilter } from '@/components/DataFilter';
import { SmartInsights } from '@/components/SmartInsights';
import { QuickAddPanel } from '@/components/QuickAddPanel';
import { HeroDemoAnimation } from '@/components/HeroDemoAnimation';

const CHART_TYPE_ROTATION = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'horizontalBar'] as const;

function buildDefaultDashboard(
  newData: Record<string, any>[],
  cols: ColumnMeta[],
  charts: ChartSuggestion[],
  t: (key: any) => string
): { items: DashboardItem[]; usedChartIds: Set<string> } {
  const items: DashboardItem[] = [];
  const usedChartIds = new Set<string>();

  charts.slice(0, 3).forEach((c, i) => {
    items.push({
      id: c.id,
      title: c.title,
      description: c.description,
      type: CHART_TYPE_ROTATION[i % CHART_TYPE_ROTATION.length],
      data: c.data,
      dataKeys: c.dataKeys,
      xKey: c.xKey,
      size: i === 0 ? 'lg' : 'md',
    });
    usedChartIds.add(c.id);
  });

  const numericCols = cols.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats);
  if (numericCols.length > 0) {
    items.push({
      id: 'insight-stats-chart',
      title: t('columnStats'),
      description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'stats', insightContent: numericCols, size: 'lg',
    });
  }

  const repeating: any[] = [];
  cols.forEach(col => {
    if (col.type === 'id') return;
    const counts: Record<string, number> = {};
    newData.forEach(row => {
      const v = row[col.name];
      if (v !== null && v !== undefined && v !== '') counts[String(v)] = (counts[String(v)] || 0) + 1;
    });
    const entries = Object.entries(counts);
    const uniqueCount = entries.length;
    const totalCount = newData.length;
    const repetitionRatio = 1 - (uniqueCount / Math.max(totalCount, 1));
    if (repetitionRatio > 0.3 && uniqueCount <= 50 && uniqueCount >= 2) {
      repeating.push({
        name: col.name, uniqueCount, totalCount, repetitionRatio,
        topValues: entries.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({
          value, count, percentage: Math.round((count / totalCount) * 100),
        })),
      });
    }
  });
  repeating.sort((a, b) => b.repetitionRatio - a.repetitionRatio);
  repeating.slice(0, 2).forEach(col => {
    items.push({
      id: `insight-repeat-chart-${col.name}`,
      title: `${col.name}${t('repeatingValuesSuffix')}`, description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'repeating', insightContent: col,
    });
  });

  const quality = cols.map(c => ({
    name: c.name,
    completeness: Math.round(((c.totalCount - c.nullCount) / c.totalCount) * 100),
    nullCount: c.nullCount,
  })).filter(c => c.nullCount > 0);
  if (quality.length > 0) {
    items.push({
      id: 'insight-quality-chart', title: t('dataQuality'), description: '',
      type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType: 'quality', insightContent: quality,
    });
  }

  if (charts.length > 3) {
    const c = charts[3];
    items.push({
      id: c.id, title: c.title, description: c.description,
      type: CHART_TYPE_ROTATION[3 % CHART_TYPE_ROTATION.length],
      data: c.data, dataKeys: c.dataKeys, xKey: c.xKey,
    });
    usedChartIds.add(c.id);
  }

  return { items, usedChartIds };
}

const STORAGE_KEY = 'excelinsight-session-v1';

type PersistedSession = {
  data: Record<string, any>[];
  fileName: string;
  columns: ColumnMeta[];
  suggestions: ChartSuggestion[];
  dashboardItems: DashboardItem[];
  filters: Record<string, string>;
  addedChartIds: string[];
  addedInsightIds: string[];
  activeTab: string;
  sidebarCollapsed: boolean;
};

function loadSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

/* ─── Sidebar nav items ─── */
const SIDEBAR_ITEMS = [
  { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { value: 'explore',   icon: BarChart3,       label: 'Explore' },
  { value: 'insights',  icon: Lightbulb,       label: 'Insights' },
  { value: 'build',     icon: Wrench,          label: 'Build' },
  { value: 'filter',    icon: Filter,          label: 'Filter' },
  { value: 'data',      icon: Database,        label: 'Data' },
] as const;

/* ─── Mobile bottom nav (subset) ─── */
const MOBILE_TABS = [
  { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { value: 'explore',   icon: BarChart3,       label: 'Charts' },
  { value: 'insights',  icon: Lightbulb,       label: 'Insights' },
  { value: 'data',      icon: Database,        label: 'Data' },
] as const;

export default function Index() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initial = useMemo(() => loadSession(), []);
  const [data, setData] = useState<Record<string, any>[]>(() => initial?.data ?? []);
  const [fileName, setFileName] = useState(() => initial?.fileName ?? '');
  const [columns, setColumns] = useState<ColumnMeta[]>(() => initial?.columns ?? []);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>(() => initial?.suggestions ?? []);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>(() => initial?.dashboardItems ?? []);
  const [filters, setFilters] = useState<Record<string, string>>(() => initial?.filters ?? {});
  const [addedChartIds, setAddedChartIds] = useState<Set<string>>(() => new Set(initial?.addedChartIds ?? []));
  const [addedInsightIds, setAddedInsightIds] = useState<Set<string>>(() => new Set(initial?.addedInsightIds ?? []));
  const [activeTab, setActiveTab] = useState<string>(() => initial?.activeTab ?? 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => initial?.sidebarCollapsed ?? false);
  const [exporting, setExporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window === 'undefined') return;
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
  }, [data, fileName, columns, suggestions, dashboardItems, filters, addedChartIds, addedInsightIds, activeTab, sidebarCollapsed]);

  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    setFilters({});
    setAnalyzing(true);
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
  }, [t]);

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
    setData([]); setFileName(''); setColumns([]); setSuggestions([]);
    setDashboardItems([]); setFilters({});
    setAddedChartIds(new Set()); setAddedInsightIds(new Set());
    setActiveTab('dashboard');
    toast.success(t('clearFile'));
  }, [t]);

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
    if (!dashboardRef.current || !dashboardItems.length) { toast.error('Nothing to export'); return; }
    setExporting(true);
    const toastId = toast.loading(t('generatingPdf'));
    const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
    const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
    const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;
    try {
      const { exportDashboardToPDF } = await import('@/lib/pdf-export');
      await exportDashboardToPDF(dashboardRef.current, {
        appName: 'ExcelInsight', fileName,
        rowCount: filteredData.length, colCount: columns.length,
        chartCount, tableCount, insightCount, logoUrl: logo.src,
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
  }, [dashboardItems, fileName, columns.length, filteredData, t]);

  const availableSuggestions = useMemo(() =>
    filteredSuggestions.filter(s => !addedChartIds.has(s.id)),
    [filteredSuggestions, addedChartIds]
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
    }]);
    setAddedChartIds(prev => new Set(prev).add(s.id));
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
    setDashboardItems(prev => prev.filter(i => i.id !== id));
    setAddedChartIds(prev => {
      const next = new Set(prev);
      for (const baseId of next) { if (id.startsWith(baseId)) { next.delete(baseId); break; } }
      return next;
    });
    setAddedInsightIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  /* ─── ANALYZING SKELETON (Moved to Dashboard Shell) ─── */

  /* ─── LANDING PAGE ─── */
  if (!mounted || !data.length) {
    return (
      <div className="min-h-screen hero-gradient">
        <div className="absolute top-4 right-4 z-10">
          <ThemeLangSwitcher />
        </div>

        {/* Animated blob decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06] dark:opacity-[0.08]"
            style={{
              background: 'radial-gradient(circle, hsl(217, 91%, 60%), transparent 70%)',
              animation: 'blob-drift 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.05] dark:opacity-[0.07]"
            style={{
              background: 'radial-gradient(circle, hsl(262, 83%, 65%), transparent 70%)',
              animation: 'blob-drift 16s ease-in-out infinite reverse',
            }}
          />
        </div>

        <main className="relative">
          {/* ── Hero section — two-column split at lg+, stacked on mobile (R1, R2, R4, R6) ── */}
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-10 lg:pt-14 pb-6 lg:pb-10 hero-appear">

            {/* Two-column grid: left = copy + upload | right = demo (desktop only) */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">

              {/* ── LEFT column: identity + headline + upload ── */}
              <div className="space-y-5 text-center lg:text-left">

                {/* Row 1: logo icon + brand name + analytics badge — all inline (R2) */}
                <div className="flex items-center gap-3 justify-center lg:justify-start hero-appear-badge">
                  <img
                    src={logo.src}
                    alt="ExcelInsight logo"
                    width="36"
                    height="36"
                    fetchPriority="high"
                    decoding="async"
                    className="h-9 w-9 drop-shadow-md flex-shrink-0"
                  />
                  <span className="font-bold text-base gradient-text tracking-tight">ExcelInsight</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs text-primary font-medium">
                    <BarChart3 className="h-3 w-3" />
                    {t('analyticsEngine')}
                  </span>
                </div>

                {/* Headline — tighter size on left column (R2) */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text tracking-tight leading-[1.1] hero-appear-title">
                  {t('heroTitle')}
                </h1>

                {/* Subtext — single quotable claim (R3) */}
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed hero-appear-sub">
                  {t('uploadSubtitle')}
                </p>

                {/* Trust pills */}
                <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start hero-appear-pills">
                  {[t('badgePrivate'), t('badgeInstant'), t('badgeExport')].map((label) => (
                    <span key={label} className="stat-chip">{label}</span>
                  ))}
                </div>

                {/* Upload zone — zero delay, opacity only, interactive from frame 1 */}
                <div className="hero-appear-upload">
                  <FileUpload onDataLoaded={handleDataLoaded} />
                </div>
              </div>

              {/* ── RIGHT column: animated demo — desktop only, hidden on mobile (R5, R6) ── */}
              <div className="hidden lg:block hero-appear-feats">
                <HeroDemoAnimation />
              </div>
            </div>

            {/* Feature cards — full-width strip below the two-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl lg:max-w-none mx-auto text-center mt-8 lg:mt-10 hero-appear-feats">
              {[
                { icon: Database, label: t('smartDetection'), desc: t('smartDetectionDesc') },
                { icon: BarChart3, label: t('autoCharts'), desc: t('autoChartsDesc') },
                { icon: LayoutDashboard, label: t('dashboards'), desc: t('dashboardsDesc') },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="elevated-card p-4 text-center group hover:scale-[1.02] transition-transform duration-200">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <LandingContent />
        </main>
      </div>
    );
  }

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
          <p className="text-base font-semibold text-foreground">Analyzing your data…</p>
          <p className="text-sm text-muted-foreground">Building charts and insights</p>
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
              src={logo.src}
              alt="ExcelInsight"
              width="28"
              height="28"
              decoding="async"
              className="h-7 w-7 flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="font-bold gradient-text text-sm leading-none truncate animate-[fade-in_0.2s_ease-out]">
                {t('appName')}
              </span>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {SIDEBAR_ITEMS.map(({ value, icon: Icon, label }) => {
              const isActive = activeTab === value;
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
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`sidebar-nav-item ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              {sidebarCollapsed
                ? <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
                : <><PanelLeftClose className="h-4 w-4 flex-shrink-0" /><span className="text-xs">Collapse</span></>
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
                <img src={logo.src} alt="ExcelInsight" width="22" height="22" decoding="async" className="h-5 w-5 flex-shrink-0" />
              )}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold gradient-text hidden sm:inline">{t('appName')}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block" />
                <span className="text-xs font-medium text-foreground truncate max-w-[120px] sm:max-w-[260px]">
                  {activeItem?.label ?? 'Dashboard'}
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
                <span className="hidden sm:inline">{t('quickAdd') || 'Quick Add'}</span>
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

              {/* Dashboard overflow menu */}
              {activeTab === 'dashboard' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                      {t('workspace')}
                    </p>
                    <h2 className="text-lg font-bold text-foreground">{fileName || t('dashboard')}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {filteredData.length} {t('rows')} · {columns.length} {t('cols')} · {dashboardItems.length} cards
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="rounded-full border-0 bg-primary/10 px-2.5 py-1 text-[11px] text-primary font-medium">
                      {filteredData.length} {t('rows')}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full border-0 bg-accent/10 px-2.5 py-1 text-[11px] text-accent font-medium">
                      {columns.length} {t('cols')}
                    </Badge>
                    {dashboardItems.length > 0 && (
                      <Badge variant="secondary" className="rounded-full border-0 bg-success/10 px-2.5 py-1 text-[11px] text-success font-medium">
                        {dashboardItems.length} cards
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
                    items={dashboardItems}
                    onReorder={setDashboardItems}
                    onRemove={handleRemoveFromDashboard}
                    onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
                    onDuplicate={handleDuplicate}
                    emptyAction={
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button size="sm" onClick={() => setQuickAddOpen(true)} className="gap-1.5 text-sm h-9">
                          <Plus className="h-3.5 w-3.5" /> {t('quickAdd') || 'Quick Add'}
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
                <p className="text-sm text-muted-foreground mt-0.5">Auto-generated chart suggestions from your data</p>
              </div>
              {availableSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center min-h-[300px]">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{t('allChartsAdded')}</p>
                  <p className="text-sm text-muted-foreground">All suggested charts are already on your dashboard.</p>
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
                <p className="text-sm text-muted-foreground mt-0.5">Smart analysis of your data patterns and quality</p>
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
                <p className="text-sm text-muted-foreground mt-0.5">Create custom charts and transform your columns</p>
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
                <p className="text-sm text-muted-foreground mt-0.5">Filter rows by column values to focus your analysis</p>
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
                <p className="text-sm text-muted-foreground mt-0.5">Column statistics and raw data preview</p>
              </div>
              <Card className="elevated-card p-5 min-h-[200px]">
                <Suspense fallback={<PanelFallback />}>
                  <DataSummary columns={filteredColumns} rowCount={filteredData.length} />
                </Suspense>
              </Card>
              <Card className="elevated-card p-4 overflow-auto max-h-96 min-h-[300px]">
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
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-around h-14">
            {MOBILE_TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                aria-label={label}
                aria-current={activeTab === value ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}

            {/* More: Build + Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More tabs"
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                    (activeTab === 'build' || activeTab === 'filter') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {activeTab === 'build' ? 'Build' : activeTab === 'filter' ? 'Filter' : 'More'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-44 mb-1">
                <DropdownMenuItem onClick={() => setActiveTab('build')} className="text-xs gap-2">
                  <Wrench className="h-3.5 w-3.5" /> Build
                  {activeTab === 'build' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('filter')} className="text-xs gap-2">
                  <Filter className="h-3.5 w-3.5" /> Filter
                  {activeTab === 'filter' && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      )}
    </div>
    </>
  );
}
