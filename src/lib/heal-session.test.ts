import { describe, it, expect } from 'vitest';
import { healSession, ANALYSIS_VERSION } from './heal-session';
import type { PersistedSession } from './session-storage';
import type { DashboardItem } from '@/components/DashboardGrid';

const data = Array.from({ length: 40 }, (_, i) => ({
  Date: `2025-0${(i % 9) + 1}-10`, Customer: `Customer ${100 + i}`, Amount: i + 1, Region: ['N', 'S'][i % 2],
}));
const card = (id: string, extra: Partial<DashboardItem> = {}): DashboardItem =>
  ({ id, title: id, type: 'bar', data: [], dataKeys: [], xKey: '', ...extra } as DashboardItem);
const session = (items: DashboardItem[], v?: number): PersistedSession => ({
  data, fileName: 'f.csv', columns: [], suggestions: [], dashboardItems: items, filters: {},
  addedChartIds: [], addedInsightIds: [], activeTab: 'dashboard', sidebarCollapsed: false, ...(v ? { analysisVersion: v } : {}),
});

describe('healSession', () => {
  it('drops stale trend suggestions on a text column, keeps the rest and user-built cards', () => {
    const spec = { v: 2 as const, dimension: 'Customer', grain: 'month' as const, measures: [{ column: 'Amount', agg: 'sum' as const }] };
    const { session: s, removed } = healSession(session([
      card('a', { sourceKey: 'trend:Customer:Amount' }),
      card('b', { sourceKey: 'trend:Date:Amount' }),
      card('c', { sourceKey: 'dist:Region' }),
      card('d', { spec }),
      card('e', { sourceKey: 'scatter:Amount:Amount' }),
    ]));
    expect(removed).toBe(1);
    expect(s.dashboardItems.map(i => i.id)).toEqual(['b', 'c', 'd', 'e']);
    expect(s.columns.find(c => c.name === 'Customer')?.type).not.toBe('date');
    expect(s.analysisVersion).toBe(ANALYSIS_VERSION);
    expect(s.suggestions.length).toBeGreaterThan(0);
  });

  it('leaves a session saved under the current rules untouched', () => {
    const saved = session([card('a', { sourceKey: 'trend:Customer:Amount' })], ANALYSIS_VERSION);
    const { session: s, removed } = healSession(saved);
    expect(s).toBe(saved);
    expect(removed).toBe(0);
  });
});
