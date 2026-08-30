import { track as vercelTrack } from '@vercel/analytics';

type AnalyticsEvent =
  | { name: 'file_upload_rejected'; props: { fileExt: string } }
  | { name: 'file_parsed'; props: { fileExt: string; rowCount: number; colCount: number } }
  | { name: 'file_parse_failed'; props: { fileExt: string } }
  | { name: 'file_analysis_empty'; props: { fileExt: string; colCount: number } }
  | { name: 'chart_added'; props: { source: 'suggestion' | 'manual' | 'insight' | 'table' | 'kpi' } }
  | { name: 'export_pdf'; props: { status: 'success' | 'failed'; chartCount: number; tableCount: number; insightCount: number } }
  | { name: 'export_png'; props: { status: 'success' | 'failed'; chartType: string } };

export function trackEvent<N extends AnalyticsEvent['name']>(
  name: N,
  props: Extract<AnalyticsEvent, { name: N }>['props']
): void {
  vercelTrack(name, props);
}

export function getFileExt(filename: string): string {
  if (!filename.includes('.')) {
    return '';
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '';
}
