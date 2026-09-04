// North Star report for the search growth programme (BRD P0-R3, P0-R4).
// Reports clicks earned from queries ranked in the top 20 — the only metric in the
// dataset that has consistently converted, and one the GSC interface will not produce.
//
// Reads a Search Console export from seo/baseline/<YYYY-MM-DD>/, which is deliberately
// NOT committed (see .gitignore): the export reveals traffic volume and converting
// queries. Drop the unzipped GSC export there to run this.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASELINE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'seo', 'baseline');

// P0-R4: the BIOVIA "Insight for Excel" query family — page-one placement, zero clicks,
// and it flatters average position in every report built on it.
// EXACT PHRASES ONLY. A substring match on "insight" also removes "excel insights" —
// a top-converting query with the opposite intent. Do not turn this into a regex.
export const EXCLUDED_QUERIES = new Set([
  'insight excel',
  'insight for excel',
  'insights excel',
  'biovia insight for excel',
]);

const BANDS = [
  { label: '1 – 10', min: 0, max: 10 },
  { label: '11 – 20', min: 10, max: 20 },
  { label: '21 – 30', min: 20, max: 30 },
  { label: '31 – 50', min: 30, max: 50 },
  { label: '50+', min: 50, max: Infinity },
];

/** Quote-aware CSV parse. GSC quotes any field containing a comma — four query rows in
 *  the baseline do, and a bare split(',') shifts their numbers by one column. */
export function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map((line) => {
    const fields = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (quoted && line[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
      } else if (c === ',' && !quoted) { fields.push(field); field = ''; }
      else field += c;
    }
    fields.push(field);
    return fields;
  });
  const header = rows.shift();
  return rows.map((fields) => Object.fromEntries(header.map((h, i) => [h, fields[i]])));
}

export function analyseQueries(rows) {
  const all = rows.map((r) => ({
    query: Object.values(r)[0],
    clicks: Number(r.Clicks),
    impressions: Number(r.Impressions),
    position: Number(r.Position),
  }));

  const excluded = all.filter((q) => EXCLUDED_QUERIES.has(q.query.toLowerCase()));
  const kept = all.filter((q) => !EXCLUDED_QUERIES.has(q.query.toLowerCase()));

  const sum = (qs, key) => qs.reduce((n, q) => n + q[key], 0);
  const topTwenty = kept.filter((q) => q.position <= 20);

  return {
    northStar: {
      clicks: sum(topTwenty, 'clicks'),
      impressions: sum(topTwenty, 'impressions'),
      queries: topTwenty.length,
    },
    bands: BANDS.map((b) => {
      const qs = kept.filter((q) => q.position > b.min && q.position <= b.max);
      return { label: b.label, impressions: sum(qs, 'impressions'), clicks: sum(qs, 'clicks') };
    }),
    excluded,
    named: { clicks: sum(kept, 'clicks'), impressions: sum(kept, 'impressions') },
    // Top-20 placement earning nothing: not noise to filter, but a rewrite shortlist.
    idleTopTwenty: topTwenty.filter((q) => q.clicks === 0).sort((a, b) => b.impressions - a.impressions),
  };
}

const pct = (n, d) => (d === 0 ? '0.00%' : `${((n / d) * 100).toFixed(2)}%`);

function main() {
  const dates = existsSync(BASELINE_ROOT) ? readdirSync(BASELINE_ROOT).sort() : [];
  const date = process.argv[2] ?? dates.at(-1);
  if (!date) {
    console.error(
      'No baseline found. Unzip a Search Console export (Queries.csv, Chart.csv, ...)\n' +
      `into ${BASELINE_ROOT}/<YYYY-MM-DD>/ and re-run. The export is not committed.`,
    );
    process.exit(1);
  }
  const dir = join(BASELINE_ROOT, date);
  const read = (f) => parseCsv(readFileSync(join(dir, f), 'utf8'));

  const a = analyseQueries(read('Queries.csv'));
  const siteClicks = read('Chart.csv').reduce((n, r) => n + Number(r.Clicks), 0);

  const out = [];
  out.push(`Search growth programme — North Star report`);
  out.push(`Baseline: seo/baseline/${date}  (frozen; see docs/seo/p0-baseline.md)`);
  out.push('');
  out.push(`NORTH STAR — clicks from queries ranked in the top 20`);
  out.push(`  ${a.northStar.clicks} clicks   ${a.northStar.impressions} impressions   ` +
    `${pct(a.northStar.clicks, a.northStar.impressions)} CTR   across ${a.northStar.queries} queries`);
  out.push('');
  out.push(`Clicks by ranking band`);
  out.push(`  ${'Band'.padEnd(9)}${'Impr'.padStart(7)}${'Clicks'.padStart(8)}${'CTR'.padStart(9)}`);
  for (const b of a.bands) {
    out.push(`  ${b.label.padEnd(9)}${String(b.impressions).padStart(7)}` +
      `${String(b.clicks).padStart(8)}${pct(b.clicks, b.impressions).padStart(9)}`);
  }
  out.push('');
  out.push(`Excluded from every figure above (P0-R4 — BIOVIA "Insight for Excel" intent)`);
  for (const q of a.excluded) {
    out.push(`  "${q.query}" — ${q.impressions} impr, ${q.clicks} clicks, pos ${q.position}`);
  }
  out.push(`  ${a.excluded.length} queries, ` +
    `${a.excluded.reduce((n, q) => n + q.impressions, 0)} impressions removed.`);
  out.push('');
  out.push(`Top-20 placement earning zero clicks — rewrite shortlist, not noise`);
  for (const q of a.idleTopTwenty.slice(0, 8)) {
    out.push(`  "${q.query}" — ${q.impressions} impr, pos ${q.position}`);
  }
  out.push('');
  out.push(`Coverage caveat`);
  out.push(`  Named queries account for ${a.named.clicks} of the site's ${siteClicks} clicks ` +
    `(${pct(a.named.clicks, siteClicks)}).`);
  out.push(`  The remaining ${siteClicks - a.named.clicks} come from queries Google anonymises for`);
  out.push(`  low volume. This report cannot see them. Do not read it as a site total.`);

  console.log(out.join('\n'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
