import { describe, it, expect } from 'vitest';
import { numberFormatter, isDefaultFormat, patchFormat } from './format';

const fmt = (f?: Parameters<typeof numberFormatter>[0]) => numberFormatter(f, 'en-US');

describe('numberFormatter', () => {
  it('undefined and auto match toLocaleString', () => {
    for (const n of [0, 45, 1234.5678, -9876543.21, 0.000123]) {
      expect(fmt()(n)).toBe(n.toLocaleString('en-US'));
      expect(fmt({ number: 'auto' })(n)).toBe(n.toLocaleString('en-US'));
    }
  });
  it('auto with decimals fixes the fraction digits', () => {
    expect(fmt({ decimals: 1 })(1234.56)).toBe('1,234.6');
    expect(fmt({ decimals: 2 })(5)).toBe('5.00');
  });
  it('compact', () => {
    expect(fmt({ number: 'compact' })(1234567)).toBe('1.23M');
    expect(fmt({ number: 'compact', decimals: 0 })(1234567)).toBe('1M');
    expect(fmt({ number: 'compact', decimals: 1 })(1234567)).toBe('1.2M');
  });
  it('percent treats the value as a fraction', () => {
    expect(fmt({ number: 'percent' })(0.256)).toBe('26%');
    expect(fmt({ number: 'percent', decimals: 1 })(0.256)).toBe('25.6%');
    expect(fmt({ number: 'percent', decimals: 0 })(0.256)).toBe('26%');
  });
  it('currency', () => {
    expect(fmt({ number: 'currency' })(1234.5)).toBe('$1,234.50');
    expect(fmt({ number: 'currency', decimals: 0 })(1234.5)).toBe('$1,235');
    expect(fmt({ number: 'currency', decimals: 2 })(1234.5)).toBe('$1,234.50');
    expect(fmt({ number: 'currency', currency: 'EUR' })(10)).toBe('€10.00');
  });
  it('invalid currency falls back to USD', () => {
    expect(fmt({ number: 'currency', currency: 'nope!' })(10)).toBe('$10.00');
    expect(fmt({ number: 'currency', currency: '' })(10)).toBe('$10.00');
  });
  it('clamps and floors decimals, ignores NaN', () => {
    expect(fmt({ decimals: 99 })(1.1234567891)).toBe('1.123457');
    expect(fmt({ decimals: -3 })(1.5)).toBe('2');
    expect(fmt({ decimals: 1.9 })(1.25)).toBe('1.3');
    expect(fmt({ decimals: NaN })(1.23456)).toBe('1.235');
  });
  it('non-finite input returns an em dash', () => {
    for (const mode of [undefined, 'compact', 'percent', 'currency'] as const) {
      const f = fmt({ number: mode });
      for (const bad of [NaN, Infinity, -Infinity, null as unknown as number, undefined as unknown as number]) {
        expect(f(bad)).toBe('—');
      }
    }
  });
});

describe('isDefaultFormat', () => {
  it('is true for undefined, {} and all-undefined keys', () => {
    expect(isDefaultFormat()).toBe(true);
    expect(isDefaultFormat({})).toBe(true);
    expect(isDefaultFormat({ number: undefined, decimals: undefined })).toBe(true);
  });
  it('is false once any key is set', () => {
    expect(isDefaultFormat({ number: 'auto' })).toBe(false);
    expect(isDefaultFormat({ gridlines: false })).toBe(false);
    expect(isDefaultFormat({ xTitle: '' })).toBe(false);
  });
});

describe('patchFormat', () => {
  it('sets and merges without touching other keys', () => {
    expect(patchFormat(undefined, { number: 'percent' })).toEqual({ number: 'percent' });
    expect(patchFormat({ number: 'percent' }, { decimals: 1 })).toEqual({ number: 'percent', decimals: 1 });
  });
  it('removes keys that return to default, and empty strings', () => {
    const r = patchFormat({ number: 'percent', xTitle: 'X' }, { number: undefined, xTitle: '' });
    expect(r).toBeUndefined();
    expect(patchFormat({ number: 'percent', decimals: 2 }, { decimals: undefined })).toEqual({ number: 'percent' });
    expect(Object.keys(patchFormat({ legend: 'top', gridlines: false }, { legend: undefined })!)).toEqual(['gridlines']);
  });
  it('does not mutate the input and keeps false', () => {
    const f = { dataLabels: true };
    expect(patchFormat(f, { dataLabels: false })).toEqual({ dataLabels: false });
    expect(f).toEqual({ dataLabels: true });
  });
});
