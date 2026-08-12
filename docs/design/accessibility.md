# Accessibility

Status as of the current `main`, cross-checked against the August 2026 design audit
(`.impeccable/critique/`). That audit scored the app **22/40** on Nielsen's heuristics;
the theme revamp that followed fixed some of what it found and left the rest.

## What the system gives you for free

- **Contrast**: every semantic text/background pair clears AA except the two flagged
  below. Full table in [color.md](color.md#measured-contrast).
- **Reduced motion**: four `prefers-reduced-motion` blocks cover the landing hero, the
  scroll narrative, named treatments and the whole dashboard, ending with a `*`
  backstop. See [motion.md](motion.md#the-reduced-motion-contract).
- **Colour-independent charts**: eight slots all clearing 3:1, plus a
  `colorblind-safe` palette the user can select ([charts.md](charts.md)).
- **Focus rings** on every shadcn primitive: `ring-2 ring-ring ring-offset-2`.
- **Six languages** with `<html lang>` kept in sync ([theming.md](theming.md)).
- **Pointer-tracked glow opts out** of both reduced motion and coarse pointers.

## Fixed since the audit

| Finding | Status |
|---|---|
| Light-mode primary button at 2.88:1 — fails AA on the main CTA | **Fixed.** Light `--primary` is now `152 65% 32%` → **4.54:1** against white |
| One destination called "Explore" (sidebar), "Charts" (mobile), "Auto Charts" (heading) | **Fixed.** `SIDEBAR_ITEMS`, `MOBILE_TABS` and the tab heading all render `t('explore')` |
| Sidebar and mobile nav labels hardcoded in English, bypassing `t()` | **Fixed.** Both navs map over `labelKey` and call `t()` |

## Open, and worth fixing

Verified against current source, roughly in priority order.

1. **No `<h1>` in the dashboard.** `app/page.tsx` returns the landing view early (with
   an `<h1>`) when there is no data; once a file is loaded the top heading is the
   `<h2>` at `app/page.tsx:806`. Screen-reader users get a document with no title-level
   heading in the working tool.
2. **`aria-current` only on mobile nav.** The mobile bottom nav sets
   `aria-current={activeTab === value ? 'page' : undefined}` (`app/page.tsx:964`); the
   desktop sidebar rows (`app/page.tsx:572`) signal the active tab with `.active`
   styling alone.
3. **Two focus systems.** shadcn primitives get the custom ring; the raw `<button>`s
   in the sidebar, the collapse toggle and card actions get the browser default. Copy
   the `focus-visible:` triplet onto bare buttons — see
   [components.md](components.md#focus-rings--one-system-please).
4. **Hover-only card actions.** Resize, duplicate and remove appear on hover
   (`.drag-rail` is `opacity: 0` until `.group:hover`). `:focus-within` is honoured, but
   nothing is discoverable without a pointer.
5. **Dark `destructive` on white is 3.73:1** — below AA for normal text. Either darken
   dark `--destructive` or only use it at large sizes / as a fill behind dark text.
6. **Collapsed sidebar relies on `title`.** `title` does supply an accessible name as a
   last resort, but it is not announced consistently and never appears on touch. Add
   `aria-label` alongside it.
7. **No keyboard shortcuts anywhere** — no hotkey for Quick Add, tab switching or
   removing a focused card.
8. **Chart-type names are hardcoded English** in `chartTypeOptions`
   ([charts.md](charts.md#chart-types)).

## Before you ship a UI change

- [ ] Tab through it. Every interactive element reachable, with a **visible** focus
      ring that matches the shadcn one.
- [ ] Toggle light/dark. Both themes, both checked — the audit's worst find was a
      light-only regression.
- [ ] Turn on OS "reduce motion". Nothing moves, nothing is left blurred, nothing is
      left invisible.
- [ ] Switch to `de` and `hi`. Nothing clips or overflows (remember: controls are
      monospaced and therefore wider than a sans mockup).
- [ ] New colour pair? Compute contrast — the one-liner is in
      [color.md](color.md#recomputing-after-a-change).
- [ ] Icon-only control? It has an `aria-label`.
- [ ] State conveyed by colour? It is also conveyed by text, icon or `aria-*`.
- [ ] New scroll-driven class whose resting state is hidden? Registered in
      `REVEAL_SELECTOR` in [`use-reveal.ts`](../../src/hooks/use-reveal.ts), or it is
      invisible in Firefox.
