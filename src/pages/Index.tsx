import { useState, useCallback, useMemo } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataSummary } from '@/components/DataSummary';
import { DynamicChart } from '@/components/DynamicChart';
import { ManualChartBuilder } from '@/components/ManualChartBuilder';
import { ColumnMerger } from '@/components/ColumnMerger';
import { DashboardGrid, DashboardItem } from '@/components/DashboardGrid';
import { DataFilter } from '@/components/DataFilter';
import { SmartInsights } from '@/components/SmartInsights';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import { LandingContent } from '@/components/LandingContent';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { chartThemes } from '@/lib/chart-themes';
import { useI18n } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Wrench, LayoutDashboard, Database, Filter, Lightbulb } from 'lucide-react';
import logo from '@/assets/ExcelInsight_Logo.png';

const CHART_TYPE_ROTATION = ['bar', 'line', 'area', 'pie', 'scatter', 'radar', 'horizontalBar'] as const;

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

  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    setFilters({});
    setAddedChartIds(new Set());
    setAddedInsightIds(new Set());
    const cols = analyzeColumns(newData);
    setColumns(cols);
    const charts = generateChartSuggestions(newData, cols);
    setSuggestions(charts);

    // Build a rich default dashboard with mixed content
    const items: DashboardItem[] = [];
    const usedChartIds = new Set<string>();

    // Add first 3 chart suggestions with varied types & themes
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

    // Auto-generate stats insight if numeric columns exist
    const numericCols = cols.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats);
    if (numericCols.length > 0) {
      const statsId = 'insight-stats-chart';
      items.push({
        id: statsId,
        title: 'Column Statistics',
        description: '',
        type: 'bar',
        data: [],
        dataKeys: [],
        xKey: '',
        displayAs: 'insight',
        insightType: 'stats',
        insightContent: numericCols,
        size: 'lg',
      });
    }

    // Auto-generate repeating value insights
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
      const id = `insight-repeat-chart-${col.name}`;
      items.push({
        id, title: `${col.name} — Repeating Values`, description: '',
        type: 'bar', data: [], dataKeys: [], xKey: '',
        displayAs: 'insight', insightType: 'repeating', insightContent: col,
      });
    });

    // Data quality insight
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

    // Add 4th chart if available
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

    setDashboardItems(items);
    setAddedChartIds(usedChartIds);
    setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
  }, []);

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
        <div className="absolute top-4 right-4 z-10">
          <ThemeLangSwitcher />
        </div>
        <section className="w-full max-w-xl mx-auto px-6 pt-16 pb-12 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
              <BarChart3 className="h-4 w-4" /> {t('analyticsEngine')}
            </div>
            <img src={logo} alt="ExcelInsight logo" className="h-16 mx-auto mb-2" />
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
            <img src={logo} alt="ExcelInsight" className="h-6" />
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
        <Tabs defaultValue="dashboard" className="space-y-6">
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
            <DashboardGrid
              items={dashboardItems}
              onReorder={setDashboardItems}
              onRemove={handleRemoveFromDashboard}
              onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
            />
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            {availableSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('allChartsAdded')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableSuggestions.map(s => (
                  <div key={s.id} className="relative group">
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
            <div className="glass-card rounded-xl p-5">
              <SmartInsights columns={filteredColumns} data={filteredData} onAddToDashboard={addInsightToDashboard} onAddTableToDashboard={addTableToDashboard} addedInsightIds={addedInsightIds} />
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5">
                <ManualChartBuilder data={filteredData} columns={filteredColumns} onAddToDashboard={addToDashboard} />
              </div>
              <div className="glass-card rounded-xl p-5">
                <ColumnMerger columns={columns} onMerge={handleMerge} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filter" className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <DataFilter columns={columns} data={data} filters={filters} onFiltersChange={setFilters} />
            </div>
            {Object.keys(filters).length > 0 && filteredSuggestions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSuggestions.slice(0, 4).map(s => (
                  <DynamicChart
                    key={s.id}
                    title={s.title}
                    description={s.description}
                    type={s.type}
                    data={s.data}
                    dataKeys={s.dataKeys}
                    xKey={s.xKey}
                    theme={chartThemes[0]}
                    showControls={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <DataSummary columns={filteredColumns} rowCount={filteredData.length} />
            </div>
            <div className="glass-card rounded-xl p-4 overflow-auto max-h-96">
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
