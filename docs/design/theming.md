# Theming and localisation

Three independent user preferences, all held in
[`app/providers.tsx`](../../app/providers.tsx), all persisted to `localStorage`, all
applied as attributes on `<html>`.

| Preference | Context | Storage key | Applied as |
|---|---|---|---|
| Light / dark | `ThemeContext` ([`src/lib/theme.ts`](../../src/lib/theme.ts)) | `datalens-theme` | `.dark` class on `<html>` |
| Language | `I18nContext` ([`src/lib/i18n/`](../../src/lib/i18n/)) | `datalens-lang` | `<html lang>` |
| Chart palette | `ChartPaletteContext` ([`src/lib/chart-themes.ts`](../../src/lib/chart-themes.ts)) | `excelinsight-chart-theme` | `data-chart-theme` on `<html>` (removed for `default`) |

The two `datalens-*` keys are legacy names from an earlier product name. Renaming them
would silently reset every returning visitor's preferences, so they stay.

## Hydration

Providers **always start from the same value on server and client** so the first client
render matches the SSR output exactly. The persisted preference is read in a
`useEffect` after mount, then applied. That means a returning dark-mode user may see one
light frame before the effect runs — accepted deliberately over a hydration mismatch.

`<html>` carries `suppressHydrationWarning` for the same reason.

If that flash ever needs fixing, the answer is a blocking inline script in
`<head>` that sets the class before first paint — **not** moving the read into render.

## Not next-themes

`next-themes` is in `package.json` and is imported by exactly one file:
`src/components/ui/sonner.tsx`, which calls its `useTheme()`. Since nothing wraps the
app in a `next-themes` provider, Sonner sees the default and never follows the real
theme. The app's own theming is the hand-rolled `ThemeContext` above.

Consequences: prefer the Radix `useToast` / `Toaster` path for new toasts (see
[components.md](components.md#toasts)), and if you add a component that expects
`next-themes`, wire it to `@/lib/theme` instead.

## Consuming the contexts

```tsx
const { theme, setTheme, toggleTheme } = useTheme();          // '@/lib/theme'
const { lang, setLang, t } = useI18n();                       // '@/lib/i18n'
const { paletteId, setPaletteId } = useChartPalette();        // '@/lib/chart-themes'
```

All three are client-only. Components using them need `"use client"`.

## Writing themeable CSS

- Use the semantic token, not a literal: `bg-card`, not `bg-white`.
- Never branch on `theme` in JS to choose a colour. Add the value to both `:root` and
  `.dark` and let CSS pick. The one legitimate JS read of `theme` is
  `ChartThemeSwitcher`, which needs to know which array of swatches to *draw*, and the
  PDF exporter, which renders outside the DOM.
- Dark mode is not "light with inverted values". Dark surfaces add an inner top
  highlight (`--shadow-card` and `--inset-lit` both change shape between themes)
  because a flat fill on a dark field reads as a cutout.

## Localisation

Six languages: `en`, `hi`, `es`, `zh`, `fr`, `de`
([`src/lib/i18n/index.ts`](../../src/lib/i18n/index.ts)). `translations` is typed
`Record<Language, Record<TranslationKey, string>>`, so **a key missing from any locale
is a type error** — which is how the set stays complete. `languageMeta` supplies the
label, native name, short code and flag for the picker.

Legal copy is separate (`src/lib/i18n/legal/`), as is SEO page copy
(`src/content/seo-i18n/`).

Design consequences worth designing around:

- German and Hindi strings run long, and every control renders in a monospaced font
  (see [typography.md](typography.md#the-sansmono-split)), so buttons and selects are
  wider than a sans mockup suggests. Test `de` and `hi` before calling a layout done.
- `zh` and `hi` have different line-height needs; avoid fixed `h-*` on anything that
  contains translated prose.
- The design audit found nav labels bypassing `t()` entirely — a fully-built
  six-language system with untranslated navigation. Any new user-facing string goes
  through `t()`.
