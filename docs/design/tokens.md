# Tokens

Declared in [`app/globals.css`](../../app/globals.css) (`:root` = light, `.dark` = dark),
mapped to utilities in [`tailwind.config.ts`](../../tailwind.config.ts).

Colour tokens hold **bare HSL channels** (`152 65% 32%`), not colour functions, so they
compose with an alpha: `hsl(var(--primary) / 0.12)`. Tailwind wraps them for you —
`bg-primary` expands to `hsl(var(--primary))`.

## Colour

| Token | Light | Dark | Tailwind |
|---|---|---|---|
| `--background` | `210 25% 97%` | `240 8% 6%` | `bg-background` |
| `--foreground` | `222 22% 10%` | `210 20% 96%` | `text-foreground` |
| `--card` / `--card-foreground` | `0 0% 100%` / `222 22% 10%` | `240 8% 9%` / `210 20% 96%` | `bg-card` |
| `--popover` / `--popover-foreground` | `0 0% 100%` / `222 22% 10%` | `240 8% 8%` / `210 20% 96%` | `bg-popover` |
| `--primary` / `--primary-foreground` | `152 65% 32%` / `0 0% 100%` | `152 68% 50%` / `240 10% 6%` | `bg-primary` |
| `--secondary` / `--secondary-foreground` | `210 20% 93%` / `222 22% 12%` | `240 7% 14%` / `210 15% 90%` | `bg-secondary` |
| `--muted` / `--muted-foreground` | `210 18% 93%` / `220 10% 42%` | `240 7% 13%` / `220 10% 64%` | `bg-muted`, `text-muted-foreground` |
| `--accent` / `--accent-foreground` | same as primary | same as primary | `bg-accent` |
| `--destructive` / `--destructive-foreground` | `6 65% 45%` / `0 0% 100%` | `6 72% 58%` / `0 0% 100%` | `bg-destructive` |
| `--success` / `-foreground` | `152 55% 34%` / `0 0% 100%` | `152 60% 50%` / `240 10% 6%` | `bg-success` |
| `--warning` / `-foreground` | `40 92% 45%` / `30 40% 12%` | `42 90% 55%` / `240 10% 6%` | `bg-warning` |
| `--info` / `-foreground` | `199 80% 38%` / `0 0% 100%` | `199 85% 60%` / `240 10% 6%` | `bg-info` |
| `--border`, `--input` | `220 16% 88%` | `240 8% 18%` | `border-border`, `border-input` |
| `--ring` | `152 65% 32%` | `152 68% 50%` | `ring-ring` |

`--accent` is an alias of `--primary` in both themes. Radix and shadcn use
`bg-accent` for hover states, so "hover" and "brand" are deliberately the same hue.

### Surface ladder

| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface-0` | `210 25% 97%` | `240 8% 6%` | page background (= `--background`) |
| `--surface-1` | `0 0% 100%` | `240 8% 9%` | cards, panels (= `--card`) |
| `--surface-2` | `210 18% 95%` | `240 7% 12%` | inset regions inside a card |
| `--surface-3` | `210 16% 92%` | `240 7% 15%` | one level deeper — wells, table headers |

Not exposed as Tailwind utilities; use `bg-[hsl(var(--surface-2))]` or reference
them from a bespoke utility in `globals.css`.

### Charts

`--chart-1` … `--chart-8`, plus four palette overrides selected by a
`[data-chart-theme]` attribute on `<html>`. See [charts.md](charts.md).

### Sidebar

`--sidebar-background`, `-foreground`, `-primary`, `-primary-foreground`,
`-accent`, `-accent-foreground`, `-border`, `-ring` → `bg-sidebar`,
`text-sidebar-foreground`, etc. The dashboard's own sidebar styling is the
`.sidebar-nav-item` utility rather than these; they exist for the shadcn sidebar
primitive, which this app does not currently use.

## Radius

| Token | Value | Tailwind name | Computed |
|---|---|---|---|
| `--radius` | `1.25rem` | `rounded-lg` | 20px |
| — | `calc(var(--radius) - 8px)` | `rounded-md` | 12px |
| — | `calc(var(--radius) - 12px)` | `rounded-sm` | 8px |
| `--radius-xl` | `1.5rem` | `rounded-xl` | 24px |
| `--radius-2xl` | `1.75rem` | `rounded-2xl` | 28px |
| — | `9999px` | `rounded-3xl` | **pill** |

> **Two traps here.** `rounded-lg` is 20px, not Tailwind's stock 8px — this scale is
> much rounder than default, so ported snippets will look wrong. And `rounded-3xl`
> is a full pill, not 24px. Reach for `rounded-full` when you mean a pill so the
> intent is legible.

## Shadow

Three real elevations, aliased across six Tailwind names:

| Token | Tailwind names |
|---|---|
| `--shadow-card` | `shadow-sm`, `shadow` |
| `--shadow-elevated` | `shadow-md`, `shadow-lg` |
| `--shadow-floating` | `shadow-xl`, `shadow-2xl` |
| `--shadow-glow` | `shadow-glow` |

Light shadows are cool-tinted (`hsl(220 20% 20% / …)`), never pure black. Dark
shadows add an `inset 0 1px 0 hsl(0 0% 100% / 0.04–0.06)` top highlight, which is
what stops dark cards reading as flat cutouts.

`--inset-lit` is a separate two-part inset (bright top edge + faint inner floor)
used as the **resting** state of primary and secondary buttons and of `.stat-chip`.
`--shadow-glow` is reserved for hover.

## Gradients

| Token | Use |
|---|---|
| `--gradient-card` | 145° near-neutral wash — `.dashboard-surface` |
| `--gradient-hero` | radial emerald spotlight from above + page background — `.hero-surface` |
| `--gradient-glow` | radial emerald falloff, for decorative blooms |

## Layout

| Token | Value |
|---|---|
| `--sidebar-width` | `240px` |
| `--sidebar-collapsed-width` | `56px` |
| `--header-height` | `56px` |

Tailwind's `container` is centred with `2rem` padding and caps at `1400px` at `2xl`.
The sticky header sets its own width (`72rem` at rest, `68rem` scrolled) — see
[surfaces.md](surfaces.md#site-header).

## Motion

| Token | Value | Tailwind | Meaning |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | `ease-smooth` | the default for everything |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-smooth-inout` | symmetric moves only (open/close) |
| `--dur-fast` | `160ms` | `duration-fast` | state feedback, hover, focus |
| `--dur-base` | `260ms` | `duration-base` | panel and tab transitions |
| `--dur-slow` | `520ms` | `duration-slow` | scroll reveals — landing only |
| `--reveal-blur` | `8px` | — | blur a reveal starts from |
| `--reveal-shift` | `12px` | — | travel a reveal starts from |

Full rationale in [motion.md](motion.md).

## Keyframes and animation utilities registered in Tailwind

`accordion-down`, `accordion-up`, `fade-in`, `shimmer` → `animate-accordion-down`,
`animate-accordion-up`, `animate-fade-in`, `animate-shimmer`. The much larger set of
keyframes defined directly in `globals.css` is catalogued in
[class-inventory.md](class-inventory.md).
