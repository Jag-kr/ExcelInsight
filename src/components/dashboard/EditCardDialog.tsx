import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getChartColor, getChartColorVar } from '@/lib/chart-themes';
import { useDashboardT } from '@/lib/i18n/dashboard';
import { DynamicChart } from '../DynamicChart';
import { ChartErrorBoundary } from '../ChartErrorBoundary';
import type { DashboardItem } from '../DashboardGrid';
import { CardSettings, type CardSettingsProps } from './CardSettings';

export interface EditCardDialogProps extends CardSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The card as the dashboard draws it right now (liveItems entry): data, series and KPI value included. */
  previewItem?: DashboardItem;
  /** Position of the card on the board: picks the KPI tint, as the card itself does. */
  previewIndex: number;
}

/* What the left side shows: a chart for chart cards, a big tile for KPI cards, nothing for the rest
   (repeating-values cards have no stand-alone rendering worth a preview: the settings take the window). */
function Preview({ item, index }: { item: DashboardItem; index: number }) {
  if (item.displayAs === 'kpi') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-md rounded-xl p-6" style={{ background: `hsl(${getChartColorVar(index)} / 0.12)` }}>
          <p className="truncate text-sm font-medium" style={{ color: getChartColor(index) }}>{item.title}</p>
          <p className="mt-2 truncate text-4xl font-bold leading-none tabular-nums text-foreground" title={item.kpiValue}>{item.kpiValue ?? '—'}</p>
        </div>
      </div>
    );
  }
  return (
    <ChartErrorBoundary title={item.title}>
      <DynamicChart
        title={item.title}
        description={item.description}
        type={item.type}
        data={item.data}
        dataKeys={item.dataKeys}
        xKey={item.xKey}
        showControls={false}
        fill
        stacked={!!item.spec && 'v' in item.spec && !!item.spec.stacked}
        format={item.format}
      />
    </ChartErrorBoundary>
  );
}

/** Centered edit window: live preview on one side, every setting of the card on the other. Full screen on phones. */
export function EditCardDialog({ open, onOpenChange, previewItem, previewIndex, ...settings }: EditCardDialogProps) {
  const d = useDashboardT();
  const { item } = settings.selected;
  const hasPreview = !!previewItem && (previewItem.displayAs === 'kpi' || !previewItem.displayAs || previewItem.displayAs === 'chart');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col gap-0 overflow-hidden p-0 h-dvh w-screen max-w-none rounded-none sm:rounded-none lg:rounded-xl ${
          hasPreview ? 'lg:h-[min(88vh,760px)] lg:w-[min(96vw,1100px)]' : 'lg:h-auto lg:max-h-[88vh] lg:w-[min(96vw,480px)]'}`}
      >
        <div className="shrink-0 border-b border-border px-4 py-3 pr-12">
          <DialogTitle className="truncate text-base leading-tight">{item.title}</DialogTitle>
          <DialogDescription className="sr-only">{d('editWindowDesc')}</DialogDescription>
        </div>

        <div className={`grid min-h-0 flex-1 ${hasPreview
          ? 'grid-rows-[minmax(180px,38%)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-1'
          : 'grid-rows-1'}`}>
          {hasPreview && previewItem && (
            <section aria-label={d('previewLabel')} className="min-h-0 min-w-0 border-b border-border bg-muted/30 p-3 lg:border-b-0 lg:border-r lg:p-4">
              <Preview item={previewItem} index={previewIndex} />
            </section>
          )}
          <div className="min-h-0 min-w-0 overflow-y-auto p-4">
            <CardSettings {...settings} />
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-border px-4 py-3">
          <Button size="sm" onClick={() => onOpenChange(false)}>{d('doneEditing')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
