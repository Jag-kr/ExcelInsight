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
