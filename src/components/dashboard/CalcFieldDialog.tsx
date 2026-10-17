import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FunctionSquare } from 'lucide-react';
import { type ColumnMeta, validateFieldName } from '@/lib/data-analyzer';
import { previewFormula } from '@/lib/formula';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboardT } from '@/lib/i18n/dashboard';

const LABEL = 'mb-1 block text-xs text-muted-foreground';
const ERROR = 'mt-1 text-xs text-destructive';
const MAX_FORMULA = 500;

export interface CalcFieldDialogProps {
  columns: ColumnMeta[];
  data: Record<string, unknown>[];
  onAdd: (name: string, formula: string) => { ok: true } | { ok: false; error: string };
  onDone: () => void;
}

/** Up to 4 decimals, trailing zeros trimmed; null shows as an em dash. */
const show = (v: number | null) => (v === null ? '—' : String(+v.toFixed(4)));

export function CalcFieldDialog({ columns, data, onAdd, onDone }: CalcFieldDialogProps) {
  const d = useDashboardT();
  const uid = useId();
  const [name, setName] = useState('');
  const [formula, setFormula] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  const names = useMemo(() => columns.map(c => c.name), [columns]);
  const nameError = name.trim() ? validateFieldName(name, names) : null;
  const typed = formula.trim() !== '';
  const preview = useMemo(() => previewFormula(formula, names, data, 5), [formula, names, data]);
  const formulaError = typed && preview.error
    ? `${preview.error.message} (at character ${preview.error.pos + 1})`
    : null;
  const canAdd = !!name.trim() && !validateFieldName(name, names) && typed && !preview.error;
  const shownError = submitError ?? formulaError;

  // Put the caret after an inserted column chip once React has rendered the new value.
  useEffect(() => {
    if (caret.current === null) return;
    formulaRef.current?.focus();
    formulaRef.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [formula]);

  const insert = (col: string) => {
    const el = formulaRef.current;
    const text = `[${col}]`;
    const start = el?.selectionStart ?? formula.length;
    const end = el?.selectionEnd ?? formula.length;
    const next = formula.slice(0, start) + text + formula.slice(end);
    if (next.length > MAX_FORMULA) return;
    caret.current = start + text.length;
    setFormula(next);
    setSubmitError(null);
  };

  const submit = () => {
    if (!canAdd) return;
    const r = onAdd(name.trim(), formula);
    if ('error' in r) { setSubmitError(r.error); return; }
    setName('');
    setFormula('');
    setSubmitError(null);
    onDone();
  };

  return (
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); submit(); }}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FunctionSquare className="h-4 w-4 text-primary" aria-hidden="true" /> {d('newField')}
      </h3>

      <div>
        <label htmlFor={`${uid}-name`} className={LABEL}>{d('fieldName')}</label>
        <Input
          id={`${uid}-name`}
          value={name}
          maxLength={80}
          autoComplete="off"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? `${uid}-name-err` : undefined}
          onChange={e => { setName(e.target.value); setSubmitError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); formulaRef.current?.focus(); } }}
          className="h-9 bg-secondary border-border text-sm"
        />
        {nameError && <p id={`${uid}-name-err`} role="alert" className={ERROR}>{nameError}</p>}
      </div>

      <div>
        <label htmlFor={`${uid}-formula`} className={LABEL}>{d('formula')}</label>
        <textarea
          id={`${uid}-formula`}
          ref={formulaRef}
          value={formula}
          rows={3}
          maxLength={MAX_FORMULA}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-invalid={!!shownError}
          aria-describedby={`${uid}-hint${shownError ? ` ${uid}-formula-err` : ''}`}
          onChange={e => { setFormula(e.target.value); setSubmitError(null); }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }}
          className="w-full resize-y rounded-md border border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {shownError && <p id={`${uid}-formula-err`} role="alert" className={ERROR}>{shownError}</p>}
        <p id={`${uid}-hint`} className="mt-1 break-words text-xs text-muted-foreground">{d('formulaHint')}</p>
      </div>

      <div>
        <span className={LABEL} id={`${uid}-chips`}>{d('insertColumn')}</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`${uid}-chips`}>
          {columns.map(c => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => insert(c.name)}
              className="max-w-full truncate rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {typed && !preview.error && (
        <div aria-live="polite">
          <span className={LABEL}>{d('preview')}</span>
          {preview.values.length === 0 ? (
            <p className="text-xs text-muted-foreground">{d('previewEmpty')}</p>
          ) : (
            <ol className="divide-y divide-border rounded-md border border-border text-xs">
              {preview.values.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-2 py-1">
                  <span className="text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 truncate font-mono tabular-nums text-foreground">{show(v)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <Button type="submit" size="sm" className="w-full" disabled={!canAdd}>
        <FunctionSquare className="mr-1 h-4 w-4" aria-hidden="true" /> {d('addField')}
      </Button>
    </form>
  );
}
