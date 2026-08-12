# Funnel Event Tracking Implementation Plan

> **Historical record — all 7 tasks completed 2026-08-08. Do not edit or re-run.**
> Unchecked `- [ ]` boxes below are the original plan text, not outstanding work.
> Execution notes, deferred minor findings and the final verification pass are in
> `.superpowers/sdd/2026-08-08-event-tracking/progress.md`. For the current event
> taxonomy see [`docs/analytics/events.md`](../../analytics/events.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument the upload → chart → export funnel with custom events so we can see whether visitors actually get value from ExcelInsight, before investing further in distribution (SEO/i18n).

**Architecture:** A single typed wrapper module (`src/lib/analytics.ts`) around `@vercel/analytics`'s existing `track()` function defines every event name and its property shape as a discriminated union. Seven `trackEvent(...)` calls are then added at the exact points in the existing upload/chart/export code where each funnel step already succeeds or fails — no new state, no new components, no behavior changes to the app itself.

**Tech Stack:** Next.js 15 (App Router), React 18, TypeScript (strict), `@vercel/analytics` 2.0.1 (already installed, `<Analytics />` already mounted in `app/layout.tsx:73`), Vitest + jsdom for the one unit test this plan adds.

## Global Constraints

- Zero new npm dependencies — use `@vercel/analytics`'s existing `track()` export only.
- Event properties must never include filenames, column names, sheet names, or cell values — only counts, file extensions, and fixed enum/status strings. This preserves the "no data leaves your device" claim on the landing page.
- `track()` calls are fire-and-forget; do not wrap them in their own try/catch (see spec's Error Handling section — nothing meaningful to recover from, and it would hide misconfiguration).
- The exact event taxonomy (7 events) is fixed by `docs/superpowers/specs/2026-08-08-event-tracking-design.md` — do not add, rename, or reshape events beyond what's specified there without checking back in.
- No new automated tests for the six UI call sites (Tasks 2–6) — only `src/lib/analytics.ts` itself gets a unit test (Task 1). This is intentional per the spec's Non-goals.

---

### Task 1: Analytics wrapper module

**Files:**
- Create: `src/lib/analytics.ts`
- Test: `src/lib/analytics.test.ts`

**Interfaces:**
- Produces: `trackEvent<N extends AnalyticsEvent['name']>(name: N, props: Extract<AnalyticsEvent, { name: N }>['props']): void` — every later task calls this.
- Produces: `getFileExt(filename: string): string` — returns the lowercased extension including the leading dot (e.g. `'.csv'`), or `''` if the filename has no extension. Used by Tasks 2 and 3 to derive `fileExt` without ever passing the actual filename to `trackEvent`.
- Consumes: `track` from `@vercel/analytics` (already a project dependency).

- [ ] **Step 1: Write the failing test**

Create `src/lib/analytics.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { track } from '@vercel/analytics';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

import { trackEvent, getFileExt } from './analytics';

const trackMock = vi.mocked(track);

beforeEach(() => {
  trackMock.mockClear();
});

describe('trackEvent', () => {
  it('forwards the event name and properties to @vercel/analytics track()', () => {
    trackEvent('file_parsed', { fileExt: '.csv', rowCount: 10, colCount: 3 });
    expect(trackMock).toHaveBeenCalledWith('file_parsed', { fileExt: '.csv', rowCount: 10, colCount: 3 });
  });

  it('forwards events that only carry an enum property unchanged', () => {
    trackEvent('chart_added', { source: 'manual' });
    expect(trackMock).toHaveBeenCalledWith('chart_added', { source: 'manual' });
  });

  it('forwards failure-status events unchanged', () => {
    trackEvent('export_pdf', { status: 'failed', chartCount: 2, tableCount: 0, insightCount: 1 });
    expect(trackMock).toHaveBeenCalledWith('export_pdf', { status: 'failed', chartCount: 2, tableCount: 0, insightCount: 1 });
  });
});

describe('getFileExt', () => {
  it('returns the lowercased extension including the dot', () => {
    expect(getFileExt('Sales_Report.XLSX')).toBe('.xlsx');
  });

  it('returns an empty string for a filename with no extension', () => {
    expect(getFileExt('README')).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: FAIL — `src/lib/analytics.ts` does not exist yet (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/lib/analytics.ts`:

```ts
import { track as vercelTrack } from '@vercel/analytics';

type AnalyticsEvent =
  | { name: 'file_upload_rejected'; props: { fileExt: string } }
  | { name: 'file_parsed'; props: { fileExt: string; rowCount: number; colCount: number } }
  | { name: 'file_parse_failed'; props: { fileExt: string } }
  | { name: 'file_analysis_empty'; props: { fileExt: string; colCount: number } }
  | { name: 'chart_added'; props: { source: 'suggestion' | 'manual' | 'insight' | 'table' } }
  | { name: 'export_pdf'; props: { status: 'success' | 'failed'; chartCount: number; tableCount: number; insightCount: number } }
  | { name: 'export_png'; props: { status: 'success' | 'failed'; chartType: string } };

export function trackEvent<N extends AnalyticsEvent['name']>(
  name: N,
  props: Extract<AnalyticsEvent, { name: N }>['props']
): void {
  vercelTrack(name, props);
}

export function getFileExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "Add typed analytics event tracking wrapper"
```

---

### Task 2: Track upload rejection and parse failure in `FileUpload`

**Files:**
- Modify: `src/components/FileUpload.tsx:1-5` (imports), `src/components/FileUpload.tsx:36-40` (rejected-file branch), `src/components/FileUpload.tsx:65-71` (parse-failure catch block)

**Interfaces:**
- Consumes: `trackEvent`, `getFileExt` from `src/lib/analytics.ts` (Task 1).

- [ ] **Step 1: Add the import**

In `src/components/FileUpload.tsx`, after the existing `import { toast } from 'sonner';` (line 5), add:

```ts
import { trackEvent, getFileExt } from '@/lib/analytics';
```

- [ ] **Step 2: Track the rejected-file path**

In `processFile`, the current code is:

```tsx
  const processFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      toast.error(t('invalidFileType'));
      return;
    }
```

Change to:

```tsx
  const processFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      trackEvent('file_upload_rejected', { fileExt: getFileExt(file.name) });
      toast.error(t('invalidFileType'));
      return;
    }
```

- [ ] **Step 3: Track the parse-failure path**

The current catch block is:

```tsx
      } catch (err: any) {
        clearInterval(interval);
        console.error('Failed to parse file:', err);
        toast.error('Failed to parse file. Please check it is a valid Excel or CSV file.');
        setFileName(null);
        setLoading(false);
      }
```

Change to:

```tsx
      } catch (err: any) {
        clearInterval(interval);
        console.error('Failed to parse file:', err);
        trackEvent('file_parse_failed', { fileExt: getFileExt(file.name) });
        toast.error('Failed to parse file. Please check it is a valid Excel or CSV file.');
        setFileName(null);
        setLoading(false);
      }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 5: Manual verification in the browser**

Run: `npm run dev`, open the app.

1. In the browser DevTools console, run `window.vaq = window.vaq || []; window.vaq.length` to note the current length (or just clear the array: `window.vaq = []`).
2. Drag a `.txt` file (or any file not in `.xlsx`/`.xls`/`.csv`) onto the upload zone.
3. In the console, run `window.vaq.at(-1)`.
   Expected: `["event", { name: "file_upload_rejected", data: { fileExt: ".txt" }, options: undefined }]`
4. Upload a spreadsheet file, but first corrupt it (e.g. `echo "not a real xlsx" > fake.xlsx`) so parsing throws.
   Expected after upload: `window.vaq.at(-1)` shows `["event", { name: "file_parse_failed", data: { fileExt: ".xlsx" }, options: undefined }]`

- [ ] **Step 6: Commit**

```bash
git add src/components/FileUpload.tsx
git commit -m "Track file upload rejection and parse failure"
```

---

### Task 3: Track successful parse and empty-analysis outcomes

**Files:**
- Modify: `app/page.tsx:9` area (imports), `app/page.tsx:263-280` (`handleDataLoaded`)

**Interfaces:**
- Consumes: `trackEvent`, `getFileExt` from `src/lib/analytics.ts` (Task 1).
- Consumes: `buildDefaultDashboard` (existing, `app/page.tsx:89`) returns `{ items: DashboardItem[]; usedChartIds: Set<string> }` — `items.length === 0` is the signal for `file_analysis_empty`.

- [ ] **Step 1: Add the import**

In `app/page.tsx`, after the existing `import { toast } from 'sonner';` (line 29), add:

```ts
import { trackEvent, getFileExt } from '@/lib/analytics';
```

- [ ] **Step 2: Track parse success and empty analysis**

The current `handleDataLoaded` (lines 263-280) is:

```tsx
  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    setFilters({});
    setAnalyzing(true);
    // Yield to browser before running heavy synchronous analysis
    startTransition(() => {
      const cols = analyzeColumns(newData);
      setColumns(cols);
      const charts = generateChartSuggestions(newData, cols);
      setSuggestions(charts);
      const { items, usedChartIds } = buildDefaultDashboard(newData, cols, charts, t);
      setDashboardItems(items);
      setAddedChartIds(usedChartIds);
      setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
      setAnalyzing(false);
    });
  }, [t]);
```

Change to:

```tsx
  const handleDataLoaded = useCallback((newData: Record<string, any>[], name: string) => {
    setData(newData);
    setFileName(name);
    setFilters({});
    setAnalyzing(true);
    // Yield to browser before running heavy synchronous analysis
    startTransition(() => {
      const cols = analyzeColumns(newData);
      setColumns(cols);
      const charts = generateChartSuggestions(newData, cols);
      setSuggestions(charts);
      const { items, usedChartIds } = buildDefaultDashboard(newData, cols, charts, t);
      setDashboardItems(items);
      setAddedChartIds(usedChartIds);
      setAddedInsightIds(new Set(items.filter(i => i.displayAs === 'insight').map(i => i.id)));
      setAnalyzing(false);

      const fileExt = getFileExt(name);
      trackEvent('file_parsed', { fileExt, rowCount: newData.length, colCount: cols.length });
      if (items.length === 0) {
        trackEvent('file_analysis_empty', { fileExt, colCount: cols.length });
      }
    });
  }, [t]);
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, open the app.

1. Clear the queue: `window.vaq = []`.
2. Upload a normal spreadsheet with a numeric column and a few rows.
   Expected: `window.vaq` contains one entry with `name: "file_parsed"` and `data.rowCount`/`data.colCount` matching the file, and **no** `file_analysis_empty` entry.
3. Clear the queue again: `window.vaq = []`.
4. Upload a CSV with a single column of free-text values only (e.g. one column `notes` with long unique sentences, no numeric/id/repeating columns) so `buildDefaultDashboard` produces zero items.
   Expected: `window.vaq` contains both a `file_parsed` entry and a `file_analysis_empty` entry.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "Track successful parse and empty-analysis outcomes"
```

---

### Task 4: Track chart/insight/table additions to the dashboard

**Files:**
- Modify: `app/page.tsx:368-401` (`addToDashboard`, `addSuggestionToDashboard`, `addInsightToDashboard`, `addTableToDashboard`)

**Interfaces:**
- Consumes: `trackEvent` from `src/lib/analytics.ts` (Task 1) — already imported into `app/page.tsx` in Task 3.

- [ ] **Step 1: Track manual chart additions**

Current:

```tsx
  const addToDashboard = useCallback((chart: DashboardItem) => {
    setDashboardItems(prev => [...prev, chart]);
  }, []);
```

Change to:

```tsx
  const addToDashboard = useCallback((chart: DashboardItem) => {
    setDashboardItems(prev => [...prev, chart]);
    trackEvent('chart_added', { source: 'manual' });
  }, []);
```

- [ ] **Step 2: Track suggested chart additions**

Current:

```tsx
  const addSuggestionToDashboard = useCallback((s: ChartSuggestion) => {
    setDashboardItems(prev => [...prev, {
      id: `${s.id}-${Date.now()}`, title: s.title, description: s.description,
      type: s.type, data: s.data, dataKeys: s.dataKeys, xKey: s.xKey,
    }]);
    setAddedChartIds(prev => new Set(prev).add(s.id));
  }, []);
```

Change to:

```tsx
  const addSuggestionToDashboard = useCallback((s: ChartSuggestion) => {
    setDashboardItems(prev => [...prev, {
      id: `${s.id}-${Date.now()}`, title: s.title, description: s.description,
      type: s.type, data: s.data, dataKeys: s.dataKeys, xKey: s.xKey,
    }]);
    setAddedChartIds(prev => new Set(prev).add(s.id));
    trackEvent('chart_added', { source: 'suggestion' });
  }, []);
```

- [ ] **Step 3: Track insight additions**

Current:

```tsx
  const addInsightToDashboard = useCallback((card: { id: string; title: string; content: any; type: 'insight' }) => {
    const content = card.content;
    let insightType: 'repeating' | 'stats' | 'quality' = 'stats';
    if (content && content.topValues && content.repetitionRatio !== undefined) insightType = 'repeating';
    else if (Array.isArray(content) && content.length > 0) {
      if (content[0]?.completeness !== undefined) insightType = 'quality';
      else if (content[0]?.stats) insightType = 'stats';
    }
    setDashboardItems(prev => [...prev, {
      id: card.id, title: card.title, description: '', type: 'bar', data: [], dataKeys: [], xKey: '',
      displayAs: 'insight', insightType, insightContent: content,
    }]);
    setAddedInsightIds(prev => new Set(prev).add(card.id));
  }, []);
```

Change the final two lines to:

```tsx
    setAddedInsightIds(prev => new Set(prev).add(card.id));
    trackEvent('chart_added', { source: 'insight' });
  }, []);
```

- [ ] **Step 4: Track table additions**

Current:

```tsx
  const addTableToDashboard = useCallback((card: { id: string; title: string; data: any[]; columns: string[] }) => {
    setDashboardItems(prev => [...prev, {
      id: card.id, title: card.title, description: '', type: 'bar', data: card.data,
      dataKeys: [], xKey: '', displayAs: 'table', tableColumns: card.columns,
    }]);
    setAddedInsightIds(prev => new Set(prev).add(card.id));
  }, []);
```

Change the final two lines to:

```tsx
    setAddedInsightIds(prev => new Set(prev).add(card.id));
    trackEvent('chart_added', { source: 'table' });
  }, []);
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 6: Manual verification in the browser**

Run: `npm run dev`, open the app, upload any valid spreadsheet.

1. Clear the queue: `window.vaq = []`.
2. Go to the "Explore" tab and click "Add to dashboard" on a suggested chart.
   Expected: `window.vaq.at(-1)` is `["event", { name: "chart_added", data: { source: "suggestion" }, options: undefined }]`
3. Go to the "Build" tab (Manual Chart Builder), configure and add a chart.
   Expected: last entry has `data: { source: "manual" }`
4. Go to the "Insights" tab, add an insight card and a table card to the dashboard.
   Expected: two more entries with `source: "insight"` and `source: "table"` respectively.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "Track chart/insight/table additions to the dashboard"
```

---

### Task 5: Track PDF export outcome

**Files:**
- Modify: `app/page.tsx:334-355` (`handleExportPdf`)

**Interfaces:**
- Consumes: `trackEvent` from `src/lib/analytics.ts` (Task 1) — already imported into `app/page.tsx` in Task 3.

- [ ] **Step 1: Hoist the count computation and track both outcomes**

Current:

```tsx
  const handleExportPdf = useCallback(async () => {
    if (!dashboardRef.current || !dashboardItems.length) { toast.error('Nothing to export'); return; }
    setExporting(true);
    const toastId = toast.loading(t('generatingPdf'));
    try {
      const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
      const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
      const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;
      const { exportDashboardToPDF } = await import('@/lib/pdf-export');
      await exportDashboardToPDF(dashboardRef.current, {
        appName: 'ExcelInsight', fileName,
        rowCount: filteredData.length, colCount: columns.length,
        chartCount, tableCount, insightCount, logoUrl: logo.src,
      });
      toast.success(t('pdfReady'), { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error(t('pdfFailed'), { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [dashboardItems, fileName, columns.length, filteredData, t]);
```

Change to:

```tsx
  const handleExportPdf = useCallback(async () => {
    if (!dashboardRef.current || !dashboardItems.length) { toast.error('Nothing to export'); return; }
    setExporting(true);
    const toastId = toast.loading(t('generatingPdf'));
    const chartCount = dashboardItems.filter(i => !i.displayAs || i.displayAs === 'chart').length;
    const tableCount = dashboardItems.filter(i => i.displayAs === 'table').length;
    const insightCount = dashboardItems.filter(i => i.displayAs === 'insight').length;
    try {
      const { exportDashboardToPDF } = await import('@/lib/pdf-export');
      await exportDashboardToPDF(dashboardRef.current, {
        appName: 'ExcelInsight', fileName,
        rowCount: filteredData.length, colCount: columns.length,
        chartCount, tableCount, insightCount, logoUrl: logo.src,
      });
      toast.success(t('pdfReady'), { id: toastId });
      trackEvent('export_pdf', { status: 'success', chartCount, tableCount, insightCount });
    } catch (e) {
      console.error(e);
      toast.error(t('pdfFailed'), { id: toastId });
      trackEvent('export_pdf', { status: 'failed', chartCount, tableCount, insightCount });
    } finally {
      setExporting(false);
    }
  }, [dashboardItems, fileName, columns.length, filteredData, t]);
```

Note: the three `const` count lines simply moved from inside the `try` block to just above it — they're pure synchronous array filters with no side effects, so this doesn't change behavior, it just makes them available to the `catch` branch too.

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Manual verification in the browser**

Run: `npm run dev`, open the app, upload a spreadsheet so the dashboard has at least one chart.

1. Clear the queue: `window.vaq = []`.
2. Click "Export PDF" and let it succeed.
   Expected: `window.vaq.at(-1)` is `["event", { name: "export_pdf", data: { status: "success", chartCount: <n>, tableCount: <n>, insightCount: <n> }, options: undefined }]` with counts matching the dashboard.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "Track PDF export outcome"
```

---

### Task 6: Track per-chart PNG export outcome

**Files:**
- Modify: `src/components/DynamicChart.tsx:1-18` (imports), `src/components/DynamicChart.tsx:70-86` (`handleExport`)

**Interfaces:**
- Consumes: `trackEvent` from `src/lib/analytics.ts` (Task 1).
- Consumes: `type: ChartType` — already a prop on `DynamicChart` (destructured at line 54-55); `ChartType` is a string union, assignable to `export_png`'s `chartType: string` property.

- [ ] **Step 1: Add the import**

In `src/components/DynamicChart.tsx`, after `import { useI18n } from '@/lib/i18n';` (line 18), add:

```ts
import { trackEvent } from '@/lib/analytics';
```

- [ ] **Step 2: Track export success and failure**

Current `handleExport` (lines 70-86):

```tsx
  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const controls = chartRef.current.querySelectorAll('[data-export-hide]');
      controls.forEach(el => (el as HTMLElement).style.display = 'none');
      const bgColor = getComputedStyle(document.body).backgroundColor || '#ffffff';
      const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: bgColor, useCORS: true });
      const url = canvas.toDataURL('image/png');
      controls.forEach(el => (el as HTMLElement).style.display = '');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };
```

Change to:

```tsx
  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const controls = chartRef.current.querySelectorAll('[data-export-hide]');
      controls.forEach(el => (el as HTMLElement).style.display = 'none');
      const bgColor = getComputedStyle(document.body).backgroundColor || '#ffffff';
      const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: bgColor, useCORS: true });
      const url = canvas.toDataURL('image/png');
      controls.forEach(el => (el as HTMLElement).style.display = '');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
      trackEvent('export_png', { status: 'success', chartType: type });
    } catch (e) {
      console.error('Export failed', e);
      trackEvent('export_png', { status: 'failed', chartType: type });
    }
  };
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -p tsconfig.json`
Expected: no errors.

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, open the app, upload a spreadsheet so at least one chart is on the dashboard.

1. Clear the queue: `window.vaq = []`.
2. Click the PNG export/download control on any chart.
   Expected: `window.vaq.at(-1)` is `["event", { name: "export_png", data: { status: "success", chartType: "<the chart's type, e.g. bar>" }, options: undefined }]`

- [ ] **Step 5: Commit**

```bash
git add src/components/DynamicChart.tsx
git commit -m "Track per-chart PNG export outcome"
```

---

### Task 7: Full regression pass

**Files:** none (verification only)

**Interfaces:** none — this task only runs existing project checks.

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass, including the new `src/lib/analytics.test.ts`.

- [ ] **Step 2: Run a full production build**

Run: `npm run build`
Expected: build succeeds with no type or lint errors.

- [ ] **Step 3: Full manual funnel walkthrough**

Run: `npm run dev`, open the app in the browser, clear `window.vaq = []`, then in one session: upload a valid spreadsheet, add a suggested chart, add a manual chart, add an insight, add a table, export to PDF, export one chart to PNG.

Expected: `window.vaq` ends up containing, in order, one `file_parsed`, four `chart_added` (sources `suggestion`, `manual`, `insight`, `table`), one `export_pdf` with `status: "success"`, and one `export_png` with `status: "success"` — and no unexpected entries.

- [ ] **Step 4: Commit (only if any fixes were needed in this task)**

```bash
git add -A
git commit -m "Fix regressions found in full funnel walkthrough"
```
