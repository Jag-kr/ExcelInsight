export interface ChartTheme {
  id: string;
  name: string;
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  tooltipBg: string;
  tooltipText: string;
}

export const chartThemes: ChartTheme[] = [
  {
    id: 'neon',
    name: 'Neon Glow',
    colors: ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'],
    backgroundColor: 'transparent',
    textColor: '#94a3b8',
    gridColor: '#1e293b',
    tooltipBg: '#0f172a',
    tooltipText: '#e2e8f0',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1', '#075985', '#67e8f9', '#22d3ee'],
    backgroundColor: 'transparent',
    textColor: '#7dd3fc',
    gridColor: '#0c4a6e',
    tooltipBg: '#082f49',
    tooltipText: '#bae6fd',
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    colors: ['#f97316', '#ef4444', '#eab308', '#f59e0b', '#dc2626', '#ea580c', '#fbbf24', '#fb923c'],
    backgroundColor: 'transparent',
    textColor: '#fbbf24',
    gridColor: '#451a03',
    tooltipBg: '#1c1917',
    tooltipText: '#fed7aa',
  },
  {
    id: 'forest',
    name: 'Emerald Forest',
    colors: ['#22c55e', '#10b981', '#34d399', '#059669', '#047857', '#065f46', '#6ee7b7', '#a7f3d0'],
    backgroundColor: 'transparent',
    textColor: '#86efac',
    gridColor: '#064e3b',
    tooltipBg: '#022c22',
    tooltipText: '#bbf7d0',
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9', '#c084fc', '#d8b4fe', '#e879f9', '#f0abfc'],
    backgroundColor: 'transparent',
    textColor: '#c4b5fd',
    gridColor: '#3b0764',
    tooltipBg: '#1e1b4b',
    tooltipText: '#e9d5ff',
  },
  {
    id: 'corporate',
    name: 'Corporate Clean',
    colors: ['#3b82f6', '#64748b', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'],
    backgroundColor: 'transparent',
    textColor: '#94a3b8',
    gridColor: '#1e293b',
    tooltipBg: '#020617',
    tooltipText: '#cbd5e1',
  },
];

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';

export const chartTypeOptions: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'radar', label: 'Radar Chart' },
];
