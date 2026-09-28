import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { AdsenseScript } from '@/components/AdsenseScript';
import { SITE_URL } from '@/lib/site';
import { analyzeColumns, generateChartSuggestions } from '@/lib/data-analyzer';
import { sampleDataset, SAMPLE_FILE_NAME } from '@/content/sample-dataset';

export const metadata: Metadata = {
  title: 'Worked Example — What ExcelInsight Produces From a Spreadsheet',
  description:
    'A real worked example: 156 rows of order data, the column types ExcelInsight infers, the statistics it computes, the data-quality issues it finds and the charts it suggests.',
  alternates: { canonical: `${SITE_URL}/example/` },
};

/**
 * A server component on purpose.
 *
 * `DashboardApp` is loaded with `ssr: false`, so the live dashboard exists only
 * after hydration — a crawler fetching this site sees an upload box and nothing
 * else, which is a fair part of why the tool reads as contentless from outside.
 *
 * `analyzeColumns` and `generateChartSuggestions` are pure and have no DOM
 * dependency, so they can run at build time. Every number below is the real
 * output of the real analyser over the real sample file, baked into the HTML.
 * Nothing here is written by hand, and nothing waits for JavaScript.
 */

const columns = analyzeColumns(sampleDataset as unknown as Record<string, any>[]);
const suggestions = generateChartSuggestions(
  sampleDataset as unknown as Record<string, any>[],
  columns,
);

const byKey = (k: string) => suggestions.find((s) => s.key === k);

// Fixed locale: this renders at build time, so it must not drift with the
// builder's environment.
const num = (n: number, dp = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const money = (n: number) => '$' + num(n, 0);

const typeLabel: Record<string, string> = {
  numeric: 'Numeric',
  categorical: 'Categorical',
  date: 'Date',
  text: 'Text',
  range: 'Range',
  id: 'Identifier',
};

/** Server-rendered bars — real widths from real totals, no charting library. */
function BarList({
  rows,
  format,
}: {
  rows: { name: string; value: number }[];
  format: (n: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <ul className="space-y-2.5 mt-4">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between gap-4 text-xs mb-1">
            <span className="text-foreground font-medium">{r.name}</span>
            <span className="text-muted-foreground tabular-nums">{format(r.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max((r.value / max) * 100, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Example() {
  const revenue = columns.find((c) => c.name === 'revenue');
  const units = columns.find((c) => c.name === 'units');
  const incomplete = columns.filter((c) => c.nullCount > 0);

  const byRegion = byKey('agg:revenue:region');
  const byCategory = byKey('agg:revenue:category');
  const monthly = byKey('trend:order_date:units');

  return (
    <>
      <AdsenseScript />
      <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold brand-text mb-4">
              A worked example, end to end
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most of this site describes what ExcelInsight does. This page shows it. Below is
              the actual output of the analyser over a real{' '}
              {num(sampleDataset.length)}-row spreadsheet — the column types it inferred, the
              statistics it computed, the gaps it found and the charts it proposed. These
              numbers are generated when the site is built, not written by hand, so they are
              exactly what you would get by loading the same file yourself.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/?sample=1"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Open this dataset in the live tool →
              </Link>
              <a
                href={`/${SAMPLE_FILE_NAME}`}
                download
                className="inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Download the CSV
              </a>
            </div>
          </article>

          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h2 className="text-xl font-bold text-foreground mb-2">The file</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <code className="px-1 bg-secondary rounded">{SAMPLE_FILE_NAME}</code> — a
              product order export with {num(sampleDataset.length)} rows and{' '}
              {columns.length} columns, covering January to September 2026. It is synthetic,
              but shaped like a real export: regions and sales channels are unevenly
              distributed, prices vary within each product&apos;s band, and{' '}
              {columns.find((c) => c.name === 'sales_rep')?.nullCount ?? 0} orders have no
              sales representative recorded.
            </p>
          </article>

          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h2 className="text-xl font-bold text-foreground mb-2">
              What the analyser inferred
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              No column mapping, no configuration. Types are detected from the values
              themselves — and the statistics below are computed for every numeric column
              automatically.
            </p>

            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3 font-semibold">Column</th>
                    <th className="py-2 pr-3 font-semibold">Detected type</th>
                    <th className="py-2 pr-3 font-semibold text-right">Distinct</th>
                    <th className="py-2 pr-3 font-semibold text-right">Missing</th>
                    <th className="py-2 font-semibold">Computed statistics</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((c) => (
                    <tr key={c.name} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium text-foreground whitespace-nowrap">
                        <code>{c.name}</code>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{typeLabel[c.type]}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                        {num(c.uniqueCount)}
                      </td>
                      <td
                        className={`py-2 pr-3 text-right tabular-nums ${
                          c.nullCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {c.nullCount > 0 ? num(c.nullCount) : '—'}
                      </td>
                      <td className="py-2 text-muted-foreground tabular-nums">
                        {c.stats
                          ? `min ${num(c.stats.min, 2)} · max ${num(c.stats.max, 2)} · mean ${num(
                              c.stats.mean,
                              2,
                            )} · median ${num(c.stats.median, 2)}`
                          : c.categories
                            ? `top value “${c.categories[0]?.value}” (${num(
                                c.categories[0]?.count ?? 0,
                              )} rows)`
                            : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          {revenue?.stats && units?.stats && (
            <article className="glass-card rounded-2xl p-6 md:p-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Headline figures</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total revenue', value: money(revenue.stats.sum) },
                  { label: 'Orders', value: num(sampleDataset.length) },
                  { label: 'Units sold', value: num(units.stats.sum) },
                  { label: 'Mean order value', value: money(revenue.stats.mean) },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border p-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                      {k.label}
                    </div>
                    <div className="text-lg font-bold text-foreground tabular-nums">
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Every figure here is a KPI the tool derives on its own — sum, count, mean —
                and each one recalculates when you apply a filter in the live dashboard.
              </p>
            </article>
          )}

          {byRegion && byCategory && (
            <article className="glass-card rounded-2xl p-6 md:p-10">
              <h2 className="text-xl font-bold text-foreground mb-2">Grouped totals</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because <code>revenue</code> was detected as summable and{' '}
                <code>region</code> and <code>category</code> as categorical, these groupings
                are proposed without being asked for.
              </p>

              <h3 className="text-sm font-semibold text-foreground mt-6">Revenue by region</h3>
              <BarList
                rows={byRegion.data.map((d: any) => ({ name: d.name, value: d.total }))}
                format={money}
              />

              <h3 className="text-sm font-semibold text-foreground mt-8">
                Revenue by category
              </h3>
              <BarList
                rows={byCategory.data.map((d: any) => ({ name: d.name, value: d.total }))}
                format={money}
              />
            </article>
          )}

          {monthly && (
            <article className="glass-card rounded-2xl p-6 md:p-10">
              <h2 className="text-xl font-bold text-foreground mb-2">Detected time series</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <code>order_date</code> was recognised as a date column, so the rows are
                bucketed by month automatically — {monthly.description.toLowerCase()}.
              </p>
              <BarList
                rows={monthly.data.map((d: any) => ({ name: d.name, value: d.value }))}
                format={(n) => num(n)}
              />
            </article>
          )}

          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h2 className="text-xl font-bold text-foreground mb-2">Data quality</h2>
            {incomplete.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gaps are reported rather than quietly filled in:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-muted-foreground">
                  {incomplete.map((c) => (
                    <li key={c.name}>
                      <code className="text-foreground">{c.name}</code> — {num(c.nullCount)} of{' '}
                      {num(c.totalCount)} rows empty (
                      {(((c.totalCount - c.nullCount) / c.totalCount) * 100).toFixed(1)}%
                      complete)
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No missing values in this file.</p>
            )}
          </article>

          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {num(suggestions.length)} charts proposed automatically
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              From {columns.length} columns the analyser derived{' '}
              {num(suggestions.length)} candidate charts. You start from these rather than
              from an empty canvas, and keep the ones that are useful. A sample:
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {suggestions.slice(0, 12).map((s) => (
                <li
                  key={s.key}
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                    {s.type}
                  </span>
                  <div className="text-foreground font-medium mt-0.5">{s.title}</div>
                  <div className="text-muted-foreground">{s.description}</div>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Try it on this file</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Everything above is static. Open the same dataset in the live tool to drag the
              tiles around, filter it, add your own charts and export a PDF.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/?sample=1"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Open in the live tool →
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Use my own spreadsheet
              </Link>
            </div>
          </article>

          <div className="text-center text-sm">
            <Link href="/about/" className="text-primary hover:underline">
              About ExcelInsight
            </Link>
            <span className="mx-2 text-muted-foreground">•</span>
            <Link href="/contact/" className="text-primary hover:underline">
              Contact
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
