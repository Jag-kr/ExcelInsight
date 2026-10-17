import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FunctionSquare, Pencil, Trash2 } from 'lucide-react';
import { type ColumnMeta, validateFieldName } from '@/lib/data-analyzer';
import { previewFormula } from '@/lib/formula';
import { type CalcField, validateEditedField } from '@/lib/calc-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { useDashboardT } from '@/lib/i18n/dashboard';

const LABEL = 'mb-1 block text-xs text-muted-foreground';
const ERROR = 'mt-1 text-xs text-destructive';
const MAX_FORMULA = 500;

type Result = { ok: true } | { ok: false; error: string };

export interface CalcFieldDialogProps {
  columns: ColumnMeta[];
  data: Record<string, unknown>[];
  /** The calculated fields added so far, in definition order. */
  fields: CalcField[];
  onAdd: (name: string, formula: string) => Result;
  onEdit: (name: string, formula: string) => Result;
  onDelete: (name: string) => Result;
  onDone: () => void;
}

/** Up to 4 decimals, trailing zeros trimmed; null shows as an em dash. */
const show = (v: number | null) => (v === null ? '—' : String(+v.toFixed(4)));

export function CalcFieldDialog({ columns, data, fields, onAdd, onEdit, onDelete, onDone }: CalcFieldDialogProps) {
  const { t } = useI18n();
  const d = useDashboardT();
  const uid = useId();
  const [name, setName] = useState('');
  const [formula, setFormula] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Name of the field being edited (null = adding) and the error of a refused delete.
  const [editingName, setEditingName] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  const allNames = useMemo(() => columns.map(c => c.name), [columns]);
  // A field that vanished (undo while editing) ends edit mode.
  const editIdx = editingName === null ? -1 : fields.findIndex(f => f.name === editingName);
  const editing = editIdx >= 0 ? editingName : null;
  // Columns the formula may use: when editing, only base columns and the fields before the edited one.
  const names = useMemo(() => {
    if (editIdx < 0) return allNames;
    const later = new Set(fields.slice(editIdx).map(f => f.name));
    return allNames.filter(n => !later.has(n));
  }, [allNames, fields, editIdx]);
  const baseNames = useMemo(() => allNames.filter(n => !fields.some(f => f.name === n)), [allNames, fields]);
  const nameError = !editing && name.trim() ? validateFieldName(name, allNames) : null;
  const typed = formula.trim() !== '';
  const preview = useMemo(() => previewFormula(formula, names, data, 5), [formula, names, data]);
  const formulaError = typed && preview.error
    ? `${preview.error.message} (at character ${preview.error.pos + 1})`
    : null;
  const canAdd = editing
    ? typed && validateEditedField(baseNames, fields, editing, formula) === null
    : !!name.trim() && !validateFieldName(name, allNames) && typed && !preview.error;
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

  const reset = () => {
    setEditingName(null);
    setName('');
    setFormula('');
    setSubmitError(null);
  };

  useEffect(() => {
    if (editingName !== null && editIdx < 0) reset();
  }, [editingName, editIdx]);

  const startEdit = (f: CalcField) => {
    setEditingName(f.name);
    setName(f.name);
    setFormula(f.formula);
    setSubmitError(null);
    setListError(null);
    caret.current = f.formula.length;
  };

  const remove = (fieldName: string) => {
    const r = onDelete(fieldName);
    setListError('error' in r ? r.error : null);
  };

  const submit = () => {
    if (!canAdd) return;
    const r = editing ? onEdit(editing, formula) : onAdd(name.trim(), formula);
    if ('error' in r) { setSubmitError(r.error); return; }
    reset();
    if (!editing) onDone();
  };

  return (
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); submit(); }}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FunctionSquare className="h-4 w-4 text-primary" aria-hidden="true" /> {editing ? d('editFormula') : d('newField')}
      </h3>

      <div>
        <label htmlFor={`${uid}-name`} className={LABEL}>{d('fieldName')}</label>
        <Input
          id={`${uid}-name`}
          value={name}
          maxLength={80}
          autoComplete="off"
          readOnly={!!editing}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? `${uid}-name-err` : editing ? `${uid}-name-hint` : undefined}
          onChange={e => { setName(e.target.value); setSubmitError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); formulaRef.current?.focus(); } }}
          className="h-9 bg-secondary border-border text-sm"
        />
        {nameError && <p id={`${uid}-name-err`} role="alert" className={ERROR}>{nameError}</p>}
        {editing && <p id={`${uid}-name-hint`} className="mt-1 break-words text-xs text-muted-foreground">{d('nameLocked')}</p>}
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
          {columns.filter(c => names.includes(c.name)).map(c => (
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

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={!canAdd}>
          <FunctionSquare className="mr-1 h-4 w-4" aria-hidden="true" /> {editing ? d('saveChanges') : d('addField')}
        </Button>
        {editing && <Button type="button" size="sm" variant="ghost" onClick={reset}>{t('cancel')}</Button>}
      </div>

      {fields.length > 0 && (
        <section aria-labelledby={`${uid}-fields`} className="border-t border-border pt-3">
          <h3 id={`${uid}-fields`} className="mb-2 text-sm font-semibold text-foreground">{d('yourFields')}</h3>
          <ul className="space-y-0.5">
            {fields.map(f => (
              <li key={f.name} className="flex items-center gap-1">
                <FunctionSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="truncate text-xs text-foreground" title={f.name}>{f.name}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground" title={f.formula}>{f.formula}</div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" title={`${d('editFormula')}: ${f.name}`} aria-label={`${d('editFormula')}: ${f.name}`} onClick={() => startEdit(f)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" title={`${d('deleteField')}: ${f.name}`} aria-label={`${d('deleteField')}: ${f.name}`} onClick={() => remove(f.name)}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          {listError && <p role="alert" className={ERROR}>{listError}</p>}
        </section>
      )}
    </form>
  );
}
