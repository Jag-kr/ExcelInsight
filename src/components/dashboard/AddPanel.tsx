import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { Search, BarChart3, Lightbulb, Wrench, Plus, Check, Sparkles, Type } from 'lucide-react';
import type { ChartSuggestion, ColumnMeta } from '@/lib/data-analyzer';
import type { ChartType } from '@/lib/chart-themes';
import { computeRepeatingColumns, computeDataQuality, kpiCardId, NUMERIC_KPI_AGGS, aggKey, type KpiSpec, type KpiAgg } from '@/lib/derive-dashboard-item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldsList } from './FieldsList';

const DynamicChart = dynamic(() => import('../DynamicChart').then(m => m.DynamicChart), {
  ssr: false,
  loading: () => (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg rounded-xl p-5 min-h-[200px]">
      <Skeleton className="h-5 w-1/3 mb-3" />
      <Skeleton className="h-[160px] w-full" />
    </Card>
  ),
});

type AddTab = 'fields' | 'suggestions' | 'metrics' | 'insights' | 'text';
/** Tabs whose cards the search box filters; Fields has its own search. */
const SEARCHABLE: AddTab[] = ['suggestions', 'metrics', 'insights'];

export interface AddPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ChartSuggestion[];
  addedChartIds: Set<string>;
  addedInsightIds: Set<string>;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  /** Names of calculated fields (fx icon in the field list). */
  calculated?: Set<string>;
  onAddSuggestion: (s: ChartSuggestion, type: ChartType) => void;
  onAddInsight: (card: { id: string; title: string; content: any; type: 'insight' }) => void;
  onAddKpi: (spec: KpiSpec, title: string) => void;
  onAddField: (col: ColumnMeta) => void;
  onAddSlicer: (col: ColumnMeta) => void;
  onNewField: () => void;
  onMergeColumns: () => void;
  onCustomChart: () => void;
  onAddText: () => void;
}

function SuggestionCard({
  suggestion,
  isAdded,
  onAdd,
}: {
  suggestion: ChartSuggestion;
  isAdded: boolean;
  onAdd: (type: ChartType) => void;
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
            onClick={() => onAdd(chartType)}
            className="h-7 text-xs gap-1 shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3" /> {t('add')}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Every KpiAgg has an i18n key of the same name except `distinct`. */
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

/** The "Added" check or the hover "Add" button of a list row (metrics, insights). */
function RowAction({ added, onAdd }: { added: boolean; onAdd: () => void }) {
  const { t } = useI18n();
  return added ? (
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
      onClick={onAdd}
    >
      <Plus className="h-3 w-3 mr-0.5" /> {t('add')}
    </Button>
  );
}

function SuggestionsTab({ suggestions, addedChartIds, searchQuery, onAdd }: {
  suggestions: ChartSuggestion[];
  addedChartIds: Set<string>;
  searchQuery: string;
  onAdd: (s: ChartSuggestion, type: ChartType) => void;
}) {
  const { t } = useI18n();

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

  return (
    <>
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
              onAdd={type => onAdd(s, type)}
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
    </>
  );
}

function MetricsTab({ columns, addedInsightIds, searchQuery, onAddKpi }: {
  columns: ColumnMeta[];
  addedInsightIds: Set<string>;
  searchQuery: string;
  onAddKpi: (spec: KpiSpec, title: string) => void;
}) {
  const { t } = useI18n();

  const numericCols = useMemo(
    () => columns.filter(c => (c.type === 'numeric' || c.type === 'range') && c.stats),
    [columns]
  );

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

  return (
    <>
      <p className="text-[10px] text-muted-foreground mb-2">{t('metricsDesc')}</p>
      <div className="space-y-2">
        {filteredMetrics.map(m => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
          >
            <span className="text-xs font-medium text-foreground truncate">{m.title}</span>
            <RowAction added={m.added} onAdd={() => onAddKpi(m.spec, m.title)} />
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border/30">
        <MetricBuilder columns={columns} onAdd={onAddKpi} />
      </div>
    </>
  );
}

function InsightsTab({ columns, data, addedInsightIds, searchQuery, onAddInsight }: {
  columns: ColumnMeta[];
  data: AddPanelProps['data'];
  addedInsightIds: Set<string>;
  searchQuery: string;
  onAddInsight: AddPanelProps['onAddInsight'];
}) {
  const { t } = useI18n();

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

  const filteredInsights = useMemo(() => {
    if (!searchQuery.trim()) return insightItems;
    const q = searchQuery.toLowerCase();
    return insightItems.filter(i => i.title.toLowerCase().includes(q));
  }, [insightItems, searchQuery]);

  return (
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
          <RowAction added={item.added} onAdd={item.onAdd} />
        </div>
      ))}
      {filteredInsights.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t('noMatchingInsights')}
        </p>
      )}
    </div>
  );
}

/**
 * The one place to add things to the board: fields, suggested charts, metrics,
 * insights and text. Stays open after an add, so several can go in a row.
 */
export function AddPanel({
  open,
  onOpenChange,
  suggestions,
  addedChartIds,
  addedInsightIds,
  columns,
  data,
  calculated,
  onAddSuggestion,
  onAddInsight,
  onAddKpi,
  onAddField,
  onAddSlicer,
  onNewField,
  onMergeColumns,
  onCustomChart,
  onAddText,
}: AddPanelProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  // Kept while the panel is mounted (it is, closed or not), so reopening lands on the last tab.
  const [tab, setTab] = useState<AddTab>('fields');
  const [searchQuery, setSearchQuery] = useState('');

  // The sheet covers the board, so these adds (which have no "Added" marker here) confirm with a toast.
  const confirm = (title: string) => toast.success(`${d('addedToBoard')}: ${title}`);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{d('addPanelTitle')}</SheetTitle>
          <SheetDescription>{d('addPanelDesc')}</SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={v => setTab(v as AddTab)}>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 pb-3 pr-12 space-y-3">
            <h2 aria-hidden className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Plus className="h-4 w-4 text-primary" />
              {d('addPanelTitle')}
            </h2>
            <TabsList className="flex h-9 w-full justify-start overflow-x-auto">
              {(['fields', 'suggestions', 'metrics', 'insights', 'text'] as const).map(value => (
                <TabsTrigger key={value} value={value} className="shrink-0 px-2.5 py-1 text-xs">
                  {value === 'fields' ? d('fields') : value === 'suggestions' ? d('suggestionsTab') : t(value)}
                </TabsTrigger>
              ))}
            </TabsList>
            {SEARCHABLE.includes(tab) && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('searchChartsInsights')}
                  aria-label={t('searchChartsInsights')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm bg-secondary/50 border-border/50"
                />
              </div>
            )}
          </div>

          {/* Radix unmounts inactive tab content, so the suggestion previews only exist on their tab. */}
          <TabsContent value="fields" className="mt-0 space-y-4 p-4">
            <div className="space-y-1">
              <Button className="h-9 w-full gap-1.5 text-sm" onClick={onCustomChart}>
                <Wrench className="h-4 w-4" /> {t('customChart')}
              </Button>
              <p className="text-[11px] text-muted-foreground">{d('customChartHint')}</p>
            </div>
            <FieldsList
              columns={columns}
              calculated={calculated}
              onAddField={col => { onAddField(col); confirm(col.name); }}
              onAddSlicer={col => { onAddSlicer(col); confirm(col.name); }}
              onNewField={onNewField}
              onMergeColumns={onMergeColumns}
            />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-0 p-4">
            <SuggestionsTab suggestions={suggestions} addedChartIds={addedChartIds} searchQuery={searchQuery} onAdd={onAddSuggestion} />
          </TabsContent>

          <TabsContent value="metrics" className="mt-0 p-4">
            <MetricsTab columns={columns} addedInsightIds={addedInsightIds} searchQuery={searchQuery} onAddKpi={onAddKpi} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0 p-4">
            <InsightsTab columns={columns} data={data} addedInsightIds={addedInsightIds} searchQuery={searchQuery} onAddInsight={onAddInsight} />
          </TabsContent>

          <TabsContent value="text" className="mt-0 space-y-3 p-4">
            <p className="text-sm text-muted-foreground">{d('textTabHint')}</p>
            <Button className="h-9 w-full gap-1.5 text-sm" onClick={() => { onAddText(); confirm(d('addText')); }}>
              <Type className="h-4 w-4" /> {d('addText')}
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
