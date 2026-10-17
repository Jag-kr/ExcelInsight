// Pure model behind the free-form 12-column dashboard grid (no React, no react-grid-layout).
export const GRID_COLS = 12;
export interface GridPos { x: number; y: number; w: number; h: number }
export type CardSize = 'xs' | 'sm' | 'md' | 'lg';

const WIDTHS: Record<CardSize, number> = { xs: 3, sm: 4, md: 6, lg: 12 };
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const bottom = (l: Record<string, GridPos>) => Math.max(0, ...Object.values(l).map((p) => p.y + p.h));

export const widthForSize = (size: CardSize): number => WIDTHS[size];
export const sizeFromWidth = (w: number): CardSize => (w <= 3 ? 'xs' : w <= 4 ? 'sm' : w <= 6 ? 'md' : 'lg');
export const defaultHeight = (displayAs?: string): number =>
  displayAs === 'kpi' ? 2 : displayAs === 'slicer' || displayAs === 'text' ? 3 : 6;

/** Integer-snap and clamp into the grid; null when any field is not a finite number. */
function repair(p?: GridPos): GridPos | null {
  if (!p || ![p.x, p.y, p.w, p.h].every((n) => Number.isFinite(n))) return null;
  const w = clamp(Math.round(p.w), 1, GRID_COLS);
  return { x: clamp(Math.round(p.x), 0, GRID_COLS - w), y: Math.max(0, Math.round(p.y)), w, h: Math.max(1, Math.round(p.h)) };
}

export function presetLayout(
  items: { id: string; size?: CardSize; displayAs?: string; layout?: GridPos }[],
): Record<string, GridPos> {
  const out: Record<string, GridPos> = {};
  const fresh: typeof items = [];
  for (const it of items) {
    const p = repair(it.layout);
    if (p) out[it.id] = p;
    else fresh.push(it);
  }
  let x = 0, y = bottom(out), rowH = 0;
  for (const it of fresh) {
    const w = widthForSize(it.size ?? (it.displayAs === 'kpi' ? 'xs' : it.displayAs === 'slicer' ? 'sm' : 'md'));
    const h = defaultHeight(it.displayAs);
    if (x + w > GRID_COLS) { y += rowH; x = 0; rowH = 0; }
    out[it.id] = { x, y, w, h };
    x += w;
    rowH = Math.max(rowH, h);
  }
  return out;
}

/** Reading order (y, then x); ids without a layout go last in original order. */
export function sortByLayout<T extends { id: string }>(items: T[], layouts: Record<string, GridPos>): T[] {
  return [...items].sort((a, b) => {
    const pa = layouts[a.id], pb = layouts[b.id];
    if (!pa || !pb) return Number(!pa) - Number(!pb);
    return pa.y - pb.y || pa.x - pb.x;
  });
}

export const placeAtBottom = (layouts: Record<string, GridPos>, w: number, h: number): GridPos =>
  ({ x: 0, y: bottom(layouts), w: clamp(Math.round(w), 1, GRID_COLS), h });

export function layoutChanged(a: Record<string, GridPos>, b: Record<string, GridPos>): boolean {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return true;
  return ka.some((k) => {
    const p = a[k], q = b[k];
    return !q || p.x !== q.x || p.y !== q.y || p.w !== q.w || p.h !== q.h;
  });
}
