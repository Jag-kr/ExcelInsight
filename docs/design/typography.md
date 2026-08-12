# Typography

## Two fonts, self-hosted

Loaded with `next/font/google` in [`app/layout.tsx`](../../app/layout.tsx), which
self-hosts the files and exposes them as CSS variables on `<html>`:

| Family | Weights | Variable | Tailwind |
|---|---|---|---|
| Plus Jakarta Sans | 400, 500, 600, 700, 800 | `--font-sans` | `font-sans`, `font-display` |
| JetBrains Mono | 400, 500, 600, 700 | `--font-mono` | `font-mono` |

Both use `display: "swap"`.

> **Never reintroduce `@import url(fonts.googleapis.com)` in `globals.css`.** It was
> removed deliberately: a render-blocking stylesheet on a third-party origin delays
> first paint no matter how well the rest is tuned. The literal family names remain
> in `tailwind.config.ts` only as a fallback if the variable ever goes missing.

`font-display` is an alias of `font-sans`. There is no separate display face.

## The sans/mono split

This is the most surprising rule in the system, set in `globals.css`:

```css
body            → var(--font-sans)   /* prose, headings, labels */
h1, h2, h3, h4  → var(--font-sans)   /* + letter-spacing: -0.015em */
button, input, select, textarea, table, code, pre → var(--font-mono)
```

**Every control and every table is monospaced.** Button labels, dropdown text, form
fields and data grids all render in JetBrains Mono; only prose and headings are
Plus Jakarta Sans. That is the product's "instrument" voice — the tool surface looks
like a terminal for numbers, the marketing surface reads like a document.

Consequences worth remembering:

- Mono is wider per character. Button and select widths do not match what a sans
  mockup implies — check real strings, especially in German (`de`) and Hindi (`hi`).
- A `<div role="button">` gets **sans**, because the rule targets the `button`
  element. Use real `<button>` elements (shadcn `Button` does) so the voice is
  consistent.
- Numeric columns line up for free; don't add `tabular-nums` to tables.

## Scale in use

Tailwind's default scale, unmodified. Actual distribution across `src/` and `app/`:

| Class | Occurrences | Role |
|---|---|---|
| `text-sm` | 94 | the default for UI text |
| `text-xs` | 87 | labels, units, chips, helper text |
| `text-base` | 16 | body copy on marketing pages |
| `text-2xl` | 10 | card and section titles |
| `text-lg` | 8 | subsection titles |
| `text-3xl` | 6 | page headings |
| `text-xl` / `text-4xl` | 3 each | — |
| `text-5xl` | 1 | — |

Weights: `font-medium` and `font-semibold` (47 each) carry almost everything;
`font-bold` (27) is for brand and headings. `font-extrabold` (800) is used only by
`.brand-mark`.

The centre of gravity is `text-sm` / `text-xs` — a dense tool, not an airy landing
page. Reach for `text-sm` by default and only go up when something is genuinely a
heading.

## Fluid display type

Two bespoke classes own the large sizes, both in `globals.css`, both landing-page only:

| Class | Size | Notes |
|---|---|---|
| `.display-heading` | `clamp(2rem, 1.2rem + 3.2vw, 3.5rem)` | 600 weight, `-0.035em`, `text-wrap: balance`; scroll-scrubbed light sweep |
| `.cta-heading` | `clamp(2.25rem, 1.2rem + 4.2vw, 4rem)` | 700 weight, `-0.04em`; static vertical metallic ramp |

Both clip a gradient to the text, so they set `color: transparent`. If a heading
using one of these ever renders invisible, the reveal never fired — see
[../animations/fallbacks.md](../animations/fallbacks.md).

Tighter tracking as size increases is the pattern: `-0.015em` on `h1–h4`,
`-0.02em` on `.brand-mark` / `.brand-text`, `-0.035em` and `-0.04em` on the two
display classes.

## Text colour classes

| Class | Use |
|---|---|
| `.brand-mark` | the "ExcelInsight" wordmark — emerald, 800, `-0.02em`. The one place brand colour is used as text |
| `.brand-text` | section display headings — neutral ink/white, 700. **Not** accent-tinted |
| `.hero-gradient-text` | radial gradient clipped to text; reserved for the single hero headline |

Section headings use `.brand-text`, not `.brand-mark`: green headlines everywhere is
one of the tells the design audit flagged. Emerald as text is for the wordmark and
for active-state affordances only.
