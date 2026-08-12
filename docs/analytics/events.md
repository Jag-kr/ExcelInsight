# Product analytics — event reference

**Status: shipped.** This is the as-built reference. The approved design is
[`../superpowers/specs/2026-08-08-event-tracking-design.md`](../superpowers/specs/2026-08-08-event-tracking-design.md);
the execution record is
[`../superpowers/plans/2026-08-08-event-tracking.md`](../superpowers/plans/2026-08-08-event-tracking.md).
Neither is maintained — change this file when you change the events.

## What it answers

One funnel: **do visitors upload successfully → do they get something onto the
dashboard → do they export?**

## The privacy constraint

The product's pitch is "no upload, no signup, no data leaving your device", and the
event schema has to be consistent with that. Properties carry **only**:

- counts (`rowCount`, `colCount`, `chartCount`, …)
- file extensions (`.xlsx`, `.csv`)
- fixed enum values (`source`, `status`, `chartType`)

Never filenames, sheet names, column names, or cell values. `getFileExt()` exists
precisely so a filename is reduced to its extension at the call site and the rest never
travels. **A new property that could carry user content does not go in.**

## Transport

`@vercel/analytics` — already a dependency and already mounted in `app/layout.tsx`. No
new SDK, no separate consent flow.

## The typed wrapper

[`src/lib/analytics.ts`](../../src/lib/analytics.ts) — a discriminated union defines
every event and its property shape in one place, so a call site cannot typo a name or
pass the wrong props, and the whole taxonomy is readable in one file:

```ts
export function trackEvent<N extends AnalyticsEvent['name']>(
  name: N,
  props: Extract<AnalyticsEvent, { name: N }>['props']
): void
```

Call `trackEvent`, never `track` from `@vercel/analytics` directly.

## Events

| Event | Properties | Fires when | Call site |
|---|---|---|---|
| `file_upload_rejected` | `fileExt` | a dropped/selected file fails the type check | `FileUpload.tsx:47` |
| `file_parse_failed` | `fileExt` | the `xlsx` parse throws (`reader.onload` catch) or the `FileReader` errors | `FileUpload.tsx:77`, `:86` |
| `file_parsed` | `fileExt`, `rowCount`, `colCount` | a file parses into rows and columns | `app/page.tsx:288` |
| `file_analysis_empty` | `fileExt`, `colCount` | parse succeeded but the analyzer produced zero items | `app/page.tsx:290` |
| `chart_added` | `source: 'suggestion' \| 'manual' \| 'insight' \| 'table'` | anything is added to the dashboard | `app/page.tsx:388`, `:397`, `:413`, `:422` |
| `export_pdf` | `status: 'success' \| 'failed'`, `chartCount`, `tableCount`, `insightCount` | a PDF export finishes or throws | `app/page.tsx:365`, `:369` |
| `export_png` | `status: 'success' \| 'failed'`, `chartType` | a single chart is exported as PNG | `DynamicChart.tsx:84`, `:87` |

`file_parsed` and `file_analysis_empty` both fire for the same upload when the analyzer
comes back empty — the pair distinguishes "we couldn't read your file" from "we read it
and had nothing to say about it", which are very different product problems.

`chart_added`'s four sources map to the four entry points: the Explore tab's suggestion
cards, the manual chart builder, the Insights tab, and adding a data table.

## Helpers

```ts
getFileExt('Sales_Report.XLSX')  // → '.xlsx'   lowercased, dot included
getFileExt('README')             // → ''
```

Known edge case, accepted: a dotfile such as `.gitignore` returns `.gitignore`. Out of
scope for an xlsx/csv upload flow.

## Tests

[`src/lib/analytics.test.ts`](../../src/lib/analytics.test.ts) mocks
`@vercel/analytics` and asserts `trackEvent` forwards name and properties unchanged
(three shapes: full props, enum-only, failure status), plus two `getFileExt` cases.

```bash
npm test
```

The call sites themselves are untested by design — one-line additions to existing
un-tested UI paths. They were verified once by a live funnel walkthrough that captured
all seven event types in order; the only branch never triggered live is
`export_pdf` with `status: 'failed'`.

## Adding an event

1. Add a variant to the `AnalyticsEvent` union in `src/lib/analytics.ts`.
2. Re-read the privacy constraint above against your new properties.
3. Call `trackEvent('name', { … })` at the call site — the type system will hold you to
   the shape.
4. Add a row to the table above.
5. Add a forwarding assertion to `analytics.test.ts` only if the shape is a new *kind*
   (a new enum, a new failure mode); don't duplicate coverage of the wrapper itself.
