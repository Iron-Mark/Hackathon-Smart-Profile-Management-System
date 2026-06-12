import { describe, expect, test } from 'vitest';
import { formatVitalValue, getVitalRating } from './webVitals';

describe('web vitals helpers', () => {
  test('rates Core Web Vitals with public threshold labels', () => {
    expect(getVitalRating('LCP', 2400)).toBe('good');
    expect(getVitalRating('LCP', 3000)).toBe('needs-improvement');
    expect(getVitalRating('LCP', 4500)).toBe('poor');
    expect(getVitalRating('CLS', 0.05)).toBe('good');
    expect(getVitalRating('INP', 250)).toBe('needs-improvement');
  });

  test('formats timing and layout-shift metrics for the debug panel', () => {
    expect(formatVitalValue('LCP', 1234.56)).toBe('1235 ms');
    expect(formatVitalValue('TTFB', 82.1)).toBe('82 ms');
    expect(formatVitalValue('CLS', 0.06789)).toBe('0.068');
  });
});
