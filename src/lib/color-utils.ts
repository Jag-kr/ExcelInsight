/**
 * Converts an "H S% L%" string (the format used throughout globals.css and
 * CHART_PALETTES) into a 0-255 RGB triple, for consumers that can't read CSS
 * at all — currently only jsPDF in pdf-export.ts.
 */
export function hslStringToRgb(hsl: string): [number, number, number] {
  const m = hsl.match(/(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [0, 0, 0];
  const h = parseFloat(m[1]);
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
