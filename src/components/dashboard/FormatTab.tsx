import { useEffect, useId, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorsByCategory, getChartPalette, useChartPalette } from '@/lib/chart-themes';
import { hslStringToRgb } from '@/lib/color-utils';
import { useTheme } from '@/lib/theme';
import { isDefaultFormat, patchFormat, type ChartFormat } from '@/lib/format';
import { useDashboardT, type DashboardKey } from '@/lib/i18n/dashboard';
import type { DashboardItem } from '../DashboardGrid';

const LABEL = 'mb-1 block text-xs text-muted-foreground';
const TRIGGER = 'bg-secondary border-border';
const INPUT = 'h-9 bg-secondary border-border text-sm';
const DEFAULT = '__default';

/** Text-like input that edits locally and commits on blur/Enter, so typing is one history entry. */
function CommitInput({ label, value, normalize = s => s.trim(), onCommit, className, ...rest }: {
  label: string;
  /** The committed value; edits are shown locally until blur/Enter. */
  value: string;
  /** Cleans the typed text; returning `value` rejects the edit. */
  normalize?: (text: string) => string;
  onCommit: (text: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'onKeyDown'>) {
  const id = useId();
  const [text, setText] = useState(value);
  // Undo/redo (or another card) changed the committed value: show it.
  useEffect(() => setText(value), [value]);
  const commit = () => {
    const next = normalize(text);
    setText(next);
    if (next !== value) onCommit(next);
  };
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <Input
        {...rest}
        id={id}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className={`${INPUT} ${className ?? ''}`}
      />
    </div>
  );
}

function Pick<V extends string>({ label, value, options, onChange }: {
  label: string;
  value: V;
  options: [V, string][];
  onChange: (v: V) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <Select value={value} onValueChange={v => onChange(v as V)}>
        <SelectTrigger id={id} className={TRIGGER}><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, text]) => <SelectItem key={v} value={v}>{text}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Colour picker that shows drags locally and commits once, on the native `change` (picker closed), so a drag is one undo entry. */
function ColorInput({ label, value, onCommit }: { label: string; value: string; onCommit: (hex: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  // React's onChange is the native `input` event (fires while dragging); `change` is the final value.
  useEffect(() => {
    const el = ref.current;
    const commit = () => el && onCommit(el.value);
    el?.addEventListener('change', commit);
    return () => el?.removeEventListener('change', commit);
  });
  return (
    <input
      ref={ref}
      type="color"
      aria-label={label}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      className="h-8 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-secondary p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

const hex = ([r, g, b]: number[]) => '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');

export interface FormatTabProps {
  item: DashboardItem;
  /** Series (data keys) the chart draws, derived from its spec; empty for KPI cards. */
  dataKeys?: string[];
  /** Rows the chart draws, to tell whether a single series is coloured per category. */
  rowCount?: number;
  /** Next format for the card; undefined clears it. */
  onChange: (format: ChartFormat | undefined) => void;
}

export function FormatTab({ item, dataKeys = [], rowCount = 0, onChange }: FormatTabProps) {
  const d = useDashboardT();
  const gridId = useId();
  const f = item.format;
  const kpi = item.displayAs === 'kpi';
  const set = (patch: Partial<ChartFormat>) => onChange(patchFormat(f, patch));
  const { theme } = useTheme();
  const { paletteId } = useChartPalette();
  const palette = getChartPalette(paletteId).colors[theme];
  // Scatter and pie colour per point/slice, and a lone series on a short bar chart per category: no per-series colour there.
  const isBar = item.type === 'bar' || item.type === 'horizontalBar';
  const showSeriesColors = !kpi && dataKeys.length > 0
    && (isBar || ['line', 'area', 'radar'].includes(item.type))
    && !(isBar && colorsByCategory(dataKeys.length, rowCount));
  const setSeriesColor = (key: string, color?: string) => {
    const { [key]: _drop, ...rest } = f?.seriesColors ?? {};
    const next = color ? { ...rest, [key]: color } : rest;
    set({ seriesColors: Object.keys(next).length ? next : undefined });
  };
  const hasAxes = !['pie', 'donut', 'radar'].includes(item.type);

  const numberOptions: [string, string][] = [
    // A chart's unset number already renders as "auto"; a KPI's unset renders compact.
    [DEFAULT, d(kpi ? 'formatDefault' : 'formatAuto')],
    ...(kpi ? [['auto', d('formatAuto')] as [string, string]] : []),
    ['compact', d('formatCompact')],
    ['percent', d('formatPercent')],
    ['currency', d('formatCurrency')],
  ];
  const legendKeys: [string, DashboardKey][] = [['top', 'legendTop'], ['bottom', 'legendBottom'], ['none', 'none']];
  const labelsValue = f?.dataLabels === undefined ? DEFAULT : f.dataLabels ? 'on' : 'off';

  return (
    <div className="space-y-3">
      <Pick
        label={d('numberFormat')}
        value={f?.number ?? DEFAULT}
        options={numberOptions}
        onChange={v => set({ number: v === DEFAULT ? undefined : (v as ChartFormat['number']) })}
      />
      <div className={f?.number === 'currency' ? 'grid grid-cols-2 gap-2' : undefined}>
        <CommitInput
          label={d('decimals')}
          type="number"
          inputMode="numeric"
          min={0}
          max={6}
          value={f?.decimals === undefined ? '' : String(f.decimals)}
          normalize={text => {
            const n = Math.round(Number(text));
            return text.trim() === '' || Number.isNaN(n) ? '' : String(Math.min(6, Math.max(0, n)));
          }}
          onCommit={text => set({ decimals: text === '' ? undefined : Number(text) })}
        />
        {f?.number === 'currency' && (
          <CommitInput
            label={d('currencyCode')}
            maxLength={3}
            placeholder="USD"
            autoCapitalize="characters"
            className="uppercase"
            value={f.currency ?? ''}
            normalize={text => {
              const code = text.trim().toUpperCase();
              return /^[A-Z]{3}$/.test(code) || code === '' ? code : f.currency ?? '';
            }}
            onCommit={text => set({ currency: text })}
          />
        )}
      </div>

      {!kpi && (
        <>
          <Pick
            label={d('dataLabels')}
            value={labelsValue}
            options={[[DEFAULT, d('formatAuto')], ['on', d('on')], ['off', d('off')]]}
            onChange={v => set({ dataLabels: v === DEFAULT ? undefined : v === 'on' })}
          />
          {item.type !== 'scatter' && (
            <Pick
              label={d('legend')}
              value={f?.legend ?? DEFAULT}
              options={[[DEFAULT, d('formatDefault')], ...legendKeys.map(([v, k]) => [v, d(k)] as [string, string])]}
              onChange={v => set({ legend: v === DEFAULT ? undefined : (v as ChartFormat['legend']) })}
            />
          )}
          {hasAxes && (
            <>
              <CommitInput label={d('xAxisTitle')} value={f?.xTitle ?? ''} onCommit={text => set({ xTitle: text })} />
              <CommitInput label={d('yAxisTitle')} value={f?.yTitle ?? ''} onCommit={text => set({ yTitle: text })} />
              <div className="flex items-center gap-2">
                <input
                  id={gridId}
                  type="checkbox"
                  checked={f?.gridlines !== false}
                  onChange={e => set({ gridlines: e.target.checked ? undefined : false })}
                  className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <label htmlFor={gridId} className="text-xs text-foreground">{d('gridlines')}</label>
              </div>
            </>
          )}
        </>
      )}

      {showSeriesColors && (
        <fieldset className="space-y-1.5">
          <legend className={LABEL}>{d('seriesColors')}</legend>
          {dataKeys.map((key, i) => {
            const custom = f?.seriesColors?.[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-xs text-foreground" title={key}>{key}</span>
                <ColorInput
                  label={`${d('seriesColor')}: ${key}`}
                  value={custom ?? hex(hslStringToRgb(palette[i % palette.length]))}
                  onCommit={c => setSeriesColor(key, c)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label={`${d('resetColor')}: ${key}`}
                  disabled={!custom}
                  onClick={() => setSeriesColor(key)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </fieldset>
      )}

      <Button variant="ghost" size="sm" className="h-8 w-full text-xs" disabled={isDefaultFormat(f)} onClick={() => onChange(undefined)}>
        {d('resetFormatting')}
      </Button>
    </div>
  );
}
