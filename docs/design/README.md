# The ExcelInsight design system

*Codename: **Nightframe** — cool paper and spreadsheet-emerald in light, off-black
and spreadsheet-emerald in dark.*

Everything visual resolves to CSS custom properties declared in
[`app/globals.css`](../../app/globals.css) and surfaced to Tailwind through
[`tailwind.config.ts`](../../tailwind.config.ts). Those two files are the source of
truth; these documents explain what the values mean and when to reach for which.

## Read in this order

| Doc | What it covers |
|---|---|
| [tokens.md](tokens.md) | Every custom property, its light/dark value, and the Tailwind name it hides behind |
| [color.md](color.md) | Semantic colour roles, the surface ladder, and measured contrast |
| [typography.md](typography.md) | The two fonts, the sans/mono split, the scale actually in use |
| [surfaces.md](surfaces.md) | `dashboard-surface`, `elevated-card`, `glass-card`, the sticky header |
| [components.md](components.md) | Button/Badge/Card/Skeleton variants and the focus-ring rules |
| [motion.md](motion.md) | The two motion tiers, easing, and the reduced-motion contract |
| [charts.md](charts.md) | `--chart-1..8`, the five selectable palettes, PDF accent |
| [theming.md](theming.md) | How dark mode, chart palette and language are stored and applied |
| [accessibility.md](accessibility.md) | Contrast status, known gaps, what to check before shipping |
| [class-inventory.md](class-inventory.md) | Every bespoke utility and keyframe, with call sites — and the dead ones |

## The five rules this system runs on

1. **No raw colour, ever.** Write `bg-primary`, `text-muted-foreground`,
   `hsl(var(--chart-2) / 0.3)`. A literal hex or `hsl(152 65% 32%)` in a component
   breaks light/dark and breaks the chart-palette switcher.
2. **One easing family, three speeds.** `--ease-out` unless the move is symmetric,
   and `--dur-fast` / `--dur-base` / `--dur-slow`. No overshoot, no bounce, no new
   curves inline — add to the token block or don't add at all. See [motion.md](motion.md).
3. **Three elevations, not six.** `--shadow-card`, `--shadow-elevated`,
   `--shadow-floating`. `--shadow-glow` is a hover event, never ambient decoration.
4. **The landing page may be expressive; the tool must be quiet.** Scroll-scrubbed
   headings, pointer-tracked glow and the lit CTA pill belong to marketing surfaces.
   The dashboard gets state feedback and nothing else.
5. **Every animation has a `prefers-reduced-motion` answer.** Not "it's subtle" —
   an explicit rule that lands on the finished state. See
   [motion.md § the contract](motion.md#the-reduced-motion-contract).

## Where things live

```
app/globals.css              tokens, bespoke utilities, keyframes, reduced-motion rules
tailwind.config.ts           token → utility mapping (colours, radii, shadows, motion)
app/layout.tsx               next/font → --font-sans, --font-mono
app/providers.tsx            theme / language / chart-palette state and persistence
src/lib/theme.ts             ThemeContext, useTheme
src/lib/chart-themes.ts      chart palettes, ChartConfig builders, colour helpers
src/hooks/use-reveal.ts      Firefox fallback for scroll-driven reveals
src/hooks/use-glow-cards.ts  pointer-tracked border light
src/components/ui/*          shadcn primitives (locally modified — see components.md)
```

## Changing a token

1. Edit the `:root` block **and** the `.dark` block in `app/globals.css`. A token
   that only exists in one theme is a bug waiting for a theme toggle.
2. If it needs a Tailwind utility name, add it under `theme.extend` in
   `tailwind.config.ts` — Tailwind cannot disambiguate arbitrary
   `[var(--…)]` values for durations or easings, which is why `duration-base`
   and `ease-smooth` exist.
3. If it is a colour, recompute contrast and update the table in
   [color.md](color.md#measured-contrast).
4. Update [tokens.md](tokens.md).
