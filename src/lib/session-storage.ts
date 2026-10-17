import type { ColumnMeta, ChartSuggestion } from '@/lib/data-analyzer';
import type { DashboardItem } from '@/components/DashboardGrid';
import type { Filters } from '@/lib/filters';
import type { CalcField } from '@/lib/calc-fields';

/**
 * The working session — parsed rows plus everything derived from them — is
 * mirrored to localStorage so a refresh doesn't cost the user their upload.
 *
 * Everything here is type-only at the module boundary except the three
 * functions below, which is deliberate: the landing page imports
 * `hasStoredSession` and nothing else, so none of data-analyzer or
 * DashboardGrid follows it onto the critical path.
 */
export const STORAGE_KEY = 'excelinsight-session-v1';

export type PersistedSession = {
  data: Record<string, any>[];
  fileName: string;
  columns: ColumnMeta[];
  suggestions: ChartSuggestion[];
  dashboardItems: DashboardItem[];
  /** Calculated-field definitions (values are re-derived, never stored). Absent in older sessions. */
  calcFields?: CalcField[];
  /** Sessions saved before typed filters hold `Record<string, string>`; load through `normalizeFilters`. */
  filters: Filters | Record<string, string>;
  addedChartIds: string[];
  addedInsightIds: string[];
  activeTab: string;
  sidebarCollapsed: boolean;
  /** Absent in sessions saved before the editor pane existed. */
  paneCollapsed?: boolean;
};

export function loadSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

/**
 * Probe for a saved session without deserializing it.
 *
 * The landing page only needs to know *whether* to mount the dashboard, and
 * the payload can be several megabytes of row data — `getItem` would pull all
 * of it into a string just to test for existence. The `in` operator checks the
 * key without touching the value.
 */
export function hasStoredSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return STORAGE_KEY in localStorage;
  } catch {
    return false;
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Private-mode / quota-disabled storage — nothing to clear. */
  }
}
