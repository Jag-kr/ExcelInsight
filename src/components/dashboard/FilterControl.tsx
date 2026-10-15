import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ColumnMeta } from '@/lib/data-analyzer';
import { filterKindFor, type Filter } from '@/lib/filters';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';

const LABEL = 'mb-1 block text-xs text-muted-foreground truncate';
const INPUT = 'h-9 bg-secondary border-border text-sm';
const MAX_SHOWN = 200;

type Props = {
  column: ColumnMeta;
  /** Candidate values for an `in` filter (distinct, already sorted). */
  values?: string[];
  filter?: Filter;
  onChange: (f: Filter | null) => void;
};

/**
 * One filter editor, picked by the column's type.
 *
 * An `in` filter never matches blank cells (the pre-typed filter matched the
 * string 'null'); that is intentional, blank is not a value to pick.
 */
export function FilterControl({ column, values = [], filter, onChange }: Props) {
  const kind = filterKindFor(column);
  if (kind === 'in') return <InFilter column={column} values={values} filter={filter?.kind === 'in' ? filter : undefined} onChange={onChange} />;
  if (kind === 'range') return <RangeFilter column={column} filter={filter?.kind === 'range' ? filter : undefined} onChange={onChange} />;
  if (kind === 'date') return <DateFilter column={column} filter={filter?.kind === 'date' ? filter : undefined} onChange={onChange} />;
  return null;
}

function InFilter({ column, values, filter, onChange }: { column: ColumnMeta; values: string[]; filter?: Extract<Filter, { kind: 'in' }>; onChange: Props['onChange'] }) {
  const { t } = useI18n();
  const d = useDashboardT();
  const id = useId();
  const [query, setQuery] = useState('');
  const selected = useMemo(() => new Set(filter?.values), [filter]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? values.filter(v => v.toLowerCase().includes(q)) : values;
  }, [values, query]);

  const commit = (next: Set<string>) => onChange(next.size ? { kind: 'in', values: [...next] } : null);
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (!next.delete(v)) next.add(v);
    commit(next);
  };

  return (
    <div>
      <span id={id} className={LABEL}>{column.name}</span>
      <Popover onOpenChange={open => { if (!open) setQuery(''); }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-labelledby={`${id} ${id}-v`}
            className={`${INPUT} w-full justify-between font-normal`}
          >
            <span id={`${id}-v`} className="truncate">
              {selected.size ? `${selected.size} ${d('selected')}` : t('allValues')}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(18rem,calc(100vw-2rem))] space-y-2 p-3">
          <Input
            type="search"
            aria-label={d('searchValues')}
            placeholder={d('searchValues')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={INPUT}
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => commit(new Set([...selected, ...matches]))}>
              {d('selectAll')}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={!selected.size} onClick={() => onChange(null)}>
              {d('clearSelection')}
            </Button>
          </div>
          <ul className="max-h-[240px] overflow-y-auto">
            {matches.slice(0, MAX_SHOWN).map(v => (
              <li key={v}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-secondary">
                  <input
                    type="checkbox"
                    checked={selected.has(v)}
                    onChange={() => toggle(v)}
                    className="h-4 w-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                  <span className="truncate">{v}</span>
                </label>
              </li>
            ))}
          </ul>
          {matches.length > MAX_SHOWN && <p className="text-xs text-muted-foreground">{d('refineSearch')}</p>}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Number box that edits locally and commits on blur/Enter; unparsable text reverts. */
function BoundInput({ label, value, placeholder, onCommit }: { label: string; value?: number; placeholder?: number; onCommit: (n: number | undefined) => void }) {
  const id = useId();
  const shown = value === undefined ? '' : String(value);
  const [text, setText] = useState(shown);
  // Cleared or changed from outside (Clear all, undo): show it.
  useEffect(() => setText(shown), [shown]);
  const commit = () => {
    const trimmed = text.trim();
    const n = trimmed === '' ? undefined : Number(trimmed);
    if (n !== undefined && !Number.isFinite(n)) return setText(shown);
    setText(n === undefined ? '' : String(n));
    if (n !== value) onCommit(n);
  };
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={text}
        placeholder={placeholder === undefined ? undefined : String(placeholder)}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className={INPUT}
      />
    </div>
  );
}

function RangeFilter({ column, filter, onChange }: { column: ColumnMeta; filter?: Extract<Filter, { kind: 'range' }>; onChange: Props['onChange'] }) {
  const { t } = useI18n();
  const set = (patch: { min?: number | undefined } | { max?: number | undefined }) => {
    const next = { kind: 'range' as const, min: filter?.min, max: filter?.max, ...patch };
    onChange(next.min === undefined && next.max === undefined ? null : next);
  };
  return (
    <fieldset className="min-w-0">
      <legend className={LABEL}>{column.name}</legend>
      <div className="flex gap-2">
        <BoundInput label={t('min')} value={filter?.min} placeholder={column.stats?.min} onCommit={min => set({ min })} />
        <BoundInput label={t('max')} value={filter?.max} placeholder={column.stats?.max} onCommit={max => set({ max })} />
      </div>
    </fieldset>
  );
}

function DateInput({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | undefined) => void }) {
  const id = useId();
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input id={id} type="date" value={value ?? ''} onChange={e => onChange(e.target.value || undefined)} className={INPUT} />
    </div>
  );
}

function DateFilter({ column, filter, onChange }: { column: ColumnMeta; filter?: Extract<Filter, { kind: 'date' }>; onChange: Props['onChange'] }) {
  const d = useDashboardT();
  const set = (patch: { from?: string | undefined } | { to?: string | undefined }) => {
    const next = { kind: 'date' as const, from: filter?.from, to: filter?.to, ...patch };
    onChange(next.from === undefined && next.to === undefined ? null : next);
  };
  return (
    <fieldset className="min-w-0">
      <legend className={LABEL}>{column.name}</legend>
      <div className="flex gap-2">
        <DateInput label={d('from')} value={filter?.from} onChange={from => set({ from })} />
        <DateInput label={d('to')} value={filter?.to} onChange={to => set({ to })} />
      </div>
    </fieldset>
  );
}
