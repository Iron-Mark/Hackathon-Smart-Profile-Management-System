import type { Metric } from 'web-vitals';

export type VitalName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export interface VitalSnapshot {
  id: string;
  name: VitalName;
  value: number;
  formattedValue: string;
  rating: VitalRating;
}

const thresholds: Record<VitalName, [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
};

export function getVitalRating(name: VitalName, value: number): VitalRating {
  const [good, poor] = thresholds[name];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

export function formatVitalValue(name: VitalName, value: number) {
  if (name === 'CLS') return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

export function toVitalSnapshot(metric: Metric): VitalSnapshot {
  const name = metric.name as VitalName;

  return {
    id: metric.id,
    name,
    value: metric.value,
    formattedValue: formatVitalValue(name, metric.value),
    rating: getVitalRating(name, metric.value),
  };
}

export async function startWebVitalsReporting(onMetric: (metric: VitalSnapshot) => void) {
  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');
  const report = (metric: Metric) => onMetric(toVitalSnapshot(metric));

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}
