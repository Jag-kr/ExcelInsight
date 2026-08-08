// Illustrative dashboard data for the landing-page chart showcase.
// Region codes (NA/EU/APAC/LATAM), "Product A–D", and axis values below are placeholders,
// same as sales_data.xlsx in ChartShowcase.tsx — no translation needed.

export const BARS = [
  { label: 'Q1', pct: 52 },
  { label: 'Q2', pct: 81 },
  { label: 'Q3', pct: 64 },
  { label: 'Q4', pct: 97 },
];

// Smooth upward-trending SVG path (viewBox 0 0 100 44)
export const LINE_D = 'M 2,38 C 10,34 18,26 28,22 S 46,9 58,13 S 74,19 86,11 L 98,5';

// Donut / pie segments — sum to 100
export const REGIONS = [
  { label: 'NA', pct: 42, color: 'hsl(var(--chart-1))' },
  { label: 'EU', pct: 28, color: 'hsl(var(--chart-2))' },
  { label: 'APAC', pct: 19, color: 'hsl(var(--chart-5))' },
  { label: 'LATAM', pct: 11, color: 'hsl(var(--chart-6))' },
];

// Horizontal ranked bars — widths relative to the top row
export const RANKED = [
  { label: 'Product A', value: '312', pct: 100 },
  { label: 'Product B', value: '289', pct: 87 },
  { label: 'Product C', value: '204', pct: 61 },
  { label: 'Product D', value: '167', pct: 48 },
];

export const DONUT_R = 15.915; // circumference ≈ 100, so pct maps directly to dash length

// Scatter: "Ad Spend vs Conversions" — viewBox 0 0 100 60, values are unitless illustrative positions
export const SCATTER_POINTS = [
  { x: 12, y: 46 },
  { x: 22, y: 38 },
  { x: 30, y: 41 },
  { x: 38, y: 28 },
  { x: 48, y: 30 },
  { x: 55, y: 18 },
  { x: 64, y: 22 },
  { x: 74, y: 12 },
  { x: 82, y: 15 },
  { x: 90, y: 6 },
];

// Area: "Website Traffic" — a distinct wave shape from LINE_D so the Area and Line
// tabs don't render an identical silhouette (viewBox 0 0 100 44)
export const AREA_D = 'M 2,32 C 14,28 22,10 34,14 S 54,30 66,24 S 84,6 98,10';

// Radar: illustrative 0-100 scores across 5 business dimensions
export const RADAR_VALUES = [82, 68, 90, 55, 74];
