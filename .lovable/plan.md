

# ExcelInsight — Dashboard Resizing, Insight UI Parity, Default Mix, and Branding

## Summary

Four changes: (1) card resizing on the dashboard, (2) preserve Insight section's premium glass-card UI when items are added to the dashboard, (3) generate a richer default dashboard with mixed chart types + tables + insights, (4) rebrand to "ExcelInsight" with the uploaded logo.

---

## 1. Dashboard Card Resizing

**What:** Each dashboard card gets a size toggle (small / medium / large) controlling its column span in the grid.

**How:**
- Add `size: 'sm' | 'md' | 'lg'` to `DashboardItem` interface (default `'md'`).
- In `SortableCard`, add a resize button group (top-right, alongside drag/delete) with three size options.
- Update the grid to use CSS classes per item: `sm` = `col-span-1`, `md` = `col-span-1 lg:col-span-1`, `lg` = `col-span-1 lg:col-span-2` (full width on large screens).
- Pass size changes through `onUpdateItem`.

**Files:** `src/components/DashboardGrid.tsx`

---

## 2. Insight Cards Keep Their Premium UI on Dashboard

**What:** Currently, insight items added to the dashboard render as plain bar charts (losing the glass-card styling with progress bars, stats, badges). Instead, they should render with the same rich UI from the Insights tab.

**How:**
- Add a new `displayAs` value: `'insight'` alongside `'chart'` and `'table'`.
- Store the original insight content (repeating column data, stats array, or quality array) in a new `insightContent` field on `DashboardItem`.
- Create a `DashboardInsightCard` component in `DashboardGrid.tsx` that renders the same styled cards as `SmartInsights` — progress bars for repeating values, stat tables for numeric columns, completeness bars for data quality.
- Update `addInsightToDashboard` in `Index.tsx` to set `displayAs: 'insight'` and pass the raw content instead of converting to chart data.

**Files:** `src/components/DashboardGrid.tsx`, `src/pages/Index.tsx`

---

## 3. Default Dashboard with Mixed Content

**What:** On file upload, auto-populate the dashboard with a mix of chart types, a stats table, and insight cards — not just 4 bar charts.

**How:**
- In `handleDataLoaded` (`Index.tsx`), after generating suggestions and analyzing columns:
  - Take first 3-4 chart suggestions with varied types (bar, line, area, pie) and varied themes.
  - Auto-generate a column stats table item (if numeric columns exist).
  - Auto-generate 1-2 repeating value insight cards (if detected).
- Assign different sizes: one chart as `'lg'`, stats table as `'lg'`, rest as `'md'`.

**Files:** `src/pages/Index.tsx`

---

## 4. Rebrand to "ExcelInsight" + Logo

**What:** Replace "DataLens" with "ExcelInsight" everywhere. Add the uploaded logo to the upload screen and header.

**How:**
- Copy `user-uploads://ExcelInsight_Logo.png` to `src/assets/ExcelInsight_Logo.png`.
- Update `src/lib/i18n.ts`: change `appName` from `'DataLens'` to `'ExcelInsight'` in both `en` and `hi` translations.
- Update `index.html` `<title>` to "ExcelInsight".
- In `Index.tsx` upload screen: replace the `BarChart3` icon with the logo image (`import logo from '@/assets/ExcelInsight_Logo.png'`), displayed at ~64px.
- In the sticky header: replace the `BarChart3` icon with the logo at ~24px height.

**Files:** `src/lib/i18n.ts`, `src/pages/Index.tsx`, `index.html`

---

## Technical Details

- **Resizing grid**: Switch from fixed `grid-cols-1 lg:grid-cols-2` to a dynamic approach where each `SortableCard` wrapper gets a className based on its `size` prop. The grid container stays `grid-cols-1 lg:grid-cols-2`.
- **Insight rendering on dashboard**: The `DashboardInsightCard` will accept `insightType: 'repeating' | 'stats' | 'quality'` and `insightContent: any` to determine which sub-layout to render, reusing the same Tailwind classes from `SmartInsights.tsx`.
- **No new dependencies** required.

