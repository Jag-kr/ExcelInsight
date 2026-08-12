# Charts

Chart colour is a **second, independent axis** from light/dark mode. A user picks a
palette; it applies in both themes and also drives the PDF export accent.

- Tokens and the per-theme overrides: [`app/globals.css`](../../app/globals.css)
- Palette data, helpers and context: [`src/lib/chart-themes.ts`](../../src/lib/chart-themes.ts)
- Picker UI: [`ChartThemeSwitcher.tsx`](../../src/components/ChartThemeSwitcher.tsx)

## The eight slots

`--chart-1` … `--chart-8`, each with a light and a dark value, exposed as
`bg-chart-1`, `stroke-chart-3`, `hsl(var(--chart-2) / 0.3)`, and so on.

Default palette (multi-hue, cool-leaning, chosen so every slot clears 3:1 against the
page background in both themes):

| Slot | Hue | Light | Dark |
|---|---|---|---|
| 1 | Emerald | `152 60% 32%` | `152 65% 55%` |
| 2 | Sky | `199 80% 38%` | `199 89% 62%` |
| 3 | Amber | `40 85% 38%` | `42 93% 58%` |
| 4 | Violet | `262 55% 50%` | `262 70% 68%` |
| 5 | Rose | `349 65% 45%` | `349 78% 63%` |
| 6 | Slate blue | `199 20% 42%` | `199 25% 62%` |
| 7 | Orange | `28 75% 40%` | `30 85% 58%` |
| 8 | Neutral grey | `210 8% 46%` | `210 10% 68%` |

Slot 1 is the brand emerald, so a single-series chart is automatically on-brand.
Measured contrast per slot is in [color.md](color.md#default-chart-palette-on-the-page-background).

**Eight is the ceiling.** `getChartColor()` wraps with a modulo, so a ninth series
silently reuses slot 1. Beyond eight categories, aggregate into an "Other" bucket
rather than adding tokens.

## The five palettes

`CHART_PALETTES` in `chart-themes.ts`, typed as `ChartPaletteId`:

| id | Intent |
|---|---|
| `default` | warm-ochre analytic set (the exported `CHART_PALETTES` values) |
| `professional` | muted blues and teals — desaturated, for reports |
| `vibrant` | high-chroma, for presentations |
| `colorblind-safe` | Okabe–Ito-style set, distinguishable under common CVD |
| `pastel` | soft, low-contrast-between-series |

Each entry carries:

```ts
{
  id: ChartPaletteId,
  labelKey: TranslationKey,        // label is translated, never hardcoded
  colors: { light: EightHsl, dark: EightHsl },   // exactly 8 "H S% L%" strings each
  pdfAccent: string,               // jsPDF can't read CSS vars, so the accent is duplicated here
}
```

> **Two sources of truth — keep them in sync.** The non-default palettes are declared
> *twice*: as `[data-chart-theme="…"]` (and `.dark[data-chart-theme="…"]`) blocks in
> `globals.css`, which is what charts on screen actually render, and as
> `colors.light` / `colors.dark` arrays in `chart-themes.ts`, which
> `ChartThemeSwitcher` renders as the **swatches in the picker**. Drift between them
> shows up as a picker whose swatches don't match the chart it produces.
>
> `default` has no CSS block — it *is* the base `--chart-*` values in `:root` / `.dark`,
> and the provider removes the `data-chart-theme` attribute entirely for it. Its
> `CHART_PALETTES[0].colors` arrays (a warm ochre/teal set) are **not** the same as
> those base values (emerald/sky/amber), so the default swatch in the picker does not
> match what the default palette draws. Worth fixing when the picker is next touched.

`pdfAccent` is a third copy, read by the PDF export in `app/page.tsx` via
`getChartPalette(id).pdfAccent` and converted with `hslStringToRgb` from
[`color-utils.ts`](../../src/lib/color-utils.ts) — jsPDF cannot read CSS variables.
For `default` the export passes `undefined` and falls back to its own accent.

Adding or editing a palette therefore means: the CSS blocks, the `colors` arrays,
`pdfAccent`, and a `chartPalette*` translation key in all six locales.

## Helpers

```ts
getChartColor(i)      // → "hsl(var(--chart-N))"   — cycles 1..8
getChartColorVar(i)   // → "var(--chart-N)"        — for composing with an alpha
getChartVarColor(key) // → "var(--color-KEY)"      — the shadcn ChartContainer channel
buildChartConfig(dataKeys)          // one colour per series
buildPieChartConfig(data, nameKey)  // one colour per data point
```

Use `buildChartConfig` / `buildPieChartConfig` to produce the `ChartConfig` for the
shadcn `ChartContainer` rather than passing colours to Recharts by hand — that is what
keeps a chart responsive to both the theme toggle and the palette switcher. Inside a
`ChartContainer`, `fill` and `stroke` should reference `getChartVarColor(key)`;
`getChartVarColor` sanitises the key (`[^a-zA-Z0-9_-]` → `_`) to match the CSS custom
property the container emits.

`getChartColorVar` exists for expressions like
`` `hsl(${getChartColorVar(i)} / 0.25)` `` — an area fill under a solid line.

## Chart types

`ChartType` = `bar` | `horizontalBar` | `line` | `area` | `pie` | `scatter` | `radar`,
with `chartTypeOptions` supplying `{ value, label }` pairs.

Those labels are **hardcoded English** in `chart-themes.ts`, unlike the palette labels.
If chart-type names need to be translated, add `TranslationKey`s and switch
`chartTypeOptions` to `labelKey` the way `ChartPalette` already does.

## Rules

- Colour carries **series identity only**. Never print a value label in the series
  colour — several slots fall below 4.5:1 in light mode. Labels use `text-foreground`
  or `text-muted-foreground`.
- Never use `--chart-*` for UI chrome, and never use `--primary` for a data mark.
  The two systems switch independently; crossing them makes the palette switcher
  appear to half-work.
- Colour is never the only encoding. Pair it with a legend, direct labels, or shape
  (`scatter` markers) — `colorblind-safe` reduces the risk but doesn't remove it.
