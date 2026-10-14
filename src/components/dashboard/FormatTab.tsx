import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export interface FormatTabProps {
  item: DashboardItem;
  /** Next format for the card; undefined clears it. */
  onChange: (format: ChartFormat | undefined) => void;
}

export function FormatTab({ item, onChange }: FormatTabProps) {
  const d = useDashboardT();
  const gridId = useId();
  const f = item.format;
  const kpi = item.displayAs === 'kpi';
  const set = (patch: Partial<ChartFormat>) => onChange(patchFormat(f, patch));
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

      <Button variant="ghost" size="sm" className="h-8 w-full text-xs" disabled={isDefaultFormat(f)} onClick={() => onChange(undefined)}>
        {d('resetFormatting')}
      </Button>
    </div>
  );
}
