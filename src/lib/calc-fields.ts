import { validateFieldName } from './data-analyzer';
import { compileFormula } from './formula';

/** A calculated column stored as its definition; values are derived by applyCalcFields. */
export type CalcField = { name: string; formula: string };
type Row = Record<string, unknown>;

const describe = (e: { message: string; pos: number }) => `${e.message} (at character ${e.pos + 1})`;

/**
 * Rows with every field's column added, in order (later fields may read earlier ones).
 * Returns `rows` itself when there are no fields. A field that no longer compiles
 * (e.g. its source column is gone) yields a null column instead of throwing.
 */
export function applyCalcFields(rows: Row[], fields: CalcField[]): Row[] {
  if (fields.length === 0) return rows;
  const known = Object.keys(rows[0] ?? {});
  const evals = fields.map(f => {
    const c = compileFormula(f.formula, known);
    known.push(f.name);
    return 'error' in c ? () => null : c.evaluate;
  });
  return rows.map(row => {
    const out: Row = { ...row };
    fields.forEach((f, i) => { out[f.name] = evals[i](out); });
    return out;
  });
}

/** null = ok, otherwise why `name`/`formula` cannot be added as a new field after `fields`. */
export function validateNewField(baseColumns: string[], fields: CalcField[], name: string, formula: string): string | null {
  const cols = [...baseColumns, ...fields.map(f => f.name)];
  const bad = validateFieldName(name, cols);
  if (bad) return bad;
  const c = compileFormula(formula, cols);
  return 'error' in c ? describe(c.error) : null;
}

/** null = ok. The field keeps its name (renaming would break references) and may use only base columns and earlier fields. */
export function validateEditedField(baseColumns: string[], fields: CalcField[], name: string, formula: string): string | null {
  const i = fields.findIndex(f => f.name === name);
  if (i < 0) return 'Unknown field';
  const c = compileFormula(formula, [...baseColumns, ...fields.slice(0, i).map(f => f.name)]);
  return 'error' in c ? describe(c.error) : null;
}

/**
 * Later fields that stop compiling once `name` is gone, including indirect ones
 * (C uses B, B uses A: removing A reports B, and therefore C).
 */
export function dependentsOf(baseColumns: string[], fields: CalcField[], name: string): string[] {
  const i = fields.findIndex(f => f.name === name);
  if (i < 0) return [];
  const gone = new Set([name]);
  const out: string[] = [];
  const avail = [...baseColumns, ...fields.slice(0, i + 1).map(f => f.name)];
  for (const f of fields.slice(i + 1)) {
    const had = compileFormula(f.formula, avail);
    const has = compileFormula(f.formula, avail.filter(c => !gone.has(c)));
    if (!('error' in had) && 'error' in has) { out.push(f.name); gone.add(f.name); }
    avail.push(f.name);
  }
  return out;
}
