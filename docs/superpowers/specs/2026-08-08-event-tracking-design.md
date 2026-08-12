# Funnel event tracking — design

> **Historical record — shipped 2026-08-08. Do not edit.**
> This is the design as approved. It was implemented as specified, with one
> difference: `trackEvent`'s signature is
> `<N extends AnalyticsEvent['name']>(name: N, props: Extract<AnalyticsEvent, { name: N }>['props'])`
> rather than the `<E extends AnalyticsEvent>` form sketched below.
> For the current event taxonomy, call sites and how to add an event, see
> [`docs/analytics/events.md`](../../analytics/events.md).

## Context

ExcelInsight is a free, client-side spreadsheet-to-dashboard tool. A recent
review of the codebase found the core upload → chart → export flow has no
usage instrumentation beyond generic pageview/speed metrics from
`@vercel/analytics`'s `<Analytics />` component. There is no way to tell
what fraction of visitors actually upload a file successfully, build a
chart, or export — i.e. no visibility into whether the core product works
for real users. This spec adds minimal custom-event tracking to close that
gap before further investing in distribution (SEO/i18n).

## Goals

- Answer: do visitors upload successfully? Do they get a chart onto the
  dashboard? Do they export?
- Zero new dependencies — `@vercel/analytics` is already installed and
  mounted in `app/layout.tsx`, and exports a `track(name, properties?)`
  function for custom events.
- Preserve the product's core privacy pitch ("no upload, no signup, no data
  leaving your device") — event properties never include filenames, column
  names, sheet names, or cell values. Only counts, file extensions, and
  fixed enum values.

## Non-goals

- No analytics dashboard/reporting UI.
- No server-side event storage or a second analytics provider.
- No broad UI/component test coverage — this spec adds one small unit test
  for the tracking wrapper only. Hardening the parsing/chart-rendering core
  with tests is a separate, already-identified follow-up.

## Design

### `src/lib/analytics.ts`

A thin typed wrapper around `@vercel/analytics`'s `track()`. Instead of
calling `track()` directly at each of the ~6 call sites spread across 3
files, a discriminated union defines every event name and its property
shape in one place, so call sites can't typo an event name or pass the
wrong properties, and the full event taxonomy is readable in one file.

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

export function trackEvent<E extends AnalyticsEvent>(name: E['name'], props: E['props']) {
  vercelTrack(name, props);
}
```

### Events and call sites

| Event | Fired from | Signals |
|---|---|---|
| `file_upload_rejected` | `FileUpload.tsx` — `isValidFile` fail path | drop-off before parsing starts |
| `file_parsed` | `app/page.tsx` — `handleDataLoaded`, after `analyzeColumns` | successful upload, data stage reached |
| `file_parse_failed` | `FileUpload.tsx` — `processFile` catch block | upload attempted but broke |
| `file_analysis_empty` | `app/page.tsx` — `handleDataLoaded`, when `buildDefaultDashboard` returns 0 items | parsed fine, but nothing in it was chartable (no numeric/repeating/null-bearing columns, no chart suggestions) — a data-shape problem, not a parse failure |
| `chart_added` | `app/page.tsx` — `addToDashboard`, `addSuggestionToDashboard`, `addInsightToDashboard`, `addTableToDashboard` | user engaged past the auto-generated default dashboard |
| `export_pdf` | `app/page.tsx` — `handleExportPdf` success/catch branches | conversion event |
| `export_png` | `DynamicChart.tsx` — `handleExport` | conversion event |

`file_parsed` fires from `page.tsx` rather than `FileUpload.tsx` because
`colCount` isn't known until `analyzeColumns` runs, which happens in
`handleDataLoaded`.

`file_parsed` and `file_analysis_empty` are not mutually exclusive with each
other — `file_parsed` always fires on a successful parse; `file_analysis_empty`
fires additionally, right after, only when `buildDefaultDashboard` comes back
with zero items. This is deliberately a separate event from
`file_parse_failed`: a parse failure means the file itself was
unreadable (corrupt, wrong format); `file_analysis_empty` means the file
was read correctly but its shape has nothing to chart — two different
problems with different fixes.

The four "add to dashboard" callbacks all emit the same `chart_added` event
with a `source` discriminator rather than four separate event names — they
represent the same funnel step (something landed on the dashboard) and a
single event with a property is simpler to reason about downstream.

### Error handling

`@vercel/analytics`'s `track()` is fire-and-forget and does not throw or
block rendering. The wrapper does not add its own try/catch — there's
nothing meaningful to recover from, and swallowing errors silently would
just hide the case where tracking is misconfigured. Consistent with the
codebase's boundary-only-validation convention.

### Testing

One unit test file for `src/lib/analytics.ts`: mock `@vercel/analytics`'s
`track` export and assert `trackEvent` forwards the event name and
properties unchanged. No new tests for the six call sites themselves —
they're one-line additions to existing, un-tested UI code paths, and adding
test scaffolding for them is out of scope per Non-goals above.

## Open questions

None — design approved as proposed.
