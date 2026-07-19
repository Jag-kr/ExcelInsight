"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { FileUpload } from '@/components/FileUpload';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { LandingContent } from '@/components/LandingContent';
import { AdSlot } from '@/components/AdSlot';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { useI18n } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Wrench, LayoutDashboard, Database, Filter, Lightbulb, FileDown, Plus, Sparkles, RotateCcw, Trash2, X, MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/ExcelInsight_Logo.png';
import { toast } from 'sonner';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 shadow"
      >
        {addLabel}
      </button>
    </div>
  );
}

const ChartFallback = () => (
  <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[300px]">
    <Skeleton className="h-5 w-1/3 mb-3" />
    <Skeleton className="h-[240px] w-full" />
  </Card>
);

const PanelFallback = () => (
  <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[300px] space-y-3">
    <Skeleton className="h-5 w-1/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-32 w-full" />
  </Card>
);

// Lazy-load heavy components (recharts, drag-and-drop, pdf libs) so they don't block initial paint.
import { DataSummary } from '@/components/DataSummary';
import { DynamicChart } from '@/components/DynamicChart';
import { ManualChartBuilder } from '@/components/ManualChartBuilder';
import { ColumnMerger } from '@/components/ColumnMerger';
import { DashboardGrid } from '@/components/DashboardGrid';
import { DataFilter } from '@/components/DataFilter';
import { SmartInsights } from '@/components/SmartInsights';
import { QuickAddPanel } from '@/components/QuickAddPanel';

const CHART_TYPE_ROTATION = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'horizontalBar'] as const;

function buildDefaultDashboard(
  newData: Record<string, any>[],
  cols: ColumnMeta[],
  charts: ChartSuggestion[],
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
      title: 'Column Statistics',
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
      title: `${col.name} — Repeating Values`, description: '',
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
      id: 'insight-quality-chart', title: 'Data Quality', description: '',
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

/* ─── Mobile bottom navigation tabs ─── */
const MOBILE_TABS = [
  { value: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { value: 'explore', icon: BarChart3, label: 'Charts' },
  { value: 'insights', icon: Lightbulb, label: 'Insights' },
  { value: 'data', icon: Database, label: 'Data' },
] as const;

export default function Index() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [exporting, setExporting] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!data.length) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      const payload: PersistedSession = {
        data, fileName, columns, suggestions, dashboardItems, filters,
        addedChartIds: Array.from(addedChartIds),
        addedInsightIds: Array.from(addedInsightIds),
        activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Quota exceeded or non-serializable — fail silently.
      console.warn('Could not persist session', e);
    }
  }, [data, fileName, columns, suggestions, dashboardItems, filters, addedChartIds, addedInsightIds, activeTab]);

  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    setFilters({});
    const cols = analyzeColumns(newData);
    setColumns(cols);
    const charts = generateChartSuggestions(newData, cols);
    setSuggestions(charts);

    const { items, usedChartIds } = buildDefaultDashboard(newData, cols, charts);
    setDashboardItems(items);
    setAddedChartIds(usedChartIds);
    setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
  }, []);

  const handleResetLayout = useCallback(() => {
    const { items, usedChartIds } = buildDefaultDashboard(data, columns, suggestions);
    setDashboardItems(items);
    setAddedChartIds(usedChartIds);
    setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
    toast.success('Layout reset');
  }, [data, columns, suggestions]);

  const handleClearAll = useCallback(() => {
    setDashboardItems([]);
    setAddedChartIds(new Set());
    setAddedInsightIds(new Set());
  }, []);

  const handleClearFile = useCallback(() => {
    setData([]);
    setFileName('');
    setColumns([]);
    setSuggestions([]);
    setDashboardItems([]);
    setFilters({});
    setAddedChartIds(new Set());
    setAddedInsightIds(new Set());
    setActiveTab('dashboard');
    toast.success('File cleared');
  }, []);

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

  const handleExportPdf = useCallback(async () => {
    if (!dashboardRef.current || !dashboardItems.length) {
      toast.error('Nothing to export');
      return;
    }
    setExporting(true);
    const toastId = toast.loading(t('generatingPdf'));
    try {
      const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
      const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
      const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;
      const { exportDashboardToPDF } = await import('@/lib/pdf-export');
      await exportDashboardToPDF(dashboardRef.current, {
        appName: 'ExcelInsight',
        fileName,
        rowCount: filteredData.length,
        colCount: columns.length,
        chartCount, tableCount, insightCount,
        logoUrl: logo.src,
      });
      toast.success(t('pdfReady'), { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error(t('pdfFailed'), { id: toastId });
    } finally {
      setExporting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardItems, fileName, columns.length, t]);


  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return data;
    return data.filter(row =>
      Object.entries(filters).every(([col, val]) => String(row[col]) === val)
    );
  }, [data, filters]);

  const filteredColumns = useMemo(() => {
    if (!Object.keys(filters).length) return columns;
    return analyzeColumns(filteredData);
  }, [filteredData, columns, filters]);

  const filteredSuggestions = useMemo(() => {
    if (!Object.keys(filters).length) return suggestions;
    return generateChartSuggestions(filteredData, filteredColumns);
  }, [filteredData, filteredColumns, filters, suggestions]);

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
  }, []);

  const addSuggestionToDashboard = useCallback((s: ChartSuggestion) => {
    setDashboardItems(prev => [...prev, {
      id: `${s.id}-${Date.now()}`,
      title: s.title,
      description: s.description,
      type: s.type,
      data: s.data,
      dataKeys: s.dataKeys,
      xKey: s.xKey,
    }]);
    setAddedChartIds(prev => new Set(prev).add(s.id));
  }, []);

  const addInsightToDashboard = useCallback((card: { id: string; title: string; content: any; type: 'insight' }) => {
    const content = card.content;

    // Determine insight type
    let insightType: 'repeating' | 'stats' | 'quality' = 'stats';
    if (content && content.topValues && content.repetitionRatio !== undefined) {
      insightType = 'repeating';
    } else if (Array.isArray(content) && content.length > 0) {
      if (content[0]?.completeness !== undefined) {
        insightType = 'quality';
      } else if (content[0]?.stats) {
        insightType = 'stats';
      }
    }

    setDashboardItems(prev => [...prev, {
      id: card.id,
      title: card.title,
      description: '',
      type: 'bar',
      data: [],
      dataKeys: [],
      xKey: '',
      displayAs: 'insight',
      insightType,
      insightContent: content,
    }]);
    setAddedInsightIds(prev => new Set(prev).add(card.id));
  }, []);

  const addTableToDashboard = useCallback((card: { id: string; title: string; data: any[]; columns: string[] }) => {
    setDashboardItems(prev => [...prev, {
      id: card.id,
      title: card.title,
      description: '',
      type: 'bar',
      data: card.data,
      dataKeys: [],
      xKey: '',
      displayAs: 'table',
      tableColumns: card.columns,
    }]);
    setAddedInsightIds(prev => new Set(prev).add(card.id));
  }, []);

  const handleRemoveFromDashboard = useCallback((id: string) => {
    setDashboardItems(prev => prev.filter(i => i.id !== id));
    setAddedChartIds(prev => {
      const next = new Set(prev);
      for (const baseId of next) {
        if (id.startsWith(baseId)) { next.delete(baseId); break; }
      }
      return next;
    });
    setAddedInsightIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  if (!mounted || !data.length) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
          <ThemeLangSwitcher />
        </div>
        <main>
          <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-12 space-y-4 sm:space-y-6 animate-fade-in">
            <div className="dashboard-surface p-5 sm:p-7 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-primary mb-3 sm:mb-4">
                <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4" /> {t('analyticsEngine')}
              </div>
              <img src={logo.src} alt="ExcelInsight logo" width="64" height="64" fetchPriority="high" decoding="async" className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-2" />
              <h1 className="text-2xl sm:text-4xl font-bold gradient-text">ExcelInsight – Excel Charts &amp; Dashboards</h1>
              <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-base text-muted-foreground">{t('uploadSubtitle')}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-secondary/70 px-2.5 py-1">Private in browser</span>
                <span className="rounded-full bg-secondary/70 px-2.5 py-1">Instant charts</span>
                <span className="rounded-full bg-secondary/70 px-2.5 py-1">Export-ready dashboards</span>
              </div>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
              {[
                { icon: Database, label: t('smartDetection'), desc: t('smartDetectionDesc') },
                { icon: BarChart3, label: t('autoCharts'), desc: t('autoChartsDesc') },
                { icon: LayoutDashboard, label: t('dashboards'), desc: t('dashboardsDesc') },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="dashboard-panel rounded-xl p-2 sm:p-3">
                  <Icon className="h-4 sm:h-5 w-4 sm:w-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] sm:text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <LandingContent />
        </main>
      </div>
    );
  }

  const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
  const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
  const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-12 sm:h-14 px-2 sm:px-4 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={logo.src} alt="ExcelInsight" width="24" height="24" decoding="async" className="h-5 sm:h-6 w-5 sm:w-6 flex-shrink-0" />
            <span className="font-bold gradient-text hidden sm:inline text-sm lg:text-base">{t('appName')}</span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-secondary pl-1.5 sm:pl-2 pr-0.5 sm:pr-1 py-0.5 rounded min-w-0">
              <span className="truncate max-w-[80px] sm:max-w-[200px]">{fileName}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('clearFile')}
                    title={t('clearFile')}
                    className="inline-flex items-center justify-center h-4 w-4 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>{filteredData.length} {t('rows')}</span>
              <span>•</span>
              <span>{columns.length} {t('cols')}</span>
              {Object.keys(filters).length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-primary">{Object.keys(filters).length} {t('activeFilters')}</span>
                </>
              )}
            </div>
            <ThemeLangSwitcher />
          </div>
        </div>
      </header>

      <main className="container px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6">
        <Card className="dashboard-surface mb-4 sm:mb-5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Workspace</p>
              <h2 className="text-lg font-semibold text-foreground">{fileName || t('dashboard')}</h2>
              <p className="text-sm text-muted-foreground">
                {fileName
                  ? `${filteredData.length} ${t('rows')} • ${columns.length} ${t('cols')} • ${dashboardItems.length} ${t('dashboard')}`
                  : 'Upload a file to start building a polished dashboard.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full border-0 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                {filteredData.length} {t('rows')}
              </Badge>
              <Badge variant="secondary" className="rounded-full border-0 bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
                {columns.length} {t('cols')}
              </Badge>
              {dashboardItems.length > 0 && (
                <Badge variant="secondary" className="rounded-full border-0 bg-success/10 px-2.5 py-1 text-[11px] text-success">
                  {dashboardItems.length} cards
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* ─── Desktop Tabs ─── */}
          {!isMobile && (
            <TabsList className="bg-secondary border border-border flex-wrap h-auto gap-0.5 sm:gap-1 p-0.5 sm:p-1">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutDashboard className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('dashboard')}
                {dashboardItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-1.5 text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0 h-4 min-w-4 bg-primary/10 text-primary border-0">
                    {dashboardItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="explore" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('explore')}
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lightbulb className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('insights')}
              </TabsTrigger>
              <TabsTrigger value="build" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wrench className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('build')}
              </TabsTrigger>
              <TabsTrigger value="filter" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Filter className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('filter')}
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Database className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-1" /> {t('data')}
              </TabsTrigger>
            </TabsList>
          )}

          {/* ─── Mobile: hidden tab list (controlled by bottom nav) ─── */}
          {isMobile && (
            <div className="w-full">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-secondary border-border h-9 sm:h-10 text-xs sm:text-sm font-medium">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
                <SelectContent className="w-full sm:w-auto">
                  <SelectItem value="dashboard"><span className="flex items-center"><LayoutDashboard className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('dashboard')}</span></SelectItem>
                  <SelectItem value="explore"><span className="flex items-center"><BarChart3 className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('explore')}</span></SelectItem>
                  <SelectItem value="insights"><span className="flex items-center"><Lightbulb className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('insights')}</span></SelectItem>
                  <SelectItem value="build"><span className="flex items-center"><Wrench className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('build')}</span></SelectItem>
                  <SelectItem value="filter"><span className="flex items-center"><Filter className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('filter')}</span></SelectItem>
                  <SelectItem value="data"><span className="flex items-center"><Database className="h-3.5 sm:h-4 w-3.5 sm:w-4 mr-2" /> {t('data')}</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* ─── Enhanced Toolbar ─── */}
            <Card className="sticky top-[48px] sm:top-[56px] md:top-[57px] z-30 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 md:gap-3 bg-card/90 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-2 sm:p-2.5 md:p-3">
              {/* Primary actions */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2">
                <Button
                  size="sm"
                  onClick={() => setQuickAddOpen(true)}
                  className="gap-1 sm:gap-1.5 text-xs sm:text-sm shadow-sm h-8 sm:h-9"
                >
                  <Plus className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> <span className="hidden sm:inline">{t('quickAdd') || 'Quick Add'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportPdf}
                  disabled={exporting || !dashboardItems.length}
                  className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <FileDown className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                  <span className="hidden sm:inline">{exporting ? t('generatingPdf') : t('exportPdf')}</span>
                  <span className="sm:hidden text-xs">PDF</span>
                </Button>
              </div>

              {/* Stats + secondary actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {dashboardItems.length > 0 && (
                  <div className="hidden md:flex items-center gap-1">
                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-normal gap-0.5 px-1 sm:px-1.5 py-0.5 h-5 sm:h-6">
                      {chartCount} {t('charts')}
                    </Badge>
                    {tableCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-normal gap-0.5 px-1 sm:px-1.5 py-0.5 h-5 sm:h-6">
                        {tableCount} {t('tables')}
                      </Badge>
                    )}
                    {insightCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-normal gap-0.5 px-1 sm:px-1.5 py-0.5 h-5 sm:h-6">
                        {insightCount} {t('insightsLabel')}
                      </Badge>
                    )}
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                      <MoreHorizontal className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 sm:w-44">
                    <DropdownMenuItem onClick={handleResetLayout} className="text-xs sm:text-sm">
                      <RotateCcw className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-2" />
                      {t('resetLayout')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('build')} className="text-xs sm:text-sm">
                      <Wrench className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-2" />
                      {t('build')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('insights')} className="text-xs sm:text-sm">
                      <Lightbulb className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-2" />
                      {t('insights')}
                    </DropdownMenuItem>
                    {dashboardItems.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClearAll} className="text-xs sm:text-sm text-destructive focus:text-destructive">
                          <Trash2 className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-2" />
                          {t('clearAll')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>

            <div ref={dashboardRef} className="min-h-[400px]">
              <Suspense fallback={<ChartFallback />}>
                <DashboardGrid
                  items={dashboardItems}
                  onReorder={setDashboardItems}
                  onRemove={handleRemoveFromDashboard}
                  onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
                  onDuplicate={handleDuplicate}
                  emptyAction={
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                      <Button size="sm" onClick={() => setQuickAddOpen(true)} className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9">
                        <Plus className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> {t('quickAdd') || 'Quick Add'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleResetLayout} className="gap-1 sm:gap-1.5 text-xs sm:text-sm h-8 sm:h-9">
                        <Sparkles className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> {t('autoGenerate')}
                      </Button>
                    </div>
                  }
                />
              </Suspense>
            </div>
            <div className="min-h-[100px]">
              <AdSlot slot="" label="Sponsored" />
            </div>
          </TabsContent>

          {/* ═══════════════ EXPLORE TAB ═══════════════ */}
          <TabsContent value="explore" className="space-y-4">
            {availableSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center min-h-[300px]">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('allChartsAdded')}</p>
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
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[300px]">
              <Suspense fallback={<PanelFallback />}>
                <SmartInsights columns={filteredColumns} data={filteredData} onAddToDashboard={addInsightToDashboard} onAddTableToDashboard={addTableToDashboard} addedInsightIds={addedInsightIds} />
              </Suspense>
            </Card>
          </TabsContent>

          {/* ═══════════════ BUILD TAB ═══════════════ */}
          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[300px]">
                <Suspense fallback={<PanelFallback />}>
                  <ManualChartBuilder data={filteredData} columns={filteredColumns} onAddToDashboard={addToDashboard} />
                </Suspense>
              </Card>
              <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[300px]">
                <Suspense fallback={<PanelFallback />}>
                  <ColumnMerger columns={columns} onMerge={handleMerge} />
                </Suspense>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ FILTER TAB ═══════════════ */}
          <TabsContent value="filter" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[250px]">
              <Suspense fallback={<PanelFallback />}>
                <DataFilter columns={columns} data={data} filters={filters} onFiltersChange={setFilters} />
              </Suspense>
            </Card>
            {Object.keys(filters).length > 0 && filteredSuggestions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSuggestions.slice(0, 4).map(s => (
                  <div key={s.id} className="min-h-[300px]">
                    <Suspense fallback={<ChartFallback />}>
                      <DynamicChart
                        title={s.title}
                        description={s.description}
                        type={s.type}
                        data={s.data}
                        dataKeys={s.dataKeys}
                        xKey={s.xKey}
                        showControls={false}
                      />
                    </Suspense>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════ DATA TAB ═══════════════ */}
          <TabsContent value="data" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[200px]">
              <Suspense fallback={<PanelFallback />}>
                <DataSummary columns={filteredColumns} rowCount={filteredData.length} />
              </Suspense>
            </Card>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-4 overflow-auto max-h-96 min-h-[300px]">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    {columns.slice(0, 10).map(c => (
                      <TableHead key={c.name} className="font-medium">{c.name}</TableHead>
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

      {/* ─── Quick Add Panel (Sheet) ─── */}
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {MOBILE_TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  activeTab === value
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
