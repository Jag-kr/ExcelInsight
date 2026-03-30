import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataSummary } from '@/components/DataSummary';
import { DynamicChart } from '@/components/DynamicChart';
import { ManualChartBuilder } from '@/components/ManualChartBuilder';
import { ColumnMerger } from '@/components/ColumnMerger';
import { DashboardGrid, DashboardItem } from '@/components/DashboardGrid';
import { analyzeColumns, generateChartSuggestions, mergeColumns, ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import { chartThemes } from '@/lib/chart-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Upload, Wrench, LayoutDashboard, Database } from 'lucide-react';

export default function Index() {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);

  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    const cols = analyzeColumns(newData);
    setColumns(cols);
    const charts = generateChartSuggestions(newData, cols);
    setSuggestions(charts);

    // Auto-populate dashboard with first few charts
    setDashboardItems(charts.slice(0, 4).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      data: c.data,
      dataKeys: c.dataKeys,
      xKey: c.xKey,
      theme: chartThemes[0],
    })));
  }, []);

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
  }, []);

  if (!data.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--gradient-glow)' }}>
        <div className="w-full max-w-xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
              <BarChart3 className="h-4 w-4" /> Analytics Engine
            </div>
            <h1 className="text-4xl font-bold gradient-text">DataLens</h1>
            <p className="text-muted-foreground">Upload any Excel file • Instant analytics • Custom dashboards</p>
          </div>
          <FileUpload onDataLoaded={handleDataLoaded} />
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Database, label: 'Smart Detection', desc: 'Auto-detects data types' },
              { icon: BarChart3, label: 'Auto Charts', desc: 'Generates insights' },
              { icon: LayoutDashboard, label: 'Dashboards', desc: 'Drag & drop builder' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card rounded-lg p-3">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-bold gradient-text">DataLens</span>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{fileName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{data.length} rows</span>
            <span>•</span>
            <span>{columns.length} cols</span>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-1" /> Auto Charts
            </TabsTrigger>
            <TabsTrigger value="build" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wrench className="h-4 w-4 mr-1" /> Build
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-1" /> Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardGrid
              items={dashboardItems}
              onReorder={setDashboardItems}
              onRemove={(id) => setDashboardItems(prev => prev.filter(i => i.id !== id))}
              onUpdateItem={(id, updates) => setDashboardItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))}
            />
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {suggestions.map(s => (
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
                    + Dashboard
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5">
                <ManualChartBuilder data={data} columns={columns} onAddToDashboard={addToDashboard} />
              </div>
              <div className="glass-card rounded-xl p-5">
                <ColumnMerger columns={columns} onMerge={handleMerge} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <DataSummary columns={columns} rowCount={data.length} />
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
                  {data.slice(0, 50).map((row, i) => (
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
