# Components

shadcn/ui primitives live in [`src/components/ui/`](../../src/components/ui/) and are
**locally modified**. Do not re-run the shadcn generator over them — it will overwrite
the changes described here. Add new primitives, then adapt them to these conventions.

## Button

[`src/components/ui/button.tsx`](../../src/components/ui/button.tsx)

Base: `rounded-full`, `text-sm font-medium` (rendered in **mono** — see
[typography.md](typography.md#the-sansmono-split)),
`transition-[background-color,box-shadow,border-color,transform,color] duration-fast ease-smooth`,
`active:scale-[0.98]`, `focus-visible:ring-2 ring-ring ring-offset-2`,
icons forced to `size-4`.

| Variant | Rest | Hover |
|---|---|---|
| `default` | `bg-primary`, `shadow-[var(--inset-lit),0 0 0 1px hsl(var(--primary)/0.25)]` | `bg-primary/90` + `shadow-glow` |
| `secondary` | `bg-secondary`, `shadow-[var(--inset-lit)]` | `bg-secondary/80` |
| `outline` | transparent, `border-foreground/15` | `bg-foreground/5`, `border-foreground/25` |
| `destructive` | `bg-destructive` | `bg-destructive/90` |
| `ghost` | transparent, **`rounded-lg`** | `bg-accent` |
| `link` | **`rounded-none`**, `text-primary` | underline |

`--inset-lit` is the resting lit-pill treatment; the glow is a hover **event**, not
ambient decoration. That distinction is why the default button doesn't look like the
`.cta-lit-btn` on the landing page — that one is deliberately the single loudest
control on the site.

`ghost` and `link` override the pill radius: ghost becomes a 20px rounded rect (it
reads as a hit area, not a button), link has no radius at all.

| Size | Metrics |
|---|---|
| `default` | `h-10 px-5 py-2` |
| `sm` | `h-9 px-4` |
| `lg` | `h-12 px-8 text-base` |
| `icon` | `h-10 w-10` |

**Extras beyond stock shadcn:**

- `loading` — swaps in a spinning `Loader2` before the children, disables the button
  and sets `aria-busy`. Ignored when `asChild` is set, since the child owns its content.
- `asChild` takes an early return path that skips the loading logic entirely.

`icon` size is `h-10 w-10` = 40px, which clears the 44px touch target only with
surrounding padding. On mobile-critical controls add `min-h-11`.

## Badge

[`src/components/ui/badge.tsx`](../../src/components/ui/badge.tsx) — `rounded-full border px-2.5 py-0.5 text-xs font-semibold`,
variants `default` (primary fill), `secondary`, `destructive`, `outline`.

A plain `<div>`: no role, no aria, and not focusable — so its `focus:ring-2` classes
never fire unless you add a `tabIndex`. If a badge conveys state a screen-reader user
needs (a validation count, a live status), give it text that says so rather than
relying on colour.

## Card

[`src/components/ui/card.tsx`](../../src/components/ui/card.tsx) — stock shadcn:
`rounded-lg border bg-card text-card-foreground shadow-sm`, with
`CardHeader` / `CardTitle` (`text-2xl`, `h3`) / `CardDescription` / `CardContent` / `CardFooter`,
all at `p-6`.

In this codebase `Card` is the *generic* container. The app's real surfaces are the
utilities in [surfaces.md](surfaces.md) — `.elevated-card`, `.dashboard-panel`,
`.glass-card`. Reach for those for anything in the dashboard; `Card`'s `p-6` and
`text-2xl` title are too loose for the tool's density.

## Skeleton

[`src/components/ui/skeleton.tsx`](../../src/components/ui/skeleton.tsx) — a single
`div` with `.skeleton-sheen rounded-md`.

A travelling sheen, **not** a whole-block opacity pulse. Two reasons: a pulse reads as
"this element is disabled" rather than "content is loading", and several stock
skeletons side by side blink in unison, which is worse than one moving highlight.
Collapses to a flat `bg-muted` under reduced motion.

## Progress

`.progress-indeterminate` (in `globals.css`, used by
[`FileUpload.tsx`](../../src/components/FileUpload.tsx)) is the same sheen idiom at a
faster 1.1s for work whose duration is unknowable. Under reduced motion it becomes a
flat `primary` fill. Use the Radix `Progress` primitive when you have a real percentage.

## Focus rings — one system, please

shadcn primitives (`Button`, `Input`, `Select`) use
`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
(`Badge` uses the `focus:` variant of the same triplet, but is not focusable).

Raw `<button>` elements written directly in components (the sidebar rows, the drag
rail, card remove/duplicate) fall back to the browser default outline. The design
audit called this out: two different focus signals across roughly half the interactive
surface. **When you add a bare `<button>`, either use the `Button` primitive or copy
that focus-visible triplet onto it.**

## Toasts

Two systems are mounted in [`app/providers.tsx`](../../app/providers.tsx): the Radix
`Toaster` (`use-toast`) and Sonner. Sonner reads its theme from `next-themes`, which
this app does **not** drive — the app's own `ThemeContext` toggles the `.dark` class
directly (see [theming.md](theming.md)). Prefer the Radix `useToast` path for new work
so theming stays consistent.

## Charts

`src/components/ui/chart.tsx` is the shadcn Recharts wrapper. Build its config with
the helpers in [`src/lib/chart-themes.ts`](../../src/lib/chart-themes.ts) rather than
passing colours by hand — see [charts.md](charts.md).
