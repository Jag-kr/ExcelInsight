## Problem

In `DashboardGrid.tsx`, the size mapping is:
```
sm → col-span-1
md → col-span-1     ← identical to sm
lg → col-span-1 lg:col-span-2
```
On a 2-column grid, "Small" and "Medium" render at the exact same width, so the resize popover feels broken. Several other UX gaps make the builder feel less polished than the UI suggests.

## Fix: make sizes truly distinct (3-column grid)

Switch the dashboard grid from `lg:grid-cols-2` to `lg:grid-cols-6` (a 6-column track allows clean S/M/L spans):

| Size | Span (desktop) | Span (tablet) | Visual |
|------|---------------|---------------|--------|
| sm   | 2 / 6 (≈⅓)    | 1 / 2         | compact tile, min-h ~260px |
| md   | 3 / 6 (½)     | 1 / 2 (full)  | standard, min-h ~320px |
| lg   | 6 / 6 (full)  | 2 / 2 (full)  | hero, min-h ~420px |

Each card also gets a `min-h-*` per size so charts visibly grow/shrink, not just change width. The DynamicChart container will read the size and pass through a matching height.

## Other UX improvements

1. **Live preview in the resize popover** — show width hint next to each option (e.g. "S · ⅓", "M · ½", "L · full") so users understand the effect before clicking.
2. **Size badge on the card** — tiny `S/M/L` chip in the top-right that's always visible (not just on hover) so users can see the current size at a glance.
3. **Keyboard shortcuts** — when a card is focused: `[` shrink, `]` grow, `Del` remove, `D` duplicate. Listed in a tooltip on the drag handle.
4. **Mobile: collapse all sizes to full-width** (already effectively true) and show controls in a bottom action bar instead of overlapping the card top — easier to tap.
5. **Drag placeholder** — render a dashed outline at the drop target using `DragOverlay` so users see where the card will land (today the dragged card just becomes semi-transparent in place).
6. **Quick-add toolbar polish** — the existing toolbar stays, but disable "Reset Layout" when the layout already matches the auto-generated default and add a tooltip explaining what it does.
7. **Empty drop zone hint** — when the dashboard has 1–2 cards, show a faint dashed "+ Add another card" tile after them that opens the manual chart builder.
8. **Confirm before destructive actions** — wrap the per-card `Trash2` in a small inline confirm (click → "Click again to remove" for 2s) instead of an alert dialog, so single removes feel fast but accidental clicks are caught.

## Technical notes

- File: `src/components/DashboardGrid.tsx`
  - Update `sizeClasses` map and grid wrapper classes; add `sizeMinHeights`.
  - Add `SizeBadge` subcomponent rendered inside each card.
  - Extend popover items with width-fraction labels.
  - Add `useEffect` keyboard handler scoped to the focused card (track via `tabIndex`/`onFocus`).
  - Switch DnD to `DragOverlay` + render a placeholder slot.
  - Inline two-step delete using local `useState<'idle'|'confirm'>` per card with a 2s timeout.
- File: `src/components/DynamicChart.tsx` — accept optional `size` prop and adjust ResponsiveContainer height (sm 220, md 280, lg 360).
- File: `src/pages/Index.tsx` — pass `size` through to DynamicChart props if needed; compare current `dashboardItems` to default-rebuilt version to enable/disable Reset.
- File: `src/lib/i18n/*.ts` — add 6 new keys: `sizeFractionThird`, `sizeFractionHalf`, `sizeFractionFull`, `clickAgainToRemove`, `addAnotherCard`, `keyboardShortcuts`. Add to all 6 languages.

## Files Changed
- `src/components/DashboardGrid.tsx`
- `src/components/DynamicChart.tsx`
- `src/pages/Index.tsx`
- `src/lib/i18n/{en,hi,es,zh,fr,de}.ts`
