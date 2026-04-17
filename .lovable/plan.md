

# Dashboard: Interactive, User-Friendly, PDF Export

## Goals
1. Make the dashboard feel more interactive and discoverable.
2. Improve usability (clearer controls, empty/help states, mobile-friendly resizing).
3. Add a one-click "Export as PDF" that captures the entire dashboard with all charts, tables, and insights.

---

## 1. Interactivity & UX Improvements (`DashboardGrid.tsx`, `Index.tsx`)

**Card controls always visible on mobile, hover-only on desktop**
- Current: controls hidden until hover (broken on touch). Make controls always visible on `<lg`, hover-only on `>=lg`.
- Add tooltips to every icon button (drag, resize, delete, change-type).

**Resize UX**
- Replace the single cycling button with a small popover offering S / M / L with visual icons + labels.
- Add a "Duplicate card" button alongside resize/delete.

**Quick-add toolbar above the grid**
- Buttons: "Add Chart" (opens manual chart builder in dialog), "Add Insight" (opens insight picker), "Reset Layout" (restore auto-generated default), "Clear All".
- Show a small counter: "5 cards · 2 charts · 1 table · 2 insights".

**Empty state polish**
- When dashboard is empty, show a friendly card with 3 quick-action buttons (Auto-generate, Add chart, Browse insights) instead of plain text.

**Drag affordance**
- Add a subtle dashed outline + "Drop here" hint on the placeholder while dragging.
- Cursor + slight scale on the dragged card.

**Edit title inline**
- Click the card title to rename (input on focus, save on blur/Enter). Persists in `DashboardItem.title`.

---

## 2. PDF Export (`Index.tsx`, new `src/lib/pdf-export.ts`)

**Approach:** Client-side capture using `html2canvas` + `jspdf` (no backend, works offline, preserves theming).

**How:**
- Add an "Export PDF" button in the dashboard tab header.
- On click:
  1. Find the dashboard grid container by ref.
  2. Temporarily expand all cards to full visibility (no overflow clipping) and hide control buttons.
  3. Render each card to canvas via `html2canvas` (respects current light/dark theme).
  4. Compose into a multi-page A4 PDF via `jspdf`: cover page (logo + filename + date + row count), then 1-2 cards per page depending on size.
  5. Restore original DOM state. Trigger download as `ExcelInsight-Dashboard-<filename>-<date>.pdf`.
- Show a toast "Generating PDF…" then "Downloaded".

**Cover page contents:**
- ExcelInsight logo, "Dashboard Report", source filename, generated date, total rows/columns, count of charts/tables/insights.

**Dependencies to add:** `html2canvas`, `jspdf`.

---

## 3. Technical Notes

- `DashboardItem` gains no new required fields. Inline-rename simply uses existing `title`.
- New `src/lib/pdf-export.ts` exports `exportDashboardToPDF(element, meta)`.
- Quick-add toolbar lives in `Index.tsx` above `<DashboardGrid />` — wired to existing `setDashboardItems` and the existing manual chart builder dialog.
- Mobile control visibility: swap `opacity-0 group-hover:opacity-100` → `opacity-100 lg:opacity-0 lg:group-hover:opacity-100`.
- PDF capture must temporarily set `document.documentElement` to a stable theme to avoid flicker mid-capture.

---

## Files Changed
- `src/components/DashboardGrid.tsx` — visible controls, resize popover, duplicate, inline title, empty state, drag polish.
- `src/pages/Index.tsx` — quick-add toolbar, Export PDF button, dashboard ref, reset layout.
- `src/lib/pdf-export.ts` — new, PDF generation logic.
- `package.json` — add `html2canvas`, `jspdf`.

