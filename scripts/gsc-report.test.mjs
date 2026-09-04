import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { analyseQueries, parseCsv, EXCLUDED_QUERIES } from './gsc-report.mjs';

// The GSC export is not committed (it exposes traffic volume and converting queries),
// so these assertions run only on a machine that has it. A clean checkout skips them
// rather than failing; the parseCsv test below is data-independent and always runs.
const DIR = join(process.cwd(), 'seo/baseline/2026-08-29');
const hasBaseline = existsSync(join(DIR, 'Queries.csv'));
const baseline = hasBaseline
  ? analyseQueries(parseCsv(readFileSync(join(DIR, 'Queries.csv'), 'utf8')))
  : null;
// Expected figures live with the export, not in this file — a committed test asserting
// real click counts would publish the very numbers the export is withheld to protect.
const expected = hasBaseline ? JSON.parse(readFileSync(join(DIR, 'expected.json'), 'utf8')) : null;

describe('parseCsv', () => {
  it('keeps commas inside quoted fields out of the column split', () => {
    const [row] = parseCsv('Top queries,Clicks,Impressions\n"charts, graphs online",0,6');
    expect(row['Top queries']).toBe('charts, graphs online');
    expect(row.Impressions).toBe('6');
  });
});

describe.skipIf(!hasBaseline)('P0-R4 exclusions', () => {
  // The whole point of an exact-phrase list: "excel insights" is a high-value query with
  // the opposite intent, differing from the BIOVIA noise only by word order and a plural.
  it('removes the BIOVIA family and keeps "excel insights"', () => {
    const excluded = baseline.excluded.map((q) => q.query);
    expect(excluded).toEqual(
      expect.arrayContaining(['insight excel', 'insights excel', 'insight for excel']),
    );
    expect(excluded).not.toContain('excel insights');
    expect(EXCLUDED_QUERIES.has('excel insights')).toBe(false);
  });
});

describe.skipIf(!hasBaseline)('North Star', () => {
  it('reports the expected click count from top-20 queries', () => {
    expect(baseline.northStar.clicks).toBe(expected.northStarClicks);
  });

  // Adding the excluded impressions back must reproduce the BRD's Section 2 band table
  // exactly. If either the band edges or the filter drift, this is what catches it.
  it('reconciles with the BRD band table once exclusions are added back', () => {
    const backfilled = (label) => {
      const band = baseline.bands.find((b) => b.label === label);
      const [min, max] = { '1 – 10': [0, 10], '11 – 20': [10, 20], '21 – 30': [20, 30] }[label];
      const removed = baseline.excluded
        .filter((q) => q.position > min && q.position <= max)
        .reduce((n, q) => n + q.impressions, 0);
      return { impressions: band.impressions + removed, clicks: band.clicks };
    };
    for (const [label, [impressions, clicks]] of Object.entries(expected.bands)) {
      expect(backfilled(label)).toEqual({ impressions, clicks });
    }
  });
});
