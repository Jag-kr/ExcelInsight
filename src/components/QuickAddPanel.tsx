import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import {
  ChevronDown, ChevronRight, Search, BarChart3, Lightbulb, Wrench,
  Plus, Check, Sparkles, Hash,
} from 'lucide-react';
import type { ChartSuggestion, ColumnMeta } from '@/lib/data-analyzer';
import type { DashboardItem } from './DashboardGrid';
import type { ChartType } from '@/lib/chart-themes';
import { computeRepeatingColumns, computeDataQuality, kpiCardId, NUMERIC_KPI_AGGS, type KpiSpec, type KpiAgg } from '@/lib/derive-dashboard-item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DynamicChart = dynamic(() => import('./DynamicChart').then(m => m.DynamicChart), {
  ssr: false,
  loading: () => (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[200px]">
      <Skeleton className="h-5 w-1/3 mb-3" />
      <Skeleton className="h-[160px] w-full" />
    </Card>
  ),
});

const ManualChartBuilder = dynamic(() => import('./ManualChartBuilder').then(m => m.ManualChartBuilder), {
  ssr: false,
  loading: () => (
    <Card className="bg-card/80 border-border/50 p-5 min-h-[200px]">
      <Skeleton className="h-5 w-1/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-32 w-full" />
    </Card>
  ),
});

interface QuickAddPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ChartSuggestion[];
  addedChartIds: Set<string>;
  addedInsightIds: Set<string>;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  onAddSuggestion: (s: ChartSuggestion) => void;
  onAddCustomChart: (chart: DashboardItem) => void;
  onAddInsight: (card: { id: string; title: string; content: any; type: 'insight' }) => void;
  onAddKpi: (spec: KpiSpec, title: string) => void;
  onAddTable: (card: { id: string; title: string; data: any[]; columns: string[] }) => void;
}

function SuggestionCard({
  suggestion,
  isAdded,
  onAdd,
}: {
  suggestion: ChartSuggestion;
  isAdded: boolean;
  onAdd: () => void;
}) {
  const { t } = useI18n();
  const [chartType, setChartType] = useState<ChartType>(suggestion.type);

  return (
    <div className="relative group rounded-lg overflow-hidden">
      <Suspense
        fallback={
          <Card className="bg-card/80 border-border/50 p-4 min-h-[180px]">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-[140px] w-full" />
          </Card>
        }
      >
        <DynamicChart
          title={suggestion.title}
          description={suggestion.description}
          type={chartType}
          data={suggestion.data}
          dataKeys={suggestion.dataKeys}
          xKey={suggestion.xKey}
          onChangeType={setChartType}
          size="sm"
        />
      </Suspense>
      <div className="absolute bottom-2 right-2 z-10">
        {isAdded ? (
          <Badge
            variant="secondary"
            className="gap-1 text-[10px] bg-success/20 text-success border-0 px-2 py-1"
          >
            <Check className="h-3 w-3" /> {t('added')}
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={onAdd}
            className="h-7 text-xs gap-1 shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3" /> {t('add')}
          </Button>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  count,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full py-2 px-1 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
            {count !== undefined && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {count}
              </Badge>
            )}
          </span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Every KpiAgg has an i18n key of the same name except `distinct`. */
const aggKey = (a: KpiAgg) => (a === 'distinct' ? 'distinctCount' : a) as Exclude<KpiAgg, 'distinct'> | 'distinctCount';

/** Pick a column + aggregation and drop the result on the board as a KPI tile. */
function MetricBuilder({ columns, onAdd }: { columns: ColumnMeta[]; onAdd: (spec: KpiSpec, title: string) => void }) {
  const { t } = useI18n();
  const [column, setColumn] = useState('__rows');
  const [agg, setAgg] = useState<KpiAgg>('count');

  const numericNames = new Set(
    columns.filter(c => c.type === 'numeric' || c.type === 'range').map(c => c.name)
  );
  const isNumeric = numericNames.has(column);
  // A text column has no sum; offering one would only produce a dash.
  const aggs: KpiAgg[] = column === '__rows' ? ['count'] : isNumeric ? [...NUMERIC_KPI_AGGS, 'count', 'distinct'] : ['count', 'distinct'];
  const effectiveAgg = aggs.includes(agg) ? agg : aggs[0];

  const spec: KpiSpec = { column: column === '__rows' ? null : column, agg: effectiveAgg };
  const title = spec.column ? `${t(aggKey(effectiveAgg))} · ${spec.column}` : t('rowCount');

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Select value={column} onValueChange={setColumn}>
          <SelectTrigger className="h-8 text-xs bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__rows">{t('rowCount')}</SelectItem>
            {columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={effectiveAgg} onValueChange={v => setAgg(v as KpiAgg)}>
          <SelectTrigger className="h-8 text-xs bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            {aggs.map(a => (
              <SelectItem key={a} value={a}>{t(aggKey(a))}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" className="w-full h-8 text-xs" onClick={() => onAdd(spec, title)}>
        <Plus className="h-3 w-3 mr-1" /> {t('addMetric')}
      </Button>
    </div>
  );
}

export function QuickAddPanel({
  open,
  onOpenChange,
  suggestions,
  addedChartIds,
  addedInsightIds,
  columns,
  data,
  onAddSuggestion,
  onAddCustomChart,
  onAddInsight,
  onAddKpi,
  onAddTable,
}: QuickAddPanelProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const availableSuggestions = useMemo(
    () => suggestions.filter(s => !addedChartIds.has(s.key)),
    [suggestions, addedChartIds]
  );

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return availableSuggestions;
    const q = searchQuery.toLowerCase();
    return availableSuggestions.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        s.type.toLowerCase().includes(q)
    );
  }, [availableSuggestions, searchQuery]);

  const addedSuggestions = useMemo(
    () => suggestions.filter(s => addedChartIds.has(s.key)),
    [suggestions, addedChartIds]
  );

  // Build insight data for the panel
  const numericCols = useMemo(
    () => columns.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats),
    [columns]
  );

  const repeatingColumns = useMemo(() => computeRepeatingColumns(columns, data), [columns, data]);
  const dataQuality = useMemo(() => computeDataQuality(columns), [columns]);

  const insightItems = useMemo(() => {
    const items: { id: string; title: string; icon: React.ElementType; type: string; added: boolean; onAdd: () => void }[] = [];

    if (numericCols.length > 0) {
      const id = 'insight-stats-chart';
      items.push({
        id,
        title: t('columnStats'),
        icon: BarChart3,
        type: 'stats',
        added: addedInsightIds.has(id),
        onAdd: () => onAddInsight({ id, title: t('columnStats'), type: 'insight', content: numericCols as any }),
      });
    }

    repeatingColumns.forEach((col: any) => {
      const id = `insight-repeat-chart-${col.name}`;
      items.push({
        id,
        title: `${col.name} — ${t('repeatingValues')}`,
        icon: Sparkles,
        type: 'repeating',
        added: addedInsightIds.has(id),
        onAdd: () => onAddInsight({ id, title: `${col.name} — ${t('repeatingValues')}`, type: 'insight', content: col }),
      });
    });

    if (dataQuality.length > 0) {
      const id = 'insight-quality-chart';
      items.push({
        id,
        title: t('dataQuality'),
        icon: Lightbulb,
        type: 'quality',
        added: addedInsightIds.has(id),
        onAdd: () => onAddInsight({ id, title: t('dataQuality'), type: 'insight', content: dataQuality }),
      });
    }

    return items;
  }, [numericCols, repeatingColumns, dataQuality, addedInsightIds, onAddInsight, t]);

  /* Suggested tiles: the row count plus one per numeric column, mirroring what
     auto-generate seeds — so a deleted tile is one click away from coming back. */
  const metricItems = useMemo(() => {
    const specs: KpiSpec[] = [
      { column: null, agg: 'count' },
      ...numericCols.map((c): KpiSpec => ({ column: c.name, agg: c.stats!.isSummable ? 'sum' : 'average' })),
    ];
    return specs.map(spec => {
      const id = kpiCardId(spec);
      const title = spec.column ? `${t(aggKey(spec.agg))} · ${spec.column}` : t('rowCount');
      return { id, title, spec, added: addedInsightIds.has(id) };
    });
  }, [numericCols, addedInsightIds, t]);

  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return metricItems;
    const q = searchQuery.toLowerCase();
    return metricItems.filter(m => m.title.toLowerCase().includes(q));
  }, [metricItems, searchQuery]);

  const filteredInsights = useMemo(() => {
    if (!searchQuery.trim()) return insightItems;
    const q = searchQuery.toLowerCase();
    return insightItems.filter(i => i.title.toLowerCase().includes(q));
  }, [insightItems, searchQuery]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md lg:max-w-lg overflow-y-auto p-0"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 pb-3">
          <SheetHeader className="mb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              {t('addToDashboardPanel')}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {t('addToDashboardPanelDesc')}
            </SheetDescription>
          </SheetHeader>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('searchChartsInsights')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary/50 border-border/50"
            />
          </div>
        </div>

        <div className="p-4 space-y-1">
          {/* Metrics Section */}
          <CollapsibleSection
            title={t('metrics')}
            icon={Hash}
            count={filteredMetrics.filter(m => !m.added).length}
            defaultOpen={true}
          >
            <p className="text-[10px] text-muted-foreground mb-2">{t('metricsDesc')}</p>
            <div className="space-y-2">
              {filteredMetrics.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <span className="text-xs font-medium text-foreground truncate">{m.title}</span>
                  {m.added ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-[10px] bg-success/20 text-success border-0 px-2 py-0.5 font-normal shrink-0"
                    >
                      <Check className="h-2.5 w-2.5" /> {t('added')}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                      onClick={() => onAddKpi(m.spec, m.title)}
                    >
                      <Plus className="h-3 w-3 mr-0.5" /> {t('add')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/30">
              <MetricBuilder columns={columns} onAdd={onAddKpi} />
            </div>
          </CollapsibleSection>

          <div className="border-t border-border/30" />

          {/* Suggested Charts Section */}
          <CollapsibleSection
            title={t('suggestedCharts')}
            icon={BarChart3}
            count={filteredSuggestions.length}
            defaultOpen={true}
          >
            {filteredSuggestions.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Check className="h-6 w-6 text-success mb-2" />
                <p className="text-xs text-muted-foreground">
                  {t('noSuggestionsLeft')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map(s => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    isAdded={addedChartIds.has(s.key)}
                    onAdd={() => onAddSuggestion(s)}
                  />
                ))}
              </div>
            )}

            {/* Show already-added suggestions as subtle badges */}
            {addedSuggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">
                  {t('alreadyOnDashboard')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {addedSuggestions.map(s => (
                    <Badge
                      key={s.id}
                      variant="secondary"
                      className="text-[10px] bg-secondary/80 text-muted-foreground gap-1 font-normal"
                    >
                      <Check className="h-2.5 w-2.5" />
                      {s.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>

          <div className="border-t border-border/30" />

          {/* Smart Insights Section */}
          <CollapsibleSection
            title={t('insights')}
            icon={Lightbulb}
            count={filteredInsights.filter(i => !i.added).length}
            defaultOpen={true}
          >
            <div className="space-y-2">
              {filteredInsights.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">{item.title}</span>
                  </div>
                  {item.added ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-[10px] bg-success/20 text-success border-0 px-2 py-0.5 font-normal shrink-0"
                    >
                      <Check className="h-2.5 w-2.5" /> {t('added')}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                      onClick={item.onAdd}
                    >
                      <Plus className="h-3 w-3 mr-0.5" /> {t('add')}
                    </Button>
                  )}
                </div>
              ))}
              {filteredInsights.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t('noMatchingInsights')}
                </p>
              )}
            </div>
          </CollapsibleSection>

          <div className="border-t border-border/30" />

          {/* Custom Chart Builder Section */}
          <CollapsibleSection
            title={t('customChart')}
            icon={Wrench}
            defaultOpen={false}
          >
            <Suspense
              fallback={
                <Card className="bg-card/80 border-border/50 p-4 min-h-[150px]">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-8 w-full" />
                </Card>
              }
            >
              <ManualChartBuilder
                data={data}
                columns={columns}
                onAddToDashboard={onAddCustomChart}
              />
            </Suspense>
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
