import { useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { LandingContent } from '@/components/LandingContent';
import { AdSlot } from '@/components/AdSlot';
import { SEO } from '@/components/SEO';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { chartThemes } from '@/lib/chart-themes';
import { useI18n } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Wrench, LayoutDashboard, Database, Filter, Lightbulb, FileDown, Plus, Sparkles, RotateCcw, Trash2 } from 'lucide-react';
import logo from '@/assets/ExcelInsight_Logo.png';
import { toast } from 'sonner';
import type { DashboardItem } from '@/components/DashboardGrid';

// Lazy-load heavy components (recharts, drag-and-drop, pdf libs) so they don't block initial paint.
const DataSummary = lazy(() => import('@/components/DataSummary').then(m => ({ default: m.DataSummary })));
const DynamicChart = lazy(() => import('@/components/DynamicChart').then(m => ({ default: m.DynamicChart })));
const ManualChartBuilder = lazy(() => import('@/components/ManualChartBuilder').then(m => ({ default: m.ManualChartBuilder })));
const ColumnMerger = lazy(() => import('@/components/ColumnMerger').then(m => ({ default: m.ColumnMerger })));
const DashboardGrid = lazy(() => import('@/components/DashboardGrid').then(m => ({ default: m.DashboardGrid })));
const DataFilter = lazy(() => import('@/components/DataFilter').then(m => ({ default: m.DataFilter })));
const SmartInsights = lazy(() => import('@/components/SmartInsights').then(m => ({ default: m.SmartInsights })));

const ChartFallback = () => (
  <div className="glass-card rounded-xl p-5 min-h-[300px]">
    <Skeleton className="h-5 w-1/3 mb-3" />
    <Skeleton className="h-[240px] w-full" />
  </div>
);

const PanelFallback = () => (
  <div className="glass-card rounded-xl p-5 min-h-[300px] space-y-3">
    <Skeleton className="h-5 w-1/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

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
      theme: chartThemes[i % chartThemes.length],
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
      theme: chartThemes[3 % chartThemes.length],
    });
    usedChartIds.add(c.id);
  }

  return { items, usedChartIds };
}

export default function Index() {
  const { t } = useI18n();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [addedChartIds, setAddedChartIds] = useState<Set<string>>(new Set());
  const [addedInsightIds, setAddedInsightIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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
        logoUrl: logo,
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
      theme: chartThemes[0],
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

  if (!data.length) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
        <SEO path="/" />
        <div className="absolute top-4 right-4 z-10">
          <ThemeLangSwitcher />
        </div>
        <section className="w-full max-w-xl mx-auto px-6 pt-16 pb-12 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
              <BarChart3 className="h-4 w-4" /> {t('analyticsEngine')}
            </div>
            <img src={logo} alt="ExcelInsight logo" width="64" height="64" fetchPriority="high" decoding="async" className="h-16 w-16 mx-auto mb-2" />
            <h1 className="text-4xl font-bold gradient-text">{t('appName')}</h1>
            <p className="text-muted-foreground">{t('uploadSubtitle')}</p>
          </div>
          <FileUpload onDataLoaded={handleDataLoaded} />
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Database, label: t('smartDetection'), desc: t('smartDetectionDesc') },
              { icon: BarChart3, label: t('autoCharts'), desc: t('autoChartsDesc') },
              { icon: LayoutDashboard, label: t('dashboards'), desc: t('dashboardsDesc') },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card rounded-lg p-3">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <LandingContent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ExcelInsight" width="24" height="24" decoding="async" className="h-6 w-6" />
            <span className="font-bold gradient-text">{t('appName')}</span>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{fileName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

      <div className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 mr-1" /> {t('dashboard')}
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-1" /> {t('explore')}
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightbulb className="h-4 w-4 mr-1" /> {t('insights')}
            </TabsTrigger>
            <TabsTrigger value="build" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wrench className="h-4 w-4 mr-1" /> {t('build')}
            </TabsTrigger>
            <TabsTrigger value="filter" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Filter className="h-4 w-4 mr-1" /> {t('filter')}
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-1" /> {t('data')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 glass-card rounded-xl p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setActiveTab('build')} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {t('addChart')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('insights')} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> {t('addInsight')}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleResetLayout} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> {t('resetLayout')}
                </Button>
                {dashboardItems.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={handleClearAll} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> {t('clearAll')}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {dashboardItems.length} {t('cards')} ·{' '}
                  {dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length} {t('charts')} ·{' '}
                  {dashboardItems.filter(i => i.displayAs === 'table').length} {t('tables')} ·{' '}
                  {dashboardItems.filter(i => i.displayAs === 'insight').length} {t('insightsLabel')}
                </span>
                <Button
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={exporting || !dashboardItems.length}
                  className="gap-1.5"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {exporting ? t('generatingPdf') : t('exportPdf')}
                </Button>
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
                      <Button size="sm" onClick={handleResetLayout} className="gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> {t('autoGenerate')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('build')} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> {t('addChart')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('insights')} className="gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5" /> {t('browseInsights')}
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

          <TabsContent value="explore" className="space-y-4">
            {availableSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center min-h-[300px]">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('allChartsAdded')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableSuggestions.map(s => (
                  <div key={s.id} className="relative group min-h-[300px]">
                    <Suspense fallback={<ChartFallback />}>
                      <DynamicChart
                        title={s.title}
                        description={s.description}
                        type={s.type}
                        data={s.data}
                        dataKeys={s.dataKeys}
                        xKey={s.xKey}
                        theme={chartThemes[0]}
                        showControls={false}
                      />
                    </Suspense>
                    <button
                      onClick={() => addSuggestionToDashboard(s)}
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90"
                    >
                      {t('addToDashboard')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="glass-card rounded-xl p-5 min-h-[300px]">
              <Suspense fallback={<PanelFallback />}>
                <SmartInsights columns={filteredColumns} data={filteredData} onAddToDashboard={addInsightToDashboard} onAddTableToDashboard={addTableToDashboard} addedInsightIds={addedInsightIds} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5 min-h-[300px]">
                <Suspense fallback={<PanelFallback />}>
                  <ManualChartBuilder data={filteredData} columns={filteredColumns} onAddToDashboard={addToDashboard} />
                </Suspense>
              </div>
              <div className="glass-card rounded-xl p-5 min-h-[300px]">
                <Suspense fallback={<PanelFallback />}>
                  <ColumnMerger columns={columns} onMerge={handleMerge} />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filter" className="space-y-4">
            <div className="glass-card rounded-xl p-5 min-h-[250px]">
              <Suspense fallback={<PanelFallback />}>
                <DataFilter columns={columns} data={data} filters={filters} onFiltersChange={setFilters} />
              </Suspense>
            </div>
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
                        theme={chartThemes[0]}
                        showControls={false}
                      />
                    </Suspense>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="glass-card rounded-xl p-5 min-h-[200px]">
              <Suspense fallback={<PanelFallback />}>
                <DataSummary columns={filteredColumns} rowCount={filteredData.length} />
              </Suspense>
            </div>
            <div className="glass-card rounded-xl p-4 overflow-auto max-h-96 min-h-[300px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {columns.slice(0, 10).map(c => (
                      <th key={c.name} className="text-left p-2 text-muted-foreground font-medium">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                      {columns.slice(0, 10).map(c => (
                        <td key={c.name} className="p-2 text-foreground truncate max-w-[150px]">{String(row[c.name] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
