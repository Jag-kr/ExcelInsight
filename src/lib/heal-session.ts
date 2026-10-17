import { analyzeColumns, generateChartSuggestions } from './data-analyzer';
import { specFromSourceKey } from './derive-dashboard-item';
import type { PersistedSession } from './session-storage';

/** Bump when column typing changes. 2 = strict dates (free text such as "Customer 12" is no longer a date). */
export const ANALYSIS_VERSION = 2;

/**
 * A session saved under older typing keeps columns the analyser would now type differently, and
 * auto-suggested trend cards on text columns that now find no dates (blank cards). Re-analyse the
 * stored rows once and drop only those untouched suggestion cards; cards the user built stay.
 */
export function healSession(s: PersistedSession): { session: PersistedSession; removed: number } {
  if ((s.analysisVersion ?? 1) >= ANALYSIS_VERSION) return { session: s, removed: 0 };
  const columns = analyzeColumns(s.data);
  const byName = new Map(columns.map(c => [c.name, c]));
  const fits = (key: string) => {
    const spec = specFromSourceKey(key, columns);
    if (!spec) return true; // scatter: no recipe to check
    const dim = byName.get(spec.dimension);
    return !!dim && (!spec.grain || dim.type === 'date');
  };
  const dashboardItems = s.dashboardItems.filter(i => !i.sourceKey || i.spec || fits(i.sourceKey));
  return {
    session: { ...s, columns, suggestions: generateChartSuggestions(s.data, columns), dashboardItems, analysisVersion: ANALYSIS_VERSION },
    removed: s.dashboardItems.length - dashboardItems.length,
  };
}
